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
        gameNameInput.addEventListener("input", this._validateGameName);

        // Create game
        document.getElementById("createButton").addEventListener("click", () => {
            let gameName = document.getElementById("gameNameInput").value;
            console.debug("SessionController: creating a name called " + gameName);
            this._gameClient.createGame(gameName);
        });
        // Join game
        document.getElementById("joinButton").addEventListener("click", () => {
            let gameName = document.getElementById("gameNameInput").value;
            let inGameName = model.inGameName;
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
                model.inGameName = document.getElementById("ingamenameInput").value;
                document.getElementById("loginForm").style.display="none"
            }
        });
        
        // validate Login using credential
        let usernameInput = document.getElementById("usernameInput");
        usernameInput.addEventListener("input", this._validateLogin);
        let ingamenameInput = document.getElementById("ingamenameInput");
        ingamenameInput.addEventListener("input", this._validateLogin);

         
        // Session-related commands during the match (keys)
        document.addEventListener("keyup", (evt) => {
            switch(evt.key) {
                case "Enter":
                    // START
                    console.debug("SessionController is asking the game client to START the joined game after the ENTER key.");
                    this._gameClient.startGame();
                    break;
                case "Escape":
                    // LEAVE
                    if(model.status.gameActive){
                        console.debug("SessionController is asking the game client to LEAVE after the ESCAPE key.");
                        this._gameClient.leave();
                    }
                    break;
                default:
                    console.debug("SessionController retrieved a keyup, but nothing happened.");
            }
        });
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
                model.setGameActive(true);
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
                model.setGameActive(true);
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
        let ingamenameInput = document.getElementById("ingamenameInput");
        let loginButton = document.getElementById("loginButton");
        if(usernameInput.value.length == 0 || ingamenameInput.value.length == 0) {
                loginButton.disabled = true
        } else {
            loginButton.disabled = false
        }
    };
    
    _validateGameName() {
        let gameNameInput = document.getElementById("gameNameInput");
        let createButton = document.getElementById("createButton");
        let joinButton = document.getElementById("joinButton");
        let spectateButton = document.getElementById("spectateButton");
        
        if(gameNameInput.value.length == 0) {
            createButton.disabled = true
            joinButton.disabled = true
            spectateButton.disabled = true
        } else {
            createButton.disabled = false
            joinButton.disabled = false
            spectateButton.disabled = false
        }
    };

}