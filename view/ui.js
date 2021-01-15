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
        // Load WorldUI
        let context = document.getElementById("canvas").getContext("2d");
        let worldui = new WorldUi(context);
        // Load HUD
        let hudui = new HudUi();
    };

    _gameActivated() {
        // Start game
        document.getElementById("homeUI").style.display = "none";
        document.getElementById("navigation-bar").style.display = "none";
        console.debug("UI: gameActivated");

        // create table for WORLD | HUD | CHAT
        document.getElementById("console").style.display = "";        
    };

    _gameDeactivated() {
        // Enable home view
        document.getElementById("homeUI").style.display = "";
        document.getElementById("navigation-bar").style.display = "";
        console.debug("UI: gameDeactivated");

        // Remove match view
        document.getElementById("console").style.display = "none";
    }

    _gameStarted(){
        _popupMsg("Match is START: Let's get ready to rumble!!!!!", "success");
    }

    _gameEnded(message) {
        _popupMsg("This is the END ... my only friend, the END! (The Doors)" 
        + "\nThank you for using our Web Client!", "info");

        document.getElementById("endgame-title").innerText = message;

        new DatalogMatch("END",1,{extra:message});
    }

    // _refreshLadder() {
    //     let endgameDiv = document.getElementById("endgame-ladder");
    //     endgameDiv.innerHTML = '';
    //     for(let endscore of model.endgameScore) {
    //         let el = document.createElement("h4");
    //         let teamColor = endscore.team == "0" ? "red" : "blue";
    //         el.innerText = endscore.score + " / " + endscore.name;
    //         el.style.color = teamColor;
    //         endgameDiv.appendChild(el);
    //     }
    //     endgameDiv = document.getElementById("endgame");
    //     endgameDiv.style.display="";
    //     //left-hud
    //     let leftHUD = document.getElementById("left-hud");
    //     leftHUD.style.display="none";
    // }

    _refreshLadder() {
        let tournamentModalLabel = document.getElementById("resultsModalLabel");
        tournamentModalLabel.innerHTML = "SCORES"

        let tournamentModalBody = document.getElementById("resultsModalBody");
        tournamentModalBody.innerHTML = '';

        let resultsTable = document.createElement("table")
        resultsTable.classList.add("table");
        resultsTable.classList.add("text-white");
        
        let tr = document.createElement("tr");

        let t1= document.createElement("th");
        t1.innerHTML = "Name";

        let t2 = document.createElement("th");
        t2.innerHTML = "Score";

        let t3 = document.createElement("th");
        t3.innerHTML = "Team";

        tr.appendChild(t1);
        tr.appendChild(t2);
        tr.appendChild(t3);

        resultsTable.appendChild(tr)

        model.endgameScore.forEach(endscore => {
            let tEl = document.createElement("tr");

            let usernameEl = document.createElement("td");
            usernameEl.innerHTML = endscore.name;
            
            let scoreEl = document.createElement("td");
            scoreEl.innerHTML = endscore.score;
            
            let teamEl = document.createElement("td");
            // teamEl.innerHTML = endscore.team;
            let dot = document.createElement("span")
            let teamClass = endscore.team == "0" ? "redDot" : "blueDot";
            dot.classList.add(teamClass);
            teamEl.appendChild(dot)

            tEl.appendChild(usernameEl);
            tEl.appendChild(scoreEl);
            tEl.appendChild(teamEl);
            
            resultsTable.appendChild(tEl);   
        });
        tournamentModalBody.appendChild(resultsTable);
        $('#resultsModal').modal('toggle');
    }

    _showSurvey() {
        $('#surveyModal').on('hidden.bs.modal', function () {
            let rating = 0;
            let ratingEl = Array.from(document.getElementsByName("ratingRadio")).find(r => r.checked)
            if(ratingEl != undefined)
                rating = ratingEl.value;
            let whyText = document.getElementById("whySurveyInput").value;
            console.log("********** SURVEY SUBMITTED!!! *********")
            console.log(whyText)
            new DatalogMatch("SURVEY", 1, {evaluation_survey:rating, why_survey:whyText, extra:model.kind});
            $(this).off('hidden.bs.modal');

        });
        // $('#surveyModal').modal('toggle');
    }


    _loadWsMessages() {
        console.debug("UI: _loadWsMessages");

        document.addEventListener("MODEL_RUN_GAME", (e) => {
            let running = e.detail.running;
            console.debug("Ui has received a running variation. So isRunning is now " + running);
            if(running) {
                this._gameActivated();
                if(model.kind == model.PLAYER) {
                    let msg = "Gameplay instructions:\n";
                    msg += "Keyboard movement: [W][A][S][D]\n"
                    msg += "Keyboard Shoot: [  space-bar  ]\n"
                    msg += "Zoom +/- : Mouse-Weel\n"
                    msg += "Move view on map: Muouse-Left drag-n-drop\n"
                    msg += "Mouse Shoot: Muouse-Right\n"
                    msg += "Path-Finding: [Ctrl] + Mouse-Left\n"
                    popupMsg(msg,"info",30000);
                }
            } else {
                this._gameDeactivated();
            }
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
            // this._showSurvey();
            // window.setTimeout(function(){ 
            //     this._showSurvey();
            // }.bind(this), 2000);
            
            // open modal results
            // $('#resultsModal').modal('toggle');
        }, false);

        document.addEventListener("MODEL_ENDGAME_SCORE_ADDED", () => {
            this._refreshLadder();
            // this._showSurvey();
        });

        document.addEventListener("MODEL_POPUP_MSG", (evt) => {
            let popup = evt.detail;
            _popupMsg(popup.msg, popup.kind, popup.timeout);
        }, false);

    };

     _loadUI() {

    }
}

