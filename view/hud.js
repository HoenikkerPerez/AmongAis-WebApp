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
            console.log("Rendering chat")
            this.renderChat();
        }, false);
    };


    _renderHud() {
        console.debug("Rendering HUD");
        // document.getElementById("hud").textContent = evt.detail;
        let status_str = "";
        status_str += "Match Name: " + model.status.ga;
        status_str += "  Match state: " + model.status.state;
        status_str +="\r\n"
        status_str += "My Name: " + model.status.me.name;
        status_str += " [" + model.status.me.symbol + "]";
        status_str += "  team/loyalty: " + model.status.me.team + "/" + model.status.me.loyalty;
        status_str += "  Energy: " + model.status.me.energy;
        status_str += "   Score: " + model.status.me.score;
        status_str += "\r\nPlayers in Game: "
        for(let i=0;i<model.status.pl_list.length;i++){
            status_str += "\r\n"
            let pl = model.status.pl_list[i];
            // PL: symbol=A name=username3 team=0 x=7 y=26
            status_str += "- " + pl.name +"["+pl.symbol+"]";
            status_str += "  Team: " + pl.team;
            // status_str += "  ("+pl.x+","+pl.y+")";
        }

        document.getElementById("hud").textContent = status_str;
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

        if(typeof model.status.me.name !== 'undefined'){
            let me = document.createElement("ul");
            me.textContent = "Player"
            
            let player = document.createElement("li");
            player.innerHTML = model.status.me.name+" [" + model.status.me.symbol + "]";
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

            p.innerHTML = "["+_p.symbol+"] " + _p.name + "   (" + _p.team + ")";
            // let team = document.createElement("li");
            // team.innerHTML = "T: " + _p.team;
            
            // p.appendChild(team);
            pl.appendChild(p);
        }
        root.appendChild(pl);

    }
    
    renderChat() {
        let div = document.getElementById("messageList");
        div.innerHTML="";

        let messages = document.createElement("ul");
        messages.textContent="MESSAGES";
        let model_messages = model.chat.messages
        for (let i=0; i<model_messages.length; i++) {
            let box = document.createElement("ul");
            box.textContent = "MESSAGE"
            let user = document.createElement("li");
            user.innerHTML = model_messages[i].user;
            box.appendChild(user);

            let message = document.createElement("li");
            message.innerHTML = model_messages[i].message;
            box.appendChild(message);

            messages.appendChild(box);
        }
        div.appendChild(messages)
    }   

};