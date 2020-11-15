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

    _gameEnded() {
        alert("This is The END ... my only frien, the END! (DOORS) \n to Restart, Refresh page.")
    }

    _loadWsMessages() {
        console.debug("UI: _loadWsMessages");

        document.addEventListener("MODEL_SETGAMEACTIVE", () => {
            this._gameActivated();
        }, false);

        document.addEventListener("MODEL_ENDGAME", () => {
            this._gameEnded();
        }, false);

    };

     _loadUI() {

    }
}

