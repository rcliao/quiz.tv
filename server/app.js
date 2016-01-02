//Add express for simplified http server
var express = require('express');
//Let socket.io handle WebSockets
var sio = require('socket.io');
//Initiate http server
var app = express();

//Include static HTML in the 'public' directory
app.use(express.static('public'));

//Start the http server on port 4005
var server = app.listen(4005);
server.listen(4005, function() {
    console.log('Server listening at http://localhost:4005/');
});

// Attach the socket.io server to the http server
var io = sio.listen(server);

// Define a message handler
io.on('connection', function(socket) {
    //If any clients move the image through touch or keypress, broadcast the
    //updated position
    socket.on('headMove', function(data) {
        socket.broadcast.emit('headPosition', {
            "update": data
        });
    });
});
