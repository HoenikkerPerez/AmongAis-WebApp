let _datalogSample = {
    username: "login-name",
    // !!! 0 fail, 1 success
    success: 1, // l'operazione è andata a buion fune
    emo_rec: "happy",
    op_type: "CREATE" // Create, JOIN, SPECTATE,...
}

// matchname

let logData = function (datalog, urlTargetPHP="datalogger/home.php") {
    console.debug("logData");
    if( typeof(datalog)!="object" ||
        typeof(datalog.username)!="string" ||
        typeof(datalog.success)!="number"
        ){
            console.error("WRONG DATALOG!");
            return;
    }
    $.ajax({
        url: urlTargetPHP,
        error: function(xhr, status, error) {
            console.debug("ERROR received: " + xhr.responseText);
        },
        data: datalog,
        success: function(data) {
            console.debug("log data sent");
            console.debug("OK received: " + data);

        },
        type: 'POST',
        timeout: 10000 
        });
}

let logDataHome = function (datalog) {
    logData(datalog,'http://amongais.altervista.org/datalogger/home.php');
}

let logDataMatch = function (datalog) {
    logData(datalog,'http://amongais.altervista.org/datalogger/match.php');
}

class DatalogHome {
    username = "";
    success = 0;
    op_type = "";
    constructor(loginName,optype,isSuccess){
        this.username=loginName;
        // this.username=model.username;
        this.op_type=optype;
        this.success=isSuccess;
    }
    // emo_rec=null;
    // extra=null;
}

class DatalogMatch {
    username = "";
    matchname="";
    op_type="";
    success = 0;
    constructor(loginName,matchName,optype,isSuccess){
        this.username=loginName;
        this.matchname=matchName;
        // this.username=model.username;
        // this.matchname=model.status.ga;
        this.op_type=optype;
        this.success=isSuccess;
    }
    // mouse_cmds = null;
    // keyboard_cmds = undefined;
    // evaluation_survey = null;
    // why_survey = null;
    // emo_rec = null;
    // extra = null;
}