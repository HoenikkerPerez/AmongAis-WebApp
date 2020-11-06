'use strict'
 
const Telnet = require(os.homedir() + '/.npm-global/lib/node_modules/telnet-client');

// This GameClient needs NodeJS
export default class TotallyUnreliableGameClient {

    connection = new Telnet();

    params = {
        host: 'margot.di.unipi.it',
        port: 8421,
        //shellPrompt: '/ # ', // or negotiationMandatory: false,
        negotiationMandatory: false,
        timeout: 1500
    }

    async connect() {
        return this.connection.connect(this.params);
    }

    async createGame(gameName) {
        return this.connection.exec("NEW " + gameName);
    }

}