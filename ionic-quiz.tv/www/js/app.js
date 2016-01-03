var SERVER_URL = 'http://7b046cb3.ngrok.io';

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

.controller('QuestionCtrl', function($scope) {
    var vm = this;
    vm.answerResult = false;
    vm.done = true;

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
        $scope.$digest();
    });

    vm.selectAnswer = function(index) {
        vm.currentQuestion.choice = index;
        socket.emit('answer', vm.currentQuestion);
    };
});
