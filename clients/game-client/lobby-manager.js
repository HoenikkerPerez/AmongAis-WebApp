/**
 * This class implements the protocol related to the match management.
 */
class LobbyManager {

    createGame(gameName, type, size) {
        
        let msg = "NEW " + gameName + " " + type + size;
        console.debug("LobbyManager built " + msg);
        return msg;
    }

    joinGame(gameName, characterName) {
        let msg = gameName + " JOIN " + characterName + " H role web-team"
        console.debug("LobbyManager built " + msg);
        return msg;
    }

    spectateGame(gameName) {
        let msg = gameName + " LOOK"
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
