class MatchController {
    
    // This class controls:
    // PHYSICAL GAME
    // MAP HANDLING
    // STATUS HANDLING
    // POLLING
    // SOCIAL DEDUCTION GAME
    // TOURING GAME
    // LISTENERS

    _gameClient;
    _lastDirection = {direction: GameClient.UP}; // Not in model because it's intended to be part of the interaction. The server actually allows to shoot in a different direction.

    constructor(gameClient) {
        this._gameClient = gameClient;
        this.load();
    }

    /* PHYSICAL GAME */

    getLastDirection() {
        return this._lastDirection;
    }

    humanHandler(event, gameClient, lastDirection) {
        switch(event.key) {
            case " ":
                // SHOOT
                console.debug("MatchController is asking the game client to SHOOT in the last direction moved (" + lastDirection.direction + ").");
                gameClient.shoot(lastDirection.direction);
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

    // Laser

    shootHandler(evt, direction) {
        console.debug("Match Controller has received a SHOOT response. Direction: " + direction);
        let msgOk = evt.detail.startsWith("OK");
        if(msgOk) {
            // I'll avoid making a copy of the whole map...
            let position = model.status.me.position;
            this.computeShootOnMap(position, direction);
            console.debug("Match Controller computed the map with the shot and is going to set the new map in the model.");
            model.setMap(model._map); // update needed to fire the rendering action
        } else {
            console.error("Match Controller retrieved an error from the server while shooting.");
        }
    }

    /* MAP HANDLING */

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
        // extract local interesting information from the map
    };


    /**
     * This function was once used with this code:
     * 
     *         this.applyOnMapEntities([
            [model.status.me.symbol,
                (x,y) => { model.status.me.position = {x:x, y:y} }],
            // [symbol, (x,y) => { handlers }],
        ]);
     *
     * I hope it'll be needed again. I had a lot of fun in writing it.
     * 

    applyOnMapEntities(symbolFunctionList) {
        let map = model._map;
        // foreach element in map
        for(let r = 0; r < map.rows; r++) {
            for(let c = 0; c < map.cols; c++) {
                // Compute cell index
                let idx = r * map.cols + c;
                let tile = map.tiles[idx];
                // Check foreach symbol in the list
                for(let sf of symbolFunctionList) {
                    //console.debug(map[idx] + "=?=" + sf[0]);
                    if(tile == sf[0]) {
                        console.debug("Match Controller found " + sf[0] + " AT " + c + "," + r + " in map. Applying now " + sf[1] + " on that position.");
                        sf[1](c,r);
                    }
                }
            }
        }
    }

    */

    computeShootOnMap(shooterPosition, direction) {
        console.debug("Match Controller is computing SHOOT in direction " + direction + " from position: " + shooterPosition.x + "," + shooterPosition.y);
        
        let stopsBullet = (tile) => {
            //console.debug("check &");
            if(tile == "&") return true;
            //console.error("check #");
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
        //console.debug("firstX: " + firstX);
        let firstY = shooterPosition.y + deltaY;
        //console.debug("firstY: " + firstY);
        let limitX = model._map.cols;
        //console.debug("limitX: " + limitX);
        let limitY = model._map.rows;
        //console.debug("limitY: " + limitY);
        let cells = 0;
        let bulletStopped = false;
        for(
            let c = firstX, r = firstY;

            c < limitX && r < limitY &&
            r >= 0 && c >= 0 &&
            !bulletStopped;

            c += deltaX, r += deltaY
        ) {
            let idx = r * model._map.cols + c;
            let tile = model._map.tiles[idx];
            console.log("Checking " + r + "," + c + " (" + tile + ")");
            bulletStopped = stopsBullet(tile);
            //console.debug("bulletStopped: " + bulletStopped);
            if(!bulletStopped) {
                model._map.tiles[idx] = "*";
                cells++;
            }
        }
        console.debug("Match Controller: shot over " + cells + " cells.");
    }

    /* STATUS HANDLING */

    startHandler = function (evt) {
        switch(evt.key) {
            // case "Enter":
            //     // START
                //  console.debug("MatchController is asking the game client to START the joined game after the ENTER key.");
            //     this._gameClient.startGame();
            // break;
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
        let me = {};
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
            
            let pls = {};
            for(let i=pl_start;i<stat.length;i++){
                let pl = {};
                let pl_list = stat[i].slice(4).split(' ')
                for(let j=0;j<pl_list.length;j++){
                    let key = pl_list[j].split('=')[0]
                    let value =  pl_list[j].substring( pl_list[j].indexOf('=')+1);
                    pl[key] = value
                }
                pls[pl.name] = pl;
            }
            status.me = me;
            status.pl_list = pls;
        }

        console.debug(status.pl_list.length);

        model.setStatus(status);
    };

    /* POLLING */

    mapPoller() {
        //console.debug("Polling map")
        let gameName = model.status.ga;
        
        this._gameClient.lookMap(gameName);
        // setMap()
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

    /* SOCIAL DEDUCTION GAME */

    accuseResponseHandler(evt){
        console.debug("Match Controller has received a ACCUSE response"); 
        let msgOk = evt.detail.startsWith("OK");
        if(msgOk) {
            console.debug("Match Controller accept an accuse");
        } else {
            console.error("Match Controller retrieved an error from the server while accusing.");
        }
    };

    /* SOCIAL DEDUCTION GAME */

    _touringQueue = []; // {name: string, touring: string}

    touringResponseHandler(evt, choice) {
        console.debug("MatchController is setting touring choice for " + model.status.pl_list[choice.name].name + " as " + choice.touring);
        model.status.pl_list[choice.name].touring = choice.touring;
    }

    /* LISTENERS */

    // All listeners common to every kind of user

    load() {
        document.addEventListener("miticoOggettoCheNonEsiste.LOOK_MAP", (this.lookMapHandler).bind(this), false);

        // Shoot events
        document.addEventListener("miticoOggettoCheNonEsiste.SHOOT:N", ((evt) => { this.shootHandler(evt, GameClient.UP) }).bind(this), false);
        document.addEventListener("miticoOggettoCheNonEsiste.SHOOT:S", ((evt) => { this.shootHandler(evt, GameClient.DOWN) }).bind(this), false);
        document.addEventListener("miticoOggettoCheNonEsiste.SHOOT:W", ((evt) => { this.shootHandler(evt, GameClient.LEFT) }).bind(this), false);
        document.addEventListener("miticoOggettoCheNonEsiste.SHOOT:E", ((evt) => { this.shootHandler(evt, GameClient.RIGHT) }).bind(this), false);

        // DEBUG: Status button
        // document.getElementById("statusButton").addEventListener("click", () => {
        //     this.statusPoller();
        // });
        
        // ACCUSE 
        document.addEventListener("miticoOggettoCheNonEsiste.ACCUSE", ((evt) => { this.accuseResponseHandler(evt) }).bind(this), false);

        // TOURING
        document.addEventListener("miticoOggettoCheNonEsiste.TOURING", ((evt) => { this.touringResponseHandler(evt, this._touringQueue.shift()) }).bind(this), false);

        // STATUS
        document.addEventListener("STATUS", this.getStatusHandler, false);

        // document.addEventListener("MODEL_SETGAMENAME", this.init, false);
        document.addEventListener("MODEL_RUN_GAME", () => {
            // Init human commands
            // Session-related commands during the lobby (keys)

            document.getElementById("start-button").addEventListener("click", () => {
                console.debug("MatchController is asking the game client to START the joined game");
                this._gameClient.startGame(model.status.ga);
                // memorize game start time
            });
            // let canvas = document.getElementById("canvas");
            canvas.addEventListener("keyup", this.startHandler.bind(this), false); // TODO REMOVE
            
            // Init map polling
            this._poller(); // TODO this._pollOnce();
            // Loads the specialized listeners
            switch(model.kind) {
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
            let canvas = document.getElementById("canvas");
            canvas.addEventListener("keyup", (evt) => {this.humanHandler(evt, this._gameClient, this._lastDirection)}, false);
            // Accuse Button
            document.addEventListener("BUTTON_ACCUSE", (evt) => {
                popupMsg("A vote of no confidence for teammate: " + teammateName, "warning");
                this._gameClient.accuse(evt.detail);
            }, false);
            // Touring Button
            document.addEventListener("BUTTON_TOURING", (evt) => {
                let name = evt.detail.name;
                let touringChoice = evt.detail.touring;
                this._touringQueue.push({name: name, touring: touringChoice});
                this._gameClient.tour(name, touringChoice);
            }, false);
            // Start game
            model.timeframe = model.playerTimeframe;
            model.setStartGameTime();
            this._poller();
        }, false);
        
        document.addEventListener("MODEL_PLAYER_JOINED", () => {
            this._poller(); // TODO this._pollOnce();
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