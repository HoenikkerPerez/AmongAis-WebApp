// "alert-popup"
// "alert-popup-msg"
popupMsg = function(msg, kind){ // kind: success / info / warning / danger
    let d = new Date();
    let id = "popup-msg-" + d.getTime();
    $("#alert-popup").append("<div id=\""+id+"\" class=\"modal-dialog\"><div class=\"alert alert-warning\" style=\"white-space: pre;\"><strong>Warning!</strong> Indicates a warning that might need attention.</div></div>");
    // alert_msg.className = 
    let content = document.getElementById(id);
    content = content.childNodes[0]
    content.textContent=msg;
    content.className = "alert alert-"+kind;
    
    $('#alert-popup').modal('show');
    window.setTimeout(function(){ $("#"+id).remove() }.bind(this), 10000);
};