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
        // Game name
        let gameNameInput = document.getElementById("gameNameInput");
        gameNameInput.addEventListener("input", this._validateCreateJoin);
        
        // InGame name
        let ingamenameInput = document.getElementById("ingamenameInput");
        ingamenameInput.addEventListener("input", this._validateCreateJoin)

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
        // Spectate game
        document.getElementById("spectateButton").addEventListener("click", () => {
            let gameName = document.getElementById("gameNameInput").value;
            model.status.ga = gameName;
            // Remove home UI elements
            console.debug("SessionController: spectating a name called " + gameName);
            //model.setGameActive(true);
            this._gameClient.spectateGame(gameName);
        });
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
            }
        });
        
        // validate Login using credential
        let usernameInput = document.getElementById("usernameInput");
        usernameInput.addEventListener("input", this._validateLogin);
        // let ingamenameInput = document.getElementById("ingamenameInput");
        // ingamenameInput.addEventListener("input", this._validateLogin);

    }

    _loadWsMessages() {
        document.addEventListener("miticoOggettoCheNonEsiste.CREATE_GAME", (evt) => {
            let msgOk = evt.detail.startsWith("OK");
            if(msgOk)
                alert("Game has been created!");
            else
                alert("Game creation failed.");
        }, false);

        document.addEventListener("miticoOggettoCheNonEsiste.JOIN_GAME", (evt) => {
            console.debug("SessionController has received a JOIN_GAME response from WS. " + evt.detail);
            console.debug(evt);
            let msg = evt.detail;
            let msgOk= msg.startsWith("OK");
            if(msgOk) {
                // Remove home UI elements
                model.setRunningGame(true);
            } else if (msg.includes("410")) {
                alert("PLAYER NAME ALREADY TAKEN IN THIS GAME");
            } else {
                alert("GAME NOT EXIST");
            }
        }, false);

        document.addEventListener("miticoOggettoCheNonEsiste.SPECTATE_GAME", (evt) => {
            console.debug("SessionController has received a SPECTATE_GAME response from WS. " + evt.detail);
            console.debug(evt);
            let msg = evt.detail;
            let msgOk= msg.startsWith("OK");

            if(msgOk) {
                // Remove home UI elements
                model.setRunningGame(true);
            } else {
                alert("GAME NOT EXIST")
            }
        }, false);

        document.addEventListener("miticoOggettoCheNonEsiste.START_GAME", (evt) => {
            console.debug("SessionController has received a START_GAME response from WS. " + evt.detail);
            console.debug(evt);
            let msg = evt.detail;
            let msgOk= msg.startsWith("OK");

            if(msgOk) {
                alert("You started the game!");
            } else if(msg.includes("501 Only")) {
                alert("Only creator can start a game");
            } else if (msg.includes("501 Need")) {
                alert("Need two non-empty teams to start");
            }
        }, false);

        document.addEventListener("miticoOggettoCheNonEsiste.LEAVE", (evt) => {
            console.debug("SessionController has received a LEAVE response from WS.");
            alert("This has been so refreshing!");
            location.reload(); 
        });
    }


    _validateLogin() {
        let usernameInput = document.getElementById("usernameInput");
        let loginButton = document.getElementById("loginButton");
        if(usernameInput.value.length == 0) {
                loginButton.disabled = true
        } else {
            loginButton.disabled = false
        }
    };
    
    _validateCreateJoin() {
        let ingamenameInput = document.getElementById("ingamenameInput");
        let gameNameInput = document.getElementById("gameNameInput");

        let createButton = document.getElementById("createButton");
        let joinButton = document.getElementById("joinButton");
        let spectateButton = document.getElementById("spectateButton");
        
        if(gameNameInput.value.length == 0 || ingamenameInput.value.length == 0) {
            joinButton.disabled = true
        } else {
            joinButton.disabled = false
        }
        if(gameNameInput.value.length == 0) {
            createButton.disabled = true
            spectateButton.disabled = true
        } else {
            createButton.disabled = false
            spectateButton.disabled = false
        }
    };
}