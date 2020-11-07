
function onOpen(evt) {
   console.log("WS: connected");
}
function onClose(evt) {
   console.log("WS: disconnected");
}
function onMessage(evt) {
   console.log('WS: received <<' + evt.data+'>>');
}
function onError(evt) {
   console.log('WS: error <<' + evt.data+'>>');
}

var gameWS = {
   openSocket: () => {
      this.ws = new WebSocket("ws://localhost:8765/"); 
      this.ws.onopen = function(evt) { onOpen(evt) };
      this.ws.onclose = function(evt) { onClose(evt) };
      this.ws.onmessage = function(evt) { onMessage(evt) };
      this.ws.onerror = function(evt) { onError(evt) };},
   send: (message) => {this.ws.send(message); console.log("WS sent: <<" + message + ">>")}
}