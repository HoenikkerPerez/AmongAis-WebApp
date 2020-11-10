class SessionController {

    _gameClient;

    constructor(gameClient) {
        console.debug("SessionController: loading the GameClient instance...");
        this._gameClient = gameClient;
        this._load();

        console.debug("SessionController: loading the listeners for UI events...");
        // document.getElementById("joinButton").addEventListener("click", this.handlers.joinButton);

        // document.addEventListener(miticoOggettoCheNonEsiste.GAME_JOINED, () => {
        //     // ...
        // });

        document.addEventListener("STATUS", () => {
            
        });

        /*joinButton (form) {
            let val = document.forms[0].nameGame.value;
            ...
        }*/
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
        //document.getElementById("joinButton").addEventListener("click", TODO);
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

        document.getElementById("statusButton").addEventListener("click", () => {
            console.debug("StatusButton has been clicked!");
            let gameName = document.getElementById("gameNameInput").value;
            let username = document.getElementById("usernameInput").value;
            console.debug("SessionController: try to get status for " + gameName);
            this._gameClient.getStatus(username)
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
    }

}