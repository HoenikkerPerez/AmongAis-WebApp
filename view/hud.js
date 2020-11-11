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
    };


    renderHud() {
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
            status_str += "  ("+pl.x+","+pl.y+")";
        }

        document.getElementById("hud").textContent = status_str;
    };
    
};