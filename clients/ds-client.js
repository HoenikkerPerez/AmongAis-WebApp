class DsClient {

    API_GW = "http://sa20dssystem.pythonanywhere.com";


    getGlobalStatistics(username) {
      let data = {"player_real_name": username};

      $.ajax({
        url: this.API_GW + '/global_statistics',
        error: function() {
          console.debug("Error retrieving Global Statistics");
        },
        data: data,
        dataType: 'json',
        type: "application/json",
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        success: function(data) {
            console.debug(data)
            document.dispatchEvent(new CustomEvent("DS_GLOBALSTATISTICS", {detail: {data:data}}));                      
        },
        type: 'GET',
        timeout: 10000 
      });
    };

    getHistory(username) {
        let data = {"player_real_name": username};
  
        $.ajax({
          url: this.API_GW + '/history',
          error: function() {
            console.debug("Error retrieving Global Statistics");
          },
          data: data,
          dataType: 'json',
          type: "application/json",
          crossDomain: true,
          contentType: 'application/json; charset=utf-8',
          success: function(data) {
              console.debug(data)
              document.dispatchEvent(new CustomEvent("DS_HISTORY", {detail: {data:data}}));                      
          },
          type: 'GET',
          timeout: 10000 
        });
      }

    getMyHistory() {
        if(model.username) {
            username = model.username;
            let data = {"player_real_name": username};
    
            $.ajax({
            url: this.API_GW + '/history',
            error: function() {
                console.debug("Error retrieving Global Statistics");
            },
            data: data,
            dataType: 'json',
            type: "application/json",
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            success: function(data) {
                console.debug(data)
                document.dispatchEvent(new CustomEvent("DS_MYHISTORY", {detail: {data:data}}));                      
            },
            type: 'GET',
            timeout: 10000 
            });
        }
    }

    getMyGlobalStatistics(username) {
        if(model.username) {
            username = model.username;
            let data = {"player_real_name": username};
    
            $.ajax({
            url: this.API_GW + '/global_statistics',
            error: function() {
                console.debug("Error retrieving Global Statistics");
            },
            data: data,
            dataType: 'json',
            type: "application/json",
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            success: function(data) {
                console.debug(data)
                document.dispatchEvent(new CustomEvent("DS_MYGLOBALSTATISTICS", {detail: {data:data}}));                      
            },
            type: 'GET',
            timeout: 10000 
            });
        };
    }

  }
    