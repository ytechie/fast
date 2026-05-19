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

  // Tags the user can apply to a fast to personalize stage timing.
  // offsetHours is added to elapsed time when computing which stage they're in:
  //   positive = pushes stages later (carbs slow ketosis)
  //   negative = pulls stages earlier (low-carb meal or activity accelerates)
  // Numbers are intentionally rough estimates; the impact strings are what the
  // user sees on the chips and chip badges.
  const MEAL_TAGS = [
    { id: "low_carb", emoji: "🥗", label: "Light, low-carb", offsetHours: -2,  impact: "ketosis ~2h sooner" },
    { id: "carby",    emoji: "🍕", label: "Big or carby",    offsetHours: 2.5, impact: "ketosis ~2–3h later" },
    { id: "dessert",  emoji: "🍦", label: "Sugar / dessert", offsetHours: 3.5, impact: "ketosis ~3–4h later" },
  ];

  const ACTIVITY_TAGS = [
    { id: "walk",    emoji: "🚶", label: "Walked 30+ min", offsetHours: -1.5, impact: "next stage ~1–2h sooner" },
    { id: "workout", emoji: "💪", label: "Workout",        offsetHours: -2.5, impact: "next stage ~2–3h sooner" },
  ];

  // Day-level notes that flag what kind of day this was. These do not shift the
  // stage timeline — they're for the user's own record-keeping.
  const NOTE_TAGS = [
    { id: "cheat_day", emoji: "🍩", label: "Cheat day", impact: "off-routine day" },
  ];

  // Drinks consumed during the eating window. These do shift the timeline
  // (alcohol pauses ketogenesis while the liver metabolizes it).
  const DRINK_TAGS = [
    { id: "alcohol", emoji: "🍷", label: "Alcohol", offsetHours: 2, impact: "ketosis ~2h later" },
  ];

  function getMealTag(id) {
    if (!id) return null;
    return MEAL_TAGS.find((t) => t.id === id) || null;
  }

  function getActivityTag(id) {
    if (!id) return null;
    return ACTIVITY_TAGS.find((t) => t.id === id) || null;
  }

  function getNoteTag(id) {
    if (!id) return null;
    return NOTE_TAGS.find((t) => t.id === id) || null;
  }

  function getDrinkTag(id) {
    if (!id) return null;
    return DRINK_TAGS.find((t) => t.id === id) || null;
  }


  // ---------- Storage ----------
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { currentFast: null, history: [], lastBackupAt: null, version: DATA_VERSION };
      const data = JSON.parse(raw);
      if (!data.history) data.history = [];
      if (!("currentFast" in data)) data.currentFast = null;
      if (!("lastBackupAt" in data)) data.lastBackupAt = null;
      return data;
    } catch (e) {
      console.warn("Failed to load data; starting fresh.", e);
      return { currentFast: null, history: [], lastBackupAt: null, version: DATA_VERSION };
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

  // Sum of all tag offsets for a given fast (meal + activities). Used to shift
  // the stage timeline. See MEAL_TAGS / ACTIVITY_TAGS for semantics.
  function getFastOffsetHours(fast) {
    if (!fast || !fast.tags) return 0;
    let total = 0;
    const meal = getMealTag(fast.tags.meal);
    if (meal) total += meal.offsetHours;
    const drink = getDrinkTag(fast.tags.drink);
    if (drink) total += drink.offsetHours;
    if (Array.isArray(fast.tags.activities)) {
      fast.tags.activities.forEach((a) => {
        const act = getActivityTag(a && a.id);
        if (act) total += act.offsetHours;
      });
    }
    return total;
  }

  // Find which stage the user is in given raw elapsed ms and their tag offset.
  // Returns the stage with its shifted wall-clock boundaries attached.
  function getStageForFast(rawElapsedMs, offsetHours) {
    const shifted = computeShiftedStages(offsetHours);
    const hours = (rawElapsedMs < 0 ? 0 : rawElapsedMs) / 3600000;
    for (let i = 0; i < STAGES.length; i++) {
      const sh = shifted[i];
      if (hours >= sh.startH && hours < sh.endH) {
        return {
          ...STAGES[i],
          index: i,
          shiftedStartH: sh.startH,
          shiftedEndH: sh.endH,
        };
      }
    }
    const last = STAGES.length - 1;
    return {
      ...STAGES[last],
      index: last,
      shiftedStartH: shifted[last].startH,
      shiftedEndH: shifted[last].endH,
    };
  }

  // Compute the displayed (wall-clock) hour ranges for each stage given the
  // active fast's offset. Stages are monotonic from 0 — when an offset is
  // applied, upper boundaries shift but each stage still starts exactly where
  // the previous one ended. Positive offsets stretch the early stages (a heavy
  // meal keeps you in Fed longer); negative offsets compress them.
  function computeShiftedStages(offsetHours) {
    const out = [];
    let prevEnd = 0;
    STAGES.forEach((s) => {
      const startH = prevEnd;
      let endH;
      if (s.endHours === Infinity) {
        endH = Infinity;
      } else {
        endH = Math.max(startH, s.endHours + offsetHours);
      }
      out.push({ startH, endH });
      if (endH !== Infinity) prevEnd = endH;
    });
    return out;
  }

  // Format an hour count for stage range labels. Integers stay clean; shifted
  // values render with one decimal (e.g. 15.5).
  function formatStageHour(h) {
    if (h <= 0) return "0";
    return h % 1 === 0 ? String(h) : h.toFixed(1);
  }


  // ---------- Streaks & milestones ----------
  // A day "counts" toward a streak if a completed fast ended on that local
  // calendar day. The currently-active fast (if any) also keeps today's spot
  // warm, so the streak isn't broken just because the user is mid-fast.
  function getLocalDateKey(d) {
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date)) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function getCountedDaysSet(history, currentFast) {
    const set = new Set();
    history.forEach((f) => {
      const key = getLocalDateKey(f.endTime || f.startTime);
      if (key) set.add(key);
    });
    if (currentFast) set.add(getLocalDateKey(new Date()));
    return set;
  }

  function getStreakInfo(history, currentFast) {
    const days = getCountedDaysSet(history, currentFast);
    if (days.size === 0) return { current: 0, longest: 0 };

    // Current streak: walk back from today.
    let current = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (days.has(getLocalDateKey(cursor))) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    }
    // If today isn't in the set but yesterday is, count from yesterday so the
    // streak doesn't read "0" all morning before a fast finishes.
    if (current === 0) {
      cursor = new Date();
      cursor.setHours(0, 0, 0, 0);
      cursor.setDate(cursor.getDate() - 1);
      while (days.has(getLocalDateKey(cursor))) {
        current++;
        cursor.setDate(cursor.getDate() - 1);
      }
    }

    // Longest streak ever: scan the sorted day set.
    const sorted = [...days].sort();
    let longest = 0;
    let run = 0;
    let prev = null;
    sorted.forEach((key) => {
      const d = new Date(key + "T00:00:00");
      if (prev) {
        const diff = Math.round((d - prev) / 86400000);
        if (diff === 1) run++;
        else run = 1;
      } else {
        run = 1;
      }
      if (run > longest) longest = run;
      prev = d;
    });
    return { current, longest };
  }

  // Badges the user can earn. Each has `earned(stats)` → boolean.
  const MILESTONES = [
    { id: "first",      emoji: "🥇", label: "First fast",     check: (s) => s.total >= 1 },
    { id: "ten",        emoji: "🔟", label: "10 fasts",       check: (s) => s.total >= 10 },
    { id: "fifty",      emoji: "🎖️", label: "50 fasts",       check: (s) => s.total >= 50 },
    { id: "hundred",    emoji: "💯", label: "100 fasts",      check: (s) => s.total >= 100 },
    { id: "fivehundred",emoji: "🏆", label: "500 fasts",      check: (s) => s.total >= 500 },
    { id: "hit18",      emoji: "⏰", label: "First 18h fast", check: (s) => s.longestMs >= 18 * 3600000 },
    { id: "hit20",      emoji: "🧠", label: "First 20h fast", check: (s) => s.longestMs >= 20 * 3600000 },
    { id: "hit24",      emoji: "🔥", label: "First 24h fast", check: (s) => s.longestMs >= 24 * 3600000 },
    { id: "hit36",      emoji: "💪", label: "First 36h fast", check: (s) => s.longestMs >= 36 * 3600000 },
    { id: "hit48",      emoji: "🏔️", label: "First 48h fast", check: (s) => s.longestMs >= 48 * 3600000 },
    { id: "streak3",    emoji: "🔥", label: "3-day streak",   check: (s) => s.longestStreak >= 3 },
    { id: "streak7",    emoji: "🔥", label: "7-day streak",   check: (s) => s.longestStreak >= 7 },
    { id: "streak14",   emoji: "🔥", label: "14-day streak",  check: (s) => s.longestStreak >= 14 },
    { id: "streak30",   emoji: "🔥", label: "30-day streak",  check: (s) => s.longestStreak >= 30 },
  ];


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
    idleTimerBlock: $("idle-timer-block"),
    idleTimerDisplay: $("idle-timer-display"),
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
    backupStatus: $("backup-status"),
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
    tagsModal: $("tags-modal"),
    tagsModalBody: $("tags-modal-body"),
    fastTagsRow: $("active-fast-tags"),
    btnOpenTags: $("btn-open-tags"),
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
    if (state.currentFast) {
      const start = new Date(state.currentFast.startTime).getTime();
      const elapsed = Date.now() - start;
      refs.timerDisplay.textContent = formatHMS(elapsed);
      const offset = getFastOffsetHours(state.currentFast);
      const stage = getStageForFast(elapsed, offset);
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
      return;
    }

    // Idle: count up since last fast ended
    if (state.history.length > 0 && refs.idleTimerDisplay) {
      const last = state.history[state.history.length - 1];
      const since = Date.now() - new Date(last.endTime).getTime();
      refs.idleTimerDisplay.textContent = formatHMS(since);
    }
  }

  function updateCurrentStageProgress(rawElapsedMs, stage) {
    const currentRow = refs.stagesList.querySelector(".stage-row.current");
    if (!currentRow) return;

    if (stage.shiftedEndH === Infinity) {
      const past = currentRow.querySelector(".stage-time-past");
      if (past) {
        const beyond = rawElapsedMs - stage.shiftedStartH * 3600000;
        past.textContent =
          formatShortDuration(beyond < 0 ? 0 : beyond) +
          " past " + formatStageHour(stage.shiftedStartH) + "h";
      }
      return;
    }

    const fill = currentRow.querySelector(".stage-progress-fill");
    const timeIn = currentRow.querySelector(".stage-time-in");
    const timeNext = currentRow.querySelector(".stage-time-next");
    if (!fill || !timeIn || !timeNext) return;

    const stageStartMs = stage.shiftedStartH * 3600000;
    const stageEndMs = stage.shiftedEndH * 3600000;
    const intoStage = rawElapsedMs - stageStartMs;
    const stageLength = stageEndMs - stageStartMs;
    const pct = stageLength > 0
      ? Math.min(100, Math.max(0, (intoStage / stageLength) * 100))
      : 100;
    fill.style.width = pct.toFixed(1) + "%";
    timeIn.textContent = formatShortDuration(intoStage < 0 ? 0 : intoStage) + " in";
    const remaining = stageEndMs - rawElapsedMs;
    timeNext.textContent =
      formatShortDuration(remaining < 0 ? 0 : remaining) + " to next stage";
  }

  function formatStartsIn(remainingMs) {
    if (remainingMs <= 0) return "starting…";
    if (remainingMs < 60000) return "soon";
    if (remainingMs < 3600000) {
      return "in " + Math.floor(remainingMs / 60000) + "m";
    }
    return "in " + Math.round(remainingMs / 3600000) + "h";
  }

  function updateUpcomingCountdowns(rawElapsedMs) {
    refs.stagesList.querySelectorAll(".stage-countdown").forEach((el) => {
      const startH = parseFloat(el.dataset.startHours);
      if (isNaN(startH)) return;
      const remaining = startH * 3600000 - rawElapsedMs;
      el.textContent = "· " + formatStartsIn(remaining);
    });
  }

  // Compute the displayed (wall-clock) hour ranges for each stage given the
  // active fast's offset. Stages are monotonic from 0 — when an offset is
  // applied, upper boundaries shift but each stage still starts exactly where
  // the previous one ended. Positive offsets stretch the early stages (a heavy
  // meal keeps you in Fed longer); negative offsets compress them.
  function computeShiftedStages(offsetHours) {
    const out = [];
    let prevEnd = 0;
    STAGES.forEach((s) => {
      const startH = prevEnd;
      let endH;
      if (s.endHours === Infinity) {
        endH = Infinity;
      } else {
        endH = Math.max(startH, s.endHours + offsetHours);
      }
      out.push({ startH, endH });
      if (endH !== Infinity) prevEnd = endH;
    });
    return out;
  }

  function renderStagesList(currentIndex) {
    // Preserve which non-current rows the user manually toggled open.
    const openState = new Map();
    refs.stagesList.querySelectorAll("details.stage-row").forEach((d, i) => {
      openState.set(i, d.open);
    });

    refs.stagesList.innerHTML = "";

    const offsetHours = state.currentFast
      ? getFastOffsetHours(state.currentFast)
      : 0;
    const rawElapsedNow = state.currentFast
      ? Date.now() - new Date(state.currentFast.startTime).getTime()
      : 0;
    const shifted = computeShiftedStages(offsetHours);

    STAGES.forEach((s, i) => {
      const isCompleted = i < currentIndex;
      const isCurrent = i === currentIndex;
      const isUpcoming = i > currentIndex;
      const sh = shifted[i];
      const rangeLabel =
        sh.endH === Infinity
          ? formatStageHour(sh.startH) + "h+"
          : formatStageHour(sh.startH) + "–" + formatStageHour(sh.endH) + "h";

      const details = document.createElement("details");
      details.className = "stage-row";
      details.dataset.index = String(i);
      if (isCompleted) details.classList.add("completed");
      if (isCurrent) details.classList.add("current");
      // Auto-open the current stage. Preserve user's manual open state for others.
      if (isCurrent || openState.get(i) === true) details.open = true;

      let metaHtml = escapeHtml(rangeLabel);
      if (isUpcoming) {
        const remaining = sh.startH * 3600000 - rawElapsedNow;
        metaHtml +=
          ' <span class="stage-countdown" data-start-hours="' +
          sh.startH +
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
    const offset = getFastOffsetHours(state.currentFast);
    const stage = getStageForFast(elapsed, offset);
    // Force a fresh render of the list (e.g., on view-switch or visibility change)
    lastStageIndex = -1;
    renderStagesList(stage.index);
    lastStageIndex = stage.index;
    updateCurrentStageProgress(elapsed, stage);
    updateUpcomingCountdowns(elapsed);
    renderActiveFastTags();
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
      if (refs.idleTimerBlock) refs.idleTimerBlock.classList.remove("hidden");
      if (refs.idleTimerDisplay) {
        const since = Date.now() - new Date(last.endTime).getTime();
        refs.idleTimerDisplay.textContent = formatHMS(since);
      }
      startTicking();
    } else {
      refs.lastFastSummary.innerHTML = "";
      if (refs.idleTimerBlock) refs.idleTimerBlock.classList.add("hidden");
    }
  }

  function renderTimerView() {
    if (state.currentFast) {
      renderFasting();
    } else {
      renderIdle();
    }
  }

  function renderMilestones(stats) {
    const card = document.getElementById("milestones-card");
    if (!card) return;
    const earned = MILESTONES.filter((m) => m.check(stats));
    if (earned.length === 0) {
      card.classList.add("hidden");
      return;
    }
    card.classList.remove("hidden");
    const grid = card.querySelector(".milestones-grid");
    if (!grid) return;
    grid.innerHTML = MILESTONES.map((m) => {
      const isEarned = m.check(stats);
      return (
        '<div class="milestone' + (isEarned ? " earned" : " locked") +
        '" title="' + escapeHtml(m.label) + '">' +
        '<span class="milestone-emoji">' + escapeHtml(m.emoji) + "</span>" +
        '<span class="milestone-label">' + escapeHtml(m.label) + "</span>" +
        "</div>"
      );
    }).join("");
    const earnedCount = card.querySelector(".milestones-count");
    if (earnedCount) {
      earnedCount.textContent =
        earned.length + " of " + MILESTONES.length + " earned";
    }
  }

  function renderHistoryView() {
    renderBackupStatus();
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
    const streak = getStreakInfo(state.history, state.currentFast);

    refs.historyStats.innerHTML =
      '<div class="history-stat"><div class="history-stat-value">' +
      total +
      '</div><div class="history-stat-label">Fasts</div></div>' +
      '<div class="history-stat"><div class="history-stat-value">' +
      formatShortDuration(avgMs) +
      '</div><div class="history-stat-label">Avg</div></div>' +
      '<div class="history-stat"><div class="history-stat-value">' +
      formatShortDuration(longest) +
      '</div><div class="history-stat-label">Longest</div></div>' +
      '<div class="history-stat" title="Best ever: ' + streak.longest + ' day' +
      (streak.longest === 1 ? "" : "s") + '">' +
      '<div class="history-stat-value">🔥 ' + streak.current +
      '</div><div class="history-stat-label">Streak</div></div>';

    renderMilestones({
      total,
      longestMs: longest,
      longestStreak: streak.longest,
    });

    // List (newest first)
    [...state.history]
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .forEach((f) => {
        const offsetHours = getFastOffsetHours(f);
        const stage = getStageForFast(f.durationMs, offsetHours);
        let tagEmojis = "";
        const fastTags = f.tags || {};
        const meal = getMealTag(fastTags.meal);
        if (meal) tagEmojis += meal.emoji;
        const drink = getDrinkTag(fastTags.drink);
        if (drink) tagEmojis += drink.emoji;
        const note = getNoteTag(fastTags.note);
        if (note) tagEmojis += note.emoji;
        if (Array.isArray(fastTags.activities)) {
          fastTags.activities.forEach((a) => {
            const act = getActivityTag(a && a.id);
            if (act) tagEmojis += act.emoji;
          });
        }
        const tagsHtml = tagEmojis
          ? '<span class="history-item-tags">' + tagEmojis + "</span>"
          : "";
        const item = document.createElement("div");
        item.className = "history-item";
        item.innerHTML =
          '<div class="history-item-main">' +
          '<div class="history-item-date">' +
          formatDateOnly(f.startTime) +
          tagsHtml +
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
    const entry = {
      id: uuid(),
      startTime: state.currentFast.startTime,
      endTime: new Date(end).toISOString(),
      durationMs,
    };
    if (state.currentFast.tags) entry.tags = state.currentFast.tags;
    state.history.push(entry);
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
  function formatBackupStatus(iso) {
    if (!iso) return { text: "No backups yet — download one!", warn: true };
    const t = new Date(iso).getTime();
    if (isNaN(t)) return { text: "No backups yet — download one!", warn: true };
    const ms = Date.now() - t;
    const days = Math.floor(ms / 86400000);
    let text;
    if (days <= 0) text = "Last backup: today";
    else if (days === 1) text = "Last backup: yesterday";
    else if (days < 30) text = "Last backup: " + days + " days ago";
    else if (days < 60) text = "Last backup: about a month ago";
    else {
      const months = Math.round(days / 30);
      text = "Last backup: " + months + " months ago";
    }
    return { text, warn: days >= 14 };
  }

  function renderBackupStatus() {
    if (!refs.backupStatus) return;
    const status = formatBackupStatus(state.lastBackupAt);
    refs.backupStatus.textContent = status.text;
    refs.backupStatus.classList.toggle("backup-warn", status.warn);
  }

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
      state.lastBackupAt = payload.exportedAt;
      saveData(state);
      renderBackupStatus();
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
      history: (Array.isArray(data.history) ? data.history : []).map((h) => {
        const out = {
          id: h.id || uuid(),
          startTime: h.startTime,
          endTime: h.endTime,
          durationMs: h.durationMs,
        };
        if (h.tags && typeof h.tags === "object") out.tags = h.tags;
        return out;
      }),
      lastBackupAt: isValidIso(data.exportedAt) ? data.exportedAt : null,
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

  // ---------- Tags modal (combined meal + activity) ----------
  function formatTimeOfDay(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function buildTagChip(tag, opts) {
    const selected = !!(opts && opts.selected);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag-chip-btn" + (selected ? " selected" : "");
    btn.innerHTML =
      '<span class="tag-chip-emoji">' + escapeHtml(tag.emoji) + "</span>" +
      '<span class="tag-chip-text">' +
      '<span class="tag-chip-label">' + escapeHtml(tag.label) + "</span>" +
      '<span class="tag-chip-impact">' + escapeHtml(tag.impact) + "</span>" +
      "</span>" +
      (selected ? '<span class="tag-chip-check" aria-hidden="true">✓</span>' : "");
    if (selected) btn.setAttribute("aria-pressed", "true");
    btn.addEventListener("click", opts && opts.onClick);
    return btn;
  }

  function openTagsModal() {
    if (!refs.tagsModal) return;
    if (!state.currentFast) return;
    renderTagsModalBody();
    refs.tagsModal.classList.remove("hidden");
  }

  function closeTagsModal() {
    if (refs.tagsModal) refs.tagsModal.classList.add("hidden");
  }

  function renderTagsModalBody() {
    if (!refs.tagsModalBody || !state.currentFast) return;
    const tags = state.currentFast.tags || {};
    refs.tagsModalBody.innerHTML = "";

    // --- Last meal section (single-select; tap again to deselect) ---
    const mealSection = document.createElement("div");
    mealSection.className = "tag-section";
    mealSection.innerHTML = '<div class="tag-section-eyebrow">Last meal</div>';
    const mealOptions = document.createElement("div");
    mealOptions.className = "tag-chip-options";
    MEAL_TAGS.forEach((tag) => {
      const isSelected = tags.meal === tag.id;
      mealOptions.appendChild(
        buildTagChip(tag, {
          selected: isSelected,
          onClick: () => toggleMealTag(tag.id),
        })
      );
    });
    mealSection.appendChild(mealOptions);
    refs.tagsModalBody.appendChild(mealSection);

    // --- Drinks section (single-select; alcohol shifts the timeline) ---
    const drinkSection = document.createElement("div");
    drinkSection.className = "tag-section";
    drinkSection.innerHTML = '<div class="tag-section-eyebrow">Drinks</div>';
    const drinkOptions = document.createElement("div");
    drinkOptions.className = "tag-chip-options";
    DRINK_TAGS.forEach((tag) => {
      const isSelected = tags.drink === tag.id;
      drinkOptions.appendChild(
        buildTagChip(tag, {
          selected: isSelected,
          onClick: () => toggleDrinkTag(tag.id),
        })
      );
    });
    drinkSection.appendChild(drinkOptions);
    refs.tagsModalBody.appendChild(drinkSection);

    // --- Day note section (single-select; no timeline impact) ---
    const noteSection = document.createElement("div");
    noteSection.className = "tag-section";
    noteSection.innerHTML = '<div class="tag-section-eyebrow">Day note</div>';
    const noteOptions = document.createElement("div");
    noteOptions.className = "tag-chip-options";
    NOTE_TAGS.forEach((tag) => {
      const isSelected = tags.note === tag.id;
      noteOptions.appendChild(
        buildTagChip(tag, {
          selected: isSelected,
          onClick: () => toggleNoteTag(tag.id),
        })
      );
    });
    noteSection.appendChild(noteOptions);
    refs.tagsModalBody.appendChild(noteSection);

    // --- Log an activity section ---
    const actSection = document.createElement("div");
    actSection.className = "tag-section";
    actSection.innerHTML =
      '<div class="tag-section-eyebrow">Log an activity</div>';
    const actOptions = document.createElement("div");
    actOptions.className = "tag-chip-options";
    ACTIVITY_TAGS.forEach((tag) => {
      actOptions.appendChild(
        buildTagChip(tag, { onClick: () => addActivityTag(tag.id) })
      );
    });
    actSection.appendChild(actOptions);
    refs.tagsModalBody.appendChild(actSection);

    // --- Logged activities (with remove buttons) ---
    const activities = Array.isArray(tags.activities) ? tags.activities : [];
    if (activities.length > 0) {
      const loggedSection = document.createElement("div");
      loggedSection.className = "tag-section";
      loggedSection.innerHTML =
        '<div class="tag-section-eyebrow">Logged</div>';
      const list = document.createElement("ul");
      list.className = "logged-activities";
      activities.forEach((a, idx) => {
        const act = getActivityTag(a && a.id);
        if (!act) return;
        const li = document.createElement("li");
        li.className = "logged-activity";
        li.innerHTML =
          '<span class="logged-activity-emoji">' + escapeHtml(act.emoji) + "</span>" +
          '<span class="logged-activity-label">' + escapeHtml(act.label) +
          '<span class="logged-activity-time"> · ' + escapeHtml(formatTimeOfDay(a.at)) + "</span>" +
          "</span>";
        const rm = document.createElement("button");
        rm.type = "button";
        rm.className = "logged-activity-remove";
        rm.setAttribute("aria-label", "Remove " + act.label);
        rm.title = "Remove";
        rm.textContent = "×";
        rm.addEventListener("click", () => removeActivity(idx));
        li.appendChild(rm);
        list.appendChild(li);
      });
      loggedSection.appendChild(list);
      refs.tagsModalBody.appendChild(loggedSection);
    }
  }

  function toggleMealTag(id) {
    if (!state.currentFast) return;
    if (!state.currentFast.tags) state.currentFast.tags = {};
    if (state.currentFast.tags.meal === id) {
      // Tap the currently-selected chip to deselect.
      delete state.currentFast.tags.meal;
      saveData(state);
      renderFasting();
      renderTagsModalBody();
      showToast("Meal tag removed");
      return;
    }
    state.currentFast.tags.meal = id;
    saveData(state);
    renderFasting();
    renderTagsModalBody();
    const tag = getMealTag(id);
    if (tag) showToast(tag.emoji + " " + tag.impact);
  }

  function toggleDrinkTag(id) {
    if (!state.currentFast) return;
    if (!state.currentFast.tags) state.currentFast.tags = {};
    if (state.currentFast.tags.drink === id) {
      delete state.currentFast.tags.drink;
      saveData(state);
      renderFasting();
      renderTagsModalBody();
      showToast("Drink tag removed");
      return;
    }
    state.currentFast.tags.drink = id;
    saveData(state);
    renderFasting();
    renderTagsModalBody();
    const tag = getDrinkTag(id);
    if (tag) showToast(tag.emoji + " " + tag.impact);
  }

  function toggleNoteTag(id) {
    if (!state.currentFast) return;
    if (!state.currentFast.tags) state.currentFast.tags = {};
    if (state.currentFast.tags.note === id) {
      delete state.currentFast.tags.note;
      saveData(state);
      renderFasting();
      renderTagsModalBody();
      showToast("Day note removed");
      return;
    }
    state.currentFast.tags.note = id;
    saveData(state);
    renderFasting();
    renderTagsModalBody();
    const tag = getNoteTag(id);
    if (tag) showToast(tag.emoji + " " + tag.label);
  }

  function addActivityTag(id) {
    if (!state.currentFast) return;
    if (!state.currentFast.tags) state.currentFast.tags = {};
    if (!Array.isArray(state.currentFast.tags.activities)) {
      state.currentFast.tags.activities = [];
    }
    state.currentFast.tags.activities.push({
      id,
      at: new Date().toISOString(),
    });
    saveData(state);
    renderFasting();
    renderTagsModalBody();
    const tag = getActivityTag(id);
    if (tag) showToast(tag.emoji + " " + tag.impact);
  }

  function removeActivity(index) {
    if (!state.currentFast || !state.currentFast.tags) return;
    const activities = state.currentFast.tags.activities;
    if (!Array.isArray(activities) || index < 0 || index >= activities.length) return;
    const removed = activities[index];
    activities.splice(index, 1);
    if (activities.length === 0) delete state.currentFast.tags.activities;
    saveData(state);
    renderFasting();
    renderTagsModalBody();
    const tag = removed && getActivityTag(removed.id);
    showToast("Removed" + (tag ? ": " + tag.emoji + " " + tag.label : ""));
  }

  function renderActiveFastTags() {
    if (!refs.fastTagsRow) return;
    const fast = state.currentFast;
    if (!fast) {
      refs.fastTagsRow.innerHTML = "";
      refs.fastTagsRow.classList.add("hidden");
      return;
    }
    const tags = fast.tags || {};
    const chips = [];
    const meal = getMealTag(tags.meal);
    if (meal) {
      chips.push(
        '<span class="fast-tag" title="' + escapeHtml(meal.impact) + '">' +
          escapeHtml(meal.emoji) + " " + escapeHtml(meal.label) +
          ' <span class="fast-tag-impact">· ' + escapeHtml(meal.impact) + "</span>" +
          "</span>"
      );
    }
    const drink = getDrinkTag(tags.drink);
    if (drink) {
      chips.push(
        '<span class="fast-tag" title="' + escapeHtml(drink.impact) + '">' +
          escapeHtml(drink.emoji) + " " + escapeHtml(drink.label) +
          ' <span class="fast-tag-impact">· ' + escapeHtml(drink.impact) + "</span>" +
          "</span>"
      );
    }
    const note = getNoteTag(tags.note);
    if (note) {
      chips.push(
        '<span class="fast-tag" title="' + escapeHtml(note.impact) + '">' +
          escapeHtml(note.emoji) + " " + escapeHtml(note.label) +
          "</span>"
      );
    }
    if (Array.isArray(tags.activities)) {
      tags.activities.forEach((a) => {
        const act = getActivityTag(a && a.id);
        if (!act) return;
        chips.push(
          '<span class="fast-tag" title="' + escapeHtml(act.impact) + '">' +
            escapeHtml(act.emoji) + " " + escapeHtml(act.label) +
            ' <span class="fast-tag-impact">· ' + escapeHtml(act.impact) + "</span>" +
            "</span>"
        );
      });
    }
    if (chips.length === 0) {
      refs.fastTagsRow.innerHTML = "";
      refs.fastTagsRow.classList.add("hidden");
    } else {
      refs.fastTagsRow.innerHTML = chips.join("");
      refs.fastTagsRow.classList.remove("hidden");
    }
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

    if (refs.btnOpenTags)
      refs.btnOpenTags.addEventListener("click", openTagsModal);
    if (refs.tagsModal) {
      refs.tagsModal.querySelectorAll("[data-close-tags]").forEach((el) => {
        el.addEventListener("click", closeTagsModal);
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
      if (
        refs.tagsModal &&
        !refs.tagsModal.classList.contains("hidden")
      ) {
        closeTagsModal();
      }
    });

    // Re-render on visibility (catches drift if tab was backgrounded)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) return;
      if (state.currentFast) {
        renderFasting();
      } else {
        renderIdle();
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

  // Register service worker (PWA) and detect updates.
  // Update strategy: silent. When a new version is ready, we wait until the
  // user backgrounds the app and then brings it back to the foreground, then
  // reload. This way they never see a flash mid-interaction and always come
  // back to the latest version.
  let updatePending = false;
  let wasHidden = false;

  function scheduleSilentReload() {
    if (updatePending) return;
    updatePending = true;
  }

  function wireSilentReload() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        wasHidden = true;
        return;
      }
      if (
        document.visibilityState === "visible" &&
        wasHidden &&
        updatePending
      ) {
        // Returned from background with an update waiting → refresh quietly.
        window.location.reload();
      }
    });
  }

  // ---------- Install prompt (Android native + iOS instructions) ----------
  const INSTALL_DISMISS_KEY = "omad-install-dismissed-at";
  const INSTALL_DISMISS_DAYS = 14;
  let deferredInstallPrompt = null;

  function isStandalone() {
    return (
      (window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true
    );
  }

  function isIosSafari() {
    const ua = window.navigator.userAgent || "";
    const isIos =
      /iPad|iPhone|iPod/.test(ua) ||
      // iPadOS 13+ reports as Mac; disambiguate via touch
      (ua.includes("Mac") && "ontouchend" in document);
    if (!isIos) return false;
    // Exclude in-app browsers (FB, Instagram, etc.) where Add-to-Home-Screen doesn't work
    const isInAppBrowser = /FBAN|FBAV|Instagram|Line|Twitter|GSA\//.test(ua);
    if (isInAppBrowser) return false;
    // Exclude Chrome on iOS (which is WebKit but no A2HS)
    if (/CriOS|FxiOS|EdgiOS/.test(ua)) return false;
    return true;
  }

  function installRecentlyDismissed() {
    try {
      const at = parseInt(localStorage.getItem(INSTALL_DISMISS_KEY) || "0", 10);
      if (!at) return false;
      const days = (Date.now() - at) / (1000 * 60 * 60 * 24);
      return days < INSTALL_DISMISS_DAYS;
    } catch {
      return false;
    }
  }

  function markInstallDismissed() {
    try {
      localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
    } catch {}
  }

  function showInstallBanner(label) {
    const banner = document.getElementById("install-banner");
    if (!banner) return;
    if (label) {
      const text = banner.querySelector(".update-banner-text");
      if (text) text.textContent = label;
    }
    banner.classList.remove("hidden");
    void banner.offsetWidth;
    banner.classList.add("show");
  }

  function hideInstallBanner() {
    const banner = document.getElementById("install-banner");
    if (!banner) return;
    banner.classList.remove("show");
    setTimeout(() => banner.classList.add("hidden"), 300);
  }

  function openIosInstallModal() {
    const modal = document.getElementById("ios-install-modal");
    if (modal) modal.classList.remove("hidden");
  }

  function closeIosInstallModal() {
    const modal = document.getElementById("ios-install-modal");
    if (modal) modal.classList.add("hidden");
  }

  function wireInstallPrompt() {
    const dismissBtn = document.getElementById("btn-install-dismiss");
    const actionBtn = document.getElementById("btn-install-action");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        markInstallDismissed();
        hideInstallBanner();
      });
    }
    if (actionBtn) {
      actionBtn.addEventListener("click", async () => {
        if (deferredInstallPrompt) {
          // Native (Android / Chromium desktop) install flow
          hideInstallBanner();
          try {
            deferredInstallPrompt.prompt();
            const choice = await deferredInstallPrompt.userChoice;
            if (choice && choice.outcome !== "accepted") {
              markInstallDismissed();
            }
          } catch (e) {
            console.warn("install prompt failed", e);
          }
          deferredInstallPrompt = null;
        } else {
          // iOS — open instructions
          openIosInstallModal();
        }
      });
    }

    const iosModal = document.getElementById("ios-install-modal");
    if (iosModal) {
      iosModal.querySelectorAll("[data-close-ios-install]").forEach((el) => {
        el.addEventListener("click", () => {
          closeIosInstallModal();
          markInstallDismissed();
          hideInstallBanner();
        });
      });
    }

    // Android / desktop Chromium path
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (isStandalone() || installRecentlyDismissed()) return;
      // Brief delay so it's not the very first thing users see
      setTimeout(() => showInstallBanner("📲 Install OMAD as an app"), 2500);
    });

    // Hide if installed during the session
    window.addEventListener("appinstalled", () => {
      hideInstallBanner();
      deferredInstallPrompt = null;
    });

    // iOS Safari path — no native event, so show our own banner
    if (isIosSafari() && !isStandalone() && !installRecentlyDismissed()) {
      setTimeout(
        () => showInstallBanner("📲 Add OMAD to your Home Screen"),
        2500
      );
    }
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      wireSilentReload();
      wireInstallPrompt();
      navigator.serviceWorker
        .register("service-worker.js")
        .then((reg) => {
          // If a new worker is found later, watch it install and schedule a reload.
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New SW installed AND we already had a controller → this is an update.
                scheduleSilentReload();
              }
            });
          });
          // Edge case: a worker was already waiting when we loaded.
          if (reg.waiting && navigator.serviceWorker.controller) {
            scheduleSilentReload();
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
