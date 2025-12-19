document.addEventListener("DOMContentLoaded", function() {
  const exam = document.getElementById("exam");
  const container = document.getElementById("question-container");
  const overlay = document.getElementById('full-image-overlay');
  const fullImg = document.getElementById('full-image-display');
  const closeBtn = document.getElementById('close-full-image');

  // ------------------- Config from Django -------------------
  const paper_id = window.paperConfig?.paperId;
  const totalQuestions = Number(window.paperConfig?.totalQuestions || 1);
  let remainingSeconds = Number(window.paperConfig?.remainingSeconds || 0);
  if (isNaN(remainingSeconds) || remainingSeconds < 0) remainingSeconds = 0;

  const timeDisplay = document.getElementById("time_display");
  const navbarHeight = 70; // adjust to your navbar height

  // ------------------- CSRF Helper -------------------
  function getCSRF() {
    const el = document.querySelector('[name=csrfmiddlewaretoken]');
    if (el) return el.value;
    const match = document.cookie.match(/(^|;)\s*csrftoken=([^;]+)/);
    return match ? match.pop() : '';
  }

  // ------------------- Toast -------------------
  function showToast(msg, color = "#333") {
    const t = document.createElement("div");
    t.innerText = msg;
    t.style.position = "fixed";
    t.style.right = "20px";
    t.style.top = "20px";
    t.style.background = "white";
    t.style.border = "1px solid #ddd";
    t.style.padding = "8px 12px";
    t.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
    t.style.color = color;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  // ------------------- Save Answer -------------------
  function saveAnswer(current_order, callback) {
    const csrf = getCSRF();
    const fd = new FormData();

    const checked = container.querySelector('input[name="option"]:checked');
    if (checked) fd.append("selected_option", checked.value);

    const fileInput = container.querySelector('input[name="answer_file"]');
    if (fileInput && fileInput.files.length > 0) {
      fd.append("answer_file", fileInput.files[0]);
    }

    fetch(`/questionpapers/save_answer/${paper_id}/${current_order}/`, {
      method: "POST",
      body: fd,
      headers: { 'X-CSRFToken': csrf },
      credentials: 'same-origin'
    })
    .then(resp => resp.json())
    .then(data => {
      if (data.status === 'saved') {
        // ✅ Update uploaded file link using server URL
        if (fileInput && fileInput.files.length > 0) {
          const containerDiv = container.querySelector('.uploaded-file-container');
          containerDiv.innerHTML = `
            <p class="uploaded-link">
              Uploaded: <a href="${data.file_url}" target="_blank">${fileInput.files[0].name}</a>
            </p>`;
        }
      }
      else if (data.error) showToast("⚠️ " + data.error, "crimson");

      if (callback) callback();
    })
    .catch(err => {
      console.error("Save failed", err);
      showToast("⚠️ Save failed", "crimson");
      if (callback) callback();
    });
  }

  // ------------------- Load Question -------------------
  function loadQuestion(new_order) {
    fetch(`/questionpapers/load_question/${paper_id}/${new_order}/`, { credentials: 'same-origin' })
      .then(resp => resp.json())
      .then(data => {
        if (data.html) {
          container.innerHTML = data.html;
          const progress = document.getElementById("progress");
          if (progress) progress.innerText = `Question ${new_order} of ${totalQuestions}`;
          window.scrollTo({ top: exam.offsetTop - navbarHeight, behavior: 'smooth' });

          bindFileInput(); // re-bind file input event
        } else if (data.error) showToast("⚠️ " + data.error, "crimson");
        else showToast("⚠️ No question returned", "crimson");
      })
      .catch(e => { console.error("Load question failed", e); showToast("⚠️ Load failed", "crimson"); });
  }

  // ------------------- Bind file input for auto-save -------------------
  function bindFileInput() {
    const fileInput = container.querySelector('input[name="answer_file"]');
    if (fileInput) {
      fileInput.addEventListener('change', function() {
        const current_order = parseInt(container.querySelector("#current_q_order").value);
        saveAnswer(current_order);
      });
    }
  }

  bindFileInput(); // initial binding

  // ------------------- Auto-save on option change -------------------
  container.addEventListener('change', function(e){
    if(e.target.name === 'option') {
      const current_order = parseInt(container.querySelector("#current_q_order").value);
      saveAnswer(current_order);
    }
  });

  // ------------------- Timer -------------------
  function updateTimer() {
    if(!timeDisplay) return;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    timeDisplay.innerText = `${minutes}:${seconds < 10 ? '0'+seconds : seconds}`;

    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      autoSubmit();
      return;
    }
    remainingSeconds--;
  }
  const timerInterval = setInterval(updateTimer, 1000);
  updateTimer();

  // ------------------- Auto Submit -------------------
  function autoSubmit() {
    const current_order = parseInt(container.querySelector("#current_q_order").value);
    saveAnswer(current_order, () => {
      const csrf = getCSRF();
      fetch(`/questionpapers/final_submit/${paper_id}/`, {
        method: "POST",
        headers: {
          'X-CSRFToken': csrf,
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `csrfmiddlewaretoken=${encodeURIComponent(csrf)}`,
        credentials: 'same-origin'
      })
      .then(resp => resp.json())
      .then(data => {
        showToast("✅ Paper submitted");
        window.location.href = data.redirect_url;
      })
      .catch(err => {
        console.error("Submit failed", err);
        showToast("⚠️ Submission failed", "crimson");
      });
    });
  }

  // ------------------- Navigation buttons and image click -------------------
  exam.addEventListener("click", function(e) {
    const elOrder = container.querySelector("#current_q_order");
    if (!elOrder) return;
    const current_order = parseInt(elOrder.value);

    if (e.target.classList.contains("next-btn")) {
      const next_order = current_order + 1;
      if (next_order <= totalQuestions) saveAnswer(current_order, () => loadQuestion(next_order));
    }
    if (e.target.classList.contains("prev-btn")) {
      const prev_order = current_order - 1;
      if (prev_order >= 1) saveAnswer(current_order, () => loadQuestion(prev_order));
    }
    if (e.target.classList.contains("submit-btn")) {
      saveAnswer(current_order, () => autoSubmit());
    }

    if(e.target.tagName === 'IMG' && e.target.classList.contains('question-img')) {
      openFullImage(e.target.src);
    }
  });

  // ------------------- Overlay Close -------------------
  closeBtn.addEventListener('click', function(e){
    e.stopPropagation();
    overlay.style.display = 'none';
  });
  overlay.addEventListener('click', function(e){
    if(e.target === overlay) overlay.style.display = 'none';
  });

  // ------------------- Open Full Image Function -------------------
  window.openFullImage = function(src) {
    fullImg.src = src;
    overlay.style.display = 'flex';
  }
});
