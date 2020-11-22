var model = {
    _map: [],
    timeframe: 1000, // Default map polling rate
    spectatorTimeframe: 1000, // Spectator's map polling rate
    playerTimeframe: 1000, // Player's map polling rate
    connectionTimeframe: 600, // Minimum delay between requests
    net: {
        game: {
            // ws: "ws://93.150.215.219:8521"
            ws: "ws://margot.di.unipi.it:8521"
        },
        chat: {
            // ws: "ws://93.150.215.219:8522"
            ws: "ws://margot.di.unipi.it:8522"
        }
}   ,
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

    local: {
        me: {
            position: { // (0,0) is North West corner
                x: 0,
                y: 0
            }
        },
        shot: false,
        kind: this.NONE
    },
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

    setLogin: function(lg) {this.login=lg},
    setUsername(uName){this.username=uName},

    setMap: function(map) {
        // preprocess map
        this._map = map;
        document.dispatchEvent(new CustomEvent("MODEL_SETMAP", {detail: {map:map}}));
        // Reset laser presence
        this.local.shot = false;
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
        let me_old = pl_list_old.find(o => o.name === oldStatus.me.name);
        let pl_list_new = newStatus.pl_list;
        let me_new = pl_list_new.find(o => o.name === newStatus.me.name);

        if( (me_new != undefined) && ( (me_old == undefined) || (me_new.state != me_old.state) ) ){
            let newMeState_tag = "MODEL_STATE_" + me_new.state;
            document.dispatchEvent(new CustomEvent(newMeState_tag, {detail: {state: me_new.state}}));
        }
    },
    setStatus: function(status) {
        let old = this.status;
        this.status = status;
        
        this._isMatchStatusChange(old.state,status.state);
        this._isMePlayerStatusChange(old,status);

        document.dispatchEvent(new CustomEvent("MODEL_SETSTATUS", {detail: {status:status}}));
    },

    // enter into the match: players & spectators
    setRunningGame: function(isRunning, kindOfUser) {
        // set user kind
        this.local.kind = kindOfUser;
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
            let userobj = this.status.pl_list.find(o => o.name === user);
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
        return this.status.pl_list.find(o => o.symbol === symb);
    }
};


// GA: name=nomepartita state=LOBBY size=32
// ME: symbol=A name=ardo team=0 loyalty=0 energy=256 score=0
// PL: symbol=A name=ardo team=0 x=3 y=27
// PL: symbol=a name=edo team=1 x=23 y=5
// «ENDOFSTATUS»