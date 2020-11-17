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
                let accuse_button = document.createElement("button");
                accuse_button.innerText = "Accuse!"
                accuse_button.className = "accuse-button";
                accuse_button.onclick= () => {
                    document.dispatchEvent(new CustomEvent("ACCUSE", {detail: _p.name }));
                    let allb = document.getElementsByClassName("accuse-button");
                    // TODO: to be continued ...
                };
                p.appendChild(accuse_button);
            }
            
        }
        root.appendChild(pl);

    }
    
    renderChat() {
        let div = document.getElementById("messageList");
        div.innerHTML="";

        let messages = document.createElement("ul");
        let model_messages = model.chat.messages
        for (let i=0; i<model_messages.length; i++) {
            let box = document.createElement("ul");
            box.textContent = "---"

            let channel = document.createElement("li");
            channel.innerHTML = model_messages[i].channel;
            box.appendChild(channel);

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