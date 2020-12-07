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

        document.addEventListener("MODEL_STATE_KILLED", () => {
            console.debug("hud displaying killing status");
            popupMsg("WASTED!!!\nYou are dead ... not a BIG surprise!", "danger");
        }, false);

        document.addEventListener("MODEL_STATE_LOBBYGUEST", () => {
            console.debug("hud displaying lobbyguess status");
            popupMsg("Welcome! Please wait for the match beginning", "success");
        }, false);

        // Show-Start Button
        document.addEventListener("MODEL_MATCH_STATUS_LOBBY", () => {
            if(model.imCreator(model.status.ga)){
                document.getElementById("start-button").style.display="";
            }
        }, false);

        document.addEventListener("MODEL_MATCH_STATUS_ACTIVE", () => {
            document.getElementById("start-button").style.display = "none";
            model.removeCreatedGames(model.status.ga);
        }, false);

        document.addEventListener("MODEL_MEETING_START", () => {
            console.debug("hud EMERGENCY MEETING START");
            popupMsg("EMERGENCY MEETING START!!!", "danger");
            let meet_div = document.getElementById("emergency-meeting");
            meet_div.style.display="";
            // <div class="spinner-border"></div>
            // TODO: Improve countdown Design <---------------- !!!
            $("#emergency-meeting").append("<div id=\"countdown\"class=\"spinner-border\"></div>");
            window.setTimeout(function(){ this.meeting_countdown(15) }.bind(this), 1000);
        }, false);

        document.addEventListener("MODEL_MEETING_END", () => {
            console.debug("hud EMERGENCY MEETING END");
            // popupMsg("EMERGENCY MEETING END!!!", "danger");
            let eMeeting = document.getElementById("emergency-meeting");
            eMeeting.className = "emergency-meeting-ended";;
            window.setTimeout(function(){ 
                let meet_div = document.getElementById("emergency-meeting");
                meet_div.style.display="none";
                meet_div.innerText="";
            }, 5000);
        }, false);

        document.addEventListener("MODEL_MEETING_ACCUSE", (evt) => {
            console.debug("hud displaying EMERGENCY MEETING START");
            let msg = evt.detail.accuser + " --accuse--> " + evt.detail.accused;
            $("#emergency-meeting").prepend("<div>" + msg + "</div>");
        }, false);

        document.addEventListener("MODEL_MEETING_MSG", (evt) => {
            console.debug("hud displaying EMERGENCY MEETING START");
            let msg = evt.detail;
            $("#emergency-meeting").prepend("<div>" + msg + "</div>");
        }, false);
    };

    meeting_countdown(times){
        if (times>5) {
            let cnt_div = document.getElementById("countdown");
            cnt_div.textContent = times;
        } else {
            let eMeeting = document.getElementById("emergency-meeting");
            eMeeting.className = "emergency-meeting-red";
            let cnt_div = document.getElementById("countdown");
            cnt_div.textContent = "";
        }

        if(times>0){
            window.setTimeout(function(){ this.meeting_countdown(times-1) }.bind(this), 1000);
        }
    }
    
    renderHud() {
        let div = document.getElementById("hud");
        div.innerHTML="";
        let root = document.createElement("div");

        let match = document.createElement("div");
        match.textContent="GAME";
        let gamename = document.createElement("div");
        gamename.innerHTML= "Name: " + model.status.ga;
        let statusGame = document.createElement("div");
        statusGame.innerHTML = "Status: " + model.status.state;

        match.appendChild(gamename);
        match.appendChild(statusGame);
        root.appendChild(match);
        div.appendChild(root);

        if(model.status.me != {} && (typeof model.status.me.name !== 'undefined')){
            let me = document.createElement("div");
            me.textContent = "Player"
            
            let player = document.createElement("div");
            player.innerHTML = model.status.me.name; // +" [" + model.status.me.symbol + "]"
            let teamLoy = document.createElement("div");
            let team = model.status.me.team == "0" ? "red" : "blue";
            let loyalty = model.status.me.loyalty == "0" ? "red" : "blue";
            teamLoy.innerHTML = "Affiliation: " + team + " loyal to " + loyalty;
            
            let energy = document.createElement("div");
            energy.innerHTML = "Energy: ";//+model.status.me.energy;
            energy.id = "me_enrg";
            let bar = buildProgress(model.status.me.energy);

            let score = document.createElement("div");
            score.innerHTML = "Score: "+model.status.me.score;

            me.appendChild(player);
            me.appendChild(teamLoy);
            me.appendChild(energy);
            me.appendChild(score);

            root.appendChild(me);
            $("#me_enrg").append(bar);
        }

        let pl = document.createElement("div");
        pl.textContent="PLAYERS IN GAME"
        for(let playerName in model.status.pl_list){
            // PL: symbol=A name=username3 team=0 x=7 y=26
            // let pul = document.createElement("il");

            let _p = model.status.pl_list[playerName];
            let p = document.createElement("div");

            p.innerHTML = _p.name; //+ "   (" + _p.team + ")"; // "["+_p.symbol+"] " + 
            if(_p.state == "KILLED") {
                p.style.textDecoration = "line-through";
            }
            
            if (_p.team == 0) {
                p.style.color = model.teamColors.teamA;
            } else if (_p.team == 1) {
                p.style.color = model.teamColors.teamB;
            }
            // let team = document.createElement("div");
            // team.innerHTML = "T: " + _p.team;
            if(model.kind == model.PLAYER) {
                // Touring game visualization
                let touring_button_human = document.createElement("button");
                touring_button_human.innerText = "H";
                touring_button_human.classList.add("touring-button-human");
                touring_button_human.classList.add("btn");
                touring_button_human.classList.add("btn-primary");
                touring_button_human.classList.add("btn-sm");
                touring_button_human.classList.add("px-1");
                touring_button_human.classList.add("py-0");
                touring_button_human.classList.add("ml-1");

                let touring_button_ai = document.createElement("button");
                touring_button_ai.innerText = "AI";
                touring_button_ai.classList.add("touring-button-ai");
                touring_button_ai.classList.add("btn");
                touring_button_ai.classList.add("btn-primary");
                touring_button_ai.classList.add("btn-sm");
                touring_button_ai.classList.add("px-1");
                touring_button_ai.classList.add("py-0");
                touring_button_ai.classList.add("ml-1");
                // Touring undefined => pushing a button means "I want to say that"
                // Touring !undefined => pushing a button means "change that I said that"
                if(_p.touring == undefined) {
                    p.appendChild(touring_button_human);
                    touring_button_human.onclick = () => { document.dispatchEvent(new CustomEvent("BUTTON_TOURING", {detail: {name: _p.name, touring: GameClient.HUMAN} })); }
                    p.appendChild(touring_button_ai);
                    touring_button_ai.onclick = () => { document.dispatchEvent(new CustomEvent("BUTTON_TOURING", {detail: {name: _p.name, touring: GameClient.AI} })); }
                } else if(_p.touring == GameClient.AI) {
                    p.appendChild(touring_button_ai);
                    touring_button_ai.onclick = () => { document.dispatchEvent(new CustomEvent("BUTTON_TOURING", {detail: {name: _p.name, touring: GameClient.HUMAN} })); }
                } else if(_p.touring == GameClient.HUMAN) {
                    p.appendChild(touring_button_human);
                    touring_button_human.onclick = () => { document.dispatchEvent(new CustomEvent("BUTTON_TOURING", {detail: {name: _p.name, touring: GameClient.AI} })); }
                } else {
                    console.error("HUD is unable to render Touring button: can't understand touring choice for " + _p.name);
                }

                // p.appendChild(team);
                pl.appendChild(p);
                if(model.status.me != {} && model.status.me.team == _p.team && model.status.me.symbol != _p.symbol) { // && model.status.me.symbol != _p.symbol
                    // Social deduction
                    let accuse_button = document.createElement("button");
                    accuse_button.innerText = "Accuse!";
                    accuse_button.classList.add("accuse-button");
                    accuse_button.classList.add("btn");
                    accuse_button.classList.add("btn-danger");
                    accuse_button.classList.add("btn-sm");
                    accuse_button.classList.add("px-1");
                    accuse_button.classList.add("py-0");
                    accuse_button.classList.add("ml-1");

                    accuse_button.onclick= () => {
                        document.dispatchEvent(new CustomEvent("BUTTON_ACCUSE", {detail: _p.name }));
                        let allb = document.getElementsByClassName("accuse-button");
                        // TODO: to be continued ...
                    };
                    p.appendChild(accuse_button);
                }
            } else if(model.kind == model.SPECTATOR) {
                pl.appendChild(p);
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

        let box = document.createElement("div");
        box.textContent = "Subscribed channels"
        for (let i=0; i< subs_channels.length; i++) { 
            let channel = document.createElement("div");
            let channelstr = subs_channels[i].channel;

            channel.innerHTML = channelstr
            box.appendChild(channel);

            let leaveButton = document.createElement("button");
            leaveButton.classList.add("btn");
            leaveButton.classList.add("btn-outline-primary");
            leaveButton.classList.add("btn-sm");
            leaveButton.classList.add("px-1");
            leaveButton.classList.add("py-0");
            leaveButton.classList.add("ml-1");

            leaveButton.innerText = "Leave";
            leaveButton.onclick= () => {
                //this._chat_client.removeSubscribedChannel(channel);
                document.dispatchEvent(new CustomEvent("BUTTON_UNSUBSRIBECHANNEL", {detail: {channel: channelstr}}));
            };
            channel.appendChild(leaveButton);

        }   
        chatSubscribedChannelBlock.appendChild(box);
    };
};
