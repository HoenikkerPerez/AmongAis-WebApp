class ChatClient {

    // WebSocket abstracts the connection to the Chat Server.
    _ws;

    constructor() {
        this._connect();
    }

    _connect() {
        console.debug("Chat Client is connecting...");
        this._ws = new WebSocket(model.net.chat.ws, ['binary','base64']);
        this._ws.onopen = function(evt) { console.debug("Chat Client opened the WebSocket.") };
        this._ws.onclose = function(evt) { console.debug("Chat Client closed the connection.") };
        this._ws.onerror = function(evt) { console.error("Chat Client error: " + evt.data) };
        // this._ws.onmessage = function(evt) { console.error("Chat Received: " + evt.data) };
    }

    onMessage(callback) {
        this._ws.onmessage = callback;
    }

    _send(msg) {
        console.debug("Chat Client is sending message: " + msg);
        this._ws.send(msg);
    }

    loginChat(username) {
        this._send("NAME " + username);
    }

    subscribeChannel(channel) {
        this._send("JOIN " + channel);
    }

    leaveChannel(channel) {
        this._send("LEAVE " + channel);
    }

    sendMessage(channel, message) {
        console.debug("sendMessage: " + message);
        this._send("POST " + channel + " " + message);
    }
    
}