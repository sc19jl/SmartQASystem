import flask
import torch
import BERTClassifier
import Settings as settings
import torch.nn as nn
import pymysql.cursors
import heapq

# 连接数据库
connect = pymysql.Connect(
    host='xx',
    port=2206,
    user='xx',
    passwd='xx.',
    db='xx',
    charset='utf8'
)




app = flask.Flask(__name__)

dir = torch.load("text_similarity_model.bin", map_location=torch.device('cuda'))
model = BERTClassifier.BERTClassifier()
model.load_state_dict(dir)
# eval(model, settings.Settings.tokenizer, "What question do you want to ask?", "What question do you want to ask?")
headers = ['id','question','answer','name','time']


@app.route("/requestTest", methods=["POST"])
def requestTest():
    request = flask.request
    if request.method == 'POST':
        return {"result":0}

@app.route("/queryNotAskedQuestions", methods=["POST"])
def queryNotAskedQuestions():
    request = flask.request
    cursor = connect.cursor()
    if request.method == 'POST':
        resultList = []
        # 查询数据
        sql = "SELECT id,question FROM question  WHERE is_answered = 0 LIMIT 100"
        cursor.execute(sql)
        connect.commit()

        for row in cursor.fetchall():
            id = row[0]
            question = row[1]
            resultList.append({"id":id,"question":question})
        return {"code":200,"data":resultList}


@app.route("/updateAnswer", methods=["POST"])
def updateAnswer():
    request = flask.request
    cursor = connect.cursor()
    if request.method == 'POST':
        resultList = []
        id = int(request.form.get("id"))
        answer = request.form.get("answer")
        data= (answer,1,id)
        print(data)
        # 查询数据
        sql = "UPDATE question SET answer = ('%s') , is_answered = %d WHERE id = %d"
        cursor.execute(sql%data)
        connect.commit()
        return {"code":200,"data":True}


@app.route("/calculateSimilarityByPair", methods=["POST"])
def calculateSimilarityByPair():
    request = flask.request
    if request.method == 'POST':
        first_question = request.form.get("q1")
        second_question = request.form.get("q2")

        result,score = eval(model,settings.Settings.tokenizer,first_question=first_question,second_question=second_question)
        return {"result":result,"score":score}

@app.route("/calculateSimilarityByList", methods=["POST"])
def calculateSimilarityByList():
    request = flask.request
    cursor = connect.cursor()
    resList = []
    QAList = []
    if request.method == 'POST':
        first_question = request.form.get("question")
        # 查询数据
        sql = "SELECT question,answer FROM question  WHERE is_answered = 1 LIMIT 100"
        cursor.execute(sql)
        for row in cursor.fetchall():
            resRow = eval(model,settings.Settings.tokenizer,first_question=first_question,second_question=row[0])
            if(resRow.get("res")):
                resList.append(resRow)
                QAList.append({"quesiton":row[0],"answer":row[1]})
        if(len(resList))==0:
            insertQuestion(question=first_question)
            return {"result": False, "message": "No similar Questions asked before"}
        else:
            maxscore = 0
            maxIndex = 0;
            for i in range(len(resList)):
                score = resList[i].get("prob")
                if(score > maxscore):
                    maxIndex = i
            answer = QAList[maxIndex].get("answer")
            if(answer == "" or answer is None):
                return {"result": False, "message": "No answers before"}
            else:
                return {"result": True, "message": answer}




def insertQuestion(question):
        cursor = connect.cursor()
        sql = "INSERT INTO question (question) VALUES ('%s')"
        cursor.execute(sql % question)
        connect.commit()



def eval(model, tokenizer, first_question, second_question):
    inputs = tokenizer.encode_plus(
        first_question,
        second_question,
        add_special_tokens=True,
        max_length=settings.Settings.max_len,
        pad_to_max_length=True,
        return_attention_mask=True,
        truncation=True
    )

    ids = torch.tensor([inputs["input_ids"]], dtype=torch.long)
    mask = torch.tensor([inputs["attention_mask"]], dtype=torch.long)
    token_type_ids = torch.tensor([inputs["token_type_ids"]], dtype=torch.long)
    with torch.no_grad():
        model.eval()
        output = model(ids=ids, mask=mask, token_type_ids=token_type_ids)
        prob = nn.Sigmoid()(output).item()

        print("questions [{}] and [{}] are {} with score {}".format(first_question, second_question, 'similar' if prob > 0.15 else 'not similar', prob))
        res = True if prob>0.15 else False
        return {"res":res,"prob":prob}


if __name__ == '__main__':
    app.run(host="127.0.0.1",port=5000, debug=True)
