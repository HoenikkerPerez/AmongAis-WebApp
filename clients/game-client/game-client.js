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

    // Queue for message requests to send to the server.
    _schedulerCounter = 0;
    _wsRequests = [];
    _wsRequests_look = [];
    _wsRequests_cmd = [];
    _noRequestsCount = 0;

    constructor() {
        this._connect();
        this._lobby = new LobbyManager();

        // TODO: Change with real login _send/_receive functions
        this._auth = new AuthManager();
        this._sync = new MatchSync();
    }

    _connect() {
        console.debug("Game Client is connecting...");
        this._ws = new WebSocket(model.net.game.ws, ['binary','base64']);
        this._ws.onopen = function(evt) { console.debug("Game Client opened the WebSocket.") };
        this._ws.onclose = function(evt) { console.debug("Game Client closed the connection.") };
        this._ws.onerror = function(evt) { console.error("Game Client error: " + evt.data) };

        this._wsQueue = [];
        this._ws.onmessage = async function(evt) {
            let msg = await evt.data.text();
            //console.debug("Game Client received a message - " + msg);
            let msgtag = this._wsQueue.shift()
            //console.debug("Game Client: Dispatching event" + msgtag);
            document.dispatchEvent(new CustomEvent(msgtag, {detail: msg }));
            // Check too fast error
            if(msg.data == "ERROR 401 Too fast") {
                popupMsg("Connection closed by the server - too fast.","danger")
                console.error("Too fast :(");
            }
        }.bind(this)

        console.debug("Game Client is initializing the request queue.");
        this._wsRequests = [];
        window.setTimeout(function(){ this._requestHandler() }.bind(this), model.connectionTimeframe);
        // window.setTimeout(function(){ this._requestCmdHandler() }.bind(this), model.connectionTimeframe);
        // window.setTimeout(function(){ this._requestLookHandler() }.bind(this), model.connectionTimeframe);

    }

    // _send is called by the other methods of the client to send a message
    _send(msgtag, msg) {
        //console.debug("Game Client pushing response tag " + msgtag);
        // this._wsQueue.push(msgtag);
        //console.debug("Game Client pushing request message " + msg);
        if(msgtag==="STATUS" || msgtag==="miticoOggettoCheNonEsiste.SPECTATE_GAME" || msgtag==="miticoOggettoCheNonEsiste.LOOK_MAP"){
            this._wsRequests_look.push({tag:msgtag, msg:msg});
        } else {
            this._wsRequests_cmd.push({tag:msgtag, msg:msg});
        }
    }

    // _requestLookHandler () {
    //     if(this._wsRequests_look.length>0){
    //         let msg_tag = this._wsRequests_look.shift();
    //         this._wsRequests.push(msg_tag);
    //     }
    //     window.setTimeout(function(){ this._requestLookHandler() }.bind(this), 1000);
    // }

    // _requestCmdHandler () {
    //     if(this._wsRequests_cmd.length>0){
    //         let msg_tag = this._wsRequests_cmd.shift();
    //         this._wsRequests.push(msg_tag);
    //     }
    //     window.setTimeout(function(){ this._requestCmdHandler() }.bind(this), 200);

    // }
    isOdd(num) { return num % 2;}
    // _requestHandler is called the timer to avoid sending messages too fast
    _requestHandler() {
        //console.debug("Game Client is going to send a message to the server, the clock tick'd!");
        //console.debug("_requestHandler Time: " + new Date());
        let timeframe = model.connectionTimeframe;
        if(this.isOdd(this._schedulerCounter) ){
            if(this._wsRequests_cmd.length > 0) {
                //console.debug("Game Client's request queue is not empty.");
                let msg = this._wsRequests_cmd.shift();
                //console.debug("_requestHandler isOdd && CMD");
                this._ws.send(msg.msg + "\n");
                this._wsQueue.push(msg.tag);
                this._noRequestsCount = 0;
                this._schedulerCounter++;
                //console.debug("Game Client actually sent " + msg);
            } else if(this._wsRequests_look.length > 0) {
                    //console.debug("Game Client's request queue is not empty.");
                    let msg = this._wsRequests_look.shift();
                    //console.debug("_requestHandler isOdd && LOOK");
                    this._ws.send(msg.msg + "\n");
                    this._wsQueue.push(msg.tag);
                    this._noRequestsCount = 0;
                    //console.debug("Game Client actually sent " + msg);
            } else {
                timeframe = 100;
                this._noRequestsCount++;
                if(this._noRequestsCount >= 300) {
                    //console.debug("_requestHandler isOdd && NOP");
                    this._noRequestsCount = 0;
                    this.nop(); // TODO gamename nop
                    timeframe = model.connectionTimeframe;
                }
            }
        } else {
            if(this._wsRequests_look.length > 0) {
                //console.debug("Game Client's request queue is not empty.");
                let msg = this._wsRequests_look.shift();
                //console.debug("_requestHandler isEven && LOOK");
                this._ws.send(msg.msg + "\n");
                this._wsQueue.push(msg.tag);
                this._noRequestsCount = 0;
                this._schedulerCounter++;
                //console.debug("Game Client actually sent " + msg);
            } else if(this._wsRequests_cmd.length > 0) {
                //console.debug("_requestHandler isEven && CMD");
                let msg = this._wsRequests_cmd.shift();
                //console.debug("Game Client is going to actually send the message " + msg);
                this._ws.send(msg.msg + "\n");
                this._wsQueue.push(msg.tag);
                this._noRequestsCount = 0;
                //console.debug("Game Client actually sent " + msg);
            } else {
                timeframe = 100;
                this._noRequestsCount++;
                if(this._noRequestsCount >= 300) {
                    this._noRequestsCount = 0;
                    this.nop(); // TODO gamename nop
                    //console.debug("_requestHandler isEven && NOP");
                    timeframe = model.connectionTimeframe;
                }
            }
        }
        // Repeat endlessly
        //console.debug("Game Client is going to set the timer to fire again in " + timeframe + "ms.");
        window.setTimeout(function(){ this._requestHandler() }.bind(this), timeframe);
        //console.debug("Game Client has set the timer for its queue.");
    }

    _close() {
        this._ws.close();
    }

    /* SESSION interface */

    createGame(gameName) {
        //console.debug("Game Client is requesting a game creation for " + gameName);
        let msg = this._lobby.createGame(gameName);
        this._send("miticoOggettoCheNonEsiste.CREATE_GAME", msg);
    }

    joinGame(gameName, characterName) {
        //console.debug("Game Client is joining game named " + gameName);
        model.status.ga = gameName;
        let msg = this._lobby.joinGame(gameName, characterName);
        this._send("miticoOggettoCheNonEsiste.JOIN_GAME", msg);
    }
    
    spectateGame(gameName) {
        //console.debug("Game Client is joining game named " + gameName);
        model.status.ga = gameName;
        let msg = this._lobby.spectateGame(gameName);
        this._send("miticoOggettoCheNonEsiste.SPECTATE_GAME", msg);
    }

    startGame() {
        //console.debug("Game Client is starting the current game.");
        let gameName = model.status.ga;
        let msg = this._lobby.startGame(gameName);
        this._send("miticoOggettoCheNonEsiste.START_GAME", msg);
    }

    leave() {
        //console.debug("Game Client is requesting to leave.");
        let msg = this._lobby.leave(model.status.ga);
        this._send("miticoOggettoCheNonEsiste.LEAVE", msg);
    }

    login(username){
        //console.debug("Game Client is requesting to login for user " + username);
        let msg = this._auth.login(username);
        //this._send("miticoOggettoCheNonEsiste.LOGIN", msg);
        return true;
    }
    
    /* MATCH interface */
    getStatus(gameName){
        //console.debug("Game Client is requesting a game status for " + gameName);
        let msg = this._sync.getStatus(gameName);
        this._send("STATUS", msg);
    }

    static UP = "N";
    static DOWN = "S";
    static LEFT = "W";
    static RIGHT = "E";

    lookMap(gameName) {
        //console.debug("Game Client is requesting a map for " + gameName);
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
        this._send("miticoOggettoCheNonEsiste.SHOOT:" + direction, msg);
    }

    accuse(teammateName) {
        console.debug("Game Client is requesting a vote of no confidence for teammate: " + teammateName);
        // alert("A vote of no confidence for teammate: " + teammateName);
        popupMsg("A vote of no confidence for teammate: " + teammateName,"warning");

    }

    nop() {
        console.debug("Game Client is requesting a nop");
        let msg = this._sync.nop(model.status.ga);
        this._send("miticoOggettoCheNonEsiste.NOP", msg);
    }
}
