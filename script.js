let videoTitles = {};
let currentChannel = "";
let currentTitle = "";
let score = 0;
const highScoreKey = "jack-channel-high-score";

let allTitles = [];
let unusedTitles = [];

const sentenceContainer = document.getElementById("sentence-container");
const input = document.getElementById("guess-input");
const guessButton = document.getElementById("guess-button");
const tryAgainButton = document.getElementById("try-again-button");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const feedback = document.getElementById("feedback");
const datalist = document.getElementById("channel-names");
const hardModeCheckbox = document.getElementById("hard-mode-checkbox");

function populateChannelList() {
  for (let channel in videoTitles) {
    let option = document.createElement("option");
    option.value = channel;
    datalist.appendChild(option);
  }
}

function buildTitlePool() {
  allTitles = [];
  for (let channel in videoTitles) {
    videoTitles[channel].forEach((title) => {
      allTitles.push({ channel, title });
    });
  }
  unusedTitles = [...allTitles];
}

function showRandomTitle() {
  if (unusedTitles.length === 0) {
    unusedTitles = [...allTitles];
  }

  const randomIndex = Math.floor(Math.random() * unusedTitles.length);
  const { channel, title } = unusedTitles.splice(randomIndex, 1)[0];

  currentChannel = channel;
  currentTitle = title;
  sentenceContainer.innerText = `"${title}"`;

  input.value = "";
  input.style.display = "block";
  guessButton.style.display = "block";
  tryAgainButton.style.display = "none";
  feedback.innerText = "";
}

function checkGuess() {
  const channelGuess = input.value.trim();

  if (!videoTitles.hasOwnProperty(channelGuess)) {
    alert("Please choose a channel from the list.");
    return;
  }

  if (channelGuess === currentChannel) {
    score++;
    feedback.innerText = "";
    showRandomTitle();
  } else {
    input.style.display = "none";
    guessButton.style.display = "none";
    tryAgainButton.style.display = "inline-block";
    feedback.innerText = `Wrong! The correct answer was: ${currentChannel}`;
  }

  updateScore();
}

function updateScore() {
  scoreDisplay.innerText = `Score: ${score}`;
  let highScore = Number(localStorage.getItem(highScoreKey)) || 0;
  if (score > highScore) {
    localStorage.setItem(highScoreKey, score);
    highScoreDisplay.innerText = `High Score: ${score}`;
  } else {
    highScoreDisplay.innerText = `High Score: ${highScore}`;
  }
  updateProgressBar();
}

function updateProgressBar() {
  const progressBar = document.querySelector(".progressToHighScore");
  let highScore = Number(localStorage.getItem(highScoreKey)) || 1;
  let percentage = Math.min((score / highScore) * 100, 100);
  progressBar.style.width = `${percentage}%`;
}

function resetGame() {
  score = 0;
  showRandomTitle();
  scoreDisplay.innerText = `Score: ${score}`;
  updateProgressBar();
}

guessButton.addEventListener("click", checkGuess);
tryAgainButton.addEventListener("click", resetGame);
input.addEventListener("keypress", (e) => { if (e.key === "Enter") checkGuess(); });

document.addEventListener("DOMContentLoaded", () => {
  fetch("jack_titles.json")
    .then((response) => response.json())
    .then((data) => {
      videoTitles = data;
      populateChannelList();
      buildTitlePool();
      showRandomTitle();
      updateScore();
    })
    .catch((error) => {
      console.error("Failed to load JSON:", error);
      sentenceContainer.innerText = "Error loading data!";
    });
});
