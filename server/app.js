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
    sendingQuestion = true;
    var private_key = '99773d5cfc6320e6df793d7368f77a67feb4226dd4c88a02';
    var b64 = new Buffer(private_key).toString('base64');
    request.post('https://push.ionic.io/api/v1/push')
    request({
        url: 'https://push.ionic.io/api/v1/push',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Ionic-Application-Id': '56249421',
            'Authorization': 'Basic ' + b64
        },
        body: JSON.stringify({
            "tokens":[
                "e-6itBCwpFA:APA91bG088s-IVEm_x6nefMKa4y07bW_sJv8_W7pOvrUOmQthdGlEuWN1T7wHA9SvFujrqRDOsBh5pghWCIPv5_LLkzEp-kwCmTQa7OzJAXDt3UDqgwAgrnQLLEeivsOFhmn1r_iXJzw"
            ],
            "notification":{
                "alert": "You got a quiz coming! Please finish quiz before you can watch TV.",
                "android":{
                    "collapseKey":"foo",
                    "delayWhileIdle":true,
                    "timeToLive":300
                }
            }
        })
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
        }
    });
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
        index: 1,
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
        index: 2,
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
        index: 3,
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
var sendingQuestion = false;

// Attach the socket.io server to the http server
var io = sio.listen(server);

// Define a message handler
io.on('connection', function(socket) {
    if (sendingQuestion) {
        socket.emit('post-question', questions[questionIndex]);
    }

    socket.on('answer', function(data) {
        var correct = data.answer === data.choice;
        io.emit('answer-result', correct);

        setTimeout(function() {
            if (correct) {
                questionIndex ++;
                if (questions[questionIndex]) {
                    io.emit('post-question', questions[questionIndex]);
                } else {
                    sendingQuestion = false;
                    io.emit('finish-quiz');
                    questionIndex = 0;
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
                    }, 7000);
                }
            } else {
                io.emit('post-question', questions[questionIndex]);
            }
        }, 1000);
    });

    socket.on('add-question', function(data) {
        console.log('adding question');
    });

    socket.on('change-channel', function(channel) {
        request(setTopBoxIP + ':8080/itv/stopITV', function(err1, res1, body1) {
            if (!err1 && res1.statusCode == 200) {
                request(setTopBoxIP + ':8080/tv/tune?major=' + channel);
            }
        });
    })
});
