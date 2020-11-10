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

    startGame(gameName) {
        let msg = gameName + " START";
        console.debug("LobbyManager built " + msg);
        return msg;
    }

    leave(gameName) {
        let msg = gameName + " LEAVE human-wanted-to-leave";
        console.debug("LobbyManager built " + msg);
        return msg;
    }

}
