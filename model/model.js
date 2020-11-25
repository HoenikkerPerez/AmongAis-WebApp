var model = {
    _map: [],
    timeframe: 1000, // Default map polling rate
    spectatorTimeframe: 1500, // Spectator's map polling rate
    playerTimeframe: 700, // Player's map polling rate
    connectionTimeframe: 700, // Minimum delay between requests
    net: {
        game: {
            ws: "ws://93.39.188.250:8521"
            // ws: "ws://131.114.3.213:8521"
        },
        chat: {
            ws: "ws://93.39.188.250:8522"
            // ws: "ws://131.114.3.213:8522"
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
    shoots: [],

    setLogin: function(lg) {this.login=lg},
    setUsername(uName){this.username=uName},

    setMap: function(map) {
        // preprocess map
        this._map = map;
        // remove exausted shoots
        this._removeExaustedShoots();
        document.dispatchEvent(new CustomEvent("MODEL_SETMAP", {detail: {map:map}}));
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
        for(let name of oldPlayers)
            if(oldPlayers[name].touring)
                newPlayers[name].touring = oldPlayers[name].touring;
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

    setStatus: function(status) {
        let old = this.status;
        this.status = status;
        
        // Postprocess the status after it is received from the server
        if(old != undefined) {
            this._restoreTouringGame(old, this.status);
        }

        // Fire an event if the match status actually changed
        this._isMatchStatusChange(old.state,status.state);

        // Fire an event if the player status actually changed
        this._isMePlayerStatusChange(old,status);

        document.dispatchEvent(new CustomEvent("MODEL_SETSTATUS", {detail: {status:status}}));
    },

    // enter into the match: players & spectators
    setRunningGame: function(isRunning, kindOfUser) {
        // set user kind
        this.kind = kindOfUser;
        // preprocess status
        this.isRunning = isRunning;
        document.dispatchEvent(new CustomEvent("MODEL_RUN_GAME", {detail:isRunning}));
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
        // todo check if already exists
        let find = this.chat.chatSubscribedChannels.find(o => o.channel === channel);
        if (find == undefined) {
            this.chat.chatSubscribedChannels.push({channel: channel});
            document.dispatchEvent(new CustomEvent("MODEL_SUBSCRIBEDCHANNEL")); // for the HUD
            console.debug("chat addSubscribedChannel: " + channel)
        }
    },

    removeSubscribedChannel: function(channel) {
        // TODO 
        let findidx = this.chat.chatSubscribedChannels.findIndex(o => o.channel === channel);
        if (findidx != -1) {
            console.debug(find);
            this.chat.chatSubscribedChannels.splice(findidx)
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