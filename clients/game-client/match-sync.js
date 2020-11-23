class MatchSync {

    lookMap(gameName) {
        return gameName + " LOOK";
    }
  
    getStatus(gameName) {
        return gameName + " STATUS";
    }

    move(gameName, direction) {
        let msg = gameName + " MOVE " + direction;
        console.debug("MatchSync built " + msg);
        return msg;
    }

    shoot(gameName, direction) {
        let msg = gameName + " SHOOT " + direction;
        console.debug("MatchSync built " + msg);
        return msg;
    }

    accuse(gameName, teammateName) {
        let msg = gameName + " ACCUSE " + teammateName;
        console.debug("MatchSync built " + msg);
        return msg;
    }

    touringChoice(gameName, name, choice) {
        let msg = gameName + " JUDGE " + name + " " + choice;
        console.debug("MatchSync built " + msg);
        return msg;
    }

    nop(gameName) {
        let msg = gameName + " NOP";
        console.debug("MatchSync built " + msg);
        return msg;
    }
}

