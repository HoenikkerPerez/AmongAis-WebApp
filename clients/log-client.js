class LogClient {
    _clientType;

    // WebSocket abstracts the connection to the Game Server.
    _ws;

    constructor(clientType) {
        this._connect();
    }

    _connect() {
        console.debug("Game Client is connecting...");
        this._ws = new WebSocket("ws://localhost:8765");
        this._ws.onopen = function(evt) { console.debug("Log Client opened the WebSocket.") };
        this._ws.onclose = function(evt) { 
            popupMsg("Game Server closed the connection!", "danger");
            console.debug("Game Client closed the connection.") };
        this._ws.onerror = function(evt) { 
            popupMsg("Game Server connection error!", "danger");
            console.error("Game Client error: " + evt); 
        };
    }
};