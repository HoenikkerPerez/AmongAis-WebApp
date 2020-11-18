// "alert-popup"
// "alert-popup-msg"
popupMsg = function(msg, kind){ // kind: success / info / warning / danger
    let content = document.getElementById("alert-popup-msg");
    content.textContent=msg;
    content.className = "alert alert-"+kind;

    $('#alert-popup').modal('show');
    
};