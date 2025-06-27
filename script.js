// script.js – Multi-subject, Chapterwise Quiz System with Voice, Color, Explanation

let questions = [];
let current = 0;
let score = 0;
let timer;
let timeLimit = 20; // seconds per question
let selectedSet = "";

function loadQuiz(jsonFile) {
  fetch(jsonFile)
    .then(res => res.json())
    .then(data => {
      questions = shuffleArray(data);
      current = 0;
      score = 0;
      selectedSet = jsonFile;
      showQuestion();
    });
}

function showQuestion() {
  clearInterval(timer);
  const q = questions[current];
  document.getElementById("question").innerText = `${current + 1}. ${q.question}`;

  const optsHTML = q.options.map((opt, i) => `
    <label class="option">
      <input type="radio" name="opt" value="${i}"> ${opt}
    </label>
  `).join('');

  document.getElementById("options").innerHTML = `<div class="grid-options">${optsHTML}</div>`;
  document.getElementById("next").style.display = "block";
  document.getElementById("explanation")?.remove();

  startTimer(timeLimit);
  updateProgress();
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'bn-BD';
  window.speechSynthesis.speak(utter);
}

function giveFeedback(userAns, correctAns, explanation) {
  const options = document.getElementsByName("opt");
  options.forEach((opt, i) => {
    if (i === correctAns) {
      opt.parentElement.style.background = "#4ade80"; // green
    }
    if (i === userAns && userAns !== correctAns) {
      opt.parentElement.style.background = "#f87171"; // red
    }
  });

  const message = userAns === correctAns ? "✔️ সঠিক উত্তর" : "❌ ভুল উত্তর";
  speak(message);

  const explainDiv = document.createElement("div");
  explainDiv.id = "explanation";
  explainDiv.innerHTML = `
    <p><strong>${message}</strong></p>
    <p><em>ব্যাখ্যা:</em> ${explanation || "ব্যাখ্যা পাওয়া যায়নি।"}</p>
  `;
  document.getElementById("quiz-container").appendChild(explainDiv);
}

function checkAnswer() {
  const selected = document.querySelector("input[name='opt']:checked");
  if (!selected) return;

  const userAnswer = parseInt(selected.value);
  const correctAnswer = questions[current].answer;
  const explanation = questions[current].explanation || "";

  questions[current].userAnswer = userAnswer;
  if (userAnswer === correctAnswer) score++;

  clearInterval(timer);
  giveFeedback(userAnswer, correctAnswer, explanation);

  document.getElementById("next").style.display = "block";
  document.getElementById("next").onclick = () => {
    current++;
    if (current < questions.length) {
      showQuestion();
    } else {
      finishQuiz();
    }
  };
}

function finishQuiz() {
  clearInterval(timer);
  const result = questions.map((q, i) => {
    const correct = q.answer === q.userAnswer;
    return `<p class="result-qa">${i + 1}. ${q.question}<br>
    আপনার উত্তর: <span style="color:${correct ? 'green' : 'red'}">${q.options[q.userAnswer] || '❌ দেননি'}</span><br>
    সঠিক উত্তর: ✅ ${q.options[q.answer]}<br>
    ব্যাখ্যা: ${q.explanation || 'পাওয়া যায়নি'}</p>`;
  }).join('<hr>');
  document.getElementById("quiz-container").innerHTML = `
    <h2>আপনার স্কোর: ${score}/${questions.length}</h2>
    ${result}
    <button onclick=\"loadQuiz(selectedSet)\">🔁 আবার শুরু করুন</button>
  `;
}

function startTimer(duration) {
  let timeLeft = duration;
  const timeDisplay = document.getElementById("timer");
  timeDisplay.innerText = `⏳ ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    timeDisplay.innerText = `⏳ ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      checkAnswer();
    }
  }, 1000);
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function updateProgress() {
  const percent = ((current) / questions.length) * 100;
  document.getElementById("progress").style.width = percent + "%";
}

// Keyboard support
document.addEventListener("keydown", (e) => {
  const keys = ['1','2','3','4'];
  if (keys.includes(e.key)) {
    const inputs = document.getElementsByName("opt");
    const index = parseInt(e.key) - 1;
    if (inputs[index]) inputs[index].checked = true;
  }
  if (e.key === "Enter") {
    checkAnswer();
  }
});

// Touch support
document.getElementById("options").addEventListener("click", e => {
  if (e.target.tagName === "INPUT") {
    e.target.checked = true;
  }
});

document.getElementById("next").addEventListener("click", checkAnswer);

// Dark Mode Toggle
document.getElementById("dark-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
