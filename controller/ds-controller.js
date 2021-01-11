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

        document.addEventListener("PAGE_YOUR_STATISTICS", this._yourStatisticsPage.bind(this), false);
        // document.addEventListener("PAGE_PLAYER_STATISTICS", this._playerPage.bind(this), false);
    }
    
    
    _yourStatisticsPage() {
        this._dsClient.getMyGlobalStatistics();
        this._dsClient.getMyHistory();
    }

    _searchPlayerHandler() {
        let player = document.getElementById("usernameSearchPlayer").value
        this._dsClient.getGlobalStatistics(player);
        this._dsClient.getHistory(player);
    }
    // DS GLOBALSTATISTICS
    // {
    //     "global_statistics": {
    //       "best_score": 270,
    //       "id": 124,
    //       "is_human": true,
    //       "name": "AI-Slayer",
    //       "total_accuracy": 0.72,
    //       "total_kill_death_ratio": 0,
    //       "total_kills": 293,
    //       "total_score": 5849
    //     }
    //   }

    _globalStatisticsReceiver(evt) {
        let itsMe = evt.detail.itsMe;
        let data = evt.detail.data;
        let globalStatistics = data.global_statistics;
        let globalStatisticsTable;
        if(itsMe)
            globalStatisticsTable = document.getElementById("yourGlobalStatsTable");
        else
            globalStatisticsTable = document.getElementById("searchPlayerGlobalStatsTable");
            // globalStatisticsTable = document.getElementById("searchPlayerGlobalStatsDiv");
        globalStatisticsTable.innerHTML = "";
        let species = globalStatistics.is_human ? "HUMAN" : "AI"
        let pairs = [["BEST SCORE", globalStatistics.best_score],
                    ["SPECIES", species], 
                    ["NAME", globalStatistics.name], 
                    ["PLAYED MATCHES",globalStatistics.played_matches],
                    ["ACCURACY", globalStatistics.total_accuracy], 
                    ["K / D", globalStatistics.total_kill_death_ratio],
                    ["KILLS",globalStatistics.total_kills],
                    ["DEATHS",globalStatistics.total_deaths],
                    [ "TOTAL SCORE",globalStatistics.total_score]];

        pairs.forEach((pair)=> {
            let tbody = document.createElement("tbody");
            let tr = document.createElement("tr");
            let th = document.createElement("th");
            th.innerHTML = pair[0];
            tr.appendChild(th);
            let td = document.createElement("td");
            td.innerHTML = pair[1];
            tr.appendChild(td);
            tbody.appendChild(tr);
            globalStatisticsTable.appendChild(tbody);
        });

    }

    _historyReceiver(evt) {

        let itsMe = evt.detail.itsMe;
        let data = evt.detail.data;
        let historyList = data.history;
        let historyTable;
        if(itsMe)
            historyTable = document.getElementById("yourHistoryTable");
        else
            historyTable = document.getElementById("searchPlayerHistoryTable");
        
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
        t6.innerHTML = "ENDGAME";

        tr.appendChild(t1);
        tr.appendChild(t2);
        tr.appendChild(t3);
        tr.appendChild(t4);
        tr.appendChild(t5);
        tr.appendChild(t6);
        historyTable.appendChild(tr);

        historyList.forEach( (history) => {
            let tbody = document.createElement("tbody");
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
            let endGame = history.player_was_killed ? "KILLED" : "SURVIROR";
            player_was_killed.innerHTML = endGame;
            

            tEl.appendChild(player_accuracy);
            tEl.appendChild(player_in_match_name);
            tEl.appendChild(player_kills);
            tEl.appendChild(player_leaderboard_position);
            tEl.appendChild(player_score);
            tEl.appendChild(player_was_killed);
            tbody.appendChild(tEl);
            historyTable.appendChild(tbody);
        });
    }

}