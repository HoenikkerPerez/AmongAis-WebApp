class SessionController {

    _gameClient;
    sfxAudio;

    constructor(gameClient, sfxAudio) {
        console.debug("SessionController: loading the GameClient instance...");
        this._gameClient = gameClient;
        this.sfxAudio = sfxAudio;
        this._load();

        console.debug("SessionController: loading the listeners for UI events...");

        console.debug("SessionController: ready!");
    };

    _load() {
        console.debug("SessionController: loading the listeners for UI events...");
        // Listeners for UI
        this._loadUI();
        // Listeners for reacting to server responses
        this._loadWsMessages();
    }

    static PLAYER = "player";
    static SPECTATOR = "spectator";

    _joinAs(userKind) {
        let gameName = document.getElementById("gameNameInput").value;
        model.status.ga = gameName;
        let inGameName = document.getElementById("ingamenameInput").value;
        model.inGameName = inGameName;
        let username = model.username;
        console.debug("SessionController: joining a name called " + gameName + " as " + inGameName + " (" + userKind + ")");
        // Join game
        // Spectate game
        switch(userKind) {
            case SessionController.PLAYER:
                this._gameClient.joinGame(gameName, inGameName, username);
                break;
            case SessionController.SPECTATOR:
                this._gameClient.spectateGame(gameName, inGameName, username);
                break;
            default:
                console.error("Session Controller tried to join but it is unable to retrieve user kind (such as player, spectator, etc...)");
        }
    }

    _loginButShouldBeInView(username) {
        this.sfxAudio.playMenuSound(.1);
        // model.inGameName = document.getElementById("ingamenameInput").value;
        document.getElementById("login-form-wrapper").style.display="none";
        document.getElementById("startgame-form-wrapper").style.display="";
        // this._hashEventListener();
        document.getElementById("usernameNavbar").innerHTML = username;
        document.getElementById("navigation-bar").style.display="";
        document.getElementById("ingamenameInput").focus();
    }

    _logoutButShouldBeInView() {
        this.sfxAudio.stopMenuSound();
        // model.inGameName = document.getElementById("ingamenameInput").value;
        document.getElementById("login-form-wrapper").style.display="";
        document.getElementById("startgame-form-wrapper").style.display="none";
        // this._hashEventListener();
        document.getElementById("navigation-bar").style.display="none";
    }

    _loadUI() {
        // Login
        document.getElementById("loginButton").addEventListener("click", () => {
            console.debug("LoginButton has been clicked!");
            let username = document.getElementById("usernameInput").value;
            console.debug("LoginController: try to login for " + username);
            if(this._gameClient.login(username)){
                model.username = username;
                this._loginButShouldBeInView(username);
                // enter event
                new DatalogHome("LOGIN", 1);
                document.removeEventListener("keydown", this._keydownLogin, false);
            }
        });

        // Game name
        let gameNameInput = document.getElementById("gameNameInput");
        gameNameInput.addEventListener("input", this._validateInput);
        
        // InGame name
        let ingamenameInput = document.getElementById("ingamenameInput");
        ingamenameInput.addEventListener("input", this._validateInput)

        // Create game
        document.getElementById("createButton").addEventListener("click", () => {
            let gameName = document.getElementById("gameNameInput").value;
            console.debug("SessionController: creating a name called " + gameName);
            let mapSize = Array.from(document.getElementsByName("mapSizeRadio")).find(r => r.checked).value;
            let mapType = Array.from(document.getElementsByName("mapTypeRadio")).find(r => r.checked).value;
            let balancedTeam = Array.from(document.getElementsByName("teamBalancedRadio")).find(r => r.checked).value == "B"; 
            let battleOfSpecies = document.getElementById("battleOfSpeciesCheckbox").checked;
            this._gameClient.createGame(gameName, mapType, mapSize, balancedTeam, battleOfSpecies);
            // TODO: add here logSettings
            new DatalogMapSettings();
        });

        // Join game
        document.getElementById("joinButton").addEventListener("click", () => {
            this._joinAs(SessionController.PLAYER);
        });
        // Spectate game
        document.getElementById("spectateButton").addEventListener("click", () => {
            this._joinAs(SessionController.SPECTATOR);
        });
        // start game no join
        document.getElementById("startButtonNoJoin").addEventListener("click", () => {
            let gameName = document.getElementById("gameNameInput").value;
            console.debug("SessionController: start game " + gameName + " without joining it");
            this._gameClient.startGame(gameName);
        });

        // validate Login using credential
        let usernameInput = document.getElementById("usernameInput");
        usernameInput.addEventListener("input", this._validateLogin);
        
        $('#popoverBattleOfSpecies').popover({ trigger: "hover" });

        // Logout
        document.getElementById('logoutLink').addEventListener("click", () => {
            model.username = undefined; // Better to avoid explicit null values with model.logout()
            this._logoutButShouldBeInView();
            document.addEventListener("keydown", this._keydownLogin, false);
        }, false)
        // $('#popoverUsernameInput').popover({ trigger: "hover" });

    }

    _loadWsMessages() {
        document.addEventListener("keydown", this._keydownLogin, false);
        document.addEventListener("miticoOggettoCheNonEsiste.CREATE_GAME", (evt) => {
            let msg = evt.detail
            let msgOk = msg.startsWith("OK");
            if(msgOk){
                // alert("Game has been created!");
                popupMsg("Game has been created!","success");
                model.addCreatedGame(document.getElementById("gameNameInput").value);
                new DatalogMatch("CREATE",1);
                // document.getElementById("start-button").style.display = "";
                // document.getElementById("start-button").addEventListener("click", () => {
                //     console.debug("MatchController is asking the game client to START the joined game");
                //     this._gameClient.startGame(document.getElementById("gameNameInput").value);
                // });
            }
            else{
                // alert("Game creation failed.");
                popupMsg(msg,"danger")
                new DatalogMatch("CREATE",0,{extra:msg});
            }
                
        }, false);

        document.addEventListener("miticoOggettoCheNonEsiste.JOIN_GAME", (evt) => {
            ModelManager.snap();
            console.debug("SessionController has received a JOIN_GAME response from WS. " + evt.detail);
            let msg = evt.detail;
            if(msg.startsWith("OK")) {
                // Remove home UI elements
                console.debug("Session Controller is going to set the game as running with user kind " + model.PLAYER);
                new DatalogMatch("JOIN",1);
                model.setRunningGame(true, model.PLAYER);
                loadMatch();
            } else if(msg.startsWith("ERROR 502")) {
                console.debug("Session Controller is going to force the spectator mode because of server error: " + msg);
                popupMsg(msg + " received from the server. Activating spectator mode for game " + model.status.ga, "success");
                new DatalogMatch("JOIN",0,{extra:msg});
                this._gameClient.spectateGame(model.status.ga);
                loadMatch();
            } else {
                popupMsg(msg,"danger")
                new DatalogMatch("JOIN",0,{extra:msg});
            } 
        }, false);

        document.addEventListener("miticoOggettoCheNonEsiste.SPECTATE_GAME", (evt) => {
            ModelManager.snap();
            console.debug("SessionController has received a SPECTATE_GAME response from WS. " + evt.detail);
            let msg = evt.detail;
            let msgOk= msg.startsWith("OK");

            if(msgOk) {
                // Remove home UI elements
                console.debug("Session Controller is going to set the game as running with user kind " + model.SPECTATOR);
                new DatalogMatch("SPECTATE",1);
                model.setRunningGame(true, model.SPECTATOR);
                loadMatch();

            } else {
                // alert("GAME NOT EXIST")
                new DatalogMatch("SPECTATE",0,{extra:msg});
                popupMsg(msg,"danger");
            }
        }, false);

        document.addEventListener("miticoOggettoCheNonEsiste.START_GAME", (evt) => {
            console.debug("SessionController has received a START_GAME response from WS. " + evt.detail);
            let msg = evt.detail;
            let msgOk= msg.startsWith("OK");

            if(msgOk) {
                popupMsg("You started the game!","success");
                new DatalogMatch("STARTGAME", 1);
            } else {
                popupMsg(msg, "danger");
                new DatalogMatch("STARTGAME",0, {extra: msg});
            }
        }, false);

        document.addEventListener("miticoOggettoCheNonEsiste.LEAVE", (evt) => {
            console.debug("SessionController has received a LEAVE response from WS.");
            new DatalogMatch("LEAVE",1,{extra:evt.details});
            alert("This has been so refreshing!");
            location.reload(); 
        });

        document.addEventListener("POPUP_MSG", (evt) => {
            model.newPopupMsg(evt.detail.msg, evt.detail.kind, evt.detail.timeout);
        }, false);

        // NAVBAR
        // window.addEventListener("hashchange", this._hashEventListener);
    }

    _keydownLogin(evt) {
        if(evt.key == "Enter")
            document.getElementById("loginButton").click();
    }

    _validateLogin() {
        let usernameInput = document.getElementById("usernameInput");
        let loginButton = document.getElementById("loginButton");
        // set focus on login button

        if(usernameInput.value.length == 0) 
                loginButton.disabled = true
        else {
            // check ^[a-zA-Z0-9-]+$
            let letters = /^[a-zA-Z0-9-]+$/;
            if(usernameInput.value.match(letters)) 
                loginButton.disabled = false
            else 
                loginButton.disabled = true
        }
    };
    
    _validateInput() {
        let ingamenameInput = document.getElementById("ingamenameInput");
        let gameNameInput = document.getElementById("gameNameInput");

        let createButton = document.getElementById("createButton");
        let joinButton = document.getElementById("joinButton");
        let spectateButton = document.getElementById("spectateButton");
        let startButtonNoJoin = document.getElementById("startButtonNoJoin");

        if(gameNameInput.value.length == 0 || ingamenameInput.value.length == 0 || ingamenameInput.value.includes("=")) {
            joinButton.disabled = true;
            spectateButton.disabled = true;
        } else {
            joinButton.disabled = false;
            spectateButton.disabled = false;
        }
        
        if(gameNameInput.value.length == 0) {
            createButton.disabled = true;
            startButtonNoJoin.disabled = true;
        } else {
            createButton.disabled = false;
            startButtonNoJoin.disabled = false;
        }
    };
    

}