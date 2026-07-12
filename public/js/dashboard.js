// =========================================================
// EduSimplify AI — Adaptive Learning Companion
// dashboard.js — Redesigned interactive layer
//
// API contract (POST /api/generate):
//   Body:   { type, content, level }
//   Types:  "core" | "revision" | "flashcards" | "quiz" |
//           "roadmap" | "realworld" | "compare-levels"
//   Levels: "child" | "beginner" | "intermediate" | "expert"
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
  // -------------------------------------------------------
  // DOM refs
  // -------------------------------------------------------
  var form = document.getElementById("learningForm");
  var contentField = document.getElementById("academicContent");
  var levelHidden = document.getElementById("learningLevel");
  var levelSelector = document.getElementById("levelSelector");
  var generateBtn = document.getElementById("generateBtn");
  var loadingState = document.getElementById("loadingState");
  var coreOutputSection = document.getElementById("coreOutputSection");
  var explanationLevelBadge = document.getElementById("explanationLevelBadge");
  var continueLearningSection = document.getElementById(
    "continueLearningSection",
  );
  var featureGrid = document.getElementById("featureGrid");
  var featureOutputArea = document.getElementById("featureOutputArea");
  var resetBtn = document.getElementById("resetBtn");

  // -------------------------------------------------------
  // State
  // -------------------------------------------------------
  var currentContent = "";
  var currentLevel = "beginner";
  var activeFeature = null;
  var fcCards = [];
  var fcIndex = 0;
  var quizQuestions = [];
  var quizIndex = 0;
  var quizScore = 0;
  var quizAnswered = false;
  var retakeData = null;
  var quizResults = [];

  var levelLabels = {
    child: "Child",
    beginner: "Beginner",
    intermediate: "Intermediate",
    expert: "Expert",
  };

  // -------------------------------------------------------
  // Level selector (pill buttons → hidden input)
  // -------------------------------------------------------
  levelSelector.addEventListener("click", function (e) {
    var btn = e.target.closest(".alc-level-btn");
    if (!btn) return;
    levelSelector.querySelectorAll(".alc-level-btn").forEach(function (b) {
      b.classList.remove("alc-level-active");
    });
    btn.classList.add("alc-level-active");
    levelHidden.value = btn.dataset.level;
    currentLevel = btn.dataset.level;
  });

  // -------------------------------------------------------
  // STEP 1 → Generate core content
  // -------------------------------------------------------
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var content = contentField.value.trim();
    if (content.length === 0) {
      contentField.classList.add("is-invalid");
      contentField.focus();
      return;
    }
    contentField.classList.remove("is-invalid");
    currentContent = content;
    currentLevel = levelHidden.value || "beginner";

    generateBtn.disabled = true;

    // ── Clear all stale content immediately ──
    clearAllFeaturePanels();
    clearCoreOutput();

    coreOutputSection.classList.add("d-none");
    continueLearningSection.classList.add("d-none");
    closeActivePanel();
    startLoadingSequence();

    callGenerateAPI("core", currentContent, currentLevel)
      .then(function (data) {
        renderCoreOutput(data);
        stopLoadingSequence();
        loadingState.classList.add("d-none");
        coreOutputSection.classList.remove("d-none");
        continueLearningSection.classList.remove("d-none");
        revealAll([coreOutputSection, continueLearningSection]);
        coreOutputSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      })
      .catch(function (err) {
        stopLoadingSequence();
        loadingState.classList.add("d-none");
        alert("Something went wrong. Please try again.");
        console.error(err);
      })
      .finally(function () {
        generateBtn.disabled = false;
      });
  });

  // -------------------------------------------------------
  // Clear helpers
  // -------------------------------------------------------
  function clearCoreOutput() {
    var expEl = document.getElementById("simplifiedExplanation");
    var sumEl = document.getElementById("summaryText");
    if (expEl) expEl.textContent = "";
    if (sumEl) sumEl.textContent = "";
  }

  function clearAllFeaturePanels() {
    // Clear revision notes
    var notesList = document.getElementById("revisionNotesList");
    if (notesList) notesList.innerHTML = "";

    // Clear flashcards
    var fcQ = document.getElementById("fcQuestion");
    var fcA = document.getElementById("fcAnswer");
    if (fcQ) fcQ.textContent = "";
    if (fcA) fcA.textContent = "";
    fcCards = [];
    fcIndex = 0;

    // Clear quiz
    var quizOpts = document.getElementById("quizOptions");
    var quizQText = document.getElementById("quizQuestionText");
    if (quizOpts) quizOpts.innerHTML = "";
    if (quizQText) quizQText.textContent = "";
    quizQuestions = [];
    quizIndex = 0;
    quizScore = 0;
    quizAnswered = false;
    quizResults = [];
    var quizInProg = document.getElementById("quizInProgress");
    var quizRep = document.getElementById("quizReport");
    if (quizInProg) quizInProg.classList.remove("d-none");
    if (quizRep) quizRep.classList.add("d-none");

    // Clear roadmap
    var prereqList = document.getElementById("prerequisitesList");
    var lpContainer = document.getElementById("learningPathContainer");
    if (prereqList) prereqList.innerHTML = "";
    if (lpContainer) lpContainer.innerHTML = "";

    // Clear real world
    var rwGrid = document.getElementById("realWorldGrid");
    if (rwGrid) rwGrid.innerHTML = "";

    // Clear compare levels
    var compareGrid = document.getElementById("compareLevelsGrid");
    if (compareGrid) compareGrid.innerHTML = "";
  }

  // -------------------------------------------------------
  // Loading sequence — multi-step AI thinking states
  // -------------------------------------------------------
  var loaderSteps = ["lstep-0", "lstep-1", "lstep-2", "lstep-3"];
  var loaderTimer = null;
  var loaderStepIndex = 0;

  function startLoadingSequence() {
    loadingState.classList.remove("d-none");
    loaderStepIndex = 0;
    resetLoaderSteps();
    activateLoaderStep(0);
    loaderTimer = setInterval(function () {
      loaderStepIndex++;
      if (loaderStepIndex >= loaderSteps.length) {
        loaderStepIndex = loaderSteps.length - 1;
        return;
      }
      activateLoaderStep(loaderStepIndex);
    }, 1100);
  }

  function stopLoadingSequence() {
    clearInterval(loaderTimer);
    resetLoaderSteps();
  }

  function resetLoaderSteps() {
    loaderSteps.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.classList.remove("alc-step-active", "alc-step-done");
      }
    });
  }

  function activateLoaderStep(index) {
    for (var i = 0; i < index; i++) {
      var prev = document.getElementById(loaderSteps[i]);
      if (prev) {
        prev.classList.remove("alc-step-active");
        prev.classList.add("alc-step-done");
      }
    }
    var cur = document.getElementById(loaderSteps[index]);
    if (cur) {
      cur.classList.add("alc-step-active");
    }
  }

  // -------------------------------------------------------
  // reveal-on-appear for newly shown sections
  // -------------------------------------------------------
  function revealAll(sections) {
    sections.forEach(function (section) {
      section.querySelectorAll("[data-reveal]").forEach(function (el) {
        el.classList.remove("es-visible");
        requestAnimationFrame(function () {
          setTimeout(function () {
            el.classList.add("es-visible");
          }, 50);
        });
      });
    });
  }

  // -------------------------------------------------------
  // STEP 3 — Feature card clicks
  // -------------------------------------------------------
  featureGrid.addEventListener("click", function (e) {
    var card = e.target.closest(".alc-feature-card");
    if (!card) return;
    var feature = card.dataset.feature;
    if (activeFeature === feature) {
      closeActivePanel();
      return;
    }
    openFeature(feature, card);
  });

  featureOutputArea.addEventListener("click", function (e) {
    if (e.target.closest("[data-close-panel]")) {
      closeActivePanel();
    }
  });

  function openFeature(feature, card) {
    featureGrid.querySelectorAll(".alc-feature-card").forEach(function (c) {
      c.classList.remove("alc-active");
    });
    document.querySelectorAll(".alc-feature-panel").forEach(function (p) {
      p.classList.add("d-none");
    });

    card.classList.add("alc-active");
    activeFeature = feature;

    var panel = document.getElementById("panel-" + feature);
    if (panel) panel.classList.remove("d-none");

    // Show skeleton immediately before API call
    showSkeletonForFeature(feature);
    renderFeature(feature);

    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeActivePanel() {
    document.querySelectorAll(".alc-feature-panel").forEach(function (p) {
      p.classList.add("d-none");
    });
    featureGrid.querySelectorAll(".alc-feature-card").forEach(function (c) {
      c.classList.remove("alc-active");
    });
    activeFeature = null;
  }

  // -------------------------------------------------------
  // Skeleton loaders — shown while API is fetching
  // -------------------------------------------------------
  function showSkeletonForFeature(feature) {
    switch (feature) {
      case "revision":
        showRevisionSkeleton();
        break;
      case "flashcards":
        showFlashcardsSkeleton();
        break;
      case "quiz":
        showQuizSkeleton();
        break;
      case "roadmap":
        showRoadmapSkeleton();
        break;
      case "realworld":
        showRealWorldSkeleton();
        break;
      case "compare-levels":
        showCompareLevelsSkeleton();
        break;
    }
  }

  function showRevisionSkeleton() {
    var list = document.getElementById("revisionNotesList");
    list.innerHTML = "";
    for (var i = 0; i < 7; i++) {
      var row = document.createElement("div");
      row.className = "alc-skeleton-note-row";
      row.innerHTML =
        '<div class="alc-skeleton alc-skeleton-circle"></div>' +
        '<div class="alc-skeleton alc-skeleton-line" style="width:' +
        (70 + Math.floor(Math.random() * 25)) +
        '%;height:14px;"></div>';
      list.appendChild(row);
    }
  }

  function showFlashcardsSkeleton() {
    var singleCard = document.getElementById("flashcardSingle");
    singleCard.classList.remove("alc-flipped");
    // Replace inner content with skeleton face
    var inner = document.getElementById("flashcardInner");
    inner.innerHTML =
      '<div class="alc-flashcard-face alc-flashcard-front alc-fc-skeleton-face">' +
      '<div class="alc-skeleton alc-skeleton-line" style="width:40%;height:10px;margin-bottom:1rem;opacity:0.4;"></div>' +
      '<div class="alc-skeleton alc-skeleton-line" style="width:80%;height:16px;margin-bottom:0.5rem;opacity:0.4;"></div>' +
      '<div class="alc-skeleton alc-skeleton-line" style="width:60%;height:16px;opacity:0.4;"></div>' +
      "</div>" +
      '<div class="alc-flashcard-face alc-flashcard-back"></div>';
    document.getElementById("fcCurrentNum").textContent = "—";
    document.getElementById("fcTotalNum").textContent = "—";
    var prevBtn = document.getElementById("fcPrevBtn");
    var nextBtn = document.getElementById("fcNextBtn");
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }

  function showQuizSkeleton() {
    document.getElementById("quizInProgress").classList.remove("d-none");
    document.getElementById("quizReport").classList.add("d-none");
    document.getElementById("quizCounter").innerHTML =
      '<span class="alc-skeleton alc-skeleton-line" style="width:120px;height:14px;display:inline-block;border-radius:999px;"></span>';
    document.getElementById("quizProgressBar").style.width = "0%";
    var qText = document.getElementById("quizQuestionText");
    qText.innerHTML =
      '<span class="alc-skeleton alc-skeleton-line" style="width:95%;height:16px;display:block;margin-bottom:0.5rem;"></span>' +
      '<span class="alc-skeleton alc-skeleton-line" style="width:70%;height:16px;display:block;"></span>';
    var opts = document.getElementById("quizOptions");
    opts.innerHTML = "";
    for (var i = 0; i < 4; i++) {
      var opt = document.createElement("div");
      opt.className = "alc-skeleton-quiz-option";
      opt.innerHTML =
        '<div class="alc-skeleton alc-skeleton-circle" style="width:28px;height:28px;flex-shrink:0;"></div>' +
        '<div class="alc-skeleton alc-skeleton-line" style="flex:1;height:14px;"></div>';
      opts.appendChild(opt);
    }
    document.getElementById("quizNextBtn").disabled = true;
  }

  function showRoadmapSkeleton() {
    var prereqList = document.getElementById("prerequisitesList");
    prereqList.innerHTML = "";
    for (var i = 0; i < 3; i++) {
      var li = document.createElement("li");
      li.className = "alc-skeleton-prereq-item";
      li.innerHTML =
        '<div class="alc-skeleton alc-skeleton-circle" style="width:22px;height:22px;flex-shrink:0;"></div>' +
        '<div class="alc-skeleton alc-skeleton-line" style="width:' +
        (50 + i * 12) +
        '%;height:14px;"></div>';
      prereqList.appendChild(li);
    }

    var pathContainer = document.getElementById("learningPathContainer");
    pathContainer.innerHTML = "";
    for (var j = 0; j < 4; j++) {
      var step = document.createElement("div");
      step.className = "alc-roadmap-step alc-skeleton-roadmap-step";
      step.innerHTML =
        '<div class="alc-roadmap-dot alc-skeleton" style="background:var(--es-gray-20);color:transparent;"></div>' +
        '<div class="alc-roadmap-card">' +
        '<div class="alc-skeleton alc-skeleton-line" style="width:55%;height:14px;margin-bottom:0.5rem;"></div>' +
        '<div class="alc-skeleton alc-skeleton-line" style="width:85%;height:12px;"></div>' +
        "</div>";
      pathContainer.appendChild(step);
    }
  }

  function showRealWorldSkeleton() {
    var grid = document.getElementById("realWorldGrid");
    grid.innerHTML = "";
    for (var i = 0; i < 4; i++) {
      var card = document.createElement("div");
      card.className = "alc-rw-card alc-skeleton-rw-card";
      card.innerHTML =
        '<div class="alc-rw-card-header">' +
        '<div class="alc-skeleton" style="width:40px;height:40px;border-radius:var(--es-radius-sm);flex-shrink:0;"></div>' +
        '<div class="alc-skeleton alc-skeleton-line" style="width:50%;height:16px;"></div>' +
        "</div>" +
        '<div class="alc-skeleton alc-skeleton-line" style="width:100%;height:12px;margin-bottom:0.4rem;margin-top:0.85rem;"></div>' +
        '<div class="alc-skeleton alc-skeleton-line" style="width:88%;height:12px;margin-bottom:0.4rem;"></div>' +
        '<div class="alc-skeleton alc-skeleton-line" style="width:72%;height:12px;margin-bottom:0.85rem;"></div>' +
        '<div style="display:flex;gap:0.45rem;">' +
        '<div class="alc-skeleton" style="width:60px;height:22px;border-radius:999px;"></div>' +
        '<div class="alc-skeleton" style="width:70px;height:22px;border-radius:999px;"></div>' +
        '<div class="alc-skeleton" style="width:55px;height:22px;border-radius:999px;"></div>' +
        "</div>";
      grid.appendChild(card);
    }
  }

  function showCompareLevelsSkeleton() {
    var container = document.getElementById("compareLevelsGrid");
    container.innerHTML = "";
    var colors = ["#fff2e8", "#defbe6", "#edf5ff", "#ede8fe"];
    for (var i = 0; i < 4; i++) {
      var card = document.createElement("div");
      card.className = "alc-cl-card alc-cl-skeleton";
      card.style.background = colors[i];
      card.innerHTML =
        '<div class="alc-skeleton alc-skeleton-circle" style="width:52px;height:52px;margin:0 auto 1rem;"></div>' +
        '<div class="alc-skeleton alc-skeleton-line" style="width:50%;height:10px;margin:0 auto 0.6rem;"></div>' +
        '<div class="alc-skeleton alc-skeleton-line" style="width:90%;height:12px;margin-bottom:0.4rem;"></div>' +
        '<div class="alc-skeleton alc-skeleton-line" style="width:80%;height:12px;margin-bottom:0.4rem;"></div>' +
        '<div class="alc-skeleton alc-skeleton-line" style="width:70%;height:12px;margin-bottom:1rem;"></div>' +
        '<div class="alc-skeleton" style="width:100%;height:4px;border-radius:999px;"></div>';
      container.appendChild(card);
    }
  }

  // -------------------------------------------------------
  // Render feature (calls API, replaces skeleton with real data)
  // -------------------------------------------------------
  function renderFeature(feature) {
    callGenerateAPI(feature, currentContent, currentLevel).then(
      function (data) {
        switch (feature) {
          case "revision":
            renderRevisionNotes(data.revisionNotes);
            break;
          case "flashcards":
            renderFlashcards(data.flashcards);
            break;
          case "quiz":
            renderQuiz(data.quizQuestions);
            break;
          case "roadmap":
            renderRoadmap(data);
            break;
          case "realworld":
            renderRealWorld(data.sections);
            break;
          case "compare-levels":
            renderCompareLevels(data.levels);
            break;
        }
      },
    );
  }

  // -------------------------------------------------------
  // Reset
  // -------------------------------------------------------
  resetBtn.addEventListener("click", function () {
    coreOutputSection.classList.add("d-none");
    continueLearningSection.classList.add("d-none");
    closeActivePanel();
    clearAllFeaturePanels();
    clearCoreOutput();
    contentField.value = "";
    currentContent = "";
    document
      .getElementById("inputSection")
      .scrollIntoView({ behavior: "smooth", block: "start" });
    contentField.focus();
  });

  // -------------------------------------------------------
  // API layer
  // -------------------------------------------------------
  function callGenerateAPI(type, content, level) {
    var endpoint = "/api/simplify";

    if (type === "revision")      endpoint = "/api/revision-notes";
    if (type === "flashcards")    endpoint = "/api/flashcards";
    if (type === "quiz")          endpoint = "/api/quiz";
    if (type === "roadmap")       endpoint = "/api/roadmap";
    if (type === "realworld")     endpoint = "/api/realworld";
    if (type === "compare-levels") endpoint = "/api/compare-levels";

    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content, level: level }),
    }).then(function (response) {
      if (!response.ok) throw new Error("Request Failed");
      return response.json();
    });
  }

  // -------------------------------------------------------
  // Render: Core output
  // -------------------------------------------------------
  function renderCoreOutput(data) {
    document.getElementById("simplifiedExplanation").textContent =
      data.simplifiedExplanation;
    document.getElementById("summaryText").textContent = data.summary;
    explanationLevelBadge.innerHTML =
      '<i class="fa-solid fa-layer-group"></i> ' +
      escapeHTML(levelLabels[currentLevel] || "Beginner");
  }

  // -------------------------------------------------------
  // Render: Revision Notes — one per row with ✓ check
  // -------------------------------------------------------
  function renderRevisionNotes(notes) {
    var list = document.getElementById("revisionNotesList");
    list.innerHTML = "";
    notes.forEach(function (note) {
      var row = document.createElement("div");
      row.className = "alc-note-row";
      row.innerHTML =
        '<div class="alc-note-check"><i class="fa-solid fa-check"></i></div>' +
        '<p class="alc-note-text">' +
        escapeHTML(note) +
        "</p>";
      list.appendChild(row);
    });
  }

  // -------------------------------------------------------
  // Render: Flashcards — single card viewer with prev/next
  // -------------------------------------------------------
  function renderFlashcards(cards) {
    fcCards = cards;
    fcIndex = 0;

    // Restore original inner HTML structure
    var inner = document.getElementById("flashcardInner");
    inner.innerHTML =
      '<div class="alc-flashcard-face alc-flashcard-front">' +
      '<span class="alc-flashcard-label"><i class="fa-regular fa-circle-question"></i> Question</span>' +
      '<p class="alc-flashcard-text" id="fcQuestion"></p>' +
      '<span class="alc-fc-tap-hint">Tap to reveal answer</span>' +
      "</div>" +
      '<div class="alc-flashcard-face alc-flashcard-back">' +
      '<span class="alc-flashcard-label"><i class="fa-solid fa-lightbulb"></i> Answer</span>' +
      '<p class="alc-flashcard-text" id="fcAnswer"></p>' +
      "</div>";

    var singleCard = document.getElementById("flashcardSingle");
    singleCard.classList.remove("alc-flipped");

    showFlashcard(0);

    singleCard.onclick = function () {
      singleCard.classList.toggle("alc-flipped");
    };

    document.getElementById("fcPrevBtn").onclick = function () {
      if (fcIndex > 0) {
        fcIndex--;
        singleCard.classList.remove("alc-flipped");
        showFlashcard(fcIndex);
      }
    };
    document.getElementById("fcNextBtn").onclick = function () {
      if (fcIndex < fcCards.length - 1) {
        fcIndex++;
        singleCard.classList.remove("alc-flipped");
        showFlashcard(fcIndex);
      }
    };
  }

  function showFlashcard(index) {
    var card = fcCards[index];
    document.getElementById("fcQuestion").textContent = card.question;
    document.getElementById("fcAnswer").textContent = card.answer;
    document.getElementById("fcCurrentNum").textContent = index + 1;
    document.getElementById("fcTotalNum").textContent = fcCards.length;

    var prevBtn = document.getElementById("fcPrevBtn");
    var nextBtn = document.getElementById("fcNextBtn");
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === fcCards.length - 1;
  }

  // -------------------------------------------------------
  // Render: Quiz Master — one question at a time
  // -------------------------------------------------------
  function renderQuiz(questions) {
    quizQuestions = questions;
    quizIndex = 0;
    quizScore = 0;
    quizAnswered = false;
    retakeData = questions;
    quizResults = [];

    document.getElementById("quizInProgress").classList.remove("d-none");
    document.getElementById("quizReport").classList.add("d-none");

    showQuizQuestion(0);

    document.getElementById("quizNextBtn").onclick = function () {
      if (!quizAnswered) return;
      quizIndex++;
      if (quizIndex < quizQuestions.length) {
        quizAnswered = false;
        showQuizQuestion(quizIndex);
      } else {
        showQuizReport();
      }
    };

    document.getElementById("retakeQuizBtn").onclick = function () {
      renderQuiz(retakeData);
    };
  }

  function showQuizQuestion(index) {
    var q = quizQuestions[index];
    var total = quizQuestions.length;
    var progress = Math.round((index / total) * 100);
    var letters = ["A", "B", "C", "D"];

    document.getElementById("quizCounter").textContent =
      "Question " + (index + 1) + " of " + total;
    document.getElementById("quizScoreLive").textContent = quizScore;
    document.getElementById("quizProgressBar").style.width = progress + "%";
    document.getElementById("quizQuestionText").textContent = q.question;

    var nextBtn = document.getElementById("quizNextBtn");
    nextBtn.disabled = true;
    nextBtn.innerHTML =
      index === total - 1
        ? 'See Results <i class="fa-solid fa-chart-bar ms-1"></i>'
        : 'Next Question <i class="fa-solid fa-arrow-right ms-1"></i>';

    var optionsContainer = document.getElementById("quizOptions");
    optionsContainer.innerHTML = "";

    q.options.forEach(function (optText, oIndex) {
      var opt = document.createElement("div");
      opt.className = "alc-quiz-option";
      opt.innerHTML =
        '<span class="alc-quiz-option-letter">' +
        letters[oIndex] +
        "</span>" +
        "<span>" +
        escapeHTML(optText) +
        "</span>";

      opt.addEventListener("click", function () {
        if (quizAnswered) return;
        quizAnswered = true;

        var allOpts = optionsContainer.querySelectorAll(".alc-quiz-option");
        allOpts.forEach(function (o) {
          o.classList.add("alc-disabled");
        });

        var isCorrect = oIndex === q.answerIndex;

        quizResults[index] = {
          question: q.question,
          correct: isCorrect,
        };

        if (isCorrect) {
          opt.classList.add("alc-correct");
          quizScore++;
          document.getElementById("quizScoreLive").textContent = quizScore;
        } else {
          opt.classList.add("alc-incorrect");
          allOpts[q.answerIndex].classList.add("alc-correct");
        }

        nextBtn.disabled = false;
      });

      optionsContainer.appendChild(opt);
    });
  }

  function showQuizReport() {
    var total = quizQuestions.length;
    var pct = total > 0 ? quizScore / total : 0;

    document.getElementById("quizInProgress").classList.add("d-none");
    document.getElementById("quizReport").classList.remove("d-none");

    var circle = document.getElementById("reportScoreCircle");
    circle.classList.remove("alc-score-great", "alc-score-mid", "alc-score-low");
    if (pct >= 0.8) circle.classList.add("alc-score-great");
    else if (pct >= 0.5) circle.classList.add("alc-score-mid");
    else circle.classList.add("alc-score-low");

    document.getElementById("reportScoreText").textContent =
      quizScore + "/" + total;

    var perf;
    if (pct >= 0.8) perf = "Excellent";
    else if (pct >= 0.6) perf = "Good";
    else if (pct >= 0.4) perf = "Fair";
    else perf = "Needs Practice";

    document.getElementById("reportHeading").textContent = "Quiz Complete!";
    document.getElementById("reportPerformance").innerHTML =
      "Performance: <strong>" + perf + "</strong>";

    var strengths = [];
    var weaknesses = [];

    quizResults.forEach(function (result) {
      if (result.correct) {
        strengths.push(result.question);
      } else {
        weaknesses.push(result.question);
      }
    });

    populateReportList("reportStrengths", strengths.slice(0, 4));
    populateReportList("reportWeaknesses", weaknesses.slice(0, 4));

    var rec;
    if (pct >= 0.8) {
      rec = "Excellent work! Try Compare Levels to explore this concept at a deeper complexity level.";
    } else if (pct >= 0.5) {
      rec = "Good effort. Revisit Revision Notes to reinforce the areas where you hesitated, then retake.";
    } else {
      rec = "Review the Simplified Explanation again, then work through Flashcards before retaking the quiz.";
    }
    document.getElementById("recText").textContent = rec;
  }

  function populateReportList(id, items) {
    var list = document.getElementById(id);
    list.innerHTML = "";
    if (items.length === 0) {
      var li = document.createElement("li");
      li.textContent = "None in this attempt";
      list.appendChild(li);
      return;
    }
    items.forEach(function (text) {
      var li = document.createElement("li");
      li.textContent = text;
      list.appendChild(li);
    });
  }

  // -------------------------------------------------------
  // Render: Learning Roadmap (merged prerequisites + steps)
  // -------------------------------------------------------
  function renderRoadmap(data) {
    renderPrerequisites(data.prerequisites);
    renderLearningPath(data.learningJourney);
  }

  function renderPrerequisites(items) {
    var list = document.getElementById("prerequisitesList");
    list.innerHTML = "";
    items.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "alc-prereq-item";
      li.innerHTML =
        '<div class="alc-prereq-check">' +
          '<i class="fa-solid fa-check"></i>' +
        "</div>" +
        '<div class="alc-prereq-title">' +
          escapeHTML(item) +
        "</div>";
      list.appendChild(li);
    });
  }

  function renderLearningPath(steps) {
    var container = document.getElementById("learningPathContainer");
    container.innerHTML = "";
    steps.forEach(function (step, index) {
      var el = document.createElement("div");
      el.className = "alc-roadmap-step";
      el.innerHTML =
        '<div class="alc-roadmap-dot">' +
        (index + 1) +
        "</div>" +
        '<div class="alc-roadmap-card">' +
        '<h4 class="alc-roadmap-title">' +
        escapeHTML(step.title) +
        "</h4>" +
        '<p class="alc-roadmap-desc">' +
        escapeHTML(step.description) +
        "</p>" +
        "</div>";
      container.appendChild(el);
    });
  }

  // -------------------------------------------------------
  // Render: Real World Explorer
  // -------------------------------------------------------
  function renderRealWorld(sections) {
    var grid = document.getElementById("realWorldGrid");
    grid.innerHTML = "";
    sections.forEach(function (section) {
      var card = document.createElement("div");
      card.className = "alc-rw-card";

      var industriesHTML = section.industries
        .map(function (tag) {
          return '<span class="alc-rw-tag">' + escapeHTML(tag) + "</span>";
        })
        .join("");

      card.innerHTML =
        '<div class="alc-rw-card-header">' +
        '<div class="alc-rw-icon" style="background:' + section.color + '">' +
        '<i class="fa-solid ' + section.icon + '"></i>' +
        "</div>" +
        '<h4 class="alc-rw-title">' + escapeHTML(section.title) + "</h4>" +
        "</div>" +
        '<p class="alc-rw-text">' + escapeHTML(section.text) + "</p>" +
        '<div class="alc-rw-industries">' + industriesHTML + "</div>";

      grid.appendChild(card);
    });
  }

  // -------------------------------------------------------
  // Render: Compare Levels — Learning Progression Layout
  // -------------------------------------------------------
  var levelMeta = {
    child: {
      cls: "alc-cl-child",
      connectorCls: "alc-cl-connector-child",
      complexityWidth: "20%",
      complexityColor: "#ff832b",
      complexityLabel: "Introductory",
      dots: 1,
    },
    beginner: {
      cls: "alc-cl-beginner",
      connectorCls: "alc-cl-connector-beginner",
      complexityWidth: "42%",
      complexityColor: "#24a148",
      complexityLabel: "Foundational",
      dots: 2,
    },
    intermediate: {
      cls: "alc-cl-intermediate",
      connectorCls: "alc-cl-connector-intermediate",
      complexityWidth: "68%",
      complexityColor: "#0f62fe",
      complexityLabel: "Intermediate",
      dots: 3,
    },
    expert: {
      cls: "alc-cl-expert",
      connectorCls: "",
      complexityWidth: "100%",
      complexityColor: "#6929c4",
      complexityLabel: "Advanced",
      dots: 4,
    },
  };

  var levelIcons = {
    child: "fa-child-reaching",
    beginner: "fa-seedling",
    intermediate: "fa-graduation-cap",
    expert: "fa-user-graduate",
  };

  function renderCompareLevels(levels) {
    var container = document.getElementById("compareLevelsGrid");
    container.innerHTML = "";

    levels.forEach(function (lvl, index) {
      var key = lvl.level.toLowerCase();
      var meta = levelMeta[key] || levelMeta["beginner"];
      var iconKey = lvl.icon
        ? lvl.icon
        : levelIcons[key] || "fa-graduation-cap";

      // Build complexity dots
      var dotsHTML = "";
      for (var d = 1; d <= 4; d++) {
        dotsHTML +=
          '<span class="alc-cl-dot' +
          (d <= meta.dots ? " alc-cl-dot-active" : "") +
          '" style="' +
          (d <= meta.dots ? "background-color:" + meta.complexityColor + ";" : "") +
          '"></span>';
      }

      var cardHTML =
        '<div class="alc-cl-card ' + meta.cls + '">' +
          '<div class="alc-cl-card-inner">' +
            '<div class="alc-cl-icon-wrap">' +
              '<i class="fa-solid ' + escapeHTML(iconKey) + '"></i>' +
            "</div>" +
            '<div class="alc-cl-header">' +
              '<span class="alc-cl-level-label">' + escapeHTML(lvl.level) + "</span>" +
              '<div class="alc-cl-complexity-row">' +
                '<span class="alc-cl-complexity-label">' + meta.complexityLabel + "</span>" +
                '<div class="alc-cl-dots">' + dotsHTML + "</div>" +
              "</div>" +
            "</div>" +
          "</div>" +
          '<div class="alc-cl-divider"></div>' +
          '<p class="alc-cl-text">' + escapeHTML(lvl.text) + "</p>" +
          '<div class="alc-cl-bar-wrap">' +
            '<div class="alc-cl-bar" style="width:' + meta.complexityWidth + ';background-color:' + meta.complexityColor + ';"></div>' +
          "</div>" +
        "</div>";

      container.insertAdjacentHTML("beforeend", cardHTML);

      // Add animated connector arrow between cards (not after last)
      if (index < levels.length - 1) {
        var connector =
          '<div class="alc-cl-connector ' + meta.connectorCls + '">' +
            '<div class="alc-cl-connector-line"></div>' +
            '<div class="alc-cl-connector-arrow">' +
              '<i class="fa-solid fa-chevron-down"></i>' +
            "</div>" +
          "</div>";
        container.insertAdjacentHTML("beforeend", connector);
      }
    });
  }

  // -------------------------------------------------------
  // Utility: safe HTML escaping
  // -------------------------------------------------------
  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});
