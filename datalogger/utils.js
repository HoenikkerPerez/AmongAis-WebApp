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
    constructor(loginName,optype,isSuccess, optionals){
        this.username=loginName;
        // this.username=model.username;
        this.op_type=optype;
        this.success=isSuccess;
        if(optionals != undefined) {
            if(optionals.extra != undefined)
                this.extra = optionals.extra;
            if(optionals.emo_rec != undefined)
                this.emo_rec = optionals.emo_rec;
        }
    };
    
    send = function () {
        logData(JSON.stringify(this),'datalogger/home.php');
    }
    // emo_rec=null;
}

class DatalogMatch {
    username = "";
    matchname="";
    op_type="";
    success = 0;
    constructor(    loginName,
                    matchName,
                    optype,
                    isSuccess, 
                    optionals
                    ) {
                        // mouse_cmds, 
                        // keyboard_cmds, 
                        // evaluation_survey, 
                        // why_survey, 
                        // emo_rec
        this.username=loginName;
        this.matchname=matchName;
        // this.username=model.username;
        // this.matchname=model.status.ga;
        this.op_type=optype;
        this.success=isSuccess;
        if(optionals != undefined) {
            if(optionals.mouse_cmds != undefined)
                this.mouse_cmds = optionals.mouse_cmds;
            if(optionals.keyboard_cmds != undefined)
                this.keyboard_cmds = optionals.keyboard_cmds;
            if(optionals.evaluation_survey != undefined)
                this.evaluation_survey = optionals.evaluation_survey;
            if(optionals.why_survey != undefined)
                this.why_survey = optionals.why_survey;
            if(optionals.emo_rec != undefined)
                this.emo_rec = optionals.emo_rec;
            if(optionals.extra != undefined)
                this.extra = optionals.extra;
        }
    };

    send = function() {
        logData(JSON.stringify(this),'datalogger/match.php');
    }

}