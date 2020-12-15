// Controller


window.onload = function () {
   // Loading session
   console.debug("Controller: loading GameClient...");
   let gameClient = new GameClient("GAMECLIENT");
   let leagueClient = new LeagueClient();

   console.debug("Controller: loading SessionController...");
   this.session = new SessionController(gameClient, leagueClient);
   // Audio
   let sfxAudio = new SfxAudio()
   // Loading match
   this.match = new MatchController(gameClient, sfxAudio);
   // Loading chat
   console.debug("Controller loading ChatController...");
   let chatClient = new ChatClient();
   this.chat = new ChatController(chatClient);
   // Loading league
   console.debug("Controller: loading LeagueController...");
   this.leageController = new LeagueController(leagueClient);
};
