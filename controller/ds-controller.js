class DsController {

    constructor(dsClient) {
        console.debug("DsController: loading the DsClient instance...");
        this._dsClient = dsClient;
        this._load();
    };

    _load() {
        console.debug("DsController: loading the listeners for UI events...");
        // Listeners for UI
        this._loadUI();
        // Listeners for reacting to server responses
        this._loadWsMessages();

    }
    
    _loadUI() {
        document.getElementById("searchPlayerButton").addEventListener("click", this._searchPlayerHandler.bind(this));
    }

    _loadWsMessages() {
        document.addEventListener("DS_GLOBALSTATISTICS", this._globalStatisticsReceiver.bind(this), false);
        document.addEventListener("DS_HISTORY", this._historyReceiver.bind(this), false);
    }
    
    


    // DS GLOBALSTATISTICS
    // {
    //     "global_statistics": {
    //       "best_score": 270,
    //       "id": 124,
    //       "is_human": true,
    //       "matches_stats": [
    //         {
    //           "id": 14,
    //           "match": {
    //             "datetime": "2020-11-10T12:33:00Z",
    //             "id": 12,
    //             "name": "Cool Match",
    //             "scores": "string"
    //           },
    //           "match_id": 57,
    //           "player_accuracy": 0.8,
    //           "player_id": 22,
    //           "player_in_match_name": "fabiofazio",
    //           "player_kills": 5,
    //           "player_leaderboard_position": 3,
    //           "player_real_name": "username",
    //           "player_was_killed": false
    //         }
    //       ],
    //       "name": "AI-Slayer",
    //       "total_accuracy": 0.72,
    //       "total_kill_death_ratio": 0,
    //       "total_kills": 293,
    //       "total_score": 5849
    //     }
    //   }

    _globalStatisticsReceiver() {
        let itsMe = evt.detail.itsMe;
        let data = evt.detail.data;
        let globalStatistics = data.global_statistics;
        
        if(itsMe)
            let globalStatisticsTable = document.getElementById("yourGlobalStatsTable");
        else
            let globalStatisticsTable = document.getElementById("searchPlayerGlobalStatsTable");

    }

    _historyReceiver(evt) {

        let itsMe = evt.detail.itsMe;
        let data = evt.detail.data;
        let historyList = data.history;
        
        if(itsMe)
            let historyTable = document.getElementById("yourHistoryTable");
        else
            let historyTable = document.getElementById("searchPlayerHistoryTable");
        
        historyTable.innerHTML = "";
        
        let tr = document.createElement("tr");

        let t1 = document.createElement("th");
        t1.innerHTML = "ACCURACY";
        let t2 = document.createElement("th");
        t2.innerHTML = "NAME";
        let t3 = document.createElement("th");
        t3.innerHTML = "KILLS";
        let t4 = document.createElement("th");
        t4.innerHTML = "POSITION";
        let t5 = document.createElement("th");
        t5.innerHTML = "SCORE";
        let t6 = document.createElement("th");
        t6.innerHTML = "KILLED";

        tr.appendChild(t1);
        tr.appendChild(t2);
        tr.appendChild(t3);
        tr.appendChild(t4);
        tr.appendChild(t5);
        tr.appendChild(t6);
        historyTable.appendChild(tr);

        historyList.forEach( (history) => {
            let tEl = document.createElement("tr");
            
            let player_accuracy = document.createElement("td");
            player_accuracy.innerHTML = history.player_accuracy;
            
            let player_in_match_name = document.createElement("td");
            player_in_match_name.innerHTML = history.player_in_match_name;

            let player_kills = document.createElement("td");
            player_kills.innerHTML = history.player_kills;

            let player_leaderboard_position = document.createElement("td");
            player_leaderboard_position.innerHTML = history.player_leaderboard_position;

            let player_score = document.createElement("td");
            player_score.innerHTML = history.player_score;

            let player_was_killed = document.createElement("td");
            player_was_killed.innerHTML = history.player_was_killed;
            

            tEl.appendChild(player_accuracy);
            tEl.appendChild(player_in_match_name);
            tEl.appendChild(player_kills);
            tEl.appendChild(player_leaderboard_position);
            tEl.appendChild(player_score);
            tEl.appendChild(player_was_killed);
            historyTable.appendChild(tEl);
        });
    }

}