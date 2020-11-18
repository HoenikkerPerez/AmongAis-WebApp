var model = {
    _map: [],
    timeframe: 1000, // Map polling rate
    connectionTimeframe: 1000, // Minimum delay between requests
    net: {
        game: {
            // ws: "ws://localhost:8765"
            // ws: "ws://93.150.215.219:8765"
            ws: "ws://margot.di.unipi.it:8521"
        },
        chat: {
            ws: "ws://margot.di.unipi.it:8522"//ws: "ws://margot.di.unipi.it:8522"
            // ws: "ws://localhost:8522"//ws: "ws://margot.di.unipi.it:8522"
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
    },
    local: {
        me: {
            position: { // (0,0) is North West corner
                x: 0,
                y: 0
            }
        },
        shot: false
    },
    chat: {
        messages:[], //{channel: string, user: string, message: string}
        chatSubscribedChannels: []
    },
    username: "",

    login: false,
    ingamename:"",
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
    
    setStatus: function(status) {
        // preprocess status
        // if(status.state =="FINISHED"){
        //     if(this.status.state != status.state){
        //         this.status = status;
        //         document.dispatchEvent(new CustomEvent("MODEL_ENDGAME", {detail: {status:status}}));
        //     }
        //     return;
        // }
        let old = this.status.state;
        this.status = status;
        if(this.status.state != old){
            let newstate_tag = "MODEL_MATCH_STATUS_"+status.state; // LOBBY, ACTIVE, FINISHED
            document.dispatchEvent(new CustomEvent(newstate_tag, {detail: {status:status}}));
        }
        document.dispatchEvent(new CustomEvent("MODEL_SETSTATUS", {detail: {status:status}}));
    },
    // enter into the match: players & spectators
    setRunningGame: function(isRunning) {
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

    addMessageChat: function(channel, user, message) {
        // preprocess message
        this.chat.messages.push({channel: channel,
                                 user: user, 
                                 message: message});
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