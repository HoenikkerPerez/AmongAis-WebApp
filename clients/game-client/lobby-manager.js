/**
 * This class implements the protocol related to the match management.
 */
class LobbyManager {

    createGame(gameName) {
        let msg = "NEW " + gameName;
        console.debug("LobbyManager built " + msg);
        return msg;
    }

    joinGame(gameName, characterName) {
        let msg = gameName + " JOIN " + characterName + " H role web-team"
        console.debug("LobbyManager built " + msg);
        return msg;
    }

    lookMap(gameName) {
        let msg = gameName + "LOOK"
        console.debug("LobbyManager built " + msg);
        return msg;
    }

}
