//Add express for simplified http server
var express = require('express');
//Let socket.io handle WebSockets
var sio = require('socket.io');

var request = require('request');

//Initiate http server
var app = express();

var setTopBoxIP = 'http://10.10.60.135';

//Include static HTML in the 'public' directory
app.use(express.static('public'));

//Start the http server on port 4005
var server = app.listen(4005);
server.listen(4005, function() {
    console.log('Server listening at http://localhost:4005/');
});

app.get('/api/testQuestion', function(req, res) {
    request(setTopBoxIP + ':8080/remote/processKey?key=pause', function(err1, res1, body1) {
        if (!err1 && res1.statusCode == 200) {
            request(setTopBoxIP + ':8080/remote/processKey?key=exit', function(err2, res2, body2) {
                if (!err2 && res2.statusCode == 200) {
                    request(setTopBoxIP + ':8080/itv/startURL?url=http://10.10.60.94:4005/', function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            setTimeout(function() {
                                io.emit('post-question', questions[questionIndex]);
                                res.status(200).send('Okay');
                            }, 1000);
                        }
                    });
                }
            });
        }
    })
});

var questions = [
    {
        description: 'What is the president of United States at 2004?',
        answers: [
            {
                description: 'Barack Obama'
            },
            {
                description: 'George W. Bush'
            },
            {
                description: 'Bill Clinton'
            },
            {
                description: 'George H. W. Bush'
            },
            {
                description: 'Not an answer'
            }
        ],
        answer: 1,
        choice: 0
    },
    {
        description: 'The brighest planet is',
        answers: [
            {
                description: 'Mars'
            },
            {
                description: 'Mercury'
            },
            {
                description: 'Neptune'
            },
            {
                description: 'Venus'
            }
        ],
        answer: 3,
        choice: 0
    },
    {
        description: 'The planet nearest to the Sun is',
        answers: [
            {
                description: 'Venus'
            },
            {
                description: 'Mercury'
            },
            {
                description: 'Jupiter'
            },
            {
                description: 'Saturn'
            }
        ],
        answer: 1,
        choice: 0
    }
];
var questionIndex = 0;

// Attach the socket.io server to the http server
var io = sio.listen(server);

// Define a message handler
io.on('connection', function(socket) {
    socket.on('answer', function(data) {

    });

    socket.on('add-question', function(data) {

    });

    socket.on('post-question', function(data) {

    });

    socket.on('next-question', function(data) {
        questionIndex ++;
        if (questions[questionIndex]) {
            io.emit('post-question', questions[questionIndex]);
        } else {
            io.emit('finish-quiz');
            setTimeout(function() {
                request(setTopBoxIP + ':8080/itv/stopITV', function(err1, res1, body1) {
                    if (!err1 && res1.statusCode == 200) {
                        request(setTopBoxIP + ':8080/remote/processKey?key=play', function(err2, res2, body2) {
                            if (!err2 && res2.statusCode == 200) {
                                console.log('should be playing');
                                request(setTopBoxIP + ':8080/remote/processKey?key=exit');
                            }
                        });
                    }
                });
            }, 1000);
        }
    });

    socket.on('same-question', function(data) {
        io.emit('post-question', questions[questionIndex]);
    });
});
