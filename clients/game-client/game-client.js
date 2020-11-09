class GameClient {

    // WebSocket abstracts the connection to the Game Server.
    _ws;
    // LobbyManager implements the protocol related to the management of the match list.
    _lobby;
    // AuthManager
    _auth;
    // MatchSync
    //_sync;

    // Queue for syncing WebSocket events.
    _wsQueue;

    constructor() {
        this._connect();
        this._lobby = new LobbyManager(
            (msg) => {this._ws.send(msg)}, // The closure is needed for incorporating the WebSocket.
            this._receive,
        );

        // TODO: Change with real login _send/_receive functions
        this._auth = new AuthManager(
            // (msg) => {this._ws.send(msg)},
            (msg) => {console.debug("[STUB_login.send] "+ msg); },
            // this._receive,
            () => {console.debug("[STUB_login.receive] "); return "OK"},
        );
        //this._sync = new MatchSync();
    }

    _connect() {
        console.debug("Game Client is connecting...");
        this._ws = new WebSocket("ws://localhost:8765");
        this._ws.onopen = function(evt) { console.debug("Game Client opened the WebSocket.") };
        this._ws.onclose = function(evt) { console.debug("Game Client closed the connection.") };
        this._ws.onerror = function(evt) { console.error("Game Client error: " + evt.data) };

        this._wsQueue = [];
        this._ws.onmessage = function(evt) {
            console.debug("Game Client received a message - " + data);
            console.debug("Unfortunately there's no way to retrieve this yet. A Queue for these messages could be helpful, probably!");
            //console.debug("Game Client received a message - " + data);
            //this._wsQueue.push(evt.data);
            //console.debug("Game Client: Dispatching event wsmsg");
            //elem.dispatchEvent(new CustomEvent("wsmsg"));
        }
    }

    _receive() {
        // await from message queue
        // return message
    }

    /*#close() {
        this._ws.close();
    }*/

    /* SESSION interface */

    createGame(gameName) {
        console.debug("Game Client is requesting a game creation for " + gameName);
        this._lobby.createGame(gameName);
    }

    login(username){
        console.debug("Game Client is requesting to login for user " + username);
        return this._auth.login(username);
    }

    /* MATCH interface */

}
