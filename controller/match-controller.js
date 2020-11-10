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
                    console.debug("MatchController is asking the game client to moove " + newDirection);
                    gameClient.move(newDirection);
                    lastDirection.direction = newDirection;
                }
        }
    }

    lookMapHandler(evt) {
        //LOOK MAP save to model
        console.debug("LOOKMAPHANDLER " + evt.detail);
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

    mapPoller() {
        let timeframe = model.timeframe;
        console.debug("Polling map")
        let gameName = model.status.ga;
        
        this._gameClient.lookMap(gameName);
        // setMap()
        window.setTimeout(function(){ this.mapPoller() }.bind(this), timeframe);
    };

    getStatusHandler(event) {}

    load() {
        document.addEventListener("miticoOggettoCheNonEsiste.LOOK_MAP", this.lookMapHandler, false);
        document.addEventListener("miticoOggettoCheNonEsiste.STATUS", this.getStatusHandler, false);
        // document.addEventListener("MODEL_SETGAMENAME", this.init, false);
        document.addEventListener("MODEL_SETGAMEACTIVE", () => {
            // Init human commands
            document.addEventListener("keyup", (evt) => {this.humanHandler(evt, this._gameClient, this._lastDirection)}, false);
            // Init map polling
            let timeframe = model.timeframe;
            window.setTimeout(function(){ this.mapPoller() }.bind(this), timeframe);
        }, false);
    };
    
};