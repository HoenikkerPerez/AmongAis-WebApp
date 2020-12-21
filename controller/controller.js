// Controller


window.onload = function () {
   // Loading session
   console.debug("Controller: loading GameClient...");
   let gameClient = new GameClient("GAMECLIENT");
   let leagueClient = new LeagueClient();
   let dsClient = new DsClient();

   console.debug("Controller: loading SessionController...");
   let sfxAudio = new SfxAudio()
   this.session = new SessionController(gameClient, leagueClient, sfxAudio);
   // Audio
   // Loading match
   this.match = new MatchController(gameClient, sfxAudio);
   // Loading chat
   console.debug("Controller loading ChatController...");
   let chatClient = new ChatClient();
   this.chat = new ChatController(chatClient);
   // Loading league
   console.debug("Controller: loading LeagueController...");
   this.leageController = new LeagueController(leagueClient);
   // Loading statistics
   console.debug("Controller: loading DsController...");
   this.dsController = new DsController(dsClient);

};
