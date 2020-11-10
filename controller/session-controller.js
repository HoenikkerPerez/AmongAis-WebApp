class SessionController {

    _gameClient;

    constructor(gameClient) {
        console.debug("SessionController: loading the GameClient instance...");
        this._gameClient = gameClient;
        this._load();

        console.debug("SessionController: loading the listeners for UI events...");

        document.addEventListener("STATUS", () => {
            
        });

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
        document.getElementById("startButton").addEventListener("click", () => {
            let gameName = document.getElementById("gameNameInput").value;
            console.debug("SessionController: starting a name called " + gameName);
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
                document.getElementById("homeUI").remove();
                // Start canvas
                let context = document.getElementById("canvas").getContext("2d");
                Game.start(model.status.ga, context);
            }
        }, false);
    }

}