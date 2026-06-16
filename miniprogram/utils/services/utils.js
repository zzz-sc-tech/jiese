// 守心小程序 - 工具函数模块
// 包含通用的计算、格式化等工具函数

const { LEVEL_EXP, STAGE_THRESHOLDS } = require('./config');

// 计算等级和阶段
function calculateLevel(exp) {
  let level = 1;
  for (let i = 0; i < LEVEL_EXP.length; i++) {
    if (exp >= LEVEL_EXP[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  let stage = 'baby';
  if (level >= STAGE_THRESHOLDS.adult.min) {
    stage = 'adult';
  } else if (level >= STAGE_THRESHOLDS.grow.min) {
    stage = 'grow';
  }

  const currentLevelExp = LEVEL_EXP[level - 1] || 0;
  const nextLevelExp = level < 30 ? LEVEL_EXP[level] : LEVEL_EXP[29];
  const levelProgress = level < 30
    ? (exp - currentLevelExp) / (nextLevelExp - currentLevelExp)
    : 1;

  return {
    level,
    stage,
    currentExp: exp,
    nextLevelExp: nextLevelExp,
    levelProgress: Math.min(1, Math.max(0, levelProgress))
  };
}

// 格式化时长秒数
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}秒`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}时${m}分`;
  if (m > 0) return `${m}分${s}秒`;
  return `${m}分`;
}

// 格式化时长（短格式）
function formatDurationShort(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}时${m}分`;
  return `${m}分`;
}

// 计算单个目标的打卡统计
function calcGoalStat(goalId, checkins) {
  const goalCheckins = checkins
    .filter(c => c.goalId === goalId)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (goalCheckins.length === 0) {
    return { totalDays: 0, currentStreak: 0, longestStreak: 0, lastCheckinDate: '' };
  }

  // 使用唯一日期计算天数（count 类型同一天有多条记录）
  const uniqueDates = [...new Set(goalCheckins.map(c => c.date))].sort();
  const totalDays = uniqueDates.length;
  const lastCheckinDate = uniqueDates[uniqueDates.length - 1];

  // 计算连续天数（从今天或昨天往回数）
  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  let currentStreak = 0;

  const reversedDates = [...uniqueDates].reverse();
  const lastDate = reversedDates[0];

  if (lastDate === today || lastDate === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < reversedDates.length; i++) {
      const prevDate = new Date(reversedDates[i - 1]);
      const currDate = new Date(reversedDates[i]);
      const diff = (prevDate - currDate) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // 计算最长连续
  let longestStreak = 0;
  let tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    if ((curr - prev) / (1000 * 60 * 60 * 24) === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { totalDays, currentStreak, longestStreak, lastCheckinDate };
}

// 获取今日日期字符串
function getTodayStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// 获取昨日日期字符串
function getYesterdayStr() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// 检查成就
function checkAchievements(totalDays, streak, existing) {
  const { ACHIEVEMENTS } = require('./config');
  const ids = (existing || []).map(a => a.id);
  const result = [];
  for (const a of ACHIEVEMENTS) {
    const val = a.type === 'streak' ? streak : totalDays;
    if (val >= a.days && !ids.includes(a.id)) {
      result.push({ id: a.id, name: a.name, desc: a.desc, unlockedAt: new Date().toISOString() });
    }
  }
  return result;
}

// 获取实际打卡天数（去重）
function getActualCheckinDaysFrom(checkins) {
  const uniqueDates = new Set(checkins.map(c => c.date));
  return uniqueDates.size;
}

// 随机选择语录
function getRandomQuote() {
  const { QUOTES } = require('./config');
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

module.exports = {
  calculateLevel,
  formatDuration,
  formatDurationShort,
  calcGoalStat,
  getTodayStr,
  getYesterdayStr,
  checkAchievements,
  getActualCheckinDaysFrom,
  getRandomQuote
};
