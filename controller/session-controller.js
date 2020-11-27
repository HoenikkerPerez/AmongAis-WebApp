class SessionController {

    _gameClient;

    constructor(gameClient) {
        console.debug("SessionController: loading the GameClient instance...");
        this._gameClient = gameClient;
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

    _loadUI() {
        // Login
        document.getElementById("loginButton").addEventListener("click", () => {
            console.debug("LoginButton has been clicked!");
            let username = document.getElementById("usernameInput").value;
            console.debug("LoginController: try to login for " + username);
            if(this._gameClient.login(username)){
                model.username = username;
                // model.inGameName = document.getElementById("ingamenameInput").value;
                document.getElementById("login-form-wrapper").style.display="none";
                document.getElementById("startgame-form-wrapper").style.display="";
                document.getElementById("ingamenameInput").focus();
                // enter event
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
            this._gameClient.createGame(gameName);
        });
        // Join game
        document.getElementById("joinButton").addEventListener("click", () => {
            let gameName = document.getElementById("gameNameInput").value;
            let inGameName = document.getElementById("ingamenameInput").value;
            model.inGameName = inGameName;
            console.debug("SessionController: joining a name called " + gameName + " as " + inGameName);
            this._gameClient.joinGame(gameName, inGameName);
        });
        // start game no join
        document.getElementById("startButtonNoJoin").addEventListener("click", () => {
            let gameName = document.getElementById("gameNameInput").value;
            console.debug("SessionController: start game " + gameName + " without joining it");
            this._gameClient.startGame(gameName);
        });
        // Spectate game
        document.getElementById("spectateButton").addEventListener("click", () => {
            let gameName = document.getElementById("gameNameInput").value;
            model.status.ga = gameName;
            // Remove home UI elements
            console.debug("SessionController: spectating a name called " + gameName);
            //model.setGameActive(true);
            this._gameClient.spectateGame(gameName);
        });

        // validate Login using credential
        let usernameInput = document.getElementById("usernameInput");
        usernameInput.addEventListener("input", this._validateLogin);
        
    }

    _loadWsMessages() {
        document.addEventListener("keydown", this._keydownLogin, false);
        document.addEventListener("miticoOggettoCheNonEsiste.CREATE_GAME", (evt) => {
            let msg = evt.detail
            let msgOk = msg.startsWith("OK");
            if(msgOk)
                // alert("Game has been created!");
                popupMsg("Game has been created!","success")
            else
                // alert("Game creation failed.");
                popupMsg(msg,"danger")
        }, false);

        document.addEventListener("miticoOggettoCheNonEsiste.JOIN_GAME", (evt) => {
            console.debug("SessionController has received a JOIN_GAME response from WS. " + evt.detail);
            let msg = evt.detail;
            let msgOk= msg.startsWith("OK");
            if(msgOk) {
                // Remove home UI elements
                console.debug("Session Controller is going to set the game as running with user kind " + model.PLAYER);
                model.setRunningGame(true, model.PLAYER);
            } else {
                popupMsg(msg,"danger")
            } 
        }, false);

        document.addEventListener("miticoOggettoCheNonEsiste.SPECTATE_GAME", (evt) => {
            console.debug("SessionController has received a SPECTATE_GAME response from WS. " + evt.detail);
            let msg = evt.detail;
            let msgOk= msg.startsWith("OK");

            if(msgOk) {
                // Remove home UI elements
                console.debug("Session Controller is going to set the game as running with user kind " + model.SPECTATOR);
                model.setRunningGame(true, model.SPECTATOR);
            } else {
                // alert("GAME NOT EXIST")
                popupMsg(msg,"danger")
            }
        }, false);

        document.addEventListener("miticoOggettoCheNonEsiste.START_GAME", (evt) => {
            console.debug("SessionController has received a START_GAME response from WS. " + evt.detail);
            let msg = evt.detail;
            let msgOk= msg.startsWith("OK");

            if(msgOk) {
                popupMsg("You started the game!","success")
            } else {
                popupMsg(msg, "danger")
            }
        }, false);

        document.addEventListener("miticoOggettoCheNonEsiste.LEAVE", (evt) => {
            console.debug("SessionController has received a LEAVE response from WS.");
            alert("This has been so refreshing!");
            location.reload(); 
        });

        
    }

    _keydownLogin(evt) {
        if(evt.key == "Enter")
            document.getElementById("loginButton").click();
    }

    _validateLogin() {
        let usernameInput = document.getElementById("usernameInput");
        let loginButton = document.getElementById("loginButton");
        // set focus on login button

        if(usernameInput.value.length == 0) {
                loginButton.disabled = true
        } else {
            loginButton.disabled = false
        }
    };
    
    _validateInput() {
        let ingamenameInput = document.getElementById("ingamenameInput");
        let gameNameInput = document.getElementById("gameNameInput");

        let createButton = document.getElementById("createButton");
        let joinButton = document.getElementById("joinButton");
        let spectateButton = document.getElementById("spectateButton");
        let startButtonNoJoin = document.getElementById("startButtonNoJoin");

        if(gameNameInput.value.length == 0 || ingamenameInput.value.length == 0) {
            joinButton.disabled = true;
        } else {
            joinButton.disabled = false;
        }
        if(gameNameInput.value.length == 0) {
            createButton.disabled = true;
            spectateButton.disabled = true;
            startButtonNoJoin.disabled = true;
        } else {
            createButton.disabled = false;
            spectateButton.disabled = false;
            startButtonNoJoin.disabled = false;
        }
    };
}