// 守心小程序 - 挑战服务模块
// 包含挑战的创建、查询、进度计算等功能

const storage = require('../storage');
const { CHALLENGE_MEDALS } = require('./config');
const { getTodayStr } = require('./utils');

// ========== 内部数据操作 ==========
function getGoals() {
  return storage.get('jiese_goals', []);
}

function getCheckins() {
  return storage.get('jiese_checkins', []);
}

function getChallenges() {
  return storage.get('jiese_challenges', []);
}

function saveChallenges(list) {
  storage.set('jiese_challenges', list);
}

function getDurationSessions() {
  return storage.get('jiese_duration_sessions', []);
}

// 计算挑战进度
function calculateChallengeProgress(challenge, goals, checkins, sessions) {
  const goal = goals.find(g => g.id === challenge.goalId);
  if (!goal) {
    return { ...challenge, completedDays: 0, progress: 0, status: 'failed' };
  }

  const startDate = new Date(challenge.startDate);
  const now = new Date();
  const today = getTodayStr();

  // 根据目标类型计算完成天数
  let completedDays = 0;

  if (goal.type === 'duration') {
    // 时长类型：检查每天是否有记录
    const goalSessions = sessions.filter(s => s.goalId === goal.id);
    const uniqueDates = new Set(goalSessions.map(s => s.date));
    completedDays = uniqueDates.size;
  } else {
    // 单次/计数类型：检查每天是否有打卡
    const goalCheckins = checkins.filter(c => c.goalId === goal.id);
    const uniqueDates = new Set(goalCheckins.map(c => c.date));
    completedDays = uniqueDates.size;
  }

  const progress = Math.min(100, Math.round((completedDays / challenge.targetDays) * 100));
  const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1;

  let status = challenge.status;
  if (status === 'active') {
    if (completedDays >= challenge.targetDays) {
      status = 'completed';
    } else if (daysSinceStart > challenge.targetDays + 3) {
      // 超过目标天数+3天容错期
      status = 'failed';
    }
  }

  return {
    ...challenge,
    completedDays,
    progress,
    status,
    goalName: goal.name,
    goalIcon: goal.icon,
    goalColor: goal.color,
    daysSinceStart
  };
}

// ========== 挑战服务 ==========
const challengeService = {
  // 获取挑战列表
  async getChallenges(goalId) {
    const list = getChallenges();
    if (goalId) {
      return { code: 0, data: list.filter(c => c.goalId === goalId) };
    }
    return { code: 0, data: list };
  },

  // 创建挑战
  async createChallenge(targetDays, goalId) {
    if (!goalId) return { code: 1, message: '请选择关联目标' };
    const list = getChallenges();
    // 检查该目标是否已有活跃挑战
    const existing = list.find(c => c.goalId === goalId && c.status === 'active');
    if (existing) return { code: 1, message: '该目标已有进行中的挑战' };
    const ch = {
      _id: 'ch_' + Date.now(),
      targetDays,
      goalId,
      startDate: getTodayStr(),
      status: 'active',
      createdAt: Date.now()
    };
    list.unshift(ch);
    saveChallenges(list);
    return { code: 0, data: ch };
  },

  // 获取挑战统计
  async getChallengeStats() {
    const challenges = getChallenges();
    const goals = getGoals();
    const checkins = getCheckins();
    const sessions = getDurationSessions();
    const now = new Date();

    // 计算每个挑战的进度
    const views = challenges.map(ch => calculateChallengeProgress(ch, goals, checkins, sessions));

    // 统计数据
    const totalChallenges = views.length;
    const completedChallenges = views.filter(c => c.status === 'completed').length;
    const activeChallenges = views.filter(c => c.status === 'active').length;
    const failedChallenges = views.filter(c => c.status === 'failed').length;

    // 计算总挑战天数
    let totalChallengeDays = 0;
    views.forEach(ch => {
      if (ch.status === 'completed') {
        totalChallengeDays += ch.targetDays;
      } else if (ch.status === 'active') {
        totalChallengeDays += ch.completedDays;
      }
    });

    // 当前进行中的挑战详情
    const activeList = views.filter(c => c.status === 'active');

    return {
      code: 0,
      data: {
        totalChallenges,
        completedChallenges,
        activeChallenges,
        failedChallenges,
        totalChallengeDays,
        activeList
      }
    };
  },

  // 获取挑战勋章
  async getChallengeMedals() {
    const challenges = getChallenges();
    const goals = getGoals();
    const checkins = getCheckins();
    const sessions = getDurationSessions();

    // 计算每个挑战的进度
    const views = challenges.map(ch => calculateChallengeProgress(ch, goals, checkins, sessions));
    const completedChallenges = views.filter(c => c.status === 'completed');

    // 统计每个勋章的获得情况
    const medalMap = {};

    completedChallenges.forEach(ch => {
      const goal = goals.find(g => g.id === ch.goalId);
      const goalName = goal ? goal.name : '未知目标';
      const goalIcon = goal ? goal.icon : '🎯';

      // 按天数匹配勋章
      CHALLENGE_MEDALS.forEach(medal => {
        if (medal.id.startsWith('challenge_') && medal.days > 0 && ch.targetDays >= medal.days) {
          if (!medalMap[medal.id]) {
            medalMap[medal.id] = { ...medal, count: 0, goals: [] };
          }
          medalMap[medal.id].count++;
          medalMap[medal.id].goals.push({ goalName, goalIcon });
        }
      });

      // 完成第一个挑战
      if (!medalMap['challenge_first']) {
        medalMap['challenge_first'] = {
          ...CHALLENGE_MEDALS.find(m => m.id === 'challenge_first'),
          count: 0,
          goals: []
        };
      }
      medalMap['challenge_first'].count++;
      medalMap['challenge_first'].goals.push({ goalName, goalIcon });
    });

    // 累计完成3个和5个挑战
    if (completedChallenges.length >= 3) {
      const medal = CHALLENGE_MEDALS.find(m => m.id === 'challenge_3');
      medalMap['challenge_3'] = { ...medal, count: 1, goals: [{ goalName: '累计完成', goalIcon: '🏆' }] };
    }
    if (completedChallenges.length >= 5) {
      const medal = CHALLENGE_MEDALS.find(m => m.id === 'challenge_5');
      medalMap['challenge_5'] = { ...medal, count: 1, goals: [{ goalName: '累计完成', goalIcon: '🏆' }] };
    }

    // 只返回已获得的勋章
    const unlockedMedals = Object.values(medalMap).filter(m => m.count > 0);

    return {
      code: 0,
      data: {
        unlockedMedals,
        totalMedals: CHALLENGE_MEDALS.length,
        unlockedCount: unlockedMedals.length
      }
    };
  },

  // 获取某个目标的挑战情况
  async getGoalChallenges(goalId) {
    const challenges = getChallenges();
    const goals = getGoals();
    const goal = goals.find(g => g.id === goalId);
    const checkins = getCheckins();
    const sessions = getDurationSessions();

    const goalChallenges = challenges
      .filter(c => c.goalId === goalId)
      .map(ch => calculateChallengeProgress(ch, goals, checkins, sessions));

    const totalChallenges = goalChallenges.length;
    const completedChallenges = goalChallenges.filter(c => c.status === 'completed').length;
    const activeChallenges = goalChallenges.filter(c => c.status === 'active').length;

    return {
      code: 0,
      data: {
        goalId,
        goalName: goal ? goal.name : '',
        goalIcon: goal ? goal.icon : '',
        totalChallenges,
        completedChallenges,
        activeChallenges,
        challenges: goalChallenges
      }
    };
  },

  // 获取所有挑战勋章定义
  getChallengeMedalDefs() {
    return CHALLENGE_MEDALS;
  }
};

module.exports = challengeService;
