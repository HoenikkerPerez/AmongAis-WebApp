class LeagueController {

    constructor(leagueClient) {
        console.debug("LeagueController: loading the GameClient instance...");
        this._leagueClient = leagueClient;
        this._load();
    };

    _load() {
        console.debug("LeagueController: loading the listeners for UI events...");
        // Listeners for UI
        this._loadUI();
        // Listeners for reacting to server responses
        this._loadWsMessages();

    }


    
    _loadUI() {
        // document.getElementById("scheduleTournamentButton").addEventListener("click", this._scheduleTournamentHandler.bind(this));
        document.getElementById("joinTournamentButton").addEventListener("click", this._joinTournamentHandler.bind(this));
        document.getElementById("leaveTournamentButton").addEventListener("click", this._leaveTournamentHandler.bind(this));
    }


    _loadWsMessages() {
        document.addEventListener("LEAGUE_SCHEDULE", this._scheduleTournamentReceiver.bind(this), false);
        document.addEventListener("LEAGUE_PLAYERS", this._subscribersTournamentReceiver.bind(this), false);
        document.addEventListener("LEAGUE_JOIN", this._joinTournamentReceiver.bind(this), false);
        document.addEventListener("LEAGUE_LIST", this._listTournamentReceiver.bind(this), false);
        document.addEventListener("LEAGUE_LIST", this._listTournamentForSelectionReceiver.bind(this), false);
        document.addEventListener("LEAGUE_GLOBALRANKING", this._globalRankingReceiver.bind(this), false);
        document.addEventListener("LEAGUE_LEADERBOARD", this._leaderboardTournamentReceiver.bind(this), false);
        
        // NAVBAR
        document.getElementById("homeLink").addEventListener("click", (()=> {this._hashEventListener("#homeLink")}).bind(this))
        document.getElementById("brandLink").addEventListener("click", (()=> {this._hashEventListener("#homeLink")}).bind(this))
        document.getElementById("joinTournamentLink").addEventListener("click", (()=> {this._hashEventListener("#joinTournament")}).bind(this))
        document.getElementById("leaveTournamentLink").addEventListener("click", (()=> {this._hashEventListener("#leaveTournament")}).bind(this))
        document.getElementById("listTournamentLink").addEventListener("click", (()=> {this._hashEventListener("#listTournament")}).bind(this))
        document.getElementById("globalLeaderboardLink").addEventListener("click", (()=> {this._hashEventListener("#globalLeaderboard")}).bind(this))
        document.getElementById("yourStatsLink").addEventListener("click", (()=> {this._hashEventListener("#yourStatsLink")}).bind(this))
        document.getElementById("searchPlayerLink").addEventListener("click", (()=> {this._hashEventListener("#searchPlayerLink")}).bind(this))
        // window.addEventListener("hashchange", this._hashEventListener.bind(this));
    }

    // GLOBAL RANKING
    _globalRankingReceiver(evt) {
        let players = evt.detail.data;
        let globalRankingTable = document.getElementById("globalRankingTable");
        globalRankingTable.innerHTML = "";

        let tr = document.createElement("tr");

        let t1= document.createElement("th");
        t1.innerHTML = "Rank";
        let t2 = document.createElement("th");
        t2.innerHTML = "Name";
        let t3 = document.createElement("th");
        t3.innerHTML = "Score";
       
        tr.appendChild(t1);
        tr.appendChild(t2);
        tr.appendChild(t3);

        globalRankingTable.appendChild(tr);

        players.forEach( (player) => {
            let tEl = document.createElement("tr");
                
            let rank = document.createElement("td");
            // rankTournament.classList.add("font-weight-bold")
            rank.innerHTML = player.player_rank;
            
            let player_id = document.createElement("td");
            player_id.innerHTML = player.player_name;
            player_id.classList.add("font-weight-bold")

            let player_score = document.createElement("td");
            player_score.innerHTML = player.player_score;

            tEl.appendChild(rank);
            tEl.appendChild(player_id);
            tEl.appendChild(player_score);

            globalRankingTable.appendChild(tEl);
        });
    }

    // JOIN TOURNAMENT
    _joinTournamentHandler() {
        let tournamentUsername = document.getElementById("usernameJoinTournament").value;
        let tournamentName = document.getElementById("nameJoinTournament").value;
        if(tournamentName && tournamentUsername) {
            this._leagueClient.joinTournament(tournamentUsername, tournamentName);
            new DatalogHome("T-JOIN-PAGE", 1);
        }
    }

    _leaveTournamentHandler() {
        let tournamentUsername = document.getElementById("usernameLeaveTournament").value;
        let tournamentName = document.getElementById("nameLeaveTournament").value;
        if(tournamentName && tournamentUsername) {
            this._leagueClient.leaveTournament(tournamentUsername, tournamentName);
            new DatalogHome("T-LEAVE", 1);
        }
    }

    _joinTournamentReceiver(evt) {
        let data = evt.detail.data;
        let joinTournamentContainer = document.getElementById("joinTournamentContainer");
        if(joinTournamentContainer) {
            joinTournamentContainer.innerHTML = data;
        }
    }

    // SCHEDULE
    _scheduleTournamentHandler() {
        let tournamentName = document.getElementById("scheduleTournamentInput").value;
        if(tournamentName)
            this._leagueClient.getTournamentSchedule(tournamentName);
    }

    // _scheduleTournamentReceiver(evt) {
    //     let data = evt.detail.data;
    //     let scheduleTournamentContainer = document.getElementById("scheduleTournamentContainer");
    //     if(scheduleTournamentContainer) {
    //         scheduleTournamentContainer.innerHTML = data;
    //     }
    // }

    _scheduleTournamentReceiver(evt) {
        $('#tournamentModal').modal('toggle');
        let data = evt.detail.data;
        let tournamentId = data.tournament_id;
        let rounds = data.rounds;
        let tournamentModalLabel = document.getElementById("tournamentModalLabel");
        tournamentModalLabel.innerHTML = "Schedule of " + tournamentId + " tournament"

        //  show on modal
        let tournamentModal = document.getElementById("tournamentModalBody");
        tournamentModal.innerHTML = "";

        let scheduleTable = document.createElement("table")
        scheduleTable.classList.add("table");
        scheduleTable.classList.add("text-white");
        
        let tr = document.createElement("tr");

        let t1= document.createElement("th");
        t1.innerHTML = "Round";

        let t2 = document.createElement("th");
        t2.innerHTML = "Match";

        let t3 = document.createElement("th");
        t3.innerHTML = "Match Name";

        let t4 = document.createElement("th");
        t4.innerHTML = "Time Schedule";

        tr.appendChild(t1);
        tr.appendChild(t2)
        tr.appendChild(t3)
        tr.appendChild(t4)
        scheduleTable.appendChild(tr)

        for(let i=0; i<rounds.length; i++) {
            let matches = rounds[i].matches;
            for(let j=0; j<matches.length; j++) {
                let tEl = document.createElement("tr");

                let roundEl = document.createElement("td");
                roundEl.innerHTML = i;
                
                let matchEl = document.createElement("td");
                matchEl.innerHTML = j;

                let idEl = document.createElement("td");
                idEl.innerHTML = matches[j].id;

                let timeScheduleEl = document.createElement("td");
                let date = new Date(matches[j].start_date);
                timeScheduleEl.innerHTML = date.toLocaleString();
                
                tEl.appendChild(roundEl);
                tEl.appendChild(matchEl);
                tEl.appendChild(idEl);
                tEl.appendChild(timeScheduleEl);
                
                scheduleTable.appendChild(tEl);
            }
        }
        tournamentModal.appendChild(scheduleTable)
    }

    _subscribersTournamentReceiver(evt) {
        $('#tournamentModal').modal('toggle');
        let players = evt.detail.data;
        //  show on modal
        let tournamentModalLabel = document.getElementById("tournamentModalLabel");
        tournamentModalLabel.innerHTML = "SUBSCRIBERS"

        let tournamentModal = document.getElementById("tournamentModalBody");
        tournamentModal.innerHTML = "";
        let playerTable = document.createElement("table")
        playerTable.classList.add("table");
        playerTable.classList.add("text-white");
        
        let tr = document.createElement("tr");

        let t1= document.createElement("th");
        t1.innerHTML = "Player";

        let t2 = document.createElement("th");
        t2.innerHTML = "Sub Date";

        tr.appendChild(t1);
        tr.appendChild(t2)
        playerTable.appendChild(tr)
        players.forEach((player)=> {
            let tEl = document.createElement("tr");
            
            let username = document.createElement("td");
            username.innerHTML = player.player_id;
            
            let subDate = document.createElement("td");
            let date = new Date(player.datetime);
            subDate.innerHTML = date.toLocaleString();
            
            tEl.appendChild(username);
            tEl.appendChild(subDate);
            
            playerTable.appendChild(tEl);
        });        
        tournamentModal.appendChild(playerTable);
    }

    _leaderboardTournamentReceiver(evt) {
        $('#tournamentModal').modal('toggle');
        let players = evt.detail.data.leaderboard;
        //  show on modal
        let tournamentModalLabel = document.getElementById("tournamentModalLabel");
        tournamentModalLabel.innerHTML = "LEADERBOARD"

        let tournamentModal = document.getElementById("tournamentModalBody");
        tournamentModal.innerHTML = "";

        let leaderboardTable = document.createElement("table")
        leaderboardTable.classList.add("table");
        leaderboardTable.classList.add("text-white");

        let tr = document.createElement("tr");

        let t1= document.createElement("th");
        t1.innerHTML = "Rank";
        let t2 = document.createElement("th");
        t2.innerHTML = "Name";
        let t3 = document.createElement("th");
        t3.innerHTML = "Score";
       
        tr.appendChild(t1);
        tr.appendChild(t2);
        tr.appendChild(t3);

        leaderboardTable.appendChild(tr);

        players.forEach( (player) => {
            let tEl = document.createElement("tr");
                
            let rank = document.createElement("td");
            rank.innerHTML = player.player_rank;
            
            let player_id = document.createElement("td");
            player_id.innerHTML = player.player_name;
            player_id.classList.add("font-weight-bold")

            let player_score = document.createElement("td");
            player_score.innerHTML = player.player_score;

            tEl.appendChild(rank);
            tEl.appendChild(player_id);
            tEl.appendChild(player_score);

            leaderboardTable.appendChild(tEl);
        });   
        tournamentModal.appendChild(leaderboardTable)
    }

    // LIST
    _listTournamentReceiver(evt) {
        let data = evt.detail.data;
        let tournamentList = data.data;
        let listTournamentTable = document.getElementById("listTournamentTable");
        listTournamentTable.innerHTML = "";

        let tr = document.createElement("tr");

        let t1= document.createElement("th");
        t1.innerHTML = "ID";
        let t2 = document.createElement("th");
        t2.innerHTML = "START MATCHES";
        let t3 = document.createElement("th");
        t3.innerHTML = "END MATCHES";
        let t4 = document.createElement("th");
        t4.innerHTML = "START SUBS";
        let t5 = document.createElement("th");
        t5.innerHTML = "END SUBS";
        let t6 = document.createElement("th");
        t6.innerHTML = "ACTIONS";

        tr.appendChild(t1);
        tr.appendChild(t2);
        tr.appendChild(t3);
        tr.appendChild(t4);
        tr.appendChild(t5);
        tr.appendChild(t6);
        listTournamentTable.appendChild(tr);

        if(listTournamentTable) {
            tournamentList.forEach( (tournament) => {
                let date;
                let closedSubs;
                let tEl = document.createElement("tr");
                
                let idTournament = document.createElement("td");
                idTournament.classList.add("font-weight-bold")
                idTournament.innerHTML = tournament.id;
                
                let startTournamentEl = document.createElement("td");
                date = new Date(tournament.start_matches_date);
                startTournamentEl.innerHTML = date.toLocaleString();

                let endTournamentEl = document.createElement("td");
                date = new Date(tournament.end_matches_date);
                endTournamentEl.innerHTML = date.toLocaleString();

                let startSubscriptionEl = document.createElement("td");
                date = new Date(tournament.start_subscriptions_date);
                startSubscriptionEl.innerHTML = date.toLocaleString();

                let endSubscriptionEl = document.createElement("td");
                date = new Date(tournament.end_subscriptions_date);
                if(date < Date.now()) {
                    endSubscriptionEl.classList.add("text-danger");
                    closedSubs = true;
                }
                endSubscriptionEl.innerHTML = date.toLocaleString();

                let actionsEl = document.createElement("td");

                let joinB = document.createElement("button");
                joinB.classList.add("btn")
                joinB.classList.add("btn-primary")   
                joinB.classList.add("btn-sm")   
                joinB.classList.add("mr-1")   
                joinB.classList.add("mt-1")   
                joinB.innerHTML = "Join"
                if(closedSubs) {
                    joinB.disabled = true;
                } else {
                    joinB.addEventListener("click", () => {
                        $('#tournamentModal').modal('toggle');
                        let tournamentModalLabel = document.getElementById("tournamentModalLabel");
                        tournamentModalLabel.innerHTML = "Join Tournament"
                        let tournamentModal = document.getElementById("tournamentModalBody");
                        tournamentModal.innerHTML = "";

                        let formJoin = document.createElement("div");

                        let labelJoin = document.createElement("label");
                        labelJoin.innerHTML = "Subscription Username";
                        formJoin.appendChild(labelJoin);

                        let inputJoin = document.createElement("input");
                        inputJoin.placeholder = "username"
                        inputJoin.classList.add("form-control")
                        inputJoin.classList.add("mb-3")
                        formJoin.appendChild(inputJoin);

                        let buttonJoin = document.createElement("button");
                        buttonJoin.innerHTML = "JOIN"
                        buttonJoin.classList.add("btn");
                        buttonJoin.classList.add("btn-primary");
                        buttonJoin.classList.add("mb-3");
                        buttonJoin.addEventListener("click", (evt)=>{
                            let tournamentUsername = inputJoin.value;
                            let tournamentName = tournament.id;
                            this._leagueClient.joinTournament(tournamentUsername, tournamentName);
                            new DatalogHome("T-JOIN-LIST", 1);
                        })
                        formJoin.appendChild(buttonJoin);

                        tournamentModal.appendChild(formJoin)
                        $('#tournamentModal').modal('toggle');
                    });
                }
                actionsEl.appendChild(joinB);

                let scheduleB = document.createElement("button");
                scheduleB.classList.add("btn")
                scheduleB.classList.add("btn-primary")  
                scheduleB.classList.add("btn-sm")   
                scheduleB.classList.add("mr-1")   
                scheduleB.classList.add("mt-1")   
                scheduleB.innerHTML = "Sched"
                scheduleB.addEventListener("click", () => {
                    this._leagueClient.getTournamentSchedule(tournament.id);
                    // document.dispatchEvent(new CustomEvent("REQUEST_LEAGUE_SCHEDULE", {detail: {torunamentId: idTournament}}));
                });
                actionsEl.appendChild(scheduleB);

                let playersB = document.createElement("button");
                playersB.classList.add("btn")
                playersB.classList.add("btn-primary")
                playersB.classList.add("btn-sm")   
                playersB.classList.add("mr-1")   
                playersB.classList.add("mt-1")                   
                playersB.innerHTML = "Players"
                playersB.addEventListener("click", () => {
                    this._leagueClient.getTournamentSubs(tournament.id);
                    // document.dispatchEvent(new CustomEvent("REQUEST_LEAGUE_SCHEDULE", {detail: {torunamentId: idTournament}}));
                });                
                actionsEl.appendChild(playersB);

                let leaderBoardB = document.createElement("button");
                leaderBoardB.classList.add("btn")
                leaderBoardB.classList.add("btn-primary")   
                leaderBoardB.classList.add("btn-sm")   
                leaderBoardB.classList.add("mr-1")   
                leaderBoardB.classList.add("mt-1")   
                leaderBoardB.innerHTML = "LeaderB"
                leaderBoardB.addEventListener("click", () => {
                    this._leagueClient.getTournamentLeaderboard(tournament.id);
                    // document.dispatchEvent(new CustomEvent("REQUEST_LEAGUE_SCHEDULE", {detail: {torunamentId: idTournament}}));
                });
                actionsEl.appendChild(leaderBoardB);

                tEl.appendChild(idTournament);
                tEl.appendChild(startTournamentEl);
                tEl.appendChild(endTournamentEl);
                tEl.appendChild(startSubscriptionEl);
                tEl.appendChild(endSubscriptionEl);
                tEl.appendChild(actionsEl);
                listTournamentTable.appendChild(tEl);
            });
        }
    }


    _listTournamentForSelectionReceiver(evt) {
        let tournamentList = evt.detail.data.data;
        let selectorJoin = document.getElementById("nameJoinTournament");
        let selectorLeave = document.getElementById("nameLeaveTournament");
        
        selectorJoin.innerHTML = "";
        selectorLeave.innerHTML = "";

        tournamentList.forEach( (tournament) => {
            let optionJoin = document.createElement("option");
            optionJoin.innerHTML = tournament.id;
            selectorJoin.appendChild(optionJoin);

            let optionLeave = document.createElement("option");
            optionLeave.innerHTML = tournament.id;
            selectorLeave.appendChild(optionLeave);
        });
    }
    
    _hashEventListener(page) {
        let homeUI = document.getElementById("homeUI");
        let console = document.getElementById("console");
        let joinTournament = document.getElementById("joinTournament");
        let leaveTournament = document.getElementById("leaveTournament");
        // let scheduleTournament = document.getElementById("scheduleTournament");
        let listTournament = document.getElementById("listTournament");
        let globalLeaderboard = document.getElementById("globalLeaderboard");
        // stats
        let yourStats = document.getElementById("yourStats");
        let searchPlayer = document.getElementById("searchPlayer");
        


        homeUI.style.display = "none";
        console.style.display = "none";
        joinTournament.style.display = "none";
        leaveTournament.style.display = "none";
        // scheduleTournament.style.display = "none";
        listTournament.style.display = "none";
        globalLeaderboard.style.display = "none";

        yourStats.style.display = "none";
        searchPlayer.style.display = "none";

        switch(page) {
            case "#home": 
                homeUI.style.display = "";
                break;
            case "#joinTournament":
                this._leagueClient.getTournamentList()
                joinTournament.style.display = "";
                break;
            case "#leaveTournament":
                this._leagueClient.getTournamentList()
                leaveTournament.style.display = "";
                break;
            // case "#scheduleTournament":
            //     scheduleTournament.style.display = "";
            //     break;
            case "#listTournament":
                listTournament.style.display = "";
                this._leagueClient.getTournamentList();
                break;
            case "#globalLeaderboard":
                globalLeaderboard.style.display = "";
                this._leagueClient.getGlobalRanking();
                break;
            case "#yourStatsLink":
                yourStats.style.display = "";
                document.dispatchEvent(new CustomEvent("PAGE_YOUR_STATISTICS"));                      

                break;
            case "#searchPlayerLink":
                searchPlayer.style.display = "";
                document.dispatchEvent(new CustomEvent("PAGE_SEARCH_PLAYER"));                      
                break;
            default:
                homeUI.style.display = "";
                break;
        }
    }

}