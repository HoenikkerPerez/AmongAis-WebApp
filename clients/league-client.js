class LeagueClient {

    API_GW = "http://api.dbarasti.com";

    // get tournaments leaderboard
    // RESPONSE:
    // [
    //   {
    //     "player_name": "xxx_terminator_xxx",
    //     "player_rank": 1,
    //     "player_score": 999
    //   }
    // ]
    getTournamentLeaderboard(tournamentId) {
      let data = {"tournament_id": tournamentId};

      $.ajax({
        url: this.API_GW + '/leaderboard',
        error: function() {
          console.debug("Error retrieving Tournament Leaderboard");
        },
        data: data,
        dataType: 'json',
        type: "application/json",
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        success: function(data) {
            console.debug(data)
            //TODO process data
        },
        type: 'GET',
        timeout: 10000 
      });
    }

    // Get a view on the global leaderboard
    getGlobalRanking() {
      $.ajax({
        url: this.API_GW + '/ranking',
        error: function() {
          console.debug("Error retrieving Tournament Leaderboard");
        },
        dataType: 'json',
        type: "application/json",
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        success: function(data) {
            console.debug(data)
            //TODO process data
        },
        type: 'GET',
        timeout: 10000 
      });
    }

    // Withdraw from a specific tournament
    leaveTournament(tournamentId, playerId) {
      let data = {
        "tournamentID": tournamentId,
        "playerID": playerId
      };

      $.ajax({
        url: this.API_GW + '/registration',
        error: function(error) {
          console.debug("Error leaving tournament");
          let parsedError = JSON.parse(error.responseText);
          popupMsg(parsedError.message, "danger")
        },
        data: JSON.stringify(data),
        dataType: 'json',
        type: "application/json",
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        success: function(data) {
            console.debug(data)
            //TODO process data
        },
        type: 'DELETE',
        timeout: 10000 
      });
    }

    // Get the list of subscriptions of a tournament
    getTournamentSubs(tournamentId) {
      let data = {
        "tournament_id": tournamentId,
      };

      $.ajax({
        url: this.API_GW + '/registration',
        error: function(error) {
          console.debug("Error leaving tournament");
          console.debug(error);
        },
        data: data,
        dataType: 'json',
        type: "application/json",
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        success: function(data) {
            console.debug(data)
            //TODO process data
        },
        type: 'DELETE',
        timeout: 10000 
      });

    }


    // Join a tournament specifying the tournament ID
    // RESPONSE
    // {
    //     "end_matches_date": "2020-12-07T18:05:34.761Z",
    //     "end_subscriptions_date": "2020-12-07T18:05:34.761Z",
    //     "name": "string",
    //     "start_matches_date": "2020-12-07T18:05:34.761Z",
    //     "start_subscriptions_date": "2020-12-07T18:05:34.761Z",
    //     "type": "knok-out"
    //   }
    joinTournament(playerId, tournamentId) {
      let data = {
        'player_id': playerId,
        'tournament_id': tournamentId
      }
      console.debug(playerId, tournamentId);

      $.ajax({
          url: this.API_GW + '/registration',
          error: function(error) {
            console.debug("Error retrieving Tournament schedule");
            let parsedError = JSON.parse(error.responseText);
            popupMsg(parsedError.message, "danger")
          },
          data: JSON.stringify(data),
          dataType: 'application/json',
          type: "application/json",
          crossDomain: true,
          contentType: 'application/json',
          success: function(data) {
              console.debug(data)
          },
          type: 'POST',
          timeout: 10000 
        });

    }

    
    // Get the full schedule of a specific tournament
    getTournamentSchedule(tournamentId) {
      let data = {
        "tournament_id": tournamentId
      }

      $.ajax({
          url: this.API_GW + '/registration',
          error: function() {
            console.debug("Error retrieving Tournament schedule");
          },
          data: data,
          dataType: 'json',
          type: "application/json",
          crossDomain: true,
          contentType: 'application/json; charset=utf-8',
          success: function(data) {
            console.debug("getTournamentSchedule received: " + data)
            document.dispatchEvent(new CustomEvent("LEAGUE_SCHEDULE", {detail: {data:data}}));

          },
          type: 'GET',
          timeout: 10000 
        });
    }

    // GET
    // ​/tournament
    // get tournaments list
    getTournamentList() {
        $.ajax({
            url: this.API_GW + '/tournament',
            // url: "http://api.dbarasti.com:8081/tournaments",
            error: function() {
              console.debug("Error retrieving Tournament list");
            },
            dataType: 'json',
            type: "application/json",
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            success: function(data) {            
              console.debug("getTournamentList received: " + data)
              document.dispatchEvent(new CustomEvent("LEAGUE_LIST", {detail: {data:data}}));
            },
            type: 'GET',
            timeout: 10000 
          });
    }

    // Create a new tournament
    // responsibility of League Manager
  }
    