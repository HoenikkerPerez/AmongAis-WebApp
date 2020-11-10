class SessionController {

    _gameClient;

    constructor(gameClient) {
        console.debug("SessionController: loading the GameClient instance...");
        this._gameClient = gameClient;
        this._load();

        /*console.debug("SessionController: going to display the WorldView canvas.");
        let context = document.getElementById('canvas').getContext('2d');
        console.debug("SessionController: going to start the WorldView canvas.");
        Game.start(context);*/

        document.addEventListener("miticoOggettoCheNonEsiste.GAME_JOINED", () => {
            // ...
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
        document.getElementById("startButton").addEventListener("click", () => {
            let gameName = document.getElementById("gameNameInput").value;
            console.debug("SessionController: starting a name called " + gameName);
            this._gameClient.createGame(gameName);
        });
        document.getElementById("joinButton").addEventListener("click", this.handlers.joinButton);
    }

    _loadWsMessages() {
        document.addEventListener("miticoOggettoCheNonEsiste.CREATE_GAME", (evt) => {
            let msgOk = evt.data.startsWith("OK");
            if(msgOk)
                alert("Game has been created!");
            else
                alert("Game creation failed.");
        }, false);
    }

}