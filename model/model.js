var model = {
    _map: [],
    timeframe: 1000, // Map polling rate
    connectionTimeframe: 1000, // Minimum delay between requests
    net: {
        game: {
            ws: "ws://localhost:8765"
            //ws: "ws://93.150.215.219:8765"//ws: "ws://margot.di.unipi.it:8521"
        },
        chat: {
            ws: "ws://localhost:8522"//ws: "ws://margot.di.unipi.it:8522"
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
            score:0
        },
        pl_list:[]
    },
    chat: {
        messages:[] //{user: string, message: string}
    },
    username: "",

    login: false,
    ingamename:"",
    gameActive: false,
    setLogin: function(lg) {this.login=lg},
    setUsername(uName){this.username=uName},

    setMap: function(map) {
        // preprocess map
        this._map = map;
        document.dispatchEvent(new CustomEvent("MODEL_SETMAP", {detail: {map:map}}));
    },
    
    setStatus: function(status) {
        // preprocess status
        if(status.state =="FINISHED"){
            if(this.status.state != status.state){
                this.status = status;
                document.dispatchEvent(new CustomEvent("MODEL_ENDGAME", {detail: {status:status}}));
            }
            return;
        }
        this.status = status;
        document.dispatchEvent(new CustomEvent("MODEL_SETSTATUS", {detail: {status:status}}));
    },

    setGameActive: function(gameActive) {
        // preprocess status
        this.gameActive = gameActive;
        document.dispatchEvent(new CustomEvent("MODEL_SETGAMEACTIVE", {detail:gameActive}));
    },

    addMessageChat: function(message) {
        // preprocess message
        this.chat.messages.push({user: "TEMP", message: message});
        document.dispatchEvent(new CustomEvent("MODEL_SETCHAT"));
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