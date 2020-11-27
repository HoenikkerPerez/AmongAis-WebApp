class GameClient {
    _clientType;

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
    _waitingResponse;
    _lastResponse;
    _nopTime;
    __noRequestsTime;
    constructor(clientType) {
        this._connect();
        this._lobby = new LobbyManager();
        this._clientType = clientType;
        // TODO: Change with real login _send/_receive functions
        this._auth = new AuthManager();
        this._sync = new MatchSync();
    }

    _connect() {
        console.debug("Game Client is connecting...");
        this._ws = new WebSocket(model.net.game.ws, ['binary','base64']);
        this._ws.onopen = function(evt) { console.debug("Game Client opened the WebSocket.") };
        this._ws.onclose = function(evt) { 
            popupMsg("Game Server closed the connection!", "danger");
            console.debug("Game Client closed the connection.") };
        this._ws.onerror = function(evt) { 
            popupMsg("Game Server connection error!", "danger");
            console.error("Game Client error: " + evt); 
        };

        this._wsQueue = [];
        this._ws.onmessage = async function(evt) {
            this._waitingResponse = false;
            this._lastResponse;
            let msg = await evt.data.text();
            let msgtag = this._wsQueue.shift()
            //console.debug(this._clientType + " received a message - " + msgtag);
            // console.debug("Game Client: Dispatching event" + msgtag);
            document.dispatchEvent(new CustomEvent(msgtag, {detail: msg }));
        }.bind(this)

        this._nopTime = new Date();
        console.debug("Game Client is initializing the request queue.");
        this._wsRequests = [];
        this._noRequestsTime = new Date();
        this._waitingResponse = false;
        this._lastResponse = new Date();
        
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
        let timeframe = model.connectionTimeframe;
        //console.debug("Game Client is going to send a message to the server, the clock tick'd!");
        //console.debug("_requestHandler Time: " + new Date());
        let now = new Date()
        let elapsed = now - this._lastResponse;
        if (elapsed < timeframe) {
            let deltaTimeframe = timeframe - elapsed + 50; // add a little more waiting time
            console.debug("_requetHandler waiting " + deltaTimeframe + " ms")
            window.setTimeout(function(){ this._requestHandler() }.bind(this), deltaTimeframe);
            return;
        }
        
        if(this.isOdd(this._schedulerCounter) ){
            if(this._wsRequests_cmd.length > 0) {
                //console.debug("Game Client's request queue is not empty.");
                let msg = this._wsRequests_cmd.shift();
                //console.debug("_requestHandler isOdd && CMD");
                this._ws.send(new Blob([msg.msg + "\n"], {type: 'text/plain'}));
                this._waitingResponse = true;

                this._wsQueue.push(msg.tag);
                this._noRequestsTime = new Date();
                this._schedulerCounter++;
                //console.debug("Game Client actually sent " + msg);
            } else if(this._wsRequests_look.length > 0) {
                    //console.debug("Game Client's request queue is not empty.");
                    let msg = this._wsRequests_look.shift();
                    //console.debug("_requestHandler isOdd && LOOK");
                    this._ws.send(new Blob([msg.msg + "\n"], {type: 'text/plain'}));
                    this._waitingResponse = true;

                    this._wsQueue.push(msg.tag);
                    this._noRequestsTime = new Date();
                    //console.debug("Game Client actually sent " + msg);
            } else {
                timeframe = 100;
                this._noRequestsCount++;
                // if(this._noRequestsCount >= 300) {
                if((new Date() - this._noRequestsTime) >= model.nopTimeframe) { 
                    //console.debug("_requestHandler isOdd && NOP");
                    this.nop(); // TODO gamename nop
                    timeframe = model.connectionTimeframe;
                    this._noRequestsTime = new Date();
                }
            }
        } else {
            if(this._wsRequests_look.length > 0) {
                //console.debug("Game Client's request queue is not empty.");
                let msg = this._wsRequests_look.shift();
                //console.debug("_requestHandler isEven && LOOK");
                this._ws.send(new Blob([msg.msg + "\n"], {type: 'text/plain'}));
                this._waitingResponse = true;

                this._wsQueue.push(msg.tag);
                
                this._noRequestsTime = new Date();
                this._schedulerCounter++;
                //console.debug("Game Client actually sent " + msg);
            } else if(this._wsRequests_cmd.length > 0) {
                //console.debug("_requestHandler isEven && CMD");
                let msg = this._wsRequests_cmd.shift();
                //console.debug("Game Client is going to actually send the message " + msg);
                this._ws.send(new Blob([msg.msg + "\n"], {type: 'text/plain'}));
                this._waitingResponse = true;

                this._wsQueue.push(msg.tag);
                this._noRequestsTime = new Date();
                //console.debug("Game Client actually sent " + msg);
            } else {
                timeframe = 100;
                this._noRequestsCount++;
                if((new Date() - this._noRequestsTime) >= model.nopTimeframe) {
                    this.nop(); // TODO gamename nop
                    //console.debug("_requestHandler isEven && NOP");
                    timeframe = model.connectionTimeframe;
                    this._noRequestsTime = new Date();
                }
            }
        }
        // console.debug("Game Client _waitingResponse = " + this._waitingResponse)
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

    startGame(gameName) {
        //console.debug("Game Client is starting the current game.");
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

    nop() {
        console.debug("nopElapsed: " + (new Date() - this._nopTime))
        this._nopTime = new Date();
        console.debug("Game Client is requesting a nop");
        let msg = this._sync.nop(model.status.ga);
        this._send("miticoOggettoCheNonEsiste.NOP", msg);
    }

    // PLAYER ACTIONS

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
        this._send("miticoOggettoCheNonEsiste.SHOOT", msg);
    }

    // SOCIAL DEDUCTION

    accuse(teammateName) {
        console.debug("Game Client is requesting a vote of no confidence for teammate: " + teammateName);
        let msg = this._sync.accuse(model.status.ga, teammateName);
        this._send("miticoOggettoCheNonEsiste.ACCUSE", msg);
    }

    // TOURING GAME

    static HUMAN = "H";
    static AI = "AI";

    tour(name, choice) {
        console.debug("Game Client is requesting a touring choice for " + name + " being " + choice);
        let msg = this._sync.touringChoice(model.status.ga, name, choice);
        this._send("miticoOggettoCheNonEsiste.TOURING", msg);
    }

}
