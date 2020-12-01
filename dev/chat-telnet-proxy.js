#!/usr/bin/env node
var WebSocketServer = require('/home/meek/.npm-global/lib/node_modules/websocket').server;
var http = require('http');
let port = 8766;

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(port, function() {
    console.log((new Date()) + ' Server is listening on port ' + port);
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    //var connection = request.accept('echo-protocol', request.origin); // Gues echo-protocol not needed
    var connection = request.accept(request.origin); // ASSUMING ACCEPT IS BLOCKING I'M NOT SURE ABOUT THIS ABSOLUTELY!!!!!!!!
    console.log((new Date()) + ' Connection accepted.');
    
    // Connect to telnet chat server after having connected to web socket
    host = "margot.di.unipi.it";
    port = 8422;
    
    const net = require('net')
    const socket = net.connect(port, host, () => {
        console.log("Sending data");
        /*socket.write('NAME test-web-003\r\n');
        socket.write('JOIN my-test-web-000\r\n');
        socket.write('POST my-test-web-000 test!!!\r\n');*/

        socket.on("data", function (data) {
            console.log("Received message from Telnet Chat Server: " + data.toString() );
            // SEND TO WEBSOCKET
    //        socket.end();
        })
    })

    // Incoming WebSocket message
    connection.on('message', function(message) {
        // socket.write(message..............)
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});