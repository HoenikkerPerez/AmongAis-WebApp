class HudUi {

    constructor() {
        this._load();
        console.debug("UI: HUD loaded"); 
    };

    _load(){
        // Listeners for UI
        this._loadWsMessages();
    };

    _loadWsMessages() {
        document.addEventListener("MODEL_SETSTATUS", () => {
            this.renderHud();
        }, false);

        document.addEventListener("MODEL_SETCHAT", () => {
            this.renderChat();
        }, false);

        document.addEventListener("MODEL_SUBSCRIBEDCHANNEL", () => {
            this.renderSubscribedChannels();
        }, false);

        document.addEventListener("MODEL_UNSUBSCRIBEDCHANNEL", () => {
            this.renderSubscribedChannels();
        }, false);

        document.addEventListener("MODEL_STATE_LOBBYOWNER", () => {
            console.debug("hud displaying start button")
            document.getElementById("start-button").style.display = "";
        }, false);

        document.addEventListener("MODEL_STATE_KILLED", () => {
            console.debug("hud displaying killing status");
            popupMsg("WASTED!!!\nYou are dead ... not a BIG surprise!", "danger");
        }, false);

        document.addEventListener("MODEL_STATE_LOBBYGUEST", () => {
            console.debug("hud displaying lobbyguess status");
            popupMsg("Welcome! Please wait for the match beginning", "success");
        }, false);

        document.addEventListener("MODEL_MATCH_STATUS_ACTIVE", () => {
            document.getElementById("start-button").style.display = "none";
        }, false);
        
    };
    
    renderHud() {
        let div = document.getElementById("hud");
        div.innerHTML="";
        let root = document.createElement("ul");
        
        let match = document.createElement("ul");
        match.textContent="GAME";
        let gamename = document.createElement("li");
        gamename.innerHTML= "Name: " + model.status.ga;
        let statusGame = document.createElement("li");
        statusGame.innerHTML = "Status: " + model.status.state;
        
        match.appendChild(gamename);
        match.appendChild(statusGame);
        root.appendChild(match);
        div.appendChild(root);

        if(model.status.me != {} && (typeof model.status.me.name !== 'undefined')){
            let me = document.createElement("ul");
            me.textContent = "Player"
            
            let player = document.createElement("li");
            player.innerHTML = model.status.me.name; // +" [" + model.status.me.symbol + "]"
            let teamLoy = document.createElement("li");
            teamLoy.innerHTML = "team/loyalty: " + model.status.me.team + "/" + model.status.me.loyalty;
            let energy = document.createElement("li");
            energy.innerHTML = "Energy: "+model.status.me.energy;
            let score = document.createElement("li");
            score.innerHTML = "Score: "+model.status.me.score;

            me.appendChild(player);
            me.appendChild(teamLoy);
            me.appendChild(energy);
            me.appendChild(score);

            root.appendChild(me);
        }

        let pl = document.createElement("ul");
        pl.textContent="PLAYERS IN GAME"
        for(let i=0;i<model.status.pl_list.length;i++){
            // PL: symbol=A name=username3 team=0 x=7 y=26
            // let pul = document.createElement("il");

            let _p = model.status.pl_list[i]; 
            let p = document.createElement("li");

            p.innerHTML = _p.name; //+ "   (" + _p.team + ")"; // "["+_p.symbol+"] " + 
            if (_p.team == 0) {
                p.style.color = model.teamColors.teamA;
            } else if (_p.team == 1) {
                p.style.color = model.teamColors.teamB;
            }
            // let team = document.createElement("li");
            // team.innerHTML = "T: " + _p.team;
            
            // p.appendChild(team);
            pl.appendChild(p);
            if(model.status.me != {} && model.status.me.team == _p.team && model.status.me.symbol != _p.symbol){ // && model.status.me.symbol != _p.symbol
                // Social deduction
                let accuse_button = document.createElement("button");
                accuse_button.innerText = "Accuse!";
                accuse_button.className = "accuse-button";
                accuse_button.onclick= () => {
                    document.dispatchEvent(new CustomEvent("BUTTON_ACCUSE", {detail: _p.name }));
                    let allb = document.getElementsByClassName("accuse-button");
                    // TODO: to be continued ...
                };
                p.appendChild(accuse_button);
                
                // Touring game visualization
                let touring_button_human = document.createElement("button");
                touring_button_human.innerText = "A-ha, it's a HUMAN!";
                touring_button_human.className = "touring-button-human";
                touring_button_human.onclick = () => {
                    document.dispatchEvent(new CustomEvent("BUTTON_TOURING", {detail: {name: _p.name, touring: GameClient.HUMAN} }));
                }
                let touring_button_ai = document.createElement("button");
                touring_button_ai.innerText = "A-ha, it's an AI!";
                touring_button_ai.className = "touring-button-ai";
                touring_button_ai.onclick = () => {
                    document.dispatchEvent(new CustomEvent("BUTTON_TOURING", {detail: {name: _p.name, touring: GameClient.AI} }));
                }
                if(_p.touring == undefined){
                    p.appendChild(touring_button_human);
                    p.appendChild(touring_button_ai);
                } else if(_p.touring == GameClient.AI) {
                    p.appendChild(touring_button_ai);
                } else if(_p.touring == GameClient.HUMAN) {
                    p.appendChild(touring_button_human);
                } else {
                    console.error("HUD is unable to render Touring button: can't understand touring choice for " + _p);
                }
            }

        }
        root.appendChild(pl);

    }

    renderChat() {
        // channel chat -> [time from start] user: message (colored by team, or me)
        // server chat -> [time from start] AmongAis message
        // others -> <canale> user: messaggio
        
        let div = document.getElementById("messageList");
        div.innerHTML="";

        let messages = document.createElement("div");
        let model_messages = model.chat.messages
        for (let i=0; i<model_messages.length; i++) {
            let timestr = model_messages[i].time;
            let usrstr = model_messages[i].user;
            let chstr  = model_messages[i].channel;;
            let msgstr = model_messages[i].message;
            let type = model_messages[i].type;
            
            let box = document.createElement("div");
            // box.textContent = "---"
            switch(type) {
                case "system":
                    box.className = "system-message"
                     // server chat -> [time from start] AmongAis message
                    if (timestr == undefined)
                        box.innerHTML = "[lobby] " + msgstr;
                    else 
                        box.innerHTML = "[" + timestr +  "] " + msgstr;
                  break;
                  
                case "me":
                    box.className = "my-message"
                    if (timestr == undefined)
                        box.innerHTML = "[lobby] " + msgstr;
                    else 
                        box.innerHTML = "[" + timestr +  "] " + msgstr;
                        break;

                case "teamA":
                    box.className = "teama-message"
                    if (timestr == undefined)
                        box.innerHTML = "[lobby] " + usrstr + ": "+ msgstr;
                    else 
                        box.innerHTML = "[" + timestr +  "] "  + usrstr + ": "+ msgstr;
                    break;

                case "teamB":
                    box.className = "teamb-message"
                    if (timestr == undefined)
                        box.innerHTML = "[lobby] " + usrstr + ": "+ msgstr;
                    else 
                        box.innerHTML = "[" + timestr +  "] "  + usrstr + ": "+ msgstr;
                    break;
                    
                default:
                    box.className = "others-message"
                    if (timestr == undefined)
                        box.innerHTML = "[lobby] " + "<" + chstr + "> " + usrstr + ": "+ msgstr;
                    else 
                        box.innerHTML = "[" + timestr +  "] "  + "<" + chstr + "> " + usrstr + ": "+ msgstr;
                    break;
              }

            // let channel = document.createElement("div");
            // channel.innerHTML = chstr;
            // box.appendChild(channel);

            // let user = document.createElement("div");
            // user.innerHTML = usrstr;
            // box.appendChild(user);

            // let message = document.createElement("div");
            // message.innerHTML = msgstr;
            // box.appendChild(message);

            messages.appendChild(box);
        }
        div.appendChild(messages)
    };

    renderSubscribedChannels() {
        // subscribed messages
        let chatSubscribedChannelBlock = document.getElementById("chatSubscribedChannelBlock");
        chatSubscribedChannelBlock.innerHTML = "";
        let subs_channels = model.chat.chatSubscribedChannels

        let box = document.createElement("ul");
        box.textContent = "Subscribed channels"
        for (let i=0; i< subs_channels.length; i++) { 
            let channel = document.createElement("li");
            let channelstr = subs_channels[i].channel;

            channel.innerHTML = channelstr
            box.appendChild(channel);

            let leaveButton = document.createElement("button");
            leaveButton.innerText = "Leave"
            leaveButton.onclick= () => {
                //this._chat_client.removeSubscribedChannel(channel);
                document.dispatchEvent(new CustomEvent("BUTTON_UNSUBSRIBECHANNEL", {detail: {channel: channelstr}}));
            };
            box.appendChild(leaveButton);

        }   
        chatSubscribedChannelBlock.appendChild(box);
    };
};
