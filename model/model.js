var model = {
    map: [],
    status: [],
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