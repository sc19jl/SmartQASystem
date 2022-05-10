<template>
  <div class="hello">

  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  data() {
    return {

    };
  },
  created() {
    this.initWebSocket();
  },
  methods: {
    e(){
     
    },
    initWebSocket() {
      //初始化weosocket
      console.log(this.$websocket);
      const WebSocketClient = this.$websocket.w3cwebsocket;
      const client = new WebSocketClient(
        "ws://localhost:8091/",
        "echo-protocol"
      );
      console.log(client);
      client.onerror = function() {
        console.log("Connection Error");
      };

      client.onopen = function() {
        console.log("WebSocket Client Connected");

        function sendNumber() {
          if (client.readyState === client.OPEN) {
            var number = Math.round(Math.random() * 0xffffff);
            client.send(number.toString());
            client.send("hello world !");
            setTimeout(sendNumber, 1000);
          }
        }
        sendNumber();
      };

      client.onclose = function() {
        console.log("echo-protocol Client Closed");
      };

      client.onmessage = function(e) {
        if (typeof e.data === "string") {
          console.log("Received: '" + e.data + "'");
        }
      };
    }
  }
};


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
