/* OMAD Fasting App
 * Vanilla JS, localStorage-backed.
 */

(() => {
  "use strict";

  // ---------- Constants ----------
  const STORAGE_KEY = "omad-data";
  const DATA_VERSION = 1;

  const STAGES = [
    {
      name: "Fed / Anabolic",
      startHours: 0,
      endHours: 4,
      emoji: "🍽️",
      whatHappens:
        "Your body is digesting and absorbing nutrients from your last meal. Insulin is elevated to shuttle glucose into cells; excess energy is stored as glycogen (in liver and muscle) and as fat.",
      benefits: [
        "Muscle protein synthesis is active when amino acids are available.",
        "Vitamins, minerals, and amino acids are being absorbed.",
        "Liver and muscle glycogen stores are being topped up.",
      ],
    },
    {
      name: "Early Fasting",
      startHours: 4,
      endHours: 12,
      emoji: "⏳",
      whatHappens:
        "Insulin gradually declines. Your body uses circulating glucose, then begins drawing on stored liver glycogen to keep blood sugar steady. Gluconeogenesis ramps up.",
      benefits: [
        "Insulin levels normalize, which over time can support insulin sensitivity.",
        "Your digestive system gets a rest.",
        "Blood sugar stabilizes; fed-state cravings tend to fade.",
      ],
    },
    {
      name: "Metabolic Switch",
      startHours: 12,
      endHours: 18,
      emoji: "🔄",
      whatHappens:
        "Liver glycogen is significantly depleted (commonly 60–80% by 12–16h), and your body shifts toward burning more fat for fuel. Low-level ketone production begins.",
      benefits: [
        "Fat oxidation rises as glycogen runs low.",
        "Insulin stays low, which supports fat mobilization.",
        "A small rise in norepinephrine can support alertness.",
        "Many people notice steadier, calmer energy in this window.",
      ],
    },
    {
      name: "Ketogenesis Rising",
      startHours: 18,
      endHours: 24,
      emoji: "🧠",
      whatHappens:
        "With glycogen largely depleted, your liver produces meaningful amounts of ketone bodies (BHB, acetoacetate). For many people, blood BHB crosses 0.5 mmol/L in this window — the threshold often called nutritional ketosis.",
      benefits: [
        "Brain begins using ketones as a supplemental fuel alongside glucose.",
        "Many people report mental clarity and steady focus.",
        "Hunger hormones (e.g., ghrelin) often calm down.",
        "Inflammation markers may begin to decline.",
      ],
    },
    {
      name: "Sustained Ketosis",
      startHours: 24,
      endHours: Infinity,
      emoji: "🔥",
      whatHappens:
        "Glycogen is essentially depleted; you're running on fat and ketones. BHB typically continues to rise toward 1–2 mmol/L. Growth hormone secretion is elevated. Autophagy markers may begin to increase, though robust human evidence for autophagy mostly comes from longer fasts (~48h+).",
      benefits: [
        "Established ketosis — steady, fat-derived energy.",
        "Growth hormone is elevated, which can help preserve lean mass.",
        "Insulin sensitivity continues to improve over time.",
        "Many people report particularly smooth focus and mood.",
      ],
    },
  ];

  const BOOST_MESSAGES = [
    { emoji: "💧", text: "Drink a glass of water — sometimes thirst masquerades as hunger. You've got this." },
    { emoji: "🌊", text: "Hunger comes in waves. This one will pass in 15–20 minutes. Ride it out." },
    { emoji: "💪", text: "You're not weak — your hunger hormones are doing their job. Acknowledge them and keep going." },
    { emoji: "🚶", text: "Step outside or move your body for 5 minutes. Cravings often vanish with a little distraction." },
    { emoji: "☕", text: "Brew a tea or black coffee (no sugar). Warmth + a little caffeine works wonders." },
    { emoji: "✨", text: "Every minute past hour 16 is when the good stuff happens. You're earning it." },
    { emoji: "🍽️", text: "Picture how good your one meal is going to taste. The wait makes it better." },
    { emoji: "⏰", text: "If you eat now, the clock starts over. Future you wants this win." },
    { emoji: "🎯", text: "Boredom is not hunger. Find something engaging to do for the next 30 minutes." },
    { emoji: "🌬️", text: "Stress eating? Take 5 slow, deep breaths first. You'd be surprised how much it helps." },
    { emoji: "🔥", text: "Your body is burning fat right now. Don't interrupt the fire." },
    { emoji: "🏔️", text: "You've already done the hard part. The next few hours are downhill." },
    { emoji: "🧠", text: "Cravings are not commands. You're in charge here." },
    { emoji: "🍋", text: "Try sparkling water with a squeeze of lemon. Trust me." },
    { emoji: "🧂", text: "Feeling off? A pinch of salt in water can fix a lot. Electrolytes matter." },
  ];

  const TIPS = [
    { emoji: "🧂", text: "Salt your meal liberally. Fasting depletes sodium fast — it's the #1 cause of headaches and fatigue." },
    { emoji: "🥑", text: "Eat enough fat at your meal — avocado, olive oil, nuts. Fat keeps you satiated through the long stretch." },
    { emoji: "🥩", text: "Hit your protein target first. Aim for ~0.7–1g per pound of goal body weight to protect muscle." },
    { emoji: "🍽️", text: "Don't undereat at your meal. OMAD works because of when you eat, not how little. Eat to true satiety." },
    { emoji: "🏋️", text: "Lift weights 2–4× a week. OMAD plus resistance training is how you stay lean, not skinny-fat." },
    { emoji: "😴", text: "Sleep is the silent multiplier. Under 7 hours spikes ghrelin and tanks willpower the next day." },
    { emoji: "💧", text: "Drink water all day — about half your body weight in ounces. Add a pinch of salt if you feel off." },
    { emoji: "🍵", text: "Black coffee, plain tea, sparkling water, and bone broth (for long fasts) won't break your fast." },
    { emoji: "🚫", text: "Avoid sweeteners during the fast. Even zero-calorie ones can trigger insulin and cravings for some." },
    { emoji: "📋", text: "Plan your meal before hour 16. Decision fatigue late in the day is how junk food sneaks in." },
    { emoji: "🚶", text: "Walk 10–15 minutes after your meal. Lowers your glucose response and helps digestion." },
    { emoji: "📈", text: "Track more than the scale — measurements, photos, energy, sleep, mood. Bodies don't change linearly." },
    { emoji: "🌊", text: "Hunger comes in waves of 15–20 minutes. It's not a steady climb — ride the wave and it passes." },
    { emoji: "🧪", text: "A tablespoon of apple cider vinegar in water can blunt hunger and steady blood sugar." },
    { emoji: "🩹", text: "Don't fast through illness. Your body needs nutrients to repair. Pause without guilt." },
    { emoji: "🍳", text: "Break a long fast with protein + fat first. Carbs and big meals on an empty stomach can wreck you." },
    { emoji: "🗓️", text: "Refeed days help. Once every 1–2 weeks, eat at maintenance to keep your metabolism honest." },
    { emoji: "🌙", text: "No caffeine after 2pm. Sleep is your fasting superpower — don't trade it for an afternoon coffee." },
    { emoji: "🍷", text: "Alcohol hits hard on an empty stomach. Eat first, drink second — and budget the calories." },
    { emoji: "🎉", text: "At social events, pre-decide your move: eat with them, skip and sip, or eat early. Don't wing it." },
    { emoji: "⏱️", text: "Slow down at your meal. Give your body 20 minutes to register fullness before going back for more." },
    { emoji: "🧠", text: "After 2–3 weeks, hunger between meals genuinely fades. You're not broken if it's hard at first — you're adapting." },
  ];

  // ---------- Storage ----------
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { currentFast: null, history: [], version: DATA_VERSION };
      const data = JSON.parse(raw);
      if (!data.history) data.history = [];
      if (!("currentFast" in data)) data.currentFast = null;
      return data;
    } catch (e) {
      console.warn("Failed to load data; starting fresh.", e);
      return { currentFast: null, history: [], version: DATA_VERSION };
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save data:", e);
      showToast("Failed to save — storage may be full.");
    }
  }

  let state = loadData();

  // ---------- Helpers ----------
  function uuid() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }

  function pad2(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function formatHMS(ms) {
    if (ms < 0) ms = 0;
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return pad2(h) + ":" + pad2(m) + ":" + pad2(s);
  }

  function formatDuration(ms) {
    if (ms < 0) ms = 0;
    const totalMin = Math.floor(ms / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h === 0) return m + "m";
    if (m === 0) return h + "h";
    return h + "h " + m + "m";
  }

  function formatShortDuration(ms) {
    if (ms < 60000) return Math.floor(ms / 1000) + "s";
    if (ms < 3600000) return Math.floor(ms / 60000) + "m";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return m === 0 ? h + "h" : h + "h " + m + "m";
  }

  function formatDateTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatDateOnly(iso) {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getStageForElapsed(ms) {
    const hours = ms / 3600000;
    for (let i = 0; i < STAGES.length; i++) {
      const s = STAGES[i];
      if (hours >= s.startHours && hours < s.endHours) {
        return { ...s, index: i };
      }
    }
    return { ...STAGES[STAGES.length - 1], index: STAGES.length - 1 };
  }

  // ---------- Toast ----------
  let toastTimer = null;
  function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  // ---------- DOM refs ----------
  const $ = (id) => document.getElementById(id);

  const refs = {
    idleCard: $("idle-card"),
    fastingCard: $("fasting-card"),
    timerDisplay: $("timer-display"),
    startedAt: $("started-at"),
    stagesList: $("stages-list"),
    btnStart: $("btn-start"),
    btnEnd: $("btn-end"),
    btnEditStart: $("btn-edit-start"),
    btnSaveStart: $("btn-save-start"),
    editModal: $("edit-modal"),
    editStartInput: $("edit-start-input"),
    lastFastSummary: $("last-fast-summary"),
    historyList: $("history-list"),
    historyEmpty: $("history-empty"),
    historyStats: $("history-stats"),
    btnExport: $("btn-export"),
    btnImport: $("btn-import"),
    importFile: $("import-file"),
    btnBoost: $("btn-boost"),
    btnTips: $("btn-tips"),
    deckModal: $("deck-modal"),
    deckTitle: $("deck-title"),
    deckEmoji: $("deck-emoji"),
    deckText: $("deck-text"),
    btnDeckAnother: $("btn-deck-another"),
    editHistoryModal: $("edit-history-modal"),
    editHistoryStart: $("edit-history-start"),
    editHistoryEnd: $("edit-history-end"),
    editHistoryDuration: $("edit-history-duration"),
    btnSaveHistory: $("btn-save-history"),
  };

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ---------- Rendering ----------
  let tickHandle = null;
  let lastStageIndex = -1;

  function startTicking() {
    stopTicking();
    tickHandle = setInterval(tick, 1000);
  }

  function stopTicking() {
    if (tickHandle) {
      clearInterval(tickHandle);
      tickHandle = null;
    }
  }

  function tick() {
    if (!state.currentFast) return;
    const start = new Date(state.currentFast.startTime).getTime();
    const elapsed = Date.now() - start;
    refs.timerDisplay.textContent = formatHMS(elapsed);
    const stage = getStageForElapsed(elapsed);
    if (stage.index !== lastStageIndex) {
      renderStagesList(stage.index);
      lastStageIndex = stage.index;
      // gentle motivational nudge on stage advance (skip the very first render)
      if (lastStageIndex > 0) {
        showToast("New stage: " + stage.emoji + " " + stage.name);
      }
    }
    updateCurrentStageProgress(elapsed, stage);
    updateUpcomingCountdowns(elapsed);
  }

  function updateCurrentStageProgress(elapsedMs, stage) {
    const currentRow = refs.stagesList.querySelector(".stage-row.current");
    if (!currentRow) return;

    if (stage.endHours === Infinity) {
      const past = currentRow.querySelector(".stage-time-past");
      if (past) {
        past.textContent =
          formatShortDuration(elapsedMs - stage.startHours * 3600000) + " past 24h";
      }
      return;
    }

    const fill = currentRow.querySelector(".stage-progress-fill");
    const timeIn = currentRow.querySelector(".stage-time-in");
    const timeNext = currentRow.querySelector(".stage-time-next");
    if (!fill || !timeIn || !timeNext) return;

    const stageStartMs = stage.startHours * 3600000;
    const stageEndMs = stage.endHours * 3600000;
    const intoStage = elapsedMs - stageStartMs;
    const stageLength = stageEndMs - stageStartMs;
    const pct = Math.min(100, Math.max(0, (intoStage / stageLength) * 100));
    fill.style.width = pct.toFixed(1) + "%";
    timeIn.textContent = formatShortDuration(intoStage) + " in";
    const remaining = stageEndMs - elapsedMs;
    timeNext.textContent = formatShortDuration(remaining) + " to next stage";
  }

  function formatStartsIn(remainingMs) {
    if (remainingMs <= 0) return "starting…";
    if (remainingMs < 60000) return "soon";
    if (remainingMs < 3600000) {
      return "in " + Math.floor(remainingMs / 60000) + "m";
    }
    return "in " + Math.round(remainingMs / 3600000) + "h";
  }

  function updateUpcomingCountdowns(elapsedMs) {
    refs.stagesList.querySelectorAll(".stage-countdown").forEach((el) => {
      const startH = parseFloat(el.dataset.startHours);
      if (isNaN(startH)) return;
      const remaining = startH * 3600000 - elapsedMs;
      el.textContent = "· " + formatStartsIn(remaining);
    });
  }

  function renderStagesList(currentIndex) {
    // Preserve which non-current rows the user manually toggled open.
    const openState = new Map();
    refs.stagesList.querySelectorAll("details.stage-row").forEach((d, i) => {
      openState.set(i, d.open);
    });

    refs.stagesList.innerHTML = "";

    const elapsedNow = state.currentFast
      ? Date.now() - new Date(state.currentFast.startTime).getTime()
      : 0;

    STAGES.forEach((s, i) => {
      const isCompleted = i < currentIndex;
      const isCurrent = i === currentIndex;
      const isUpcoming = i > currentIndex;
      const rangeLabel =
        s.endHours === Infinity
          ? s.startHours + "h+"
          : s.startHours + "–" + s.endHours + "h";

      const details = document.createElement("details");
      details.className = "stage-row";
      details.dataset.index = String(i);
      if (isCompleted) details.classList.add("completed");
      if (isCurrent) details.classList.add("current");
      // Auto-open the current stage. Preserve user's manual open state for others.
      if (isCurrent || openState.get(i) === true) details.open = true;

      let metaHtml = escapeHtml(rangeLabel);
      if (isUpcoming) {
        const remaining = s.startHours * 3600000 - elapsedNow;
        metaHtml +=
          ' <span class="stage-countdown" data-start-hours="' +
          s.startHours +
          '">· ' +
          escapeHtml(formatStartsIn(remaining)) +
          "</span>";
      }

      const summary = document.createElement("summary");
      summary.className = "stage-summary";
      summary.innerHTML =
        '<span class="stage-dot">' +
        (isCompleted ? "✓" : escapeHtml(s.emoji)) +
        "</span>" +
        '<span class="stage-row-info">' +
        '<span class="stage-row-name">' +
        escapeHtml(s.name) +
        (isCurrent ? ' <span class="now-pill">NOW</span>' : "") +
        "</span>" +
        '<span class="stage-row-meta">' +
        metaHtml +
        "</span>" +
        "</span>" +
        '<span class="stage-row-chevron" aria-hidden="true">›</span>';

      let contentHtml = "";
      if (isCurrent) {
        if (s.endHours === Infinity) {
          contentHtml +=
            '<div class="stage-progress-final">' +
            '<span class="stage-time-past">0m past 24h</span>' +
            "</div>";
        } else {
          contentHtml +=
            '<div class="stage-progress">' +
            '<div class="stage-progress-bar"><div class="stage-progress-fill"></div></div>' +
            '<div class="stage-progress-meta">' +
            '<span class="stage-time-in">0m in</span>' +
            '<span class="stage-time-next">— to next</span>' +
            "</div>" +
            "</div>";
        }
      }
      contentHtml +=
        '<div class="stage-what"><span class="stage-eyebrow">What\'s happening</span>' +
        "<p>" +
        escapeHtml(s.whatHappens) +
        "</p></div>" +
        '<div class="stage-benefits-block">' +
        '<span class="stage-eyebrow">Benefits at this stage</span>' +
        '<ul class="stage-benefits">' +
        s.benefits.map((b) => "<li>" + escapeHtml(b) + "</li>").join("") +
        "</ul>" +
        "</div>";

      const content = document.createElement("div");
      content.className = "stage-content";
      content.innerHTML = contentHtml;

      details.appendChild(summary);
      details.appendChild(content);
      refs.stagesList.appendChild(details);
    });
  }

  function renderFasting() {
    refs.idleCard.classList.add("hidden");
    refs.fastingCard.classList.remove("hidden");
    const start = new Date(state.currentFast.startTime).getTime();
    const elapsed = Date.now() - start;
    refs.timerDisplay.textContent = formatHMS(elapsed);
    refs.startedAt.textContent = formatDateTime(state.currentFast.startTime);
    const stage = getStageForElapsed(elapsed);
    // Force a fresh render of the list (e.g., on view-switch or visibility change)
    lastStageIndex = -1;
    renderStagesList(stage.index);
    lastStageIndex = stage.index;
    updateCurrentStageProgress(elapsed, stage);
    updateUpcomingCountdowns(elapsed);
    startTicking();
  }

  function renderIdle() {
    stopTicking();
    refs.fastingCard.classList.add("hidden");
    refs.idleCard.classList.remove("hidden");
    if (state.history.length > 0) {
      const last = state.history[state.history.length - 1];
      refs.lastFastSummary.innerHTML =
        "Last fast: <strong>" +
        formatDuration(last.durationMs) +
        "</strong> &middot; ended " +
        formatDateTime(last.endTime);
    } else {
      refs.lastFastSummary.innerHTML = "";
    }
  }

  function renderTimerView() {
    if (state.currentFast) {
      renderFasting();
    } else {
      renderIdle();
    }
  }

  function renderHistoryView() {
    const list = refs.historyList;
    list.innerHTML = "";
    if (state.history.length === 0) {
      refs.historyEmpty.classList.remove("hidden");
      refs.historyStats.classList.add("hidden");
      return;
    }
    refs.historyEmpty.classList.add("hidden");
    refs.historyStats.classList.remove("hidden");

    // Stats
    const total = state.history.length;
    const totalMs = state.history.reduce((a, f) => a + f.durationMs, 0);
    const avgMs = Math.round(totalMs / total);
    const longest = state.history.reduce((a, f) => Math.max(a, f.durationMs), 0);

    refs.historyStats.innerHTML =
      '<div class="history-stat"><div class="history-stat-value">' +
      total +
      '</div><div class="history-stat-label">Fasts</div></div>' +
      '<div class="history-stat"><div class="history-stat-value">' +
      formatShortDuration(avgMs) +
      '</div><div class="history-stat-label">Avg</div></div>' +
      '<div class="history-stat"><div class="history-stat-value">' +
      formatShortDuration(longest) +
      '</div><div class="history-stat-label">Longest</div></div>';

    // List (newest first)
    [...state.history]
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .forEach((f) => {
        const stage = getStageForElapsed(f.durationMs);
        const item = document.createElement("div");
        item.className = "history-item";
        item.innerHTML =
          '<div class="history-item-main">' +
          '<div class="history-item-date">' +
          formatDateOnly(f.startTime) +
          "</div>" +
          '<div class="history-item-meta">' +
          new Date(f.startTime).toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          }) +
          " → " +
          new Date(f.endTime).toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          }) +
          '<span class="history-item-stage-badge">' +
          stage.emoji +
          " " +
          stage.name +
          "</span>" +
          "</div>" +
          "</div>" +
          '<div class="history-item-duration">' +
          formatDuration(f.durationMs) +
          "</div>";

        const actions = document.createElement("div");
        actions.className = "history-item-actions";

        const editBtn = document.createElement("button");
        editBtn.className = "history-item-edit";
        editBtn.setAttribute("aria-label", "Edit this fast");
        editBtn.title = "Edit";
        editBtn.textContent = "✎";
        editBtn.addEventListener("click", () => openEditHistory(f.id));
        actions.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.className = "history-item-delete";
        delBtn.setAttribute("aria-label", "Delete this fast");
        delBtn.title = "Delete";
        delBtn.textContent = "×";
        delBtn.addEventListener("click", () => deleteFast(f.id));
        actions.appendChild(delBtn);

        item.appendChild(actions);

        list.appendChild(item);
      });
  }

  // ---------- Actions ----------
  function startFast() {
    if (state.currentFast) return;
    state.currentFast = { startTime: new Date().toISOString() };
    saveData(state);
    renderTimerView();
    showToast("Fast started 🔥");
  }

  function endFast() {
    if (!state.currentFast) return;
    const start = new Date(state.currentFast.startTime).getTime();
    const end = Date.now();
    const durationMs = end - start;
    if (durationMs < 60000) {
      if (
        !confirm(
          "This fast is less than a minute long. End and save it anyway? Cancel to keep fasting."
        )
      ) {
        return;
      }
    }
    state.history.push({
      id: uuid(),
      startTime: state.currentFast.startTime,
      endTime: new Date(end).toISOString(),
      durationMs,
    });
    state.currentFast = null;
    saveData(state);
    renderTimerView();
    renderHistoryView();
    showToast("Fast ended: " + formatDuration(durationMs));
  }

  function openEditModal() {
    if (!state.currentFast) return;
    const d = new Date(state.currentFast.startTime);
    refs.editStartInput.value = toLocalDatetimeInput(d);
    refs.editModal.classList.remove("hidden");
    setTimeout(() => refs.editStartInput.focus(), 50);
  }

  function closeEditModal() {
    refs.editModal.classList.add("hidden");
  }

  function saveEditedStart() {
    const v = refs.editStartInput.value;
    if (!v) {
      showToast("Pick a valid date & time.");
      return;
    }
    const newStart = new Date(v);
    if (isNaN(newStart.getTime())) {
      showToast("Invalid date.");
      return;
    }
    if (newStart.getTime() > Date.now()) {
      showToast("Start time can't be in the future.");
      return;
    }
    state.currentFast.startTime = newStart.toISOString();
    saveData(state);
    closeEditModal();
    renderFasting();
    showToast("Start time updated");
  }

  function deleteFast(id) {
    if (!confirm("Delete this fast from your history?")) return;
    state.history = state.history.filter((f) => f.id !== id);
    saveData(state);
    renderHistoryView();
    if (!state.currentFast) renderIdle(); // refresh "last fast" summary
    showToast("Fast deleted");
  }

  // ---------- Edit history item ----------
  let editingHistoryId = null;

  function openEditHistory(id) {
    const item = state.history.find((f) => f.id === id);
    if (!item) return;
    editingHistoryId = id;
    if (refs.editHistoryStart) {
      refs.editHistoryStart.value = toLocalDatetimeInput(new Date(item.startTime));
    }
    if (refs.editHistoryEnd) {
      refs.editHistoryEnd.value = toLocalDatetimeInput(new Date(item.endTime));
    }
    updateEditHistoryDuration();
    if (refs.editHistoryModal) refs.editHistoryModal.classList.remove("hidden");
    setTimeout(() => {
      if (refs.editHistoryStart) refs.editHistoryStart.focus();
    }, 50);
  }

  function closeEditHistory() {
    editingHistoryId = null;
    if (refs.editHistoryModal) refs.editHistoryModal.classList.add("hidden");
  }

  function updateEditHistoryDuration() {
    const display = refs.editHistoryDuration;
    if (!display) return;
    const startVal = refs.editHistoryStart ? refs.editHistoryStart.value : "";
    const endVal = refs.editHistoryEnd ? refs.editHistoryEnd.value : "";
    if (!startVal || !endVal) {
      display.textContent = "Duration: —";
      display.classList.remove("error");
      return;
    }
    const start = new Date(startVal);
    const end = new Date(endVal);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      display.textContent = "Invalid date";
      display.classList.add("error");
      return;
    }
    const dur = end.getTime() - start.getTime();
    if (dur <= 0) {
      display.textContent = "End must be after start";
      display.classList.add("error");
      return;
    }
    display.textContent = "Duration: " + formatDuration(dur);
    display.classList.remove("error");
  }

  function saveEditedHistory() {
    if (!editingHistoryId) return;
    const startVal = refs.editHistoryStart ? refs.editHistoryStart.value : "";
    const endVal = refs.editHistoryEnd ? refs.editHistoryEnd.value : "";
    if (!startVal || !endVal) {
      showToast("Pick both start and end times.");
      return;
    }
    const start = new Date(startVal);
    const end = new Date(endVal);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      showToast("Invalid date.");
      return;
    }
    const dur = end.getTime() - start.getTime();
    if (dur <= 0) {
      showToast("End must be after start.");
      return;
    }
    const item = state.history.find((f) => f.id === editingHistoryId);
    if (!item) {
      closeEditHistory();
      return;
    }
    item.startTime = start.toISOString();
    item.endTime = end.toISOString();
    item.durationMs = dur;
    saveData(state);
    closeEditHistory();
    renderHistoryView();
    if (!state.currentFast) renderIdle(); // refresh "last fast" summary
    showToast("Fast updated");
  }

  // ---------- Export / Import ----------
  function exportData() {
    try {
      const payload = {
        version: DATA_VERSION,
        exportedAt: new Date().toISOString(),
        currentFast: state.currentFast,
        history: state.history,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const datePart = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = "omad-backup-" + datePart + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("Backup downloaded");
    } catch (err) {
      console.error("Export failed:", err);
      showToast("Export failed");
    }
  }

  function triggerImport() {
    refs.importFile.click();
  }

  function isValidIso(s) {
    return typeof s === "string" && !isNaN(new Date(s).getTime());
  }

  function validateBackup(data) {
    if (!data || typeof data !== "object") return "File is not a JSON object.";
    if (data.history != null && !Array.isArray(data.history)) {
      return "history must be an array.";
    }
    if (data.currentFast != null) {
      if (typeof data.currentFast !== "object") {
        return "currentFast must be null or an object.";
      }
      if (!isValidIso(data.currentFast.startTime)) {
        return "currentFast.startTime is missing or not a valid date.";
      }
    }
    if (Array.isArray(data.history)) {
      for (let i = 0; i < data.history.length; i++) {
        const h = data.history[i];
        if (!h || typeof h !== "object") {
          return "history[" + i + "] is not an object.";
        }
        if (!isValidIso(h.startTime)) {
          return "history[" + i + "].startTime is invalid.";
        }
        if (!isValidIso(h.endTime)) {
          return "history[" + i + "].endTime is invalid.";
        }
        if (typeof h.durationMs !== "number" || h.durationMs < 0) {
          return "history[" + i + "].durationMs is invalid.";
        }
      }
    }
    return null; // valid
  }

  function normalizeImported(data) {
    return {
      version: DATA_VERSION,
      currentFast: data.currentFast || null,
      history: (Array.isArray(data.history) ? data.history : []).map((h) => ({
        id: h.id || uuid(),
        startTime: h.startTime,
        endTime: h.endTime,
        durationMs: h.durationMs,
      })),
    };
  }

  function describeBackup(data) {
    const histCount = Array.isArray(data.history) ? data.history.length : 0;
    const fastsLabel = histCount + " fast" + (histCount === 1 ? "" : "s");
    const currentLabel = data.currentFast ? " + 1 in-progress fast" : "";
    return fastsLabel + " in history" + currentLabel;
  }

  function handleImportFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const err = validateBackup(data);
        if (err) {
          alert("This file isn't a valid OMAD backup.\n\n" + err);
          return;
        }
        const summary = describeBackup(data);
        const ok = confirm(
          "Restore this backup?\n\n" +
            summary +
            "\n\nThis will REPLACE all current data on this device."
        );
        if (!ok) return;
        state = normalizeImported(data);
        saveData(state);
        lastStageIndex = -1;
        renderTimerView();
        renderHistoryView();
        showToast("Backup restored");
      } catch (parseErr) {
        console.error("Import failed:", parseErr);
        alert("Failed to read file. Make sure it's a JSON backup.");
      } finally {
        // Reset so importing the same file again works
        e.target.value = "";
      }
    };
    reader.onerror = () => {
      alert("Could not read the file.");
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  // ---------- Deck (Boost / Tips popup) ----------
  const deckState = {
    items: [],
    lastIndex: -1,
    title: "",
  };

  function pickRandomItem() {
    if (!deckState.items.length) return null;
    if (deckState.items.length === 1) return deckState.items[0];
    let i;
    do {
      i = Math.floor(Math.random() * deckState.items.length);
    } while (i === deckState.lastIndex);
    deckState.lastIndex = i;
    return deckState.items[i];
  }

  function renderDeckItem(item) {
    if (!item) return;
    if (refs.deckEmoji) refs.deckEmoji.textContent = item.emoji;
    if (refs.deckText) refs.deckText.textContent = item.text;
    if (refs.deckTitle) refs.deckTitle.textContent = deckState.title;
  }

  function openDeck(mode) {
    if (mode === "tips") {
      deckState.items = TIPS;
      deckState.title = "💡 Tip";
    } else {
      deckState.items = BOOST_MESSAGES;
      deckState.title = "💪 Boost";
    }
    deckState.lastIndex = -1;
    renderDeckItem(pickRandomItem());
    if (refs.deckModal) refs.deckModal.classList.remove("hidden");
  }

  function closeDeck() {
    if (refs.deckModal) refs.deckModal.classList.add("hidden");
  }

  function showAnother() {
    renderDeckItem(pickRandomItem());
  }

  // datetime-local needs YYYY-MM-DDTHH:MM in local time
  function toLocalDatetimeInput(d) {
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mi = pad2(d.getMinutes());
    return yyyy + "-" + mm + "-" + dd + "T" + hh + ":" + mi;
  }

  // ---------- View switching ----------
  function switchView(name) {
    document.querySelectorAll(".tab").forEach((tab) => {
      const active = tab.dataset.view === name;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    document.querySelectorAll(".view").forEach((view) => {
      const active = view.id === "view-" + name;
      view.classList.toggle("active", active);
      view.hidden = !active;
    });
    if (name === "history") renderHistoryView();
    if (name === "timer") renderTimerView();
  }

  // ---------- Wire up ----------
  function init() {
    refs.btnStart.addEventListener("click", startFast);
    refs.btnEnd.addEventListener("click", endFast);
    refs.btnEditStart.addEventListener("click", openEditModal);
    refs.btnSaveStart.addEventListener("click", saveEditedStart);
    if (refs.editStartInput) {
      refs.editStartInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          saveEditedStart();
        }
      });
    }
    refs.editModal.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", closeEditModal);
    });

    if (refs.btnExport) refs.btnExport.addEventListener("click", exportData);
    if (refs.btnImport) refs.btnImport.addEventListener("click", triggerImport);
    if (refs.importFile)
      refs.importFile.addEventListener("change", handleImportFile);

    if (refs.btnBoost) refs.btnBoost.addEventListener("click", () => openDeck("boost"));
    if (refs.btnTips) refs.btnTips.addEventListener("click", () => openDeck("tips"));
    if (refs.btnDeckAnother)
      refs.btnDeckAnother.addEventListener("click", showAnother);
    if (refs.deckModal) {
      refs.deckModal.querySelectorAll("[data-close-deck]").forEach((el) => {
        el.addEventListener("click", closeDeck);
      });
    }

    if (refs.btnSaveHistory)
      refs.btnSaveHistory.addEventListener("click", saveEditedHistory);
    [refs.editHistoryStart, refs.editHistoryEnd].forEach((el) => {
      if (!el) return;
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          saveEditedHistory();
        }
      });
    });
    if (refs.editHistoryStart)
      refs.editHistoryStart.addEventListener("input", updateEditHistoryDuration);
    if (refs.editHistoryEnd)
      refs.editHistoryEnd.addEventListener("input", updateEditHistoryDuration);
    if (refs.editHistoryModal) {
      refs.editHistoryModal
        .querySelectorAll("[data-close-edit-history]")
        .forEach((el) => {
          el.addEventListener("click", closeEditHistory);
        });
    }

    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => switchView(tab.dataset.view));
    });

    const logo = document.getElementById("app-logo");
    if (logo) {
      logo.addEventListener("click", () => switchView("timer"));
      logo.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          switchView("timer");
        }
      });
    }

    // ESC closes modals
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (refs.editModal && !refs.editModal.classList.contains("hidden")) {
        closeEditModal();
      }
      if (refs.deckModal && !refs.deckModal.classList.contains("hidden")) {
        closeDeck();
      }
      if (
        refs.editHistoryModal &&
        !refs.editHistoryModal.classList.contains("hidden")
      ) {
        closeEditHistory();
      }
    });

    // Re-render on visibility (catches drift if tab was backgrounded)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && state.currentFast) {
        renderFasting();
      }
    });

    // Sync state from other tabs
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) {
        state = loadData();
        renderTimerView();
        renderHistoryView();
      }
    });

    renderTimerView();
    renderHistoryView();
  }

  // Register service worker (PWA) and detect updates
  function showUpdateBanner() {
    const banner = document.getElementById("update-banner");
    if (!banner) return;
    banner.classList.remove("hidden");
    // Force reflow so the .show transition runs
    void banner.offsetWidth;
    banner.classList.add("show");
  }

  function hideUpdateBanner() {
    const banner = document.getElementById("update-banner");
    if (!banner) return;
    banner.classList.remove("show");
    setTimeout(() => banner.classList.add("hidden"), 300);
  }

  function wireUpdateBanner() {
    const refreshBtn = document.getElementById("btn-update-refresh");
    const dismissBtn = document.getElementById("btn-update-dismiss");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => window.location.reload());
    }
    if (dismissBtn) {
      dismissBtn.addEventListener("click", hideUpdateBanner);
    }
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      wireUpdateBanner();
      navigator.serviceWorker
        .register("service-worker.js")
        .then((reg) => {
          // If a new worker is found later, watch it install and prompt.
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New SW installed AND we already had a controller → this is an update.
                showUpdateBanner();
              }
            });
          });
          // Edge case: a worker was already waiting when we loaded.
          if (reg.waiting && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        })
        .catch((err) => {
          console.warn("SW registration failed:", err);
        });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
