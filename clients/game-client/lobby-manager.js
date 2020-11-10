/**
 * This class implements the protocol related to the match management.
 */
class LobbyManager {

    createGame(gameName) {
        return "NEW " + gameName;
    }

    lookMap(gameName) {
        return gameName + "LOOK";
    }

}
