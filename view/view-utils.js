// "alert-popup"
// "alert-popup-msg"

popupMsg = function(msg, kind,timeout=3000){
    document.dispatchEvent(new CustomEvent("POPUP_MSG", {detail: {msg:msg, kind:kind,timeout:timeout}}));
}

_popupMsgM = function(msg, kind,timeout=3000){ // kind: success / info / warning / danger
    let d = new Date();
    let id = "popup-msg-" + d.getTime();
    $("#alert-popup").append("<div id=\""+id+"\" class=\"modal-dialog\"><div class=\"alert alert-warning\" style=\"white-space: pre;\"><strong>Warning!</strong> Indicates a warning that might need attention.</div></div>");
    console.debug("New popup Appended: " + id);
    console.debug("msg: " + msg);
    // alert_msg.className = 
    let content = document.getElementById(id);
    content = content.childNodes[0]
    content.textContent=msg;
    content.className = "alert alert-"+kind;
    
    $('#alert-popup').modal('show');
    model.popupAck();

    window.setTimeout(function(){ 
        console.debug(id + " Timeout Expired after " + timeout + "msec")
        $("#"+id).remove(); 
        let remain = model.popupEnd();
        if(remain<=0){
            $(".modal-backdrop").remove();
        }
    }.bind(this), timeout);
};

_popupMsg = function(msg, kind,timeout=3000){ // kind: success / info / warning / danger
    let d = new Date();
    let id = "popup-msg-" + d.getTime();

    let toast = "<div id=\""+id+"\" class=\"toast bg-dark text-white\" role=\"alert\" aria-live=\"assertive\" aria-atomic=\"true\""
    toast += "data-delay="+timeout+">";
    toast += "<div class=\"toast-header bg-dark text-white\">"
    toast += "<strong class=\"mr-auto bg-dark text-white\">" + "Message:" + "</strong>";
    toast += "<small class=\"text-muted\">just now</small>";
    toast += "<button type=\"button\" class=\"ml-2 mb-1 close\" data-dismiss=\"toast\" aria-label=\"Close\">"
    toast += "<span aria-hidden=\"true\">&times;</span></button></div>"
    toast += "<div class=\"alert alert-"+kind+"\"style=\"white-space: pre;\">" + msg + "</div></div>"
    $("#toastHook").append(toast);
    console.debug("New popup Appended: " + id);
    console.debug("msg: " + msg);
    // alert_msg.className = 
    // let content = document.getElementById(id);
    // content = content.childNodes[0]
    // content.textContent=msg;
    // content.className = "alert alert-"+kind;
    
    $("#"+id).toast("show"); 
    model.popupAck();

    // window.setTimeout(function(){ 
    //     console.debug(id + " Timeout Expired after " + timeout + "msec")
    //     $("#"+id).remove(); 
    //     let remain = model.popupEnd();
    //     if(remain<=0){
    //         $(".modal-backdrop").remove();
    //     }
    // }.bind(this), timeout);
};

let maxE = 256;

buildProgress = function(nrg){
    let p_nrg = (nrg/maxE)*100;
    let color;
    if(p_nrg>75){
        color="bg-success";
    } else if(p_nrg>50){
        color="bg-info";
    } else if(p_nrg>25){
        color="bg-warning";
    } else {
        color="bg-danger";
    } 

    let bar = "<div class=\"progress\"><div class=\"progress-bar progress-bar-striped progress-bar-animated "+color+"\" ";
    bar += "role=\"progressbar\" aria-valuenow=\"100\" aria-valuemin=\"0\" aria-valuemax=\"100\" "
    bar += "style=\"width: "+p_nrg+"%\">"+nrg+"</div></div>"
    return bar;
}