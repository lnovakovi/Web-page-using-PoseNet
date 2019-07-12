//console.log(screen.width)    1280
//console.log(screen.height)   720
let flag = true;
const start = document.getElementById("start");
const quiz = document.getElementById("quiz");
const mouse = document.getElementById("mouse-pointer");
const question = document.getElementsByClassName("question-div");
const questionDiv = document.getElementById("question");
const answerOne = document.getElementById("answer-one");
const answerTwo = document.getElementById("answer-two");
const scoreContainer = document.getElementById("scoreContainer");
let score = 0;


/************************************************************************************************ */
function getPosition(el) {
  var xPos = 0;
  var yPos = 0;

  while (el) {
    if (el.tagName == "BODY") {
      // deal with browser quirks with body/window/document and page scroll
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;

      xPos += el.offsetLeft - xScroll + el.clientLeft;
      yPos += el.offsetTop - yScroll + el.clientTop;
    } else {
      // for all other non-BODY elements
      xPos += el.offsetLeft - el.scrollLeft + el.clientLeft;
      yPos += el.offsetTop - el.scrollTop + el.clientTop;
    }

    el = el.offsetParent;
  }
  return {
    x: xPos,
    y: yPos
  };
}

/************************************************************************************************************* */
/**
 *     QUIZ
 */
let questions = [
  {
    question: "Glavni grad Švedske?",
    choiceA: "Stockholm",
    choiceB: "Goteborg",
    correct: "A"
  },
  {
    question: "Je li lubenica voce ili povrce?",
    choiceA: "Voce",
    choiceB: "Povrce",
    correct: "B"
  },
  {
    question: "Koji je najveci planet suncevog sustava?",
    choiceA: "Jupiter",
    choiceB: "Zemlja",
    correct: "A"
  }
];

let lastQuestionIndex = questions.length - 1;

let runningQuestionIndex = 0;

function renderQuestion() {
  let q = questions[runningQuestionIndex];
  let note = document.getElementById("answerNote");
  note.style.display="none";
  questionDiv.innerHTML = q.question;
  answerOne.innerHTML = q.choiceA;
  answerTwo.innerHTML = q.choiceB;
  flag = true;
}

function checkAnswer(answer) {
  if (questions[runningQuestionIndex].correct == answer) {
    score++;
    answerIsCorrect();  
  } else {
    answerIsWrong();  
  }
  if (runningQuestionIndex < lastQuestionIndex) {
    runningQuestionIndex++;
    setTimeout(renderQuestion,1200);
  } else {
    setTimeout(renderScore,1500);
  }
}
function moveMouse(){
  mouse.style.top = Math.floor(screen.height/3).toString() + "px";
  mouse.style.left = Math.floor(screen.width/2).toString() + "px";
}
function startQuiz() {
  start.style.display = "none";
  quiz.style.display = "block";
  question[0].style.display = "inline-block";
  renderQuestion();
}

function renderScore() {
  scoreContainer.style.display = "block";
  quiz.style.display = "none";
  question[0].style.display = "none";
  let scorePerCent = Math.round((100 * score) / questions.length);
  let img =
    scorePerCent >= 80
      ? "img/5.png"
      : scorePerCent >= 60
      ? "img/4.png"
      : scorePerCent >= 40
      ? "img/3.png"
      : scorePerCent >= 20
      ? "img/2.png"
      : "img/1.png";
  scoreContainer.innerHTML = `<img src="${img}" /><br>
    Tvoj rezultat: <p>${scorePerCent}%</p>`;
}

function answerIsCorrect() {
  let note = document.getElementById("answerNote");
  note.style.display = "block";
  note.innerHTML = "Bravo! Odgovor je točan!";
  moveMouse();
}

function answerIsWrong() {
  let note = document.getElementById("answerNote");
  note.style.display = "block";
  note.innerHTML = "Nažalost odgovor je netočan!";
  moveMouse();
}

/** import camera */
/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licnses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

const maxVideoSize = 200;
const canvasSize = 200;

const scaleX = Math.floor(screen.width / canvasSize) - 1;
const scaleY = Math.floor(screen.height / canvasSize) - 0.5;

// provjeravanje OS
function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

/**
 * Loads a the camera to be used in the demo
 *
 */

// navigator -> objekt koji sadrzi podatke o browseru
async function setupCamera() {
  const video = document.getElementById("video");
  video.width = maxVideoSize;
  video.height = maxVideoSize;

  // trazimo dozvolu da koristimo inpute kao sto su kamera, mikrofon..
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const mobile = isMobile();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: mobile ? undefined : maxVideoSize,
        height: mobile ? undefined : maxVideoSize
      }
    });
    video.srcObject = stream;

    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  } else {
    const errorMessage =
      "This browser does not support video capture, or this device does not have a camera";
    alert(errorMessage);
    return Promise.reject(errorMessage);
  }
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

// Net will hold the posenet model

let net={};

// Main animation loop
function render(video, net) {
  const canvas = document.getElementById("output");
  const ctx = canvas.getContext("2d");
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  // Flip the webcam image to get it right
  const flipHorizontal = true;
  async function detect() {
    // očistiti grafičku karticu
    net.dispose();
    
    // Učitaj posenet
    net = await posenet.load(1.01);
    // Skaliranje slike, što je faktor manji, model je brži u obradi 
    const imageScaleFactor = 0.75;
    // Što je stride veći, model je brži
    const outputStride = 16;
    // Niz za pohranu poza
    let poses = [];
    const pose = await net.estimateSinglePose(
      video,
      imageScaleFactor,
      flipHorizontal,
      outputStride,
    );                   
    poses.push(pose);
   
    let minPoseConfidence;
    let minPartConfidence;
    // Show a pose (i.e. a person) only if probability more than 0.1
    minPoseConfidence = 0.1;
    // Show a body part only if probability more than 0.3
    minPartConfidence = 0.3;

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvasSize, 0);
    ctx.drawImage(video, 0, 0, canvasSize, canvasSize);
    ctx.restore();

    const scale = canvasSize / video.width;
    
    // Za svaku pozu prepoznatu na slici, prođi kroz petlju poza i nacrtaj odgovarajući skeleton
    // i ključne točke samo ako je pouzdanost veća od one koju smo unaprijed odredili
    poses.forEach(({ score, keypoints }) => {   
      if (score >= minPoseConfidence) {
        drawKeypoints(keypoints, minPartConfidence, ctx, scale);
        drawSkeleton(keypoints, minPartConfidence, ctx, scale);
      }
    });
    if( flag === true){
     
    for (const pose of poses[0].keypoints){
      if(pose.score >= minPoseConfidence){
        if( pose.part  == "rightWrist" && pose.position.x > 0 && pose.position.y>0){
          let top = pose.position.y * scaleY;
          let left = pose.position.x * scaleX;
          mouse.style.top = Math.floor(top).toString() + "px";
          mouse.style.left = Math.floor(left).toString() + "px";
          inside = await checkFirstCoord();
        }
      }
    }
  }
    
    //render( video, camera );
    requestAnimationFrame(detect);
  }
  detect();
}


async function main() {
  // Load posenet
  const net = await posenet.load();
  document.getElementById("main").style.display = "inline-block";

  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    console.error(e);
  }

  render(video, net);
}

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

main();


async function checkFirstCoord(){
  
    let positionOfImg = getPosition(mouse);
    let positionOfA = getPosition(answerOne);
    let positionOfB = getPosition(answerTwo);
    let positionStart = getPosition(start);
    if (
      positionOfImg.x >= positionOfA.x &&
      positionOfImg.x <= positionOfA.x + answerOne.offsetWidth &&
      (positionOfImg.y >= positionOfA.y &&
        positionOfA.y <= positionOfA.y + answerOne.offsetHeight)
    ) {
      setTimeout(checkImgCoord,1200);
    } else if (
      positionOfImg.x >= positionOfB.x &&
      positionOfImg.x <= positionOfB.x + answerOne.offsetWidth &&
      (positionOfImg.y >= positionOfB.y &&
        positionOfB.y <= positionOfB.y + answerTwo.offsetHeight)
    ) {
      setTimeout(checkImgCoord,1200);
    } else if (
      positionOfImg.x >= positionStart.x &&
      positionOfImg.x <= positionStart.x + start.offsetWidth &&
      (positionOfImg.y >= positionStart.y &&
        positionStart.y <= positionStart.y + start.offsetHeight)
    ) {
      setTimeout(checkImgCoord,1200);
    }
  
} 

async function checkImgCoord() {
  let positionOfImg = getPosition(mouse);
  let positionOfA = getPosition(answerOne);
  let positionOfB = getPosition(answerTwo);
  let positionStart = getPosition(start);
  if (
    positionOfImg.x >= positionOfA.x &&
    positionOfImg.x <= (positionOfA.x + answerOne.offsetWidth - mouse.offsetWidth/2) &&
    (positionOfImg.y >= positionOfA.y &&
      positionOfA.y <= positionOfA.y + answerOne.offsetHeight)
  ) {
    checkAnswer("A");
    flag=false;
  } else if (
    positionOfImg.x >= positionOfB.x &&
    positionOfImg.x <= (positionOfB.x + answerOne.offsetWidth - mouse.offsetWidth/2) &&
    (positionOfImg.y >= positionOfB.y &&
      positionOfB.y <= positionOfB.y + answerTwo.offsetHeight)
  ) {
    checkAnswer("B")
    flag=false;
  } else if (
    positionOfImg.x > positionStart.x &&
    positionOfImg.x < (positionStart.x + start.offsetWidth - mouse.offsetWidth/2) &&
    (positionOfImg.y >= positionStart.y &&
      positionOfImg.y < positionStart.y + start.offsetHeight)
  ) {
    setTimeout(startQuiz,1400);
  }
}


