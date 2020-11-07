class SessionController {

    _gameClient;

    handlers = {
        startGameButton: (form) => {
            console.debug("StartGameButton has been clicked!");
            let gameName = document.getElementById("gameNameInput").value;
            console.debug("SessionController: starting a name called " + gameName);
            this._gameClient.createGame(gameName);
            console.debug("SessionController: going to display the WorldView canvas.");
            let context = document.getElementById('canvas').getContext('2d');
            console.debug("SessionController: going to start the WorldView canvas.");
            Game.start(context);
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
        console.debug("SessionController: ready!");
    };

}