class MatchController {
    _gameClient;
    _lastDirection = {direction: GameClient.UP}; // Not in model because it's intended to be part of the interaction. The server actually allows to shoot in a different direction.

    constructor(gameClient) {
        this._gameClient = gameClient;
        this.load();
    }

    getLastDirection() {
        return this._lastDirection;
    }

    humanHandler(event, gameClient, lastDirection) {
        switch(event.key) {
            case " ":
                // SHOOT
                console.debug("MatchController is asking the game client to SHOOT in the last direction moved (" + lastDirection.direction + ").");
                gameClient.shoot(lastDirection.direction);
                this.eventualConsistentShot(lastDirection.direction);
                break;
            default:
                // MOVE. Moving also sets the lastDirection in which the player shoots.
                let newDirection = undefined;
                switch(event.key) {
                case "w":
                    console.debug("MatchController acknowledged the wish of the player to MOVE UP and is going to behave accordingly.");
                    newDirection = GameClient.UP;
                    break;
                case "a":
                    console.debug("MatchController acknowledged the wish of the player to MOVE LEFT and is going to behave accordingly.");
                    newDirection = GameClient.LEFT;
                    break;
                case "s":
                    console.debug("MatchController acknowledged the wish of the player to MOVE DOWN and is going to behave accordingly.");
                    newDirection = GameClient.DOWN;
                    break;
                case "d":
                    console.debug("MatchController acknowledged the wish of the player to MOVE RIGHT and is going to behave accordingly.");
                    newDirection = GameClient.RIGHT;
                    break;
                }
                if(newDirection) {
                    console.debug("MatchController is asking the game client to move " + newDirection);
                    gameClient.move(newDirection);
                    lastDirection.direction = newDirection;
                }
        }
    }

    lookMapHandler(evt) {
        //LOOK MAP save to model
        //console.debug("LOOKMAPHANDLER " + evt.detail);
        let msgOk = evt.detail.startsWith("OK");
        if(!msgOk){
            return;
        }
        // parse map
        let map = evt.detail;
        let parsed_map = map.slice(7).replace('«ENDOFMAP»', '').replace(/\n/g, '').split('');
        let N = Math.sqrt(parsed_map.length);
        let map_obj = {
            cols: N,
            rows: N,
            tsize: 32,
            tiles: parsed_map
        }
        // update model
        model.setMap(map_obj);
        // send notification to render component

    };

    // Lasers

    computeShootOnMap(shooterPosition, direction) {

        let stopsBullet = (tile) => {
            console.error("check &");
            if(tile == "&") return true;
            console.error("check #");
            if(tile == "#") return true;
            return false;
        }

        let deltaX = 0, deltaY = 0;
        switch(direction) {
            case GameClient.UP:
                deltaY = -1;
                break;
            case GameClient.DOWN:
                deltaY = 1;
                break;
            case GameClient.LEFT:
                deltaX = -1;
                break;
            case GameClient.RIGHT:
                deltaX = 1;
                break;
        }
        let firstX = shooterPosition.x + deltaX;
        console.error("firstX: " + firstX);
        let firstY = shooterPosition.y + deltaY;
        console.error("firstY: " + firstY);
        let limitX = model._map.cols;
        console.error("limitX: " + limitX);
        let limitY = model._map.rows;
        console.error("limitY: " + limitY);
        let cells = 0;
        let bulletStopped = false;
        for(
            let c = firstX, r = firstY;

            c < limitX && r < limitY &&
            r >= 0 && c >= 0 &&
            !bulletStopped;

            r += deltaY, c += deltaX
        ) {
            let idx = r * model._map.cols + c;
            bulletStopped = stopsBullet(model._map.tiles[idx]);
            console.error("bulletStopped: " + bulletStopped);
            if(!bulletStopped) {
                model._map.tiles[idx] = "*";
                cells++;
            }
        }
        console.error("Match Controller: shot over " + cells + " cells.");
    }

    eventualConsistentShot(direction) {
        if(!model.local.shot) {
            // I'll avoid making a copy of the whole map...
            let position = model.local.me.position;
            this.computeShootOnMap(position, direction);
            console.debug("Match Controller computed the map with the shot and is going to set the new map in the model.");
            model.setMap(model._map); // horrible
            model.local.shot = true;
        }
    }

    // Map view management

    onwheelHandler = function (event){
        event.preventDefault();
        // Get mouse offset.
        var mousex = event.clientX - canvas.offsetLeft;
        var mousey = event.clientY - canvas.offsetTop;
        // Normalize wheel to +1 or -1.
        var wheel = event.deltaY < 0 ? 1 : -1;
    
        // Compute zoom factor.
        var zoom = Math.exp(wheel*zoomIntensity);
        
        // Translate so the visible origin is at the context's origin.
        context.translate(originx, originy);
      
        // Compute the new visible origin. Originally the mouse is at a
        // distance mouse/scale from the corner, we want the point under
        // the mouse to remain in the same place after the zoom, but this
        // is at mouse/new_scale away from the corner. Therefore we need to
        // shift the origin (coordinates of the corner) to account for this.
        originx -= mousex/(scale*zoom) - mousex/scale;
        originy -= mousey/(scale*zoom) - mousey/scale;
        
        // Scale it (centered around the origin due to the trasnslate above).
        context.scale(zoom, zoom);
        // Offset the visible origin to it's proper position.
        context.translate(-originx, -originy);
    
        // Update scale and others.
        scale *= zoom;
        visibleWidth = width / scale;
        visibleHeight = height / scale;
    }
    mapPoller() {
        //console.debug("Polling map")
        let gameName = model.status.ga;
        
        this._gameClient.lookMap(gameName);
        // setMap()
    };

    accuseHandler(evt, gameClient){
        let teammate = evt.detail;
        gameClient.accuse(teammate);
    };

    startHandler = function (evt) {
        switch(evt.key) {
            case "Enter":
                // START
                console.debug("MatchController is asking the game client to START the joined game after the ENTER key.");
                this._gameClient.startGame();
                break;
            case "Escape":
                // LEAVE
                if(model.status.gameActive){
                    console.debug("MatchController is asking the game client to LEAVE after the ESCAPE key.");
                    this._gameClient.leave();
                }
                break;
        }
    };


    getStatusHandler(evt){
        //console.debug("getStatusHandler: " + evt.detail);
        let msgOk = evt.detail.startsWith("OK");
        if(!msgOk){
            // alert("HUD[!]" + evt.detail);
            popupMsg("[!] getStatusHandler" + evt.detail, "danger");
            return;
        }
        let status = {};
        let ga = {};
        let me = {}
        status.pl_list = [];        


        let stat = evt.detail.slice(7).replace("«ENDOFSTATUS»",'').trim().split('\n');
        let ga_list = stat[0].slice(4).split(' ')
        for(let j=0;j<ga_list.length;j++){
            let key = ga_list[j].split('=')[0]
            let value = ga_list[j].substring(ga_list[j].indexOf('=')+1);
            ga[key] = value
        }
        status.ga = ga.name;
        status.state = ga.state;
        status.size = ga.size;
        status.me = me;

        if(stat.length>1){
            let pl_start=2;
            if(stat[1].startsWith("ME:")){
                let me_list = stat[1].slice(4).split(' ');
                for(let j=0;j<me_list.length;j++){
                    let key =me_list[j].split('=')[0]
                    let value =  me_list[j].substring( me_list[j].indexOf('=')+1);
                    me[key] = value
                }
            }
            else{
                pl_start=1;
            }
            
            let pls = [];
            for(let i=pl_start;i<stat.length;i++){
                let pl = {};
                let pl_list = stat[i].slice(4).split(' ')
                for(let j=0;j<pl_list.length;j++){
                    let key = pl_list[j].split('=')[0]
                    let value =  pl_list[j].substring( pl_list[j].indexOf('=')+1);
                    pl[key] = value
                }
                pls.push(pl);
            }
            status.me = me;
            status.pl_list = pls;        
        }

        model.setStatus(status);
    };

    statusPoller(){
        //console.debug("status poller run");
        let gameName = model.status.ga;
        //console.debug("matchController: try to get status for " + gameName);
        this._gameClient.getStatus(gameName)
    };

    _pollOnce() {
        this.mapPoller();
        this.statusPoller();
    };

    _poller() {
        let timeframe = model.timeframe;
        this._pollOnce();
        window.setTimeout(function(){ this._poller() }.bind(this), timeframe);
    }

    

    load() {
        // All listeners common to every kind of user
        document.addEventListener("miticoOggettoCheNonEsiste.LOOK_MAP", this.lookMapHandler, false);
        
        // DEBUG: Status button
        // document.getElementById("statusButton").addEventListener("click", () => {
        //     this.statusPoller();
        // });

        document.addEventListener("STATUS", this.getStatusHandler, false);
        // document.addEventListener("ACCUSE", (evt) => {this.accuseHandler(this._gameClient)}, false);

        // document.addEventListener("MODEL_SETGAMENAME", this.init, false);
        document.addEventListener("MODEL_RUN_GAME", () => {
            // Init human commands
            // Session-related commands during the lobby (keys)
            document.addEventListener("keyup", this.startHandler.bind(this), false);
            // Init map polling
            this._pollOnce();
            // Loads the specialized listeners
            switch(model.local.kind) {
                case model.PLAYER:
                    console.debug("Match Controller is loading the player listeners...");
                    this._loadPlayerOnRunGame();
                break;
                case model.SPECTATOR:
                    console.debug("Match Controller is loading the spectator listeners...");
                    this._loadSpectatorOnRunGame();
                break;
                default:
                    console.error("Unable to retrieve user kind.");
                    popupMsg("Are you a PLAYER or a SPECTATOR?", "danger");
            }
        }, false);
    };

    // Player-specific listeners

    _loadPlayerOnRunGame() {
        document.addEventListener("MODEL_MATCH_STATUS_ACTIVE", () => {
            // Init human commands
            console.debug("match-controller catches MODEL_MATCH_STATUS_ACTIVE")
            document.addEventListener("keyup", (evt) => {this.humanHandler(evt, this._gameClient, this._lastDirection)}, false);
            document.addEventListener("ACCUSE", (evt) => {this.accuseHandler(evt, this._gameClient)}, false);
            model.timeframe = model.playerTimeframe;
            this._poller();
        }, false);
        
        document.addEventListener("MODEL_PLAYER_JOINED", () => {
        this._pollOnce();
        }, false);
    }

    // Spectator-specific listeners

    _loadSpectatorOnRunGame() {
        document.addEventListener("MODEL_MATCH_STATUS_ACTIVE", () => {
            // Init human commands
            model.timeframe = model.spectatorTimeframe;
            this._poller();
        }, false);
    }
    
};