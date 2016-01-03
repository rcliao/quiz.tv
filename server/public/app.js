//Initiate the WebSocket connection through socket.io
var socket = io.connect();
//Assume we're not a stb
var stb = false;

//If we are a stb, set the resolution
if (!!navigator.setResolution) {
    navigator.setResolution(1920, 1080);
    stb = true;
}

//Disable websecutiry to bypass CORS issues if any.
if (!!navigator.setWebSecurityEnabled){
    navigator.setWebSecurityEnabled(false);
}

// boostrap up the name space for quiz.tv
window.quizTvApp = {};

// called when the TV loads
function init () {
    // cache dom elements
    window.questionDescription = document.getElementById('question_description');
    window.answers = document.getElementById('answers');
    window.overlay = document.getElementById('overlay');
    window.countDownDom = document.getElementById('countdown');
    window.questionDom = document.getElementById('question');
    window.feedbackDom = document.getElementById('feedback');
    window.feedbackDescription = document.getElementById('feedback_description');

    window.answerDom = document.createElement('div');
    answerDom.classList.add('answer');

    hideOverlay();

    socket.on('post-question', function(data) {
        startCountdown(15);

        window.currentQuestion = data;

        showOverlay();
        showQuestion();
        updateQuestion(currentQuestion);
    });

    socket.on('finish-quiz', function() {
        hideOverlay();
        navigator.exit();
    });
}

function keyHandler(e){
    var code = e.keyCode;

    //Don't for get to put a BREAK after every case OR it will
    //Fall through like it does below.
    switch(code){
        case 13: // Select / Enter
            hideQuestion();
            updateFeedback(checkQuestionChoice(window.currentQuestion) ? 'Woohoo, you got it right!' : 'Wrong. Try again.');

            removeCountdown();
            setTimeout(function() {
                hideFeedback();
                if (checkQuestionChoice(window.currentQuestion)) {
                    socket.emit('next-question');
                } else {
                    socket.emit('same-question');
                }
            }, 3000);
            break;
        case 48 : // 0
            break;
        case 49 : // 1
            window.currentQuestion.choice = 0;
            break;
        case 50 : // 2
            window.currentQuestion.choice = 1;
            break;
        case 51 : // 3
            window.currentQuestion.choice = 2;
            break;
        case 52 : // 4
            window.currentQuestion.choice = 3;
            break;
        case 53 : // 5
            window.currentQuestion.choice = 4;
            break;
        case 54 : // 6
            window.currentQuestion.choice = 5;
            break;
        case 55 : // 7
            window.currentQuestion.choice = 6;
            break;
        case 56 : // 8
            window.currentQuestion.choice = 7;
            break;
        case 57 : // 9
            window.currentQuestion.choice = 8;
            break;
        case 79 : // Info
            break;
        case 87 : // Rewind Trick play
            break;
        case 9 : // FF Trick play
            break;
        case 65 : //Active
            break;
        case 67 : // Next Trick play
            break;
        case 72 : // red
            break;
        case 74 : // green
            break;
        case 75 : // yellow
            break;
        case 76 : // blue
            break;
        case 80: // Play Trick play
            break;
        case 82 : // Record Trick play
            break;
        case 83 : // Stop Trick play
            break;
        case 85 : // Pause Trick play
            break;
        case 46 : // Back Trick play
            break;
        case 37: //left
            break;
        case 33: //pageup channelUp
            break;
        case 34: //pagedown channelDown
            break;
        case 38: //up
            window.currentQuestion.choice --;
            window.currentQuestion.choice = (window.currentQuestion.choice >= 0) ? window.currentQuestion.choice : window.currentQuestion.answers.length - 1;
            break;
        case 39: //right
            break;
        case 40: //down
            window.currentQuestion.choice ++;
            window.currentQuestion.choice = window.currentQuestion.choice % window.currentQuestion.answers.length;
            break;
        case 47: //back
            break;
        case 189 : //dash
            break;
        default :
            break;
    }

    console.log(code);

    updateQuestion(window.currentQuestion);

    // return false prevents keys from bubbling to UI
    return false;
}

window.onkeydown = keyHandler;

window.onerror = function(errorMsg, url, lineNumber){
    // If Webkit throws an error on the STB - the app crashes.
    // To prevent the propagation and therefore the crash
    // return true

    // Look for this console.log message in the logs
    // To access the logs use http://{STB_IP}/itv/getLogs
    console.error(errorMsg);
    return true;
};

function hideOverlay () {
    window.overlay.style.display = 'none';
}

function showOverlay () {
    window.overlay.style.display = '';
}

function removeCountdown () {
    window.countdown = 0;
}

function hideQuestion () {
    questionDom.style.display = 'none';
}

function showQuestion () {
    questionDom.style.display = '';
}

function hideFeedback () {
    window.feedbackDom.style.display = 'none';
}

/**
 *  To update the question using plain JavaScript
 */
function updateQuestion (question) {
    if (!question.description) {
        questionDescription.innerHTML = '';
        answers.innerHTML = '';
        questionDom.style.display = 'none';
        return;
    }

    questionDescription.innerHTML = question.description;

    // remote all children
    answers.innerHTML = '';

    question.answers.forEach(function(answer, index) {
        var newAnswer = answerDom.cloneNode(true);

        newAnswer.innerHTML = answer.description;
        if (index === question.choice) {
            newAnswer.classList.add('active');
        }

        answers.appendChild(newAnswer);
    });
}

function startCountdown (countdown) {
    window.countdown = countdown;

    window.countDownInterval = setInterval(function() {
        if (window.countdown > 0) {
            window.countdown --;
        } else {
            clearInterval(window.countDownInterval);
        }

        updateCountdown();
    }, 1000);
}

function updateCountdown () {
    if (window.countdown > 0) {
        window.countDownDom.innerText = window.countdown;
    } else {
        window.countDownDom.innerHTML = '';
    }
}

function updateFeedback (feedback) {
    if (feedback) {
        window.feedbackDom.style.display = '';
        window.feedbackDescription.innerHTML = feedback;
    } else {
        window.feedbackDom.style.display = 'none';
        window.feedbackDescription.innerHTML = '';
    }
}

function checkQuestionChoice (question) {
    return (question.choice === question.answer);
}
