var model = {
    map: [],
    map_name: [],
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
    
    setLogin: function(lg) {this.login=lg},
    setUsername(uName){this.username=uName},

    getMap:  function() {},
    getStatus: function() {},
    setMap: function() {},
    setStatus: function() {}
};

class Map {
    _map;
    _gameclient;
    _mapname;

    constructor(gameclient, mapname) {
        this._gameclient = gameclient;
        this._mapname = mapname;
    };
    
    pollMap() {
        gameclient._send("PollerTag", mapname + "LOOK");
    };

    parseMap(stringmap) {
        this._map = stringmap.replace('\n', '').split("");
    };
};

console.debug("Model Initialized");

// GA: name=nomepartita state=LOBBY size=32
// ME: symbol=A name=ardo team=0 loyalty=0 energy=256 score=0
// PL: symbol=A name=ardo team=0 x=3 y=27
// PL: symbol=a name=edo team=1 x=23 y=5
// «ENDOFSTATUS»