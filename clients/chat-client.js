class ChatClient {

    // WebSocket abstracts the connection to the Chat Server.
    _ws;
    _keepalive=false;

    constructor() {
        this._connect();
    }

    _connect() {
        console.debug("Chat Client is connecting...");
        this._ws = new WebSocket(model.net.chat.ws, ['binary','base64']);
        this._ws.onopen = function(evt) { console.debug("Chat Client opened the WebSocket.") };
        this._ws.onclose = function(evt) { 
            // popupMsg("Chat Server closed the connection!", "danger");
            console.debug("Chat Server closed the connection.") 
            if(this._keepalive){
                this._reconnect();
            }
        }.bind(this);
        this._ws.onerror = function(evt) { 
            console.error("Chat Client error: " + evt.data);
            popupMsg("Chat Server connection error!", "danger");

        };
        this._keepalive=true;
        // this._ws.onmessage = function(evt) { console.error("Chat Received: " + evt.data) };
    }

    _reconnect(){
        console.debug("chat-client RECONNECTION")
        let oldWs = this._ws;
        this._ws = new WebSocket(model.net.chat.ws, ['binary','base64']);
        this._ws.onopen = oldWs.onopen;
        this._ws.onclose = oldWs.onclose;
        this._ws.onerror = oldWs.onerror;
        this._ws.onmessage = oldWs.onmessage;

        let username = model.inGameName
        this.loginChat(username);

        // SUBSCRIBE to the game channel
        let channel;
        for(let i=0;i<model.chat.chatSubscribedChannels.length;i++){
            channel=(model.chat.chatSubscribedChannels[i]).channel;
            this.subscribeChannel(channel);
        }
    }

    onMessage(callback) {
        this._ws.onmessage = callback;
    }

    close() {
        this._keepalive=false;
        this._ws.close();
        console.debug("Chat Client closed connection");
    }

    _dbgReconnect() {
        this._ws.close();
        console.debug("Chat Client TRY to close connection");
    }

    // Make the function wait until the connection is made...
    waitForSocketConnection(socket, callback){
        let that = this;
        setTimeout(
            function () {
                if (socket.readyState === 1) {
                    if (callback != null){
                        callback();
                    }
                } else {
                    console.log("wait for connection...")
                    that.waitForSocketConnection(socket, callback);
                }

        }, 5); // wait 5 milisecond for the connection...
    }

    _send(msg) {
        let that = this;
        this.waitForSocketConnection(this._ws, function(){

            console.debug("Chat Client is sending message: " + msg);
            that._ws.send(new Blob([msg + "\n"], {types: 'text/plain'}));
        });
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