
function startButtonHandler (form) {
    var gameName = document.forms[0].nameGame.value;
    alert ("START: " + gameName);
    // window.location.href = "./view/ui.html";
    var context = document.getElementById('canvas').getContext('2d');
    gameWS.send("NEW " + gameName + "\n");
    Game.start(context);
}


function joinButtonHandler (form) {
    var val = document.forms[0].nameGame.value;
    alert ("JOIN: " + val);
    window.location.href = "./view/ui.html";
}

window.onload = function () {
    document.getElementById("startButton").addEventListener("click", startButtonHandler);
    document.getElementById("joinButton").addEventListener("click", joinButtonHandler);
    gameWS.openSocket();
};
