/**
 * This class implements the protocol related to the Authentication management.
 */
class AuthManager {

    _send;
    _receive;

    constructor(send, receive) {
        this._send = send;
        this._receive = receive;
    }

    login(username) {
        console.debug("AuthManager: sending loginmessage for  " + username);
        return "LOGIN " + username;
    }

}

// this.session._gameClient._connect()
// this.session._gameClient._send("tag", "test2 LOOK")
