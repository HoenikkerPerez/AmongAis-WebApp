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
        // parse map
        // update model
    };

    getStatusHandler(event) {

    }
    _updateStatus() {
        document.addEventListener("STATUS", (evt) => {
            document.getElementById("hud").textContent = "Status received";
        }, false);
    }

    load() {
        document.addEventListener('keydown', this.keyDownHandler, false);
        document.addEventListener('keyup', this.keyUpHandler, false);
        document.addEventListener("miticoOggettoCheNonEsiste.LOOK_MAP", this.lookMapHandler, false);
        document.addEventListener("STATUS", this.getStatusHandler, false);
    };
    
};