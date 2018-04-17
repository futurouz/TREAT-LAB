const notifier = require("node-notifier");

var ctracker;
var trigHeight = 0;
var ypos = 0;
var button;
var alarm = false;
var isLine = false;
var checkFace = false;
var counter = 0;
var positions;
let sec = 0;
let date = new Date()
  .toJSON()
  .slice(0, 10)
  .replace(/-/g, "-");

function setup() {
  var videoInput = createCapture(VIDEO);
  videoInput.size(400, 300);
  videoInput.parent("sketch-holder");

  var cnv = createCanvas(400, 300);
  cnv.parent("sketch-holder2");

  ctracker = new clm.tracker();
  ctracker.init(pModel);
  ctracker.start(videoInput.elt);

  button = createButton("set height");
  button.mousePressed(setHeight);
}

function draw() {
  clear();
  noStroke();

  positions = ctracker.getCurrentPosition();
  for (var i = 0; i < positions.length; i++) {
    fill(0, 255, 0);
    rect(positions[i][0], positions[i][1], 3, 3);
    if (i == 20) {
      ypos = positions[i][1];
    }
  }
  stroke("rgb(0,255,0)");
  strokeWeight(4);
  isLine && line(0, trigHeight, width * 2, trigHeight);
}

function setHeight() {
  trigHeight = ypos + 15;
  isLine = true;
  checkFace = true;
  alarm = true;
}

function headUp() {
  if (checkFace) {
    if (ypos > trigHeight && alarm) {
      timer();
      if (counter == 2) {
        notifier.notify({
          title: "Mind your posture",
          message: "Your Head is bending down."
        });

        bendCount();
        alarm = false;
        counter = 0;
        clearInterval(timer);
      }
    }
    if (ypos <= trigHeight) {
      alarm = true;
      counter = 0;
    }
  }
}

function timer() {
  console.log(counter);
  setTimeout(function() {
    ++counter;
  }, 1000);
}

setInterval(headUp, 1000);

// Timer for long sit
function sitTimer() {
  if (typeof positions === "object") {
    ++sec;
    document.getElementById("timer").innerHTML = `${sec} s`;
  }
}
setInterval(sitTimer, 1000);

function updateCount(received) {
  let data = received.val();
  if (data) {
    document.getElementById("showBend").innerHTML = data;
  } else {
    document.getElementById("showBend").innerHTML = "0";
  }
}

// Save and Retrive data
function bendCount() {
  let user = firebase.auth().currentUser;
  let databaseRef = firebase
    .database()
    .ref(`users/${user.uid}/bends/${date}/count`);
  databaseRef.transaction(function(count) {
    count += 1;
    return count;
  });

  databaseRef.on("value", updateCount);
}

window.onload = function() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      let databaseRef = firebase
        .database()
        .ref(`users/${user.uid}/bends/${date}/count`);
      databaseRef.on("value", updateCount);
    }
  });
};
