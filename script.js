const state = {
  index: 0,
  score: 0,
  streak: 0,
  lives: 3,
  answered: false,
  timeLeft: 15,
  timer: null
};

const $ = (id) => document.getElementById(id);
const qNo = $("questionNo"), scoreEl = $("score"), streakEl = $("streak"),
      livesEl = $("lives"), timerEl = $("timer"), progressEl = $("progress"),
      cluesEl = $("clues"), optionsEl = $("options"), feedbackEl = $("feedback"),
      nextBtn = $("nextBtn"), difficultyEl = $("difficulty");

function difficultyFor(i){
  if(i < 25) return "Easy";
  if(i < 60) return "Medium";
  if(i < 85) return "Hard";
  return "Expert";
}

function updateStats(){
  qNo.textContent = `${Math.min(state.index + 1, PUZZLES.length)} / ${PUZZLES.length}`;
  scoreEl.textContent = state.score;
  streakEl.textContent = `${state.streak} 🔥`;
  livesEl.textContent = "❤️".repeat(state.lives) + "🖤".repeat(3-state.lives);
  progressEl.style.width = `${(state.index / PUZZLES.length) * 100}%`;
}

function loadQuestion(){
  clearInterval(state.timer);
  state.answered = false;
  state.timeLeft = 15;
  nextBtn.disabled = true;
  nextBtn.textContent = "Choose an answer";
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";

  const p = PUZZLES[state.index];
  difficultyEl.textContent = difficultyFor(state.index);
  updateStats();
  timerEl.textContent = state.timeLeft;

  cluesEl.innerHTML = "";
  p.clues.forEach((c, i) => {
    const box = document.createElement("div");
    box.className = "clue";
    const img = document.createElement("img");
    img.src = c.src;
    img.alt = c.alt;
    img.onerror = () => {
      box.innerHTML = `<div style="text-align:center;color:#77809a;font-size:13px">
        <strong>Image ${i+1}</strong><br><br>${escapeHtml(c.alt)}<br><br>
        <small>Replace this file: ${c.src}</small>
      </div>`;
    };
    box.appendChild(img);
    cluesEl.appendChild(box);
    if(i === 0){
      const plus = document.createElement("div");
      plus.className = "plus";
      plus.textContent = "+";
      cluesEl.appendChild(plus);
    }
  });

  optionsEl.innerHTML = "";
  p.options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = option;
    btn.onclick = () => answer(option, btn);
    optionsEl.appendChild(btn);
  });

  state.timer = setInterval(() => {
    state.timeLeft--;
    timerEl.textContent = state.timeLeft;
    if(state.timeLeft <= 0){
      clearInterval(state.timer);
      answer(null, null, true);
    }
  }, 1000);
}

function answer(choice, clicked, timedOut=false){
  if(state.answered) return;
  state.answered = true;
  clearInterval(state.timer);

  const p = PUZZLES[state.index];
  document.querySelectorAll(".option").forEach(btn => {
    btn.disabled = true;
    if(btn.textContent === p.answer) btn.classList.add("correct");
  });

  if(choice === p.answer){
    const points = 100 + state.timeLeft * 5 + state.streak * 10;
    state.score += points;
    state.streak++;
    feedbackEl.textContent = `Correct! +${points} points 🎉`;
    feedbackEl.className = "feedback good";
  }else{
    if(clicked) clicked.classList.add("wrong");
    state.streak = 0;
    state.lives--;
    feedbackEl.textContent = timedOut
      ? `Time's up! Answer: ${p.answer}`
      : `Not quite. Answer: ${p.answer}`;
    feedbackEl.className = "feedback bad";
  }

  updateStats();
  nextBtn.disabled = false;
  nextBtn.textContent = state.index === PUZZLES.length - 1 ? "See Final Score" : "Next Question";
}

function next(){
  if(!state.answered) return;
  if(state.lives <= 0){
    finish();
    return;
  }
  if(state.index >= PUZZLES.length - 1){
    finish();
    return;
  }
  state.index++;
  loadQuestion();
}

function finish(){
  clearInterval(state.timer);
  const best = Math.max(state.score, Number(localStorage.getItem("movieRebusBest") || 0));
  localStorage.setItem("movieRebusBest", best);

  document.querySelector(".game-card").innerHTML = `
    <div style="text-align:center;padding:55px 20px">
      <div style="font-size:60px">🏆</div>
      <h2 style="font-size:34px;margin:12px 0">Game Complete!</h2>
      <p style="color:#9ca4bd">You scored</p>
      <div style="font-size:64px;font-weight:900">${state.score}</div>
      <p style="color:#9ca4bd">Best score: ${best}</p>
      <button class="next-btn" onclick="location.reload()">Play Again</button>
    </div>`;
}

function restart(){ location.reload(); }
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

nextBtn.onclick = next;
$("restartBtn").onclick = restart;
loadQuestion();
