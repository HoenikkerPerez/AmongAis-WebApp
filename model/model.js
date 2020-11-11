var model = {
    _map: [],
    timeframe: 2000, // Map polling rate
    connectionTimeframe: 200, // Minimum delay between requests
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
        this.status = status;
        document.dispatchEvent(new CustomEvent("MODEL_SETSTATUS", {detail: {status:status}}));
    },

    setGameActive: function(gameActive) {
        // preprocess status
        this.gameActive = gameActive;
        document.dispatchEvent(new CustomEvent("MODEL_SETGAMEACTIVE", {detail:gameActive}));
    }
};


// GA: name=nomepartita state=LOBBY size=32
// ME: symbol=A name=ardo team=0 loyalty=0 energy=256 score=0
// PL: symbol=A name=ardo team=0 x=3 y=27
// PL: symbol=a name=edo team=1 x=23 y=5
// «ENDOFSTATUS»