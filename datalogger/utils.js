let _datalogSample = {
    username: "user",
    success: 1,
    emo_rec: "happy",
    op_type: "CREATE"
}

let logData = function (datalog, urlTargetPHP="datalogger/home.php") {
    console.debug("logData");

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