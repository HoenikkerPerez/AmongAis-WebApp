/**
 * This class implements the protocol related to the match management.
 */
class LobbyManager {

    createGame(gameName, type, size, balancedTeams) {
        let msg;
        
        if(balancedTeams) 
            msg = "NEW " + gameName + " " + type + size;
        else 
            msg = "NEW " + gameName + " " + type + size + " B";

        console.debug("LobbyManager built " + msg);
        return msg;
    }

    joinGame(gameName, characterName, logName) {
        let msg = gameName + " JOIN " + characterName + " H role " + logName;
        console.debug("LobbyManager built " + msg);
        return msg;
    }

    spectateGame(gameName, characterName, logName) {
        let msg = gameName + " JOIN " + characterName + " O role " + logName;
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
