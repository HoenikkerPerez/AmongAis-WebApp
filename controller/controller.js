// Controller

mapClient = new GameClient();

window.onload = function () {
   // Loading session
   console.debug("Controller: loading GameClient...");
   let gameClient = new GameClient();
   console.debug("Controller: loading SessionController...");
   this.session = new SessionController(gameClient);
   // Loading match
   this.match = new MatchController(gameClient);
   // Loading chat
   console.debug("Controller loading ChatController...");
   let chatClient = new ChatClient();
   this.chat = new ChatController(chatClient);
   // Loading league
   //console.debug("Controller: loading LeagueController...");
   // ...
};
