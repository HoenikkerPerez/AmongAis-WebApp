class DsClient {

    API_GW = "http://sa20dssystem.pythonanywhere.com";


    getGlobalStatistics(username) {
      // let data = {"player_real_name": username};

      $.ajax({
        url: this.API_GW + '/global_statistics/' + username,
        error: function(request, status, error) {
          console.debug("Error retrieving Global Statistics");
          if(request.status == "404") {
            let respJson = JSON.parse(request.responseText);
            console.log(respJson.message);
            popupMsg("Player not found", "warning");
          } else {
            console.log(respJson.message);
          }
         },
        // data: data,
        dataType: 'json',
        type: "application/json",
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        success: function(data) {
            console.debug(data)
            document.dispatchEvent(new CustomEvent("DS_GLOBALSTATISTICS", {detail: {itsMe: false, data:data}}));                      
        },
        type: 'GET',
        timeout: 10000 
      });
    };

    getHistory(username) {
        let data = {"player_real_name": username};
  
        $.ajax({
          url: this.API_GW + '/history/' + username,
          error: function(request, status, error) {
            console.debug("Error retrieving Global Statistics");
            if(request.status == "404") {
              let respJson = JSON.parse(request.responseText);
              console.log(respJson.message);
              popupMsg("Player not found", "warning");
            } else {
              console.log(respJson.message);
            }
          },
          // data: data,
          dataType: 'json',
          type: "application/json",
          crossDomain: true,
          contentType: 'application/json; charset=utf-8',
          success: function(data) {
              console.debug(data)
              document.dispatchEvent(new CustomEvent("DS_HISTORY", {detail: {itsMe: false, data:data}}));                      
          },
          type: 'GET',
          timeout: 10000 
        });
      }

    getMyHistory() {
        if(model.username) {
            let username = model.username;
            // let data = {"player_real_name": username};
    
            $.ajax({
            url: this.API_GW + '/history/' + username,
            error: function(request, status, error) {
              if(request.status == "404") {
                let respJson = JSON.parse(request.responseText);
                console.log(respJson.message);
                popupMsg("You don't have any stats yet.\nPlay and build your reputation!", "warning");
              } else {
                console.log(respJson.message);
              }
            },
            // data: data,
            dataType: 'json',
            type: "application/json",
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            success: function(data) {
                console.debug(data)
                document.dispatchEvent(new CustomEvent("DS_HISTORY", {detail: {itsMe: true, data:data}}));                      
            },
            type: 'GET',
            timeout: 10000 
            });
        }
    }

    getMyGlobalStatistics() {
        if(model.username) {
            let user = model.username;
            // let data = {"player_real_name": username};
    
            $.ajax({
            url: this.API_GW + '/global_statistics/' + user,
            error: function(request, status, error) {
                if(request.status == "404") {
                  console.debug("Error retrieving Global Statistics");
                  console.debug(request.responseText);
                  popupMsg("You don't have any stats yet.\nPlay and build your reputation!", "warning");
                } else {
                  console.log(request.message);
                }
            },
            // data: data,
            dataType: 'json',
            type: "application/json",
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            success: function(data) {
                console.debug(data)
                document.dispatchEvent(new CustomEvent("DS_GLOBALSTATISTICS", {detail: {itsMe: true, data:data}}));                      
            },
            type: 'GET',
            timeout: 10000 
            });
        };
    }

  }
    