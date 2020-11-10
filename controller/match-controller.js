var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

class MatchController {
    _gameclient;

    constructor(gameClient) {
        this.load(gameClient);
    }

    keyDownHandler(event) { // just one direction at the time (manhattan moves)
        if(event.keyCode == 39) {
            rightPressed = true;
        }
        else if(event.keyCode == 37) {
            leftPressed = true;
        }
        else if(event.keyCode == 40) {
            downPressed = true;
        }
        else if(event.keyCode == 38) {
            upPressed = true;
        }
    }

    keyUpHandler(event) {
        if(event.keyCode == 39) {
            rightPressed = false;
        }
        else if(event.keyCode == 37) {
            leftPressed = false;
        }
        else if(event.keyCode == 40) {
            downPressed = false;
        }
        else if(event.keyCode == 38) {
            upPressed = false;
        }
    }

    lookMapHandler(event) {
        //LOOK MAP save to model
        console.log("LOOKMAPHANDLER" + event.data);
        // parse map
        // update model

        // send notification to render component
    };

    mapPoller(gameName, timeframe) {
        this._gameclient.lookMap(gameName);
        window.setTimeout(this.mapPoller, timeframe);
    };
    
    load() {
        document.addEventListener('keydown', this.keyDownHandler, false);
        document.addEventListener('keyup', this.keyUpHandler, false);
        document.addEventListener("miticoOggettoCheNonEsiste.LOOK_MAP", this.lookMapHandler, false);
    };
    
};