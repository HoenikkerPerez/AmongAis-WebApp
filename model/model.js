var model = {
    timeframe: 150, // Default map polling rate
    timeframeMap: 150,
    timeframeStatus:1500,
    spectatorTimeframe: 150, // Spectator's map polling rate
    playerTimeframe: 150, // Player's map polling rate
    connectionTimeframe: 150, // Minimum delay between requests
    nopTimeframe: 20000,
    net: {
        game: {
            ws: "ws://margot.di.unipi.it:8521"
            // ws: "ws://93.39.188.250:8521"
        },
        chat: {
            ws: "ws://margot.di.unipi.it:8522"
            // ws: "ws://93.39.188.250:8522"
        }
    },
    status: {
        ga: "gamename",
        state: "lobby-started-ended",
        size: 0,
        me: {
            symbol: 'A',
            name: "inGameName",
            team: 0,
            loyalty:0,
            energy:256,
            score:0,
            lastDirection: undefined
        },
        pl_list:[]
        //     pl_list: (2) […]
            //     0: {…}
                //     name: "undesiderable1"
                //     state: "LOBBYOWNER" / "LOBBYGUEST" / "ACTIVE" / "KILLED"
                //     symbol: "A"
                //     team: "0"
                //     x: "13"
                //     y: "25"
                // *touring
                // direction N,E,S,W
    },

    NONE: "NONE",
    PLAYER: "PLAYER",
    SPECTATOR: "SPECTATOR",
    kind: this.NONE,

    chat: {
        messages:[], //{channel: string, user: string, message: string}
        chatSubscribedChannels: []
    },
    username: "",

    login: false,
    inGameName: undefined,
    userType: "", // player/spectator
    isRunning: false,

    teamColors : {
        teamA: "#ff0000",
        teamB: "#0000FF",
        mePlayer: "#FFFFFF"
    },

    meeting: {
        isRunning: false,
        iVote: false,
    },
    meetingsQueue: [],
    shoots: [],
    dieing: [], // [{name:____, cnt:5}]
    pathfindigMoves: [],
    path: [],
    createdGames:new Set(),
    pl_directions: [],  // Todo insert into status!
    // word parameters
    world: {
        _map: [],
        _rendering: false,
        _initSize: false,
        tmp_players: [],
        tmp_objects: [],
        _imageLoaded: false,
        showGrid: false,
        showMinimap: true,
        refresh: false
    },
    musicVolume: 0.3,

    setMusicVolume(volume) {
        this.musicVolume = volume;
        document.dispatchEvent(new CustomEvent("MODEL_MUSIC_VOLUME", {detail: {volume: volume}}));
    },

    showGrid(show) {
        this.world.showGrid = show;
    },

    lowResolutionMap(flag) {
        this.world.lowResolutionMap = flag;
    },

    needRefresh() {
        return this.world.refresh;
    },

    startRefreshMap() {
        this.world.refresh = true;
    },

    stopRefreshMap() {
        this.world.refresh = false;
    },

    showMinimap(show) {
        this.world.showMinimap = show;
    },

    
    addCreatedGame(nameGame){
        this.createdGames.add(nameGame);
    },
    
    setRendering(rendering) {
        this.world._rendering = rendering;
    },
        
    getRendering() {
        return this.world._rendering;
    },

    imCreator(nameGame){
        return this.createdGames.has(nameGame);
    },

    removeCreatedGames(nameGame){
        this.createdGames.delete(nameGame);
    },

    setLogin: function(lg) {this.login=lg},
    setUsername(uName){this.username=uName},

    setMap: function(map) {
        // preprocess map
        this.world._map = map;
        // remove exausted shoots
        this._removeExaustedShoots();
        let tmpMap = map.tiles;
        for(let i = 0; i<tmpMap.length; i++) {
            let symbol_code = tmpMap[i].charCodeAt(0);
            // update player position and direction
            if(symbol_code >= 65 && symbol_code <= 87 || symbol_code >= 97 && symbol_code <= 119) { 
                let pl = this.findPlayerBySymbol(tmpMap[i]);
                if(pl != undefined) {
                    let name = pl.name;
                    let newDirection;
                    if(this.pl_directions[name] == undefined) {
                        // add new player
                        this.pl_directions[name] = "S";
                    } else {
                        let oldDirection =  this.pl_directions[name];
                        let oldPosition = {x: pl.x, y: pl.y};
                        let newPosition = {x: i % map.cols, y:  Math.floor(i / map.cols)};
                        // N
                        if(oldPosition.x < newPosition.x) {
                            newDirection = "E";
                        } else if(oldPosition.x > newPosition.x) {
                            newDirection = "W";
                        } else if(oldPosition.y > newPosition.y) {
                            newDirection = "N";
                        } else if(oldPosition.y < newPosition.y || oldDirection == undefined) {
                            newDirection = "S";
                        } else {
                            newDirection = oldDirection; // default positioning (start)
                        }

                        this.pl_directions[name] = newDirection;
                        pl.x = newPosition.x;
                        pl.y = newPosition.y;
                    }
                } 
            }
        }
        this.startRefreshMap();
        document.dispatchEvent(new CustomEvent("MODEL_SETMAP", {detail: {map:map}}));
    },

    setPath(steps) {
        let reverseSteps = steps.reverse();
        // reverseSteps.shift();
        this.path = reverseSteps.map(step => {
                                    return {
                                        x: step.x, 
                                        y: step.y, 
                                        nextMove: undefined,
                                        counter: 7}});
        let path = this.path;
        for(let i=0; i<path.length-1; i++) {
            this.path[i].nextMove = this._computeNextPathfindingMove(path[i].x, path[i].y, path[i+1].x, path[i+1].y);
        }
        // remove last move 
        // this.path.pop();
        // attach first step to the event
        document.dispatchEvent(new CustomEvent("MODEL_SETPATHFINDING", {detail: {step:this.path}}));
    },

    popNextPathfindingMove() {
        if(this.path.length <= 0)
            return undefined
        
        let nextStep =  this.path.shift();
        if(nextStep.nextMove == undefined)
            return undefined
        let nextMove = nextStep.nextMove;
        console.debug("popNextPathfindingMove: MOVE: " + nextMove);
        return nextMove;
    },

    _computeNextPathfindingMove(startX, startY, nextStepX, nextStepY) {
        if(startX > nextStepX)
            nextMove = "W";
        else if (startX < nextStepX)
            nextMove="E";
        else if (startY < nextStepY)
            nextMove="S";
        else if (startY > nextStepY)
            nextMove="N";
        console.debug("_computeNextPathfindingMove: pos " + "(" + startX + ", " + startY + ")" + " to " + "(" + nextStepX + ", " + nextStepY + "); MOVE: " + nextMove);
        return nextMove;
    },


    _removeExaustedShoots() {
        let shoots = this.shoots;
        for (let i=0; i<shoots.length; i++) {
            if(shoots[i].counter <= 0) {
                this.shoots.splice(i,1);
            }
        }
    },

    _restoreTouringGame(oldMatchStatus, newMatchStatus) {
        let oldPlayers = oldMatchStatus.pl_list;
        let newPlayers = newMatchStatus.pl_list;
        for(let name in oldPlayers)
            if(oldPlayers[name].touring)
                newPlayers[name].touring = oldPlayers[name].touring;
    },

    _restoreLastDirection(oldMatchStatus, newMatchStatus) {
        newMatchStatus.me.lastDirection = oldMatchStatus.me.lastDirection;
    },

    _isMatchStatusChange(oldMatchStatus,newMatchStatus){
        if(newMatchStatus !== oldMatchStatus){
            let newstate_tag = "MODEL_MATCH_STATUS_"+this.status.state; // LOBBY, ACTIVE, FINISHED
            document.dispatchEvent(new CustomEvent(newstate_tag, {detail: {status:this.status}}));
        }
    },

    _isMePlayerStatusChange(oldStatus,newStatus){
        // check if you'are the owner
        let pl_list_old = oldStatus.pl_list;
        let me_old = pl_list_old[oldStatus.me.name];
        let pl_list_new = newStatus.pl_list;
        let me_new = pl_list_new[newStatus.me.name];

        if( (me_new != undefined) && ( (me_old == undefined) || (me_new.state != me_old.state) ) ){
            let newMeState_tag = "MODEL_STATE_" + me_new.state;
            document.dispatchEvent(new CustomEvent(newMeState_tag, {detail: {state: me_new.state}}));
        }
    },

    isDying(name){
        for (let i = 0; i < this.dieing.length; i++) {
            if(this.dieing[i].name === name){
                return true;
            }
        }
        return false;
    },

    setStatus: function(status) {
        let old = this.status;
        this.status = status;
        
        // Postprocess the status after it is received from the server
        if(old != undefined) {
            this._restoreTouringGame(old, this.status);
            this._restoreLastDirection(old, this.status);
        }

        // Fire an event if the match status actually changed
        this._isMatchStatusChange(old.state,status.state);

        // Fire an event if the player status actually changed
        this._isMePlayerStatusChange(old,status);

        document.dispatchEvent(new CustomEvent("MODEL_SETSTATUS", {detail: {status:status}}));
        this.startRefreshMap();
    },

    // enter into the match: players & spectators
    setRunningGame: function(isRunning, kindOfUser) {
        // set user kind
        this.kind = kindOfUser;
        // preprocess status
        this.isRunning = isRunning;
        document.dispatchEvent(new CustomEvent("MODEL_RUN_GAME", { detail: {running: isRunning} }));
    },

    setGameActive: function(){
        this.status.state = "ACTIVE";
        document.dispatchEvent(new CustomEvent("MODEL_MATCH_STATUS_ACTIVE"));
    },

    playerJoined: function() {
        document.dispatchEvent(new CustomEvent("MODEL_PLAYER_JOINED"));
    },
    
    _sec2time: function(timeInSeconds) {
        var pad = function(num, size) { return ('000' + num).slice(size * -1); },
        time = parseFloat(timeInSeconds).toFixed(3),
        // hours = Math.floor(time / 60 / 60),
        minutes = Math.floor(time / 60) % 60,
        seconds = Math.floor(time - minutes * 60);
        // milliseconds = time.slice(-3);
        // return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + ',' + pad(milliseconds, 3);
        return pad(minutes, 2) + ':' + pad(seconds, 2); // + ',' + pad(milliseconds, 3);
    },

    setStartGameTime: function() {
        this._startGameTime = new Date();
    },

    addMessageChat: function(channel, user, message) {
        // preprocess message
        if (user.startsWith("@")) {
            type = "system";
        } else if (this.inGameName != undefined && user == this.inGameName) {
            type = "me";
        } else {
            let userobj = this.status.pl_list[user];
            if (userobj != undefined) {
                if (userobj.team == 0) {
                    type = "teamA";
                } else {
                    type = "teamB";
                }
            } else {
                type = "other";
            }
        }
        let time = undefined;
        if (this._startGameTime != undefined)
            time = this._sec2time((new Date() - this._startGameTime)/1000);
        this.chat.messages.unshift({time: time,
                                 channel: channel,
                                 user: user, 
                                 message: message,
                                 type: type});
        document.dispatchEvent(new CustomEvent("MODEL_SETCHAT"));
    },

    addSubscribedChannel: function(channel) {
        let find = this.chat.chatSubscribedChannels.find(o => o.channel === channel);
        if (find == undefined) {
            this.chat.chatSubscribedChannels.push({channel: channel});
            document.dispatchEvent(new CustomEvent("MODEL_SUBSCRIBEDCHANNEL")); // for the HUD
            console.debug("chat addSubscribedChannel: " + channel)
        }
    },

    removeSubscribedChannel: function(channel) {
        let findidx = this.chat.chatSubscribedChannels.findIndex(o => o.channel === channel);
        if (findidx != -1) {
            this.chat.chatSubscribedChannels.splice(findidx, 1);
            document.dispatchEvent(new CustomEvent("MODEL_UNSUBSCRIBEDCHANNEL")); // for the HUD
            console.debug("chat removeSubscribedChannel: " + channel)
        }

    },

    findPlayerBySymbol: function(symb) {
        let playerList = this.status.pl_list;
        for(let p in playerList) {
            let player = playerList[p];
            if(player.symbol === symb)
                return player;
        }
        return undefined;
    },

    findMyPosition() {
        let me = this.inGameName;
        let playerList = this.status.pl_list;
        for(let p in playerList) {
            let player = playerList[p];
            if(player.name === me)
                return {x: player.x, y: player.y};
        }
        return undefined;
    },

    meetingStart(who_start){
        this.meeting.isRunning = true;
        document.dispatchEvent(new CustomEvent("MODEL_MEETING_START", {detail:who_start}));

    },

    meetingMSG(msg){
        document.dispatchEvent(new CustomEvent("MODEL_MEETING_MSG", {detail:msg}));
    },

    accuseDone(accuser, accused){
        document.dispatchEvent(new CustomEvent("MODEL_MEETING_ACCUSE", {detail:{accuser:accuser, accused:accused}}));
    },
    
    meetingEnd(){
        this.meeting.isRunning = false;
        document.dispatchEvent(new CustomEvent("MODEL_MEETING_END"));
    },

    murderCatched(murder, murdered){
        this.dieing.push({name:murdered,cnt:5});
    },

    // Endgame

    endgameScore: [],

    pushEndgameScore(endscore) {
        this.endgameScore.push(endscore);
        this.endgameScore.sort((a,b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0));
        document.dispatchEvent(new CustomEvent("MODEL_ENDGAME_SCORE_ADDED"));
    }

};


// GA: name=nomepartita state=LOBBY size=32
// ME: symbol=A name=ardo team=0 loyalty=0 energy=256 score=0
// PL: symbol=A name=ardo team=0 x=3 y=27
// PL: symbol=a name=edo team=1 x=23 y=5
// «ENDOFSTATUS»