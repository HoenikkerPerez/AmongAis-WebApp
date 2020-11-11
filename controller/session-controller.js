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
        // Create game
        document.getElementById("createButton").addEventListener("click", () => {
            let gameName = document.getElementById("gameNameInput").value;
            console.debug("SessionController: creating a name called " + gameName);
            this._gameClient.createGame(gameName);
        });
        // Join game
        document.getElementById("joinButton").addEventListener("click", () => {
            let gameName = document.getElementById("gameNameInput").value;
            let username = model.username;
            console.debug("SessionController: joining a name called " + gameName + " as " + username);
            this._gameClient.joinGame(gameName, username);
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
            }
        }, false);

        document.addEventListener("miticoOggettoCheNonEsiste.START_GAME", (evt) => {
            console.debug("SessionController has received a START_GAME response from WS. " + evt.detail);
            console.debug(evt);
            let msg = evt.detail;
            let msgOk= msg.startsWith("OK");

            if(msgOk) {
                alert("You started the game!");
            }
        }, false);

        document.addEventListener("miticoOggettoCheNonEsiste.LEAVE", (evt) => {
            console.debug("SessionController has received a LEAVE response from WS.");
            alert("This has been so refreshing!");
            location.reload(); 
        });
    }

}