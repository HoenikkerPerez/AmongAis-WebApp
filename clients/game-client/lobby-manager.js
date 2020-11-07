export default class LobbyManager {    

    constructor(client) {}

    createGame(gameName) {
        return client.createGame(gameName);
    }

}