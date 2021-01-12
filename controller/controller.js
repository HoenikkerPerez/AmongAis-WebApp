// Controller

loadChat = function() {
   console.debug("Controller is loading ChatController...");
   this.chat = new ChatController(new ChatClient());
   console.debug("Controller has loaded the Chat.");
}

closeChat = function() {
   delete this.chat;
}

loadMatch = function() {
   // Load Chat
   loadChat();
   // Load Match
   console.debug("Controller is loading MatchController...");
   this.match = new MatchController(this.gameClient, this.sfxAudio);
   console.debug("Controller has loaded the MatchController.");
}

closeMatch = function() {
   delete this.match;
}

loadController = function() {
   // Loading session
   console.debug("Controller: loading GameClient...");
   let gameClient = new GameClient("GAMECLIENT");
   let leagueClient = new LeagueClient();
   let dsClient = new DsClient();

   this.gameClient = gameClient;
   console.debug("Controller: loading SessionController...");
   let sfxAudio = new SfxAudio()
   this.sfxAudio = sfxAudio;
   this.session = new SessionController(gameClient, sfxAudio);

   // Load chat
   console.debug("Controller is loading ChatClient...");
   // let chatClient = new ChatClient();
   // this.chatClient = chatClient;

   // Loading league
   console.debug("Controller: loading LeagueController...");
   this.leageController = new LeagueController(leagueClient);
   // Loading statistics
   console.debug("Controller: loading DsController...");
   this.dsController = new DsController(dsClient);

};
