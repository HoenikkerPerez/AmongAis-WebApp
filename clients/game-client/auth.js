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
        // TODO: Change with real login message
        this._send("LOGIN " + username);
        return this._receive() == "OK";
    }

}
