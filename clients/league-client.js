class leagueClient {

    API_GW = "http://api.dbarasti.com";

    // ​registration
    // withdraw from a tournament
    leaveTournament() {}

    // GET
    // ​registration
    // Get the list of subscriptions of a tournament
    getTournamentSubs() {}


    // join a tournament
    joinTournament(playerId, tournamentId) {
        // {
        //     "end_matches_date": "2020-12-07T18:05:34.761Z",
        //     "end_subscriptions_date": "2020-12-07T18:05:34.761Z",
        //     "name": "string",
        //     "start_matches_date": "2020-12-07T18:05:34.761Z",
        //     "start_subscriptions_date": "2020-12-07T18:05:34.761Z",
        //     "type": "knok-out"
        //   }
        // POST
        let postData = {
            "player_id": playerId,
            "tournament_id": tournamentId
          }
        // ​/registration
        $.ajax({
            url: this.API_GW + '/registration?tournament_id='+tournamentName,
            // url: "http://api.dbarasti.com:8081/tournaments",
            error: function() {
              console.debug("Error retrieving Tournament schedule");
            },
            data: postData,
            dataType: 'json',
            type: "application/json",
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            success: function(data) {
                console.debug(data)
            },
            type: 'POST',
            timeout: 10000 
          });

    }

    // GET
    // ​/schedule
    // get the full schedule of a specific tournament
    getTournamentSchedule(tournamentName) {
        // api.dbarasti.com/registration?tournament_id=SmartCUP2
        $.ajax({
            url: this.API_GW + '/registration?tournament_id='+tournamentName,
            // url: "http://api.dbarasti.com:8081/tournaments",
            error: function() {
              console.debug("Error retrieving Tournament schedule");
            },
            dataType: 'json',
            type: "application/json",
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            success: function(data) {
                console.debug(data)
            },
            type: 'GET',
            timeout: 10000 
          });
    }


    // POST
    // ​/schedule
    // create a tournament schedule
    createTournamentSchedule() {}

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
                console.debug(data)
              console.debug("Retrieve n. " + data.length + " Tournaments");
            },
            type: 'GET',
            timeout: 10000 
          });
    }

    // POST
    // ​/tournament
    // create a tournament
    createTournament() {}
}
    