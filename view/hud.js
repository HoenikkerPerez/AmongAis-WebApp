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
            _popupMsg("WASTED!!!\nYou are dead ... not a BIG surprise!", "danger");
        }, false);

        document.addEventListener("MODEL_STATE_LOBBYGUEST", () => {
            console.debug("hud displaying lobbyguess status");
            _popupMsg("Welcome! Please wait for the match beginning", "success");
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

        document.addEventListener("MODEL_MEETING_START", (evt) => {
            console.debug("hud EMERGENCY MEETING START");
            _popupMsg("EMERGENCY MEETING START!!!", "danger");
            let meet_div = document.getElementById("emergency-meeting");
            
            let who_start_name = evt.detail;
            let who_start = model.status.pl_list[who_start_name];
            let id = who_start.team;
            model.meetingsQueue.push(id);
            $("#emergency-meeting").append("<div id=\"emergency-meeting-"+id+"\" class=\"emergency-meeting-yellow\"></div>");        
            
            meet_div.style.display="";
            // <div class="spinner-border"></div>
            $("#emergency-meeting-"+id).append("<div id=\"countdown-" + id + "\"class=\"spinner-border\"></div>");
            window.setTimeout(function(){ this.meeting_countdown(15,id) }.bind(this), 1000);
        }, false);

        document.addEventListener("MODEL_MEETING_ACCUSE", (evt) => {
            console.debug("hud displaying EMERGENCY MEETING ACCUSE");
            let who = model.status.pl_list[evt.detail.accuser];
            let id = who.team;
            let msg = evt.detail.accuser + " --accuse--> " + evt.detail.accused;
            $("#emergency-meeting-"+id).prepend("<div>" + msg + "</div>");
        }, false);

        document.addEventListener("MODEL_MEETING_MSG", (evt) => {
            console.debug("hud displaying EMERGENCY MEETING MSG");
            // if(model.meetingsQueue.length<=0){ return; }
            // let id = model.meetingsQueue[0];
            let msg = evt.detail;
            $("#emergency-meeting").prepend("<div>" + msg + "</div>");
        }, false);

        document.addEventListener("CHAT_KILL", (evt) => {
            let murder = evt.detail.murder;
            let murdered = evt.detail.murdered;
            let murderColor = murder.team == "0" ? "red" : "blue";
            let murderedColor = murdered.team == "0" ? "red" : "blue";
            console.debug("hud displaying kill: " + murder + " kills " + murdered);
            let notificationHtml = '<p>' 
                            + '<span style="color: ' + murderedColor +  '" >' + murdered.name + '</span>' 
                            + ' killed by '
                            + '<span style="color: ' + murderColor +  '" >' + murder.name + '</span></p>';
            console.debug("notification toast kill shows: " + notificationHtml)
            $('#notificationToast')
                .html(notificationHtml)
                .toast("show");
        }, false);
    };

    meeting_countdown(times, id){
        if (times>5) {
            let cnt_div = document.getElementById("countdown-" + id);
            cnt_div.textContent = times;
        } else {
            let eMeeting = document.getElementById("emergency-meeting-" + id);
            eMeeting.className = "emergency-meeting-red";
            let cnt_div = document.getElementById("countdown-" + id);
            cnt_div.textContent = "";
        }

        if(times>0){
            window.setTimeout(function(){ this.meeting_countdown(times-1,id) }.bind(this), 1000);
        } else {
            let id = model.meetingsQueue.shift();
            let eMeeting = document.getElementById("emergency-meeting-"+id);
            eMeeting.className = "emergency-meeting-ended";
            window.setTimeout(function(){ 
                let meet_div_id = document.getElementById("emergency-meeting-"+id);
                meet_div_id.style.display="none";
                if(model.meetingsQueue.length<=0){
                    let meet_div = document.getElementById("emergency-meeting");
                    meet_div.innerText="";
                    meet_div.style.display="none";
                }
            }, 5000);
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
            if(model.kind == model.PLAYER && _p.name != model.status.me.name) {
                // Touring game visualization
                let touring_button_human = document.createElement("button");
                // touring_button_human.innerText = "H";
                // 
                let svgHuman = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svgHuman.setAttribute("xmlns","http://www.w3.org/2000/svg")
                svgHuman.setAttribute("viewBox","0 0 16 16")
                svgHuman.setAttribute("width","16")
                svgHuman.setAttribute("height","16")
                let pathHuman = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
                pathHuman.setAttribute("fill-rule","evenodd"); //Set path's data fill-rule="evenodd"
                pathHuman.setAttribute("d","M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 10-5.123 0 6.004 6.004 0 00-3.431 5.142.75.75 0 001.498.07 4.5 4.5 0 018.99 0 .75.75 0 101.498-.07 6.005 6.005 0 00-3.432-5.142z");
                svgHuman.appendChild(pathHuman);
                touring_button_human.appendChild(svgHuman)

                let human_button_id = "touring-button-human";
                touring_button_human.classList.add(human_button_id);
                touring_button_human.classList.add("btn");
                touring_button_human.classList.add("btn-primary");
                touring_button_human.classList.add("btn-sm");
                touring_button_human.classList.add("px-1");
                touring_button_human.classList.add("py-0");
                touring_button_human.classList.add("ml-1");

                let touring_button_ai = document.createElement("button");
                let svgAi = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svgAi.setAttribute("xmlns","http://www.w3.org/2000/svg")
                svgAi.setAttribute("viewBox","0 0 16 16")
                svgAi.setAttribute("width","16")
                svgAi.setAttribute("height","16")
                let pathAi = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
                pathAi.setAttribute("fill-rule","evenodd"); //Set path's data fill-rule="evenodd"
                pathAi.setAttribute("d","M0 8a8 8 0 1116 0v5.25a.75.75 0 01-1.5 0V8a6.5 6.5 0 10-13 0v5.25a.75.75 0 01-1.5 0V8zm5.5 4.25a.75.75 0 01.75-.75h3.5a.75.75 0 010 1.5h-3.5a.75.75 0 01-.75-.75zM3 6.75C3 5.784 3.784 5 4.75 5h6.5c.966 0 1.75.784 1.75 1.75v1.5A1.75 1.75 0 0111.25 10h-6.5A1.75 1.75 0 013 8.25v-1.5zm1.47-.53a.75.75 0 011.06 0l.97.97.97-.97a.75.75 0 011.06 0l.97.97.97-.97a.75.75 0 111.06 1.06l-1.5 1.5a.75.75 0 01-1.06 0L8 7.81l-.97.97a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 010-1.06z");
                // newElement.style.stroke = "#000"; //Set stroke colour
                // newElement.style.strokeWidth = "5px"; //Set stroke width
                svgAi.appendChild(pathAi);
                touring_button_ai.appendChild(svgAi)

                let ai_button_id = "touring-button-ai";
                touring_button_ai.classList.add(ai_button_id);
                touring_button_ai.classList.add("btn");
                touring_button_ai.classList.add("btn-primary");
                touring_button_ai.classList.add("btn-sm");
                touring_button_ai.classList.add("px-1");
                touring_button_ai.classList.add("py-0");
                touring_button_ai.classList.add("ml-1");

                // Attach buttons to the DOM
                // Touring undefined => pushing a button means "I want to say that"
                // Touring !undefined => pushing a button means "change that I said that"
                if(_p.touring == undefined || _p.touring == GameClient.HUMAN) {
                    p.appendChild(touring_button_human);
                    touring_button_human.onclick = () => {
                        if(_p.touring == undefined){
                            touring_button_human.style.visibility = 'visible';
                            touring_button_ai.style.visibility = 'hidden';
                            document.dispatchEvent(new CustomEvent("BUTTON_TOURING", {detail: {name: _p.name, touring: GameClient.HUMAN} }));
                        } else if (_p.touring == GameClient.HUMAN) {
                            touring_button_human.style.visibility = 'hidden';
                            touring_button_ai.style.visibility = 'visible';
                            document.dispatchEvent(new CustomEvent("BUTTON_TOURING", {detail: {name: _p.name, touring: GameClient.AI} }));
                        }
                    };
                }
                if(_p.touring == undefined || _p.touring == GameClient.AI) {
                    p.appendChild(touring_button_ai);
                    touring_button_ai.onclick = () => {
                        if(_p.touring == undefined){
                            touring_button_human.style.visibility = 'hidden';
                            touring_button_ai.style.visibility = 'visible';
                            document.dispatchEvent(new CustomEvent("BUTTON_TOURING", {detail: {name: _p.name, touring: GameClient.AI} }));
                        } else if (_p.touring == GameClient.AI) {
                            touring_button_human.style.visibility = 'visible';
                            touring_button_ai.style.visibility = 'hidden';
                            document.dispatchEvent(new CustomEvent("BUTTON_TOURING", {detail: {name: _p.name, touring: GameClient.HUMAN} }));
                        }
                    };
                }

                // p.appendChild(team);
                pl.appendChild(p);
                if(model.status.me != {} && model.status.me.team == _p.team && model.status.me.symbol != _p.symbol) { // && model.status.me.symbol != _p.symbol
                    // Social deduction
                    let accuse_button = document.createElement("button");
                    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    svg.setAttribute("xmlns","http://www.w3.org/2000/svg")
                    svg.setAttribute("viewBox","0 0 16 16")
                    svg.setAttribute("width","16")
                    svg.setAttribute("height","16")
                    var path = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
                    path.setAttribute("fill-rule","evenodd"); //Set path's data fill-rule="evenodd"
                    path.setAttribute("d","M8.75.75a.75.75 0 00-1.5 0V2h-.984c-.305 0-.604.08-.869.23l-1.288.737A.25.25 0 013.984 3H1.75a.75.75 0 000 1.5h.428L.066 9.192a.75.75 0 00.154.838l.53-.53-.53.53v.001l.002.002.002.002.006.006.016.015.045.04a3.514 3.514 0 00.686.45A4.492 4.492 0 003 11c.88 0 1.556-.22 2.023-.454a3.515 3.515 0 00.686-.45l.045-.04.016-.015.006-.006.002-.002.001-.002L5.25 9.5l.53.53a.75.75 0 00.154-.838L3.822 4.5h.162c.305 0 .604-.08.869-.23l1.289-.737a.25.25 0 01.124-.033h.984V13h-2.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-2.5V3.5h.984a.25.25 0 01.124.033l1.29.736c.264.152.563.231.868.231h.162l-2.112 4.692a.75.75 0 00.154.838l.53-.53-.53.53v.001l.002.002.002.002.006.006.016.015.045.04a3.517 3.517 0 00.686.45A4.492 4.492 0 0013 11c.88 0 1.556-.22 2.023-.454a3.512 3.512 0 00.686-.45l.045-.04.01-.01.006-.005.006-.006.002-.002.001-.002-.529-.531.53.53a.75.75 0 00.154-.838L13.823 4.5h.427a.75.75 0 000-1.5h-2.234a.25.25 0 01-.124-.033l-1.29-.736A1.75 1.75 0 009.735 2H8.75V.75zM1.695 9.227c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L3 6.327l-1.305 2.9zm10 0c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L13 6.327l-1.305 2.9z"); //Set path's data fill-rule="evenodd"
                    // newElement.style.stroke = "#000"; //Set stroke colour
                    // newElement.style.strokeWidth = "5px"; //Set stroke width
                    svg.appendChild(path);
                    accuse_button.appendChild(svg)

                    // accuse_button.classList.add("accuse-button");
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
