var model = {
    map: [],
    map_name: [],
    status: [],
    username: "",
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