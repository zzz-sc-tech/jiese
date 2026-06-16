// 守心小程序 - 目标服务模块
// 包含目标的CRUD操作、打卡逻辑等

const storage = require('../storage');
const { GOAL_PRESETS, GOAL_TEMPLATES } = require('./config');
const { calcGoalStat, checkAchievements, getActualCheckinDaysFrom, getTodayStr, getRandomQuote } = require('./utils');

// ========== 内部数据操作 ==========
function getGoals() {
  return storage.get('jiese_goals', []);
}

function saveGoals(goals) {
  storage.set('jiese_goals', goals);
}

function getGoalStats() {
  return storage.get('jiese_goal_stats', {});
}

function saveGoalStats(stats) {
  storage.set('jiese_goal_stats', stats);
}

function getCheckins() {
  return storage.get('jiese_checkins', []);
}

function saveCheckins(list) {
  storage.set('jiese_checkins', list);
}

function getDurationSessions() {
  return storage.get('jiese_duration_sessions', []);
}

function saveDurationSessions(list) {
  storage.set('jiese_duration_sessions', list);
}

function getGlobalStats() {
  return storage.get('jiese_global_stats', {
    totalDays: 0, longestStreak: 0, achievements: []
  });
}

function saveGlobalStats(data) {
  storage.set('jiese_global_stats', data);
}

// ========== 目标服务 ==========
const goalService = {
  // 获取预设图标列表
  getGoalPresets() {
    return GOAL_PRESETS;
  },

  // 获取目标模板列表
  getGoalTemplates() {
    return GOAL_TEMPLATES;
  },

  // 获取目标模板分类
  getGoalTemplateCategories() {
    const categories = [...new Set(GOAL_TEMPLATES.map(t => t.category))];
    return categories;
  },

  // 获取打卡记录
  getCheckins() {
    return getCheckins();
  },

  // 获取总打卡次数
  getTotalCheckins() {
    return getCheckins().length;
  },

  // 获取实际打卡天数（去重）
  getActualCheckinDays() {
    return getActualCheckinDaysFrom(getCheckins());
  },

  // 创建目标
  async createGoal(name, icon, color, type, targetCount) {
    const goals = getGoals();
    const id = 'goal_' + Date.now();
    const preset = GOAL_PRESETS[goals.length % GOAL_PRESETS.length];
    const goal = {
      id,
      name: name || '新目标',
      icon: icon || preset.icon,
      color: color || preset.color,
      type: type || 'single',
      targetCount: type === 'count' ? (targetCount || 3) : 0,
      createdAt: Date.now()
    };
    goals.push(goal);
    saveGoals(goals);
    return { code: 0, data: goal };
  },

  // 更新目标
  async updateGoal(goalId, updates) {
    const goals = getGoals();
    const idx = goals.findIndex(g => g.id === goalId);
    if (idx === -1) return { code: 1, message: '目标不存在' };
    goals[idx] = { ...goals[idx], ...updates };
    saveGoals(goals);
    return { code: 0, data: goals[idx] };
  },

  // 删除目标
  async deleteGoal(goalId) {
    let goals = getGoals();
    goals = goals.filter(g => g.id !== goalId);
    saveGoals(goals);
    // 同时删除该目标的打卡记录
    let checkins = getCheckins();
    checkins = checkins.filter(c => c.goalId !== goalId);
    saveCheckins(checkins);
    // 删除时长记录
    let sessions = getDurationSessions();
    sessions = sessions.filter(s => s.goalId !== goalId);
    saveDurationSessions(sessions);
    return { code: 0 };
  },

  // 获取所有目标
  async getGoals() {
    return { code: 0, data: getGoals() };
  },

  // 对某个目标打卡（single 类型：每天一次）
  async checkin(goalId, diary = '', mood = '') {
    const today = getTodayStr();
    const checkins = getCheckins();

    // 检查该目标今日是否已打卡
    if (checkins.some(c => c.date === today && c.goalId === goalId)) {
      return { code: 1, message: '今日已打卡' };
    }

    const goals = getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { code: 2, message: '目标不存在' };

    // 记录打卡
    const checkin = { date: today, goalId, timestamp: Date.now() };
    if (diary) checkin.diary = diary;
    if (mood) checkin.mood = mood;
    checkins.push(checkin);
    saveCheckins(checkins);

    return this._afterCheckin(goal, checkins);
  },

  // count 类型打卡：每天可多次，记录次数
  async checkinCount(goalId) {
    const today = getTodayStr();
    const checkins = getCheckins();
    const goals = getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { code: 2, message: '目标不存在' };

    // 统计今日已打卡次数
    const todayCount = checkins.filter(c => c.date === today && c.goalId === goalId).length;
    if (goal.targetCount > 0 && todayCount >= goal.targetCount) {
      return { code: 1, message: `今日已完成${goal.targetCount}次` };
    }

    checkins.push({ date: today, goalId, timestamp: Date.now(), count: todayCount + 1 });
    saveCheckins(checkins);

    return this._afterCheckin(goal, checkins);
  },

  // duration 类型：保存一段时长记录
  async saveDuration(goalId, durationSeconds, startTimestamp, timerType) {
    const today = getTodayStr();
    const goals = getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { code: 2, message: '目标不存在' };

    // 保存时长会话
    const sessions = getDurationSessions();
    sessions.push({
      id: 'ses_' + Date.now(),
      goalId,
      date: today,
      duration: durationSeconds,
      timerType: timerType || 'clock',
      startTimestamp,
      endTimestamp: Date.now(),
      timestamp: Date.now()
    });
    saveDurationSessions(sessions);

    // 同时记录一条打卡（如果今天还没有打卡记录）
    const checkins = getCheckins();
    const todayHasCheckin = checkins.some(c => c.date === today && c.goalId === goalId);
    if (!todayHasCheckin) {
      checkins.push({ date: today, goalId, timestamp: Date.now() });
      saveCheckins(checkins);
    }

    return this._afterCheckin(goal, checkins);
  },

  // 打卡后的公共逻辑
  _afterCheckin(goal, checkins) {
    const goalStat = calcGoalStat(goal.id, checkins);
    const allStats = getGoalStats();
    allStats[goal.id] = goalStat;
    saveGoalStats(allStats);

    const global = getGlobalStats();
    const allGoalStats = Object.values(allStats);
    const totalDays = getActualCheckinDaysFrom(checkins);
    const goalActiveDays = allGoalStats.reduce((sum, s) => sum + s.totalDays, 0);
    const maxStreak = Math.max(0, ...allGoalStats.map(s => s.currentStreak));
    const maxLongest = Math.max(0, ...allGoalStats.map(s => s.longestStreak));
    global.totalDays = totalDays;
    global.longestStreak = Math.max(global.longestStreak || 0, maxLongest);
    const newAchievements = checkAchievements(totalDays, maxStreak, global.achievements);
    global.achievements = [...(global.achievements || []), ...newAchievements];
    saveGlobalStats(global);

    const quote = getRandomQuote();

    return {
      code: 0, message: '打卡成功',
      data: {
        goalId: goal.id,
        goalName: goal.name,
        totalDays: goalStat.totalDays,
        currentStreak: goalStat.currentStreak,
        longestStreak: goalStat.longestStreak,
        globalTotalDays: totalDays,
        quote,
        newAchievements
      }
    };
  },

  // 获取今日各目标打卡状态
  async getTodayStatus() {
    const today = getTodayStr();
    const goals = getGoals();
    const checkins = getCheckins();
    const todayCheckins = checkins.filter(c => c.date === today);
    const allStats = getGoalStats();
    const sessions = getDurationSessions();
    const todaySessions = sessions.filter(s => s.date === today);

    const goalStatuses = goals.map(goal => {
      const stat = allStats[goal.id] || { totalDays: 0, currentStreak: 0, longestStreak: 0 };
      const type = goal.type || 'single';

      if (type === 'count') {
        const todayCount = todayCheckins.filter(c => c.goalId === goal.id).length;
        return {
          ...goal, ...stat, type,
          checked: todayCount > 0,
          todayCount,
          targetCount: goal.targetCount || 3,
          countDone: goal.targetCount > 0 && todayCount >= goal.targetCount
        };
      } else if (type === 'duration') {
        const goalSessions = todaySessions.filter(s => s.goalId === goal.id);
        const todayDuration = goalSessions.reduce((sum, s) => sum + s.duration, 0);
        return {
          ...goal, ...stat, type,
          checked: todayDuration > 0,
          todayDuration,
          todayDurationStr: this._formatDuration(todayDuration),
          sessionCount: goalSessions.length
        };
      } else {
        const checked = todayCheckins.some(c => c.goalId === goal.id);
        return { ...goal, ...stat, type, checked };
      }
    });

    const allChecked = goals.length > 0 && goalStatuses.every(g => {
      if (g.type === 'count') return g.countDone;
      if (g.type === 'duration') return g.checked;
      return g.checked;
    });
    const anyChecked = goalStatuses.some(g => g.checked);

    return { code: 0, data: { goals: goalStatuses, allChecked, anyChecked } };
  },

  // 获取某个目标今日时长会话
  async getTodaySessions(goalId) {
    const today = getTodayStr();
    const sessions = getDurationSessions();
    const todaySessions = sessions.filter(s => s.date === today && s.goalId === goalId);
    const totalDuration = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    return {
      code: 0,
      data: {
        sessions: todaySessions,
        totalDuration,
        totalDurationStr: this._formatDuration(totalDuration)
      }
    };
  },

  // 格式化时长
  _formatDuration(seconds) {
    if (seconds < 60) return `${seconds}秒`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}时${m}分`;
    return `${m}分`;
  }
};

module.exports = goalService;
