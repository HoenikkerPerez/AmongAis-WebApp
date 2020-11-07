/**
 * This class implements the protocol related to the match management.
 */
class LobbyManager {

    _send;
    _receive;

    constructor(send, receive) {
        this._send = send;
        this._receive = receive;
    }

    createGame(gameName) {
        console.debug("LobbyManager: sending NEW " + gameName);
        this._send("NEW " + gameName);
        return this._receive() == "OK";
    }

}
