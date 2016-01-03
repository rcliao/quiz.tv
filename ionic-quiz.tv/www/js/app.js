var SERVER_URL = 'http://7b046cb3.ngrok.io';
var projectAPIKey = 'DAK7b4967e33538456e80d13b87f3dd2919';
var username = 'test';
var password = 'atthackathon2016';
var kandyDomain = 'quiztv.gmail.com';

var socket = io.connect(SERVER_URL);

angular.module('quiz.tv.app', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    var push = new Ionic.Push({
      "debug": false
    });

    push.register(function(token) {
      // kick off the platform web client
      Ionic.io();

      // this will give you a fresh user or the previously saved 'current user'
      var user = Ionic.User.current();

      // if the user doesn't have an id, you'll need to give it one.
      if (!user.id) {
          user.id = Ionic.User.anonymousId();
          // user.id = 'your-custom-user-id';
      }

      console.log(Ionic.User);
      console.log(user);

      user.set('token', token.token);
      user.addPushToken(token.token);

      //persist the user
      user.save();
    });
  });
})

.controller('QuestionCtrl', function($scope, $http, $timeout, $ionicPopup) {
    var vm = this;
    vm.answerResult = false;
    vm.done = true;
    vm.kandyReady = false;
    vm.dataRewards = 0;

    $timeout(function() {
        kandy.setup({
            // Containers for streaming elements.
            remoteVideoContainer: document.getElementById('remote_call'),
            localVideoContainer: document.getElementById('local_call'),
            // Register listeners to call events.
            listeners: {
                callinitiated: onCallInitiated,
                callincoming: onCallIncoming,
                callestablished: onCallEstablished,
                callended: onCallEnded
            }
        });
        $scope.data = {};
        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="data.username">',
            title: 'Simple user authentication',
            subTitle: 'Sign in with username',
            scope: $scope,
            buttons: [
                { text: 'Cancel' },
                {
                    text: '<b>Sign In</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        console.log($scope.data.username);
                        if (!$scope.data.username) {
                            //don't allow the user to close unless he enters wifi password
                            e.preventDefault();
                        } else {
                            return $scope.data.username;
                        }
                    }
                }
            ]
        });

        myPopup.then(function(res) {
            kandy.login(projectAPIKey, res, password, function() {
                console.log('successfully logged into Kandy');
                vm.kandyReady = true;
            }, function() {
                console.log('failure while logging into kandy');
            });
        });
    });

    function onCallInitiated(call, callee) {
        console.log('Call initialized');
        vm.callId = call.getId();
    }

    function onCallIncoming(call) {
        alert('Incoming call from ' + call.callNumber);
        vm.calling = true;
        vm.callId = call.getId();
        vm.callIncoming = true;
        $scope.$digest();
    }

    function onCallEstablished(call) {
        vm.callIncoming = false;
        vm.outCalling = true;
        console.log('Call established');
        $scope.$digest();
    }

    function onCallEnded (call) {
        alert('Call ended');
    }

    vm.users = [
        {
            name: 'Teacher Liao',
            role: 'teacher',
            username: 'test',
            password: 'atthackathon2016'
        },
        {
            name: 'Jane Doe',
            role: 'student',
            username: 'test2',
            password: 'atthackathon2016'
        }
    ];

    socket.on('post-question', function(question) {
        vm.done = false;
        vm.answerResult = false;
        vm.currentQuestion = question;
        $scope.$digest();
    });

    socket.on('answer-result', function(correct) {
        vm.answerResult = true;
        vm.correct = correct;
        $scope.$digest();
    });

    socket.on('finish-quiz', function() {
        vm.done = true;
        vm.answerResult = false;
        vm.currentQuestion = null;
        // seek for content
        vm.suggestions = [];
        vm.dataRewards += 20;
        $http.get('https://concept-insights-nodejs-quiztvinsight-2011.mybluemix.net/api/conceptualSearch?ids%5B%5D=%2Fgraphs%2Fwikipedia%2Fen-20120601%2Fconcepts%2FGeorge_W._Bush&limit=3&document_fields=%7B%22user_fields%22%3A1%7D')
            .then(function(response) {
                response.data.results.forEach(function(result) {
                    vm.suggestions.push({
                        topic: 'George W Bush',
                        description: result.user_fields.description,
                        url: result.user_fields.url,
                        thumbnail: result.user_fields.thumbnail,
                        title: result.user_fields.title
                    });
                });
            });
        $http.get('https://concept-insights-nodejs-quiztvinsight-2011.mybluemix.net/api/conceptualSearch?ids%5B%5D=%2Fgraphs%2Fwikipedia%2Fen-20120601%2Fconcepts%2FVenus&limit=3&document_fields=%7B%22user_fields%22%3A1%7D')
            .then(function(response) {
                response.data.results.forEach(function(result) {
                    vm.suggestions.push({
                        topic: 'Venus',
                        description: result.user_fields.description,
                        url: result.user_fields.url,
                        thumbnail: result.user_fields.thumbnail,
                        title: result.user_fields.title
                    });
                });
            });
        $http.get('https://concept-insights-nodejs-quiztvinsight-2011.mybluemix.net/api/conceptualSearch?ids%5B%5D=%2Fgraphs%2Fwikipedia%2Fen-20120601%2Fconcepts%2FMercury_(planet)&limit=3&document_fields=%7B%22user_fields%22%3A1%7D')
            .then(function(response) {
                response.data.results.forEach(function(result) {
                    vm.suggestions.push({
                        topic: 'Mercury',
                        description: result.user_fields.description,
                        url: result.user_fields.url,
                        thumbnail: result.user_fields.thumbnail,
                        title: result.user_fields.title
                    });
                });
            });
        $scope.$digest();
    });

    socket.on('choice-change', function(choice) {
        vm.currentQuestion.choice = choice;
        $scope.$digest();
    });

    vm.selectAnswer = function(index) {
        vm.currentQuestion.choice = index;
        socket.emit('choice-change', index);
    };

    vm.submitAnswer = function() {
        socket.emit('answer', vm.currentQuestion);
    };

    vm.openLink = function(link) {
        vm.dataRewards += 10;
        window.open(link, '_system', 'location=yes');
    };

    vm.callForHelp = function() {
        vm.calling = true;
    };

    vm.callUser = function(user) {
        if (vm.kandyReady) {
            // Tell Kandy to make a call to callee.
            kandy.call.makeCall(user.username + '@' + kandyDomain, true);
        }
    };

    vm.pickUpCall = function() {
        kandy.call.answerCall(vm.callId, true);
    };

    vm.endCall = function() {
        kandy.call.endCall(vm.callId);
        vm.calling = false;
    };

    vm.backToQuestions = function() {
        vm.calling = false;
    };
});
