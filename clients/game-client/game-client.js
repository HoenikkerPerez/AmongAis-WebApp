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
        this._lobby = new LobbyManager();

        // TODO: Change with real login _send/_receive functions
        this._auth = new AuthManager();
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
            console.debug("Game Client: Dispatching event" + msgtag);
            document.dispatchEvent(new CustomEvent(msgtag, {detail: evt.data }));
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
    }

    joinGame(gameName, characterName) {
        console.debug("Game Client is joining game named " + gameName);
        
        model.status.ga = gameName;
        let msg = this._lobby.joinGame(gameName, characterName);
        this._send("miticoOggettoCheNonEsiste.JOIN_GAME", msg);
    }

    startGame() {
        console.debug("Game Client is starting the current game.");
        
        let gameName = model.status.ga;
        let msg = this._lobby.startGame(gameName);
        this._send("miticoOggettoCheNonEsiste.START_GAME", msg);
    }

    leave() {
        console.debug("Game Client is requesting to leave.");

        let msg = this._lobby.leave(model.status.ga);
        this._send("miticoOggettoCheNonEsiste.LEAVE", msg);
    }

    login(username){
        console.debug("Game Client is requesting to login for user " + username);
        let msg = this._auth.login(username);
        //this._send("miticoOggettoCheNonEsiste.LOGIN", msg);
        return true;
    }
    
    /* MATCH interface */
    getStatus(gameName){
        console.debug("Game Client is requesting a game status for " + gameName);

        let msg = this._sync(gameName);
        this._send("miticoOggettoCheNonEsiste.STATUS", msg);
    }

    static UP = "N";
    static DOWN = "D";
    static LEFT = "W";
    static RIGHT = "R";

    lookMap(gameName) {
        console.debug("Game Client is requesting a map for " + gameName);

        let msg = this._sync.lookMap(gameName);
        this._send("miticoOggettoCheNonEsiste.LOOK_MAP", msg);
    }

    move(direction) {
        console.debug ("Game Client is requesting a move to direction: " + direction);

        let msg = this._sync.move(model.status.ga, direction);
        this._send("miticoOggettoCheNonEsiste.MOVE", msg)
    }

    shoot(direction) {
        console.debug("Game Client is requesting a shoot to direction: " + direction);

        let msg = this._sync.shoot(model.status.ga, direction);
        this._send("miticoOggettoCheNonEsiste.SHOOT", msg);
    }
}
