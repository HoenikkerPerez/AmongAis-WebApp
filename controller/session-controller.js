class SessionController {

    _gameClient;

    handlers = {
        startGameButton: (form) => {
            console.debug("StartGameButton has been clicked!");
            let gameName = document.getElementById("gameNameInput").value;
            console.debug("SessionController: starting a name called " + gameName);
            this._gameClient.createGame(gameName); // TODO Probabilmente questo "this" è sbagliato
            console.debug("SessionController: going to display the WorldView canvas.");
            let context = document.getElementById('canvas').getContext('2d');
            console.debug("SessionController: going to start the WorldView canvas.");
            Game.start(context);
        },

        loginButton: (form) => {
            console.debug("LoginButton has been clicked!");
            let username = document.getElementById("usernameInput").value;
            console.debug("LoginController: try to login for " + username);
            if(this._gameClient.login(username)){
                model.username = username;
                model.inGameName = document.getElementById("ingamenameInput").value;
                document.getElementById("loginForm").style.display="none"
            }
        },

        /*joinButton (form) {
            let val = document.forms[0].nameGame.value;
            ...
        }*/
    }

    constructor(gameClient) {
        console.debug("SessionController: loading the GameClient instance...");
        this._gameClient = gameClient;

        console.debug("SessionController: loading the listeners for UI events...");
        document.getElementById("startButton").addEventListener("click", this.handlers.startGameButton);
        // document.getElementById("joinButton").addEventListener("click", this.handlers.joinButton);

        // document.addEventListener(miticoOggettoCheNonEsiste.GAME_JOINED, () => {
        //     // ...
        // });

        document.getElementById("loginButton").addEventListener("click", this.handlers.loginButton);

        console.debug("SessionController: ready!");
    };

}