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
}

