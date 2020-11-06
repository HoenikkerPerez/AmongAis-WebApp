/*export default*/ class LobbyManager {    

    constructor(client) {}

    createGame(gameName) {
        msg = "NEW " + gameName;
        return client.createGame(gameName);
    }

}