const modes = document.querySelectorAll(".mode");
const timer = document.getElementById("timer");
const restart = document.getElementById("restart");
const wordsEl = document.getElementById("words");
let correctChars = 0;
let incorrectChars = 0;
let finished = false;
const wordList = ["the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this"];

let testTime = 15;
let timeLeft = testTime;
let timerId = null;
let started = false;

let words = [];
let wordIndex = 0;
let letterIndex = 0;

function generateWords(count = 200) {
  words = [];
  for (let i = 0; i < count; i++) {
    words.push(wordList[Math.floor(Math.random() * wordList.length)]);
  }
}

function renderWords() {
  wordsEl.innerHTML = "";
  words.forEach((word) => {                      // words, not wordList
    const wordEl = document.createElement("div");
    wordEl.classList.add("word");
    word.split("").forEach((ch) => {
      const letterEl = document.createElement("span");
      letterEl.classList.add("letter");
      letterEl.textContent = ch;
      wordEl.appendChild(letterEl);
    });
    wordsEl.appendChild(wordEl);
  });
  wordsEl.children[0].classList.add("active");
}

generateWords();
renderWords();

modes.forEach((button) => {
  button.addEventListener("click", () => {
    modes.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    testTime = Number(button.dataset.time);
    restartTest();
  });
});

function startTimer() {
  started = true;
  timeLeft = testTime;
  timerId = setInterval(() => {
    timeLeft--;
    timer.textContent = timeLeft;
    if (timeLeft <= 0) endTest();
  }, 1000);
}

function endTest() {
  clearInterval(timerId);
  timerId = null;
  started = false;
  finished = true;
  const minutes = testTime / 60;
  const wpm = Math.round(correctChars / 5 / minutes);
  const total = correctChars + incorrectChars;
  const acc = total === 0 ? 0 : Math.round((correctChars / total) * 100);
  document.body.classList.add("finished");
  document.getElementById("res-wpm").textContent = wpm;
  document.getElementById("res-acc").textContent = acc + "%";
  document.getElementById("res-chars").textContent =
    correctChars + "/" + incorrectChars;
  document.getElementById("results").classList.remove("hidden");
}

function resetTimer() {
  clearInterval(timerId);
  timerId = null;
  started = false;
  timeLeft = testTime;
  timer.textContent = testTime;
  document.getElementById("results").classList.add("hidden");
}

function restartTest() {
  resetTimer();
  generateWords();
  renderWords();
  wordIndex = 0;
  letterIndex = 0;
  correctChars = 0;
  incorrectChars = 0;
  finished = false;
  document.body.classList.remove("finished");
  document.getElementById("caret").classList.remove("hidden");
} 

function handleKey(e) {
  const currentWord = words[wordIndex];
  const wordEl = wordsEl.children[wordIndex];                      // ran out of words
  const letterEls = wordEl.querySelectorAll(".letter");

  if (e.key === " ") {
    if (letterIndex === 0) return;              
    const isCorrect =
      !wordEl.querySelector(".incorrect") && letterIndex === currentWord.length;
    if (isCorrect) {
      correctChars++; 
    } 
    else {
      incorrectChars+=(currentWord.length-letterIndex);
      wordEl.classList.add("error");
    }
    wordEl.classList.remove("active");
    wordIndex++;
    letterIndex = 0;
    if (wordsEl.children[wordIndex]) {
      wordsEl.children[wordIndex].classList.add("active");
    }
    else{
        endTest();
        return;
    }
    return;
  }

  if (e.key === "Backspace") {
    if (letterIndex > 0) {
      letterIndex--;
      letterEls[letterIndex].classList.remove("correct", "incorrect");
    }
    return;
  }

  if (e.key.length === 1 && letterIndex < currentWord.length) {
    if (e.key === currentWord[letterIndex]) {
      letterEls[letterIndex].classList.add("correct");
      correctChars++;
    } else {
      letterEls[letterIndex].classList.add("incorrect");
      incorrectChars++;
    }
    letterIndex++;
  }
}

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;   // let browser shortcuts work

  if (e.key === "Tab") {
    e.preventDefault();
    restartTest();
    return;
  }
  if(finished) return;
  if (e.key === " ") e.preventDefault();            // stop page scrolling

  if (e.key.length === 1 && !started && e.key != " "){
    startTimer(); // only real characters start it
    document.getElementById("caret").classList.add("hidden");
  }
  handleKey(e);
});

restart.addEventListener("click", () => {
  restartTest();
  restart.blur();                                   // so Space doesn't re-click it
});
document.getElementById("again").addEventListener("click",()=>{
  restartTest();
});