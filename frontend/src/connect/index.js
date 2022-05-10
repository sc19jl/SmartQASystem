let defaultData = {
  event:"connection", // connection or msg or server
  type:"", // self or others or server
  from: "",
  userName: "", // nickname
  sendWho: "", // all or uID
  msg: "",
  time:""
}

class WSocket {
  wss;
  port = 18089;

  constructor() {
    if (!"WebSocket" in window) {
      alert("The browser version is too low to support WebSocket！")
    }
  }

  // Connect service
  openWS(openInfo) {
    try {
      this.wss = new WebSocket("ws://127.0.0.1:18089")
      console.log("The connection to the server is successful!");
    } catch (error) {
      /* eslint-disable */
      console.log(error);
      alert("Connection failure!")
    }
    this.wss.onopen = () =>{
      console.log("onopen");
      openInfo = Object.assign(defaultData,openInfo)
      this.sendMsg(openInfo)
    }

  }

  // Receive the message
  onMessage(cb){
    this.wss.onmessage = data => {
      cb(data)
    }
  }

  // Send the message
  sendMsg(sendData) {
    sendData = Object.assign(defaultData,sendData) // 合并默认的data和需要发送的data
    this.wss.send(JSON.stringify(sendData))
  }
}

export default new WSocket()