//const { match } = require("assert"); // can we delete this? what is this for?
//const { default: SessionController } = require("./session-controller"); // same as above

//session;
//match;
//chat;
// league;

// Controller

window.onload = function () {
   console.debug("Controller: loading GameClient...");
   let gameClient = new GameClient();
   console.debug("Controller: loading SessionController...");
   this.session = new SessionController(gameClient);
   this.match = new MatchController(gameClient);
};
