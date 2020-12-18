// Controller

loadChat = function() {
   console.debug("Controller is loading ChatClient...");
   let chatClient = new ChatClient();
   console.debug("Controller is loading ChatController...");
   this.chat = new ChatController(chatClient);
   console.debug("Controller has loaded the Chat.");
}

loadMatch = function() {
   console.debug("Controller is loading MatchController...");
   this.match = new MatchController(this.gameClient, this.sfxAudio);
   console.debug("Controller has loaded the MatchController.");
   loadChat();
}

window.onload = function () {
   // Loading session
   console.debug("Controller: loading GameClient...");
   let gameClient = new GameClient("GAMECLIENT");
   this.gameClient = gameClient;
   console.debug("Controller: loading SessionController...");
   let sfxAudio = new SfxAudio()
   this.sfxAudio = sfxAudio;
   this.session = new SessionController(gameClient, sfxAudio);

   // Loading league
   console.debug("Controller: loading LeagueController...");
   let leagueClient = new LeagueClient();
   this.leageController = new LeagueController(leagueClient);
};
