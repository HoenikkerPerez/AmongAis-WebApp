class ChatClient {

    // WebSocket abstracts the connection to the Chat Server.
    _ws;

    constructor() {
        this._connect();
    }

    _connect() {
        console.debug("Chat Client is connecting...");
        this._ws = new WebSocket(model.net.chat.ws, ['binary', 'base64']);
        this._ws.onopen = function(evt) { console.debug("Chat Client opened the WebSocket.") };
        this._ws.onclose = function(evt) { console.debug("Chat Client closed the connection.") };
        this._ws.onerror = function(evt) { console.error("Chat Client error: " + evt.data) };
        this._ws.onmessage = async function(evt) {
            let msg = await evt.data.text();
            console.debug("Chat Client received message: " + msg);
            // parse msg
            // dispatch chat customevent
            model.addMessageChat(msg); // event?
        }
    }

    _send(msg) {
        console.debug("Chat Client is sending message: " + msg);
        this._ws.send(msg);
    }

    login(username) {
        this._send("NAME " + username);
    }

    sendMessage(message) {
        console.debug("sendMessage: " + message);
        this._send(message);
    }

}