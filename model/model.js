var model = {
    map: [],
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
}

console.debug("Model Initialized");

// GA: name=nomepartita state=LOBBY size=32
// ME: symbol=A name=ardo team=0 loyalty=0 energy=256 score=0
// PL: symbol=A name=ardo team=0 x=3 y=27
// PL: symbol=a name=edo team=1 x=23 y=5
// «ENDOFSTATUS»