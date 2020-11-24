// export default function login(){
//     // var form = document.getElementById("form");
//     var username = document.login_form.username;
//     // console.log(username);
//     window.alert(username);
// }

class Ui {

    constructor() {
        this._load();
    };

    _load() {
        // Listeners for UI
        this._loadWsMessages();
        this._loadUI();
    };

    _gameActivated() {
        // Start game
        document.getElementById("homeUI").remove();
        console.debug("UI: gameActivated");
        // Start canvas
        let context = document.getElementById("canvas").getContext("2d");
        
        // create table for WORLD | HUD | CHAT
        document.getElementById("console").style.display = "";
        let worldui = new WorldUi(context);
        let hudui = new HudUi();
        
    };

    _gameStarted(){
        popupMsg("Match is START: Let's get ready to rumble!!!!!", "success");
    }

    _gameEnded(message) {
        popupMsg("This is the END ... my only friend, the END! (The Doors)" 
        + "\nThank you for using our Web Client!", "info");

        document.getElementById("endgame-title").innerText = message;
    }

    _refreshLadder() {
        let endgameDiv = document.getElementById("endgame");
        for(let endscore of model.endgameScore) {
            let el = document.createElement("h4");
            let teamColor = endscore.team == "0" ? "red" : "blue";
            el.innerText = endscore.score + " / " + endscore.name;
            el.style.color = teamColor;
            endgameDiv.appendChild(el);
        }
    }

    _loadWsMessages() {
        console.debug("UI: _loadWsMessages");

        document.addEventListener("MODEL_RUN_GAME", () => {
            this._gameActivated();
        }, false);

        document.addEventListener("MODEL_MATCH_STATUS_ACTIVE", () => {
            this._gameStarted();
        }, false);

        // TODO only one of the following?
        // document.addEventListener("MODEL_MATCH_STATUS_FINISHED", () => {
        //     this._gameEnded();
        // }, false);

        document.addEventListener("CHAT_GAME_FINISHED", (evt) => {
            let msg = evt.detail.message;
            this._gameEnded(msg);
            
        }, false);

        document.addEventListener("MODEL_ENDGAME_SCORE_ADDED", () => {
            this._refreshLadder();
        });
    };

     _loadUI() {

    }
}

