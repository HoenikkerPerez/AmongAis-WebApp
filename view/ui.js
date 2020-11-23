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
        // alert("This is The END ... my only frien, the END! (DOORS) \n to Restart, Refresh page. (I can't do all stuff for you!)");
        popupMsg("Match is START: Let's get ready to rumble!!!!!", "success");
    }

    _gameEnded(message) {
        // alert("This is The END ... my only frien, the END! (DOORS) \n to Restart, Refresh page. (I can't do all stuff for you!)");
        popupMsg("This is The END ... my only friend, the END! (DOORS) \n" 
        + message 
        + "\nto Restart, Refresh page. (Thank You to use our Web-Client!)", "info");
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
    };

     _loadUI() {

    }
}

