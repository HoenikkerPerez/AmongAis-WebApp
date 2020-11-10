var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

class MatchController {
    _gameclient;

    constructor(gameclient) {
        this._gameclient = gameclient;
        this.load();
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
        
        this._gameclient.lookMap(gameName);
        // setMap()
        window.setTimeout(function(){ this.mapPoller() }.bind(this), timeframe);
    };

    getStatusHandler(event) {}

    load() {
        document.addEventListener("miticoOggettoCheNonEsiste.LOOK_MAP", this.lookMapHandler, false);
        document.addEventListener("miticoOggettoCheNonEsiste.STATUS", this.getStatusHandler, false);
        // document.addEventListener("MODEL_SETGAMENAME", this.init, false);
        document.addEventListener("MODEL_SETGAMEACTIVE", () => {
                let timeframe = model.timeframe;
                window.setTimeout(function(){ this.mapPoller() }.bind(this), timeframe);
            }, false);
    };
    
};