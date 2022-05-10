// server

// import ws module
const WebSocket = require('ws');

// client list
let clientList = {}

// online client
let clientLive = []


// port number
const port = 18089

var robotData = {
  message: {
    event: 'msg',
    type: 'robot',
    from: 'robot',
    userName: 'Robot',
    sendWho: 'server',
    msg: 'test',
    time: 0
  }

}

const ApiUrl = "http://127.0.0.1:5000/"
var request = require('request');
request.post(ApiUrl + "requestTest", (error, response, body) => {
  if (!error && response.statusCode == 200) {
    console.log(body) // Show the HTML for the baidu homepage.
  }
})
// Create a ws server and enable ws port listening
const wss = new WebSocket.Server({
  port
}, () => {
  // 成功回调
  console.log((new Date()) + ' -----> ws server created successfully at port : ' + port);
}
);


// Emitted when the underlying server is bound
wss.on('listening', function connection() {
  console.log("Server binding successfully.");
});

// Emitted when the server is down
wss.on('close', function connection() {
  console.log("Server Close");
});

// Emitted when an error occurs on the underlying server.
wss.on('error', function connection(err) {
  console.log("Error" + err);
});


// Emitted when the handshake is complete
wss.on('connection', (ws, req) => {
  console.log('Server connection successfully.');
  onMessage(ws)
});
// Monitor connections and monitor messages
function onMessage(ws) {
  ws.on('message', async data => {
    const Data = JSON.parse(data)
    if (Data.event === "connection") {
      console.log(Data.userName + " is online");
      addClientList(ws, Data)
      massTexting(ws, Data, false)
      computeLive()

    } else if (Data.event === "msg") {
      console.log(Data);

      if (Data.sendWho === "server") {
        // Group sending
        console.log("all");

        massTexting(ws, Data, true)
      } else {
        // Send to person(not yet)
        console.log("no all");
        sendToUser(Data)
      }
    } else if (Data.event === "ask") {
      if (Data.sendWho === "server") {
        // Group sending

        massTexting(ws, Data, true)
        let question = Data.msg

        request.post({ url: ApiUrl + "calculateSimilarityByList", form: { question: question } }, (error, response, body) => {
          if (!error && response.statusCode == 200) {
            let result = JSON.parse(body)
            let time = new Date().getTime()
            robotData.message.time = time
            robotData.message.msg = result.message
            massTexting(ws, robotData.message, true)
            // console.log(result.message) 
          }
        })



      } else {
        // Send to person
        console.log("no all");
        sendToUser(Data)
      }
    } else if (Data.event === "answer") {

      if (Data.sendWho === "server") {
        // Group sending
        massTexting(ws, Data, true)
      } else {
        // Send to person(not yet)
        sendToUser(Data)
      }
    } else {
      console.log("Error send type");
      massTexting(ws, Data, true)
    }
  })
}

// Add ti client
function addClientList(ws, data) {
  const { userName } = data
  const uId = {
    ws,
    userName
  }
  clientList[data.from] = uId
  // console.log(clientList);

}

// Group sending
function massTexting(ws, msg, sendToSelf = false) {

  wss.clients.forEach(client => {

    if (client === ws && client.readyState === WebSocket.OPEN) {
      sendToSelf && client.send(JSON.stringify(msg))
    } else {
      client.send(JSON.stringify(msg))
    }
  })
}

// Send to person
function sendToUser(data) {
  console.log(data);

  const who = clientList[data.sendWho]
  // console.log(who);

  who.ws.send(JSON.stringify(data))
}


/**
 * Compute Live 
 */
function computeLive() {
  let _temp = [];
  wss.clients.forEach(client => {
    for (let x in clientList) {
      if (clientList[x]['ws'] == client) {
        if (client.readyState === WebSocket.OPEN) {
          _temp.push({
            uId: x,
            userName: clientList[x]['userName']
          });
        } else {
          delete (clientList[x]);
        }
      }
    }
  });
  clientLive = _temp;
  sendAllLive()
}


function sendAllLive() {
  const msg = {
    event: 'server',
    from: 'all',
    to: 'all',
    userName: 'server',
    type: 'others',
    data: clientLive 
  };
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
}



// setInterval(computeLive, 1000*5);
// setInterval(sendAllLive, 1000*5);
