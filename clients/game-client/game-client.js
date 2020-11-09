class GameClient {

    // WebSocket abstracts the connection to the Game Server.
    _ws;
    // LobbyManager implements the protocol related to the management of the match list.
    _lobby;
    // AuthManager
    _auth;
    // MatchSync
    _sync;

    // Queue for syncing WebSocket events.
    _wsQueue;

    constructor() {
        this._connect();
        this._lobby = new LobbyManager(
            (msg) => {this._send(msg)}, // The closure is needed for incorporating the WebSocket.
        );

        // TODO: Change with real login _send/_receive functions
        this._auth = new AuthManager(
            // (msg) => {this._ws.send(msg)},
            (msg) => {console.debug("[STUB_login.send] "+ msg); },
            // this._receive,
            () => {console.debug("[STUB_login.receive] "); return "OK"},
        );
        this._sync = new MatchSync();
    }

    _connect() {
        console.debug("Game Client is connecting...");
        this._ws = new WebSocket("ws://localhost:8765");
        this._ws.onopen = function(evt) { console.debug("Game Client opened the WebSocket.") };
        this._ws.onclose = function(evt) { console.debug("Game Client closed the connection.") };
        this._ws.onerror = function(evt) { console.error("Game Client error: " + evt.data) };

        this._wsQueue = [];
        this._ws.onmessage = function(evt) {
            console.debug("Game Client received a message - " + evt.data);
            let msgtag = this._wsQueue.pop()
            //console.debug("Game Client: Dispatching event" + msgtag);
            document.dispatchEvent(new CustomEvent(msgtag, {data: evt.data })); // TODO non sono sicuro di data:evt.data
        }.bind(this)
    }

    _send(msgtag, msg) {
        this._ws.send(msg + "\n");
        this._wsQueue.push(msgtag);
    }

    _close() {
        this._ws.close();
    }

    /* SESSION interface */

    createGame(gameName) {
        console.debug("Game Client is requesting a game creation for " + gameName);

        let msg = this._lobby.createGame(gameName);
        this._send("miticoOggettoCheNonEsiste.CREATE_GAME", msg);
        model.status.ga=gameName;
    }

    login(username){
        console.debug("Game Client is requesting to login for user " + username);
        return this._auth.login(username);
    }

    getStatus(gameName){
        console.debug("Game Client is requesting a game status for " + gameName);

        let msg = this._sync(gameName);
        this._send("miticoOggettoCheNonEsiste.STATUS", msg);
    }

    /* MATCH interface */

}
