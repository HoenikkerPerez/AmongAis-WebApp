// "alert-popup"
// "alert-popup-msg"
popupMsg = function(msg, kind){
    document.getElementById("alert-popup-msg").textContent=msg;
    $('#alert-popup').modal('show');
    
};