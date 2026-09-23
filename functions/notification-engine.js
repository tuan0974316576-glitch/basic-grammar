const DAILY_TEMPLATES = Array.from({ length: 24 }, (_, index) => ({
  id: `daily-${index + 1}`,
  title: [
    "今日一齊學少少",
    "A1 BUDDY 等緊你",
    "今日嘅短練習準備好喇",
    "畀自己幾分鐘學英文",
  ][index % 4],
  body: [
    "完成一個短練習，就可以點亮今日火焰。",
    "今日行多一步，學習習慣會愈來愈穩。",
    "揀一個未完成練習，做少少都係進步。",
    "返嚟完成今日小任務，保持學習節奏。",
    "今日仲有一個短練習等緊你。",
    "用幾分鐘溫習，為今日加上一個完成記號。",
  ][Math.floor(index / 4) % 6],
}));

const STREAK_RISK_TEMPLATES = [
  { id: "risk-1", title: "今晚仲未儲火 🔥", body: "完成一個短練習，保住你嘅連續學習紀錄。" },
  { id: "risk-2", title: "今日火焰等緊你", body: "做一個短回合，就可以延續連續學習。" },
  { id: "risk-3", title: "唔好畀今日火焰熄呀", body: "返嚟學幾分鐘，今日仍然趕得切。" },
  { id: "risk-4", title: "火焰保護時間", body: "完成一個練習，繼續保持每日學習。" },
  { id: "risk-5", title: "今日仲差一小步", body: "揀個短練習完成，延續你嘅學習習慣。" },
  { id: "risk-6", title: "今晚記得返嚟", body: "幾分鐘練習就可以保住今日火焰。" },
  { id: "risk-7", title: "連續學習等你延續", body: "今日完成一個回合，聽日再繼續。" },
  { id: "risk-8", title: "今日火焰仲有機會", body: "立即完成一個短練習，保持連續紀錄。" },
];

const ACHIEVEMENT_TEMPLATES = [
  { id: "achievement-1", title: "新里程碑達成！", body: "你嘅每日努力累積成新紀錄，入嚟睇吓啦。" },
  { id: "achievement-2", title: "學習火焰升級喇", body: "你又完成一個連續學習里程碑。" },
  { id: "achievement-3", title: "做得好，繼續保持！", body: "穩定學習已經成為你嘅好習慣。" },
  { id: "achievement-4", title: "A1 BUDDY 為你慶祝", body: "打開 App 睇返今次學習里程碑。" },
  { id: "achievement-5", title: "你嘅努力有成果喇", body: "一日一小步，今日達成咗新里程碑。" },
  { id: "achievement-6", title: "連續學習新紀錄", body: "保持呢個節奏，繼續向下一個目標出發。" },
  { id: "achievement-7", title: "今日值得慶祝", body: "你已經建立咗更穩定嘅學習習慣。" },
  { id: "achievement-8", title: "又行前一步！", body: "入嚟睇吓你最新達成嘅學習紀錄。" },
];

const WEEKLY_TEMPLATES = [
  { id: "weekly-1", title: "今個星期辛苦晒", body: "打開 A1 BUDDY，睇返今週嘅學習足跡。" },
  { id: "weekly-2", title: "每週學習小結", body: "今週嘅努力已經記錄好，入嚟睇吓啦。" },
  { id: "weekly-3", title: "回顧今個星期", body: "睇吓自己完成咗邊啲學習日，再準備新一週。" },
  { id: "weekly-4", title: "一星期又完成喇", body: "你嘅學習足跡已經整理好。" },
  { id: "weekly-5", title: "今週學習回顧", body: "打開 App，為新一週定一個小目標。" },
  { id: "weekly-6", title: "A1 BUDDY 每週總結", body: "入嚟睇返今週建立嘅學習習慣。" },
  { id: "weekly-7", title: "今週努力已記低", body: "回顧學習足跡，下一週繼續前進。" },
  { id: "weekly-8", title: "準備迎接新一週", body: "先睇返今週進度，再揀下一個練習目標。" },
];

const SOCIAL_TEMPLATES = [
  { id: "social-1", title: "班級任務有新進度", body: "返嚟一齊完成今次學習任務。" },
  { id: "social-2", title: "拍檔任務等緊你", body: "完成一個短練習，幫大家向目標前進。" },
  { id: "social-3", title: "一齊學會更有力量", body: "打開 A1 BUDDY，睇吓今次合作任務。" },
  { id: "social-4", title: "班級目標更新喇", body: "做一個練習，為共同目標加一分努力。" },
  { id: "social-5", title: "合作學習時間", body: "返嚟完成你嘅一小步，一齊保持進度。" },
  { id: "social-6", title: "今週拍檔任務", body: "一個短回合就可以推進合作任務。" },
  { id: "social-7", title: "班級任務繼續中", body: "揀一個練習完成，幫大家行前一步。" },
  { id: "social-8", title: "一齊向目標出發", body: "打開 App，繼續今次班級／拍檔任務。" },
];

function normalizeReminderMinutes(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.max(0, Math.min(1439, Math.round(parsed)))
    : 18 * 60 + 30;
}

function reminderSlots(reminderMinutes) {
  const start = normalizeReminderMinutes(reminderMinutes);
  const dangerMinute = Math.max(
    20 * 60 + 30,
    Math.min(start + 270, 22 * 60 + 30),
  );
  return {
    daily: [start, start + 90, start + 180]
      .filter((minute) => minute < dangerMinute && minute < 24 * 60),
    danger: dangerMinute,
  };
}

function dueReminderAt(minuteOfDay, reminderMinutes, windowMinutes = 15) {
  const slots = reminderSlots(reminderMinutes);
  const dailyIndex = slots.daily.findIndex(
    (minute) => minuteOfDay >= minute && minuteOfDay < minute + windowMinutes,
  );
  if (dailyIndex >= 0) return { kind: "daily", slotIndex: dailyIndex };
  if (minuteOfDay >= slots.danger && minuteOfDay < slots.danger + windowMinutes) {
    return { kind: "streakRisk", slotIndex: 0 };
  }
  return null;
}

function dateKeyDistance(fromKey, toKey) {
  const from = Date.parse(`${fromKey}T00:00:00Z`);
  const to = Date.parse(`${toKey}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return Number.POSITIVE_INFINITY;
  return Math.round((to - from) / 86400000);
}

function stableIndex(text, length) {
  let value = 0;
  for (const char of String(text || "")) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return length ? value % length : 0;
}

function pickFreshTemplate(templates, history = {}, dateKey, salt = "") {
  const available = templates.filter((template) => {
    const lastDate = String(history[template.id] || "");
    const distance = dateKeyDistance(lastDate, dateKey);
    return !lastDate || distance < 0 || distance >= 7;
  });
  const pool = available.length ? available : templates;
  return pool[stableIndex(`${salt}|${dateKey}|${pool.length}`, pool.length)];
}

function trimTemplateHistory(history = {}, dateKey) {
  return Object.fromEntries(Object.entries(history).filter(([, lastDate]) => {
    const distance = dateKeyDistance(String(lastDate || ""), dateKey);
    return distance >= 0 && distance < 8;
  }));
}

module.exports = {
  ACHIEVEMENT_TEMPLATES,
  DAILY_TEMPLATES,
  SOCIAL_TEMPLATES,
  STREAK_RISK_TEMPLATES,
  WEEKLY_TEMPLATES,
  dueReminderAt,
  normalizeReminderMinutes,
  pickFreshTemplate,
  reminderSlots,
  trimTemplateHistory,
};
