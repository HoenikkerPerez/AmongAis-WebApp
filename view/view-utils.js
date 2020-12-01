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