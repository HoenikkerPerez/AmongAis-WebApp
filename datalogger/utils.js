let commandsRatio = {
    keys:0,
    clicks:0
}

let logData = function (datalog, urlTargetPHP="datalogger/home.php") {
    // console.debug("logData");
    datalog = JSON.parse(datalog)
    // if( typeof(datalog)!="object" ||
    //     typeof(datalog.username)!="string" ||
    //     typeof(datalog.success)!="number"
    //     ){
    //         console.error("WRONG DATALOG!");
    //         return;
    // }
    $.ajax({
        url: urlTargetPHP,
        error: function(xhr, status, error) {
            console.debug("ERROR received: " + xhr.responseText);
        },
        data: datalog,
        success: function(data) {
            console.debug("OK received: " + data);

        },
        type: 'POST',
        timeout: 10000 
        });
}

// let logDataHome = function (datalog) {
//     logData(datalog,'datalogger/home.php');
// }

// let logDataMatch = function (datalog) {
//     logData(datalog,'datalogger/match.php');
// }

class DatalogHome {
    username = "";
    success = 0;
    op_type = "";
    constructor(optype, isSuccess, optionals){

        this.username=model.username;
        this.logSessionID = logSessionID;

        this.op_type=optype;
        this.success=isSuccess;
        
        if(optionals != undefined) {
            if(optionals.extra != undefined)
                this.extra = optionals.extra;
            if(optionals.emo_rec != undefined)
                this.emo_rec = optionals.emo_rec;
        }
        this.send();
    };
    
    send = function () {
        logData(JSON.stringify(this),'datalogger/home.php');
    }
}

class DatalogMatch {
    username = "";
    matchname="";
    op_type="";
    success = 0;
    constructor(optype, isSuccess, optionals) {

        this.username=model.username;
        this.matchname=model.status.ga;
        this.logSessionID = logSessionID;

        this.op_type=optype;
        this.success=isSuccess;

        if(optionals != undefined) {
            
            // if(optionals.mouse_cmds != undefined){
            //     this.mouse_cmds = optionals.mouse_cmds;
            // }
            if(commandsRatio.clicks >0){
                this.mouse_cmds = commandsRatio.clicks;
                commandsRatio.clicks=0;
            }

            // if(optionals.keyboard_cmds != undefined){
            //     this.keyboard_cmds = optionals.keyboard_cmds;
            // }
            if(commandsRatio.keys > 0){
                this.keyboard_cmds = commandsRatio.keys;
                commandsRatio.keys = 0;
            }
            
            if(optionals.evaluation_survey != undefined)
                this.evaluation_survey = optionals.evaluation_survey;
            if(optionals.why_survey != undefined)
                this.why_survey = optionals.why_survey;
            if(optionals.emo_rec != undefined)
                this.emo_rec = optionals.emo_rec;
            if(optionals.extra != undefined)
                this.extra = optionals.extra;
        }
        this.send();
    };

    send = function() {
        logData(JSON.stringify(this),'datalogger/match.php');
    }

}

class DatalogSettings {
    username = "";
    success = 0;
    op_type = "";
    constructor(){
        this.username=model.username;

        this.volume=Math.floor(model.musicVolume*10);
        this.grid=(model.world.showGrid)?1:0;
        this.minimap=(model.world.showMinimap)?1:0;
        this.lowers=(model.world.lowResolutionMap)?1:0;
        this.send();
    };
    
    send = function () {
        logData(JSON.stringify(this),'datalogger/match-settings.php');
    }
}

class DatalogMapSettings {
    constructor(){
        this.username=model.username;

        let mapSize = Array.from(document.getElementsByName("mapSizeRadio")).find(r => r.checked).value;
        let mapType = Array.from(document.getElementsByName("mapTypeRadio")).find(r => r.checked).value;
        let balancedTeam = Array.from(document.getElementsByName("teamBalancedRadio")).find(r => r.checked).value == "B"; 
        let battleOfSpecies = document.getElementById("battleOfSpeciesCheckbox").checked;

        this.size=(mapSize=="1")? "small": (mapSize=="2")? "medium" : "large";
        this.balanced=(balancedTeam=="B")? 1 : 0;
        this.square=(mapType=="Q")? 1 : 0;
        this.bos=(battleOfSpecies)? 1 : 0;

        this.send();
    };
    
    send = function () {
        logData(JSON.stringify(this),'datalogger/map-settings.php');
    }
}