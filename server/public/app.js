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
    window.questionDom = document.getElementById('question');
    window.feedbackDom = document.getElementById('feedback');
    window.feedbackDescription = document.getElementById('feedback_description');
    window.questionCount = document.getElementById('question_count');
    window.summaryDom = document.getElementById('summary');

    window.answerDom = document.createElement('div');
    answerDom.classList.add('answer');

    hideOverlay();
    hideSummary();

    socket.on('post-question', function(data) {
        hideFeedback();

        window.currentQuestion = data;
        console.log(data);

        showOverlay();
        showQuestion();
        updateQuestion(window.currentQuestion);
    });

    socket.on('finish-quiz', function() {
        window.currentQuestion = null;
        hideFeedback();
        showSummary();
        updateContentPosters();
    });

    socket.on('choice-change', function(choice) {
        currentQuestion.choice = choice;
        updateQuestion(currentQuestion);
    });

    socket.on('answer-result', function(correct) {
        hideQuestion();

        updateFeedback(correct ? 'Woohoo, you got it right!' : 'Wrong. Try again.');
    })
}

function keyHandler(e){
    var code = e.keyCode;

    //Don't for get to put a BREAK after every case OR it will
    //Fall through like it does below.
    switch(code){
        case 13: // Select / Enter
            if (window.currentQuestion && window.currentQuestion.description) {
                socket.emit('answer', window.currentQuestion);
            } else {
                if (window.contentPosterChoice === 0) {
                    socket.emit('change-channel', 269);
                } else {
                    socket.emit('change-channel', 278);
                }
            }
            break;
        case 48 : // 0
            break;
        case 49 : // 1
            window.currentQuestion.choice = 0;
            socket.emit('choice-change', window.currentQuestion.choice);
            break;
        case 50 : // 2
            window.currentQuestion.choice = 1;
            socket.emit('choice-change', window.currentQuestion.choice);
            break;
        case 51 : // 3
            window.currentQuestion.choice = 2;
            socket.emit('choice-change', window.currentQuestion.choice);
            break;
        case 52 : // 4
            window.currentQuestion.choice = 3;
            socket.emit('choice-change', window.currentQuestion.choice);
            break;
        case 53 : // 5
            window.currentQuestion.choice = 4;
            socket.emit('choice-change', window.currentQuestion.choice);
            break;
        case 54 : // 6
            window.currentQuestion.choice = 5;
            socket.emit('choice-change', window.currentQuestion.choice);
            break;
        case 55 : // 7
            window.currentQuestion.choice = 6;
            socket.emit('choice-change', window.currentQuestion.choice);
            break;
        case 56 : // 8
            window.currentQuestion.choice = 7;
            socket.emit('choice-change', window.currentQuestion.choice);
            break;
        case 57 : // 9
            window.currentQuestion.choice = 8;
            socket.emit('choice-change', window.currentQuestion.choice);
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
            window.contentPosterChoice --;
            if (window.contentPosterChoice < 0) {
                window.contentPosterChoice = 2;
            }
            updateContentPosters();
            break;
        case 33: //pageup channelUp
            break;
        case 34: //pagedown channelDown
            break;
        case 38: //up
            window.currentQuestion.choice --;
            window.currentQuestion.choice = (window.currentQuestion.choice >= 0) ? window.currentQuestion.choice : window.currentQuestion.answers.length - 1;
            socket.emit('choice-change', window.currentQuestion.choice);
            break;
        case 39: //right
            window.contentPosterChoice ++;
            if (window.contentPosterChoice > 2) {
                window.contentPosterChoice = 0;
            }
            updateContentPosters();
            break;
        case 40: //down
            window.currentQuestion.choice ++;
            window.currentQuestion.choice = window.currentQuestion.choice % window.currentQuestion.answers.length;
            socket.emit('choice-change', window.currentQuestion.choice);
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
    console.log(lineNumber);
    return true;
};

function hideOverlay () {
    window.overlay.style.display = 'none';
}

function showOverlay () {
    window.overlay.style.display = '';
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

    questionCount.innerHTML = question.index + '/' + 3;

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

function hideSummary () {
    summary.style.display = 'none';
}

function showSummary () {
    summary.style.display = '';
    window.contentPosterChoice = 0;
}

function updateContentPosters () {
    document.getElementById('correct_answers')
        .innerHTML = 'George W Bush, Venus and Mercury';

    var posters = document.getElementById('content_posters');
    posters.innerHTML = '';

    var contentPoster = document.createElement('div');
    contentPoster.classList.add('content-poster');
    var img = document.createElement('img');
    img.classList.add('content-poster.img');
    var description = document.createElement('div');
    description.classList.add('description');
    img.src = 'george-w-bush.jpg';
    description.innerHTML = 'George W Bush';

    var description2 = description.cloneNode(true);
    description2.innerHTML = 'Venus';
    var description3 = description.cloneNode(true);
    description3.innerHTML = 'Mercury';

    var contentPoster2 = contentPoster.cloneNode(true);
    var contentPoster3 = contentPoster.cloneNode(true);
    var img2 = img.cloneNode(true);
    var img3 = img.cloneNode(true);

    img2.src = 'planet-venus.jpg';
    img3.src = 'mercury.jpeg';

    contentPoster.appendChild(img);
    contentPoster.appendChild(description);

    contentPoster2.appendChild(img2);
    contentPoster2.appendChild(description2);

    contentPoster3.appendChild(img3);
    contentPoster3.appendChild(description3);

    switch (window.contentPosterChoice) {
        case 0:
            contentPoster.classList.add('active');
            break;
        case 1:
            contentPoster2.classList.add('active');
            break;
        case 2:
            contentPoster3.classList.add('active');
            break;
    }

    posters.appendChild(contentPoster);
    posters.appendChild(contentPoster2);
    posters.appendChild(contentPoster3);
}
