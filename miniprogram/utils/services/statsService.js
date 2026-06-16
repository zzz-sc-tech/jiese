// 守心小程序 - 统计服务模块
// 包含统计数据、时长分析、计数分析等功能

const storage = require('../storage');
const { getTodayStr } = require('./utils');

// ========== 内部数据操作 ==========
function getGoals() {
  return storage.get('jiese_goals', []);
}

function getCheckins() {
  return storage.get('jiese_checkins', []);
}

function getGoalStats() {
  return storage.get('jiese_goal_stats', {});
}

function getDurationSessions() {
  return storage.get('jiese_duration_sessions', []);
}

function getGlobalStats() {
  return storage.get('jiese_global_stats', {
    totalDays: 0, longestStreak: 0, achievements: []
  });
}

// 格式化时长
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}秒`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}时${m}分`;
  return `${m}分`;
}

// ========== 统计服务 ==========
const statsService = {
  // 获取统计数据
  async getStats(goalId) {
    const goals = getGoals();
    const checkins = getCheckins();
    const allStats = getGoalStats();
    const global = getGlobalStats();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = getTodayStr();

    // 筛选打卡记录
    const filteredCheckins = goalId
      ? checkins.filter(c => c.goalId === goalId)
      : checkins;

    // 月度数据
    const monthlyData = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayCheckins = filteredCheckins.filter(c => c.date === ds);
      monthlyData.push({
        date: ds,
        checked: dayCheckins.length > 0,
        count: dayCheckins.length
      });
    }

    // 周数据
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayCheckins = filteredCheckins.filter(c => c.date === ds);
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      weeklyData.push({
        date: ds,
        day: weekdays[d.getDay()],
        checked: dayCheckins.length > 0,
        count: dayCheckins.length
      });
    }

    // 如果指定了目标，返回该目标的统计
    if (goalId) {
      const stat = allStats[goalId] || { totalDays: 0, currentStreak: 0, longestStreak: 0 };
      return {
        code: 0,
        data: {
          ...stat,
          monthlyData,
          weeklyData,
          recentChallenges: storage.get('jiese_challenges', []).filter(c => c.goalId === goalId).slice(0, 5)
        }
      };
    }

    // 全局统计
    const allGoalStats = Object.values(allStats);
    const totalDays = allGoalStats.reduce((sum, s) => sum + s.totalDays, 0);
    const maxCurrentStreak = Math.max(0, ...allGoalStats.map(s => s.currentStreak));
    const maxLongestStreak = Math.max(0, ...allGoalStats.map(s => s.longestStreak));

    // 各目标统计
    const goalStats = goals.map(goal => {
      const stat = allStats[goal.id] || { totalDays: 0, currentStreak: 0, longestStreak: 0 };
      return { ...goal, ...stat };
    });

    return {
      code: 0,
      data: {
        totalDays,
        currentStreak: maxCurrentStreak,
        longestStreak: maxLongestStreak,
        achievements: global.achievements || [],
        monthlyData,
        weeklyData,
        goalStats,
        recentChallenges: storage.get('jiese_challenges', []).slice(0, 5)
      }
    };
  },

  // 获取时长类目标的统计数据
  async getDurationStats(days, goalId) {
    days = days || 14;
    const allGoals = getGoals();
    const durationGoals = allGoals.filter(g => g.type === 'duration');
    const sessions = getDurationSessions();
    const now = new Date();

    // 确定要统计的目标
    let targetGoals;
    if (goalId) {
      const g = allGoals.find(g => g.id === goalId);
      if (!g || g.type !== 'duration') {
        return { code: 0, data: { hasDurationGoals: false } };
      }
      targetGoals = [g];
    } else {
      if (durationGoals.length === 0) {
        return { code: 0, data: { hasDurationGoals: false } };
      }
      targetGoals = durationGoals;
    }

    // 筛选相关会话
    const relevantSessions = goalId
      ? sessions.filter(s => s.goalId === goalId)
      : sessions;

    // 最近 N 天每天的总时长
    const dailyTotals = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const daySessions = relevantSessions.filter(s => s.date === ds);
      const totalSec = daySessions.reduce((sum, s) => sum + s.duration, 0);
      dailyTotals.push({
        date: ds,
        day: `${d.getMonth() + 1}/${d.getDate()}`,
        totalSeconds: totalSec,
        totalMinutes: Math.round(totalSec / 60),
        totalStr: formatDuration(totalSec)
      });
    }

    // 各目标的时长分布
    const goalDistribution = targetGoals.map(goal => {
      const goalSessions = relevantSessions.filter(s => s.goalId === goal.id);
      const totalSec = goalSessions.reduce((sum, s) => sum + s.duration, 0);
      const totalDays = new Set(goalSessions.map(s => s.date)).size;
      const avgPerDay = totalDays > 0 ? Math.round(totalSec / totalDays) : 0;
      const recent7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const daySec = goalSessions.filter(s => s.date === ds).reduce((sum, s) => sum + s.duration, 0);
        recent7.push({ date: ds, seconds: daySec, minutes: Math.round(daySec / 60) });
      }
      return {
        id: goal.id,
        name: goal.name,
        icon: goal.icon,
        color: goal.color,
        totalSeconds: totalSec,
        totalStr: formatDuration(totalSec),
        totalDays,
        avgPerDay,
        avgPerDayStr: formatDuration(avgPerDay),
        sessionCount: goalSessions.length,
        recent7
      };
    });

    const grandTotal = goalDistribution.reduce((sum, g) => sum + g.totalSeconds, 0);
    goalDistribution.forEach(g => {
      g.percent = grandTotal > 0 ? Math.round((g.totalSeconds / grandTotal) * 100) : 0;
    });

    // 分析
    const analysis = [];
    if (grandTotal > 0) {
      const dailyAvg = Math.round(grandTotal / days);
      analysis.push(`近${days}天日均投入 ${formatDuration(dailyAvg)}`);
      if (goalDistribution.length > 1) {
        const sorted = [...goalDistribution].sort((a, b) => b.totalSeconds - a.totalSeconds);
        analysis.push(`投入最多的是「${sorted[0].name}」，占比 ${sorted[0].percent}%`);
      }
      if (relevantSessions.length > 0) {
        const longest = relevantSessions.reduce((a, b) => a.duration > b.duration ? a : b);
        const goal = allGoals.find(g => g.id === longest.goalId);
        analysis.push(`最长单次 ${formatDuration(longest.duration)}（${goal ? goal.name : ''}）`);
      }
    }

    return {
      code: 0,
      data: {
        hasDurationGoals: true,
        grandTotal,
        grandTotalStr: formatDuration(grandTotal),
        days,
        dailyTotals,
        goalDistribution,
        showPie: !goalId && goalDistribution.length > 1,
        analysis
      }
    };
  },

  // 获取计数类目标的统计数据
  async getCountStats(days, goalId) {
    days = days || 14;
    const allGoals = getGoals();
    const checkins = getCheckins();
    const now = new Date();

    let targetGoals;
    if (goalId) {
      const g = allGoals.find(g => g.id === goalId);
      if (!g || g.type !== 'count') return { code: 0, data: { hasCountGoals: false } };
      targetGoals = [g];
    } else {
      targetGoals = allGoals.filter(g => g.type === 'count');
      if (targetGoals.length === 0) return { code: 0, data: { hasCountGoals: false } };
    }

    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayCheckins = checkins.filter(c => c.date === ds && targetGoals.some(g => g.id === c.goalId));
      dailyData.push({
        date: ds,
        day: `${d.getMonth() + 1}/${d.getDate()}`,
        count: dayCheckins.length
      });
    }

    const goalDetails = targetGoals.map(goal => {
      const goalCheckins = checkins.filter(c => c.goalId === goal.id);
      const totalCheckins = goalCheckins.length;
      const uniqueDays = new Set(goalCheckins.map(c => c.date)).size;
      const recent7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const cnt = goalCheckins.filter(c => c.date === ds).length;
        recent7.push({ date: ds, count: cnt });
      }
      return {
        id: goal.id,
        name: goal.name,
        icon: goal.icon,
        color: goal.color,
        targetCount: goal.targetCount || 3,
        totalCheckins,
        uniqueDays,
        avgPerDay: uniqueDays > 0 ? Math.round(totalCheckins / uniqueDays * 10) / 10 : 0,
        recent7
      };
    });

    return {
      code: 0,
      data: {
        hasCountGoals: true,
        days,
        dailyData,
        goalDetails
      }
    };
  },

  // 获取语录
  async getQuotes(count = 1) {
    const { QUOTES } = require('./config');
    const shuffled = [...QUOTES].sort(() => Math.random() - 0.5);
    return { code: 0, data: shuffled.slice(0, count) };
  },

  // ========== 智能分析 ==========

  // 习惯稳定性评分
  async getStabilityScore(goalId) {
    const checkins = getCheckins();
    const allStats = getGoalStats();
    const goalCheckins = goalId
      ? checkins.filter(c => c.goalId === goalId)
      : checkins;

    if (goalCheckins.length < 7) {
      return { code: 0, data: { score: 0, level: 'insufficient', message: '数据不足，需要至少7次打卡' } };
    }

    // 计算各项指标
    const uniqueDates = [...new Set(goalCheckins.map(c => c.date))].sort();
    const totalDays = uniqueDates.length;

    // 1. 连续性评分 (40分)
    let maxStreak = 0;
    let currentStreak = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }
    const continuityScore = Math.min(40, Math.round(maxStreak / 30 * 40));

    // 2. 规律性评分 (30分) - 打卡时间的一致性
    const hourCounts = new Array(24).fill(0);
    goalCheckins.forEach(c => {
      const hour = new Date(c.timestamp).getHours();
      hourCounts[hour]++;
    });
    const maxHourCount = Math.max(...hourCounts);
    const regularityScore = Math.min(30, Math.round(maxHourCount / totalDays * 30));

    // 3. 完成率评分 (30分) - 最近30天的完成率
    const now = new Date();
    let completedDays = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (uniqueDates.includes(dateStr)) {
        completedDays++;
      }
    }
    const completionScore = Math.min(30, Math.round(completedDays / 30 * 30));

    // 总分
    const totalScore = continuityScore + regularityScore + completionScore;

    // 评级
    let level = '';
    let message = '';
    if (totalScore >= 90) {
      level = 'excellent';
      message = '习惯非常稳定，继续保持！';
    } else if (totalScore >= 70) {
      level = 'good';
      message = '习惯基本稳定，还有提升空间。';
    } else if (totalScore >= 50) {
      level = 'fair';
      message = '习惯正在养成中，坚持打卡！';
    } else {
      level = 'poor';
      message = '习惯还不稳定，需要更多坚持。';
    }

    return {
      code: 0,
      data: {
        score: totalScore,
        level,
        message,
        breakdown: {
          continuity: { score: continuityScore, max: 40, desc: '连续性' },
          regularity: { score: regularityScore, max: 30, desc: '规律性' },
          completion: { score: completionScore, max: 30, desc: '完成率' }
        }
      }
    };
  },

  // 对比分析（本周 vs 上周）
  async getComparisonAnalysis() {
    const checkins = getCheckins();
    const goals = getGoals();
    const now = new Date();

    // 计算本周和上周的日期范围
    const dayOfWeek = now.getDay() || 7;
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - dayOfWeek + 1);
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

    // 统计本周和上周的打卡数据
    const thisWeekCheckins = checkins.filter(c => {
      const d = new Date(c.date);
      return d >= thisWeekStart;
    });

    const lastWeekCheckins = checkins.filter(c => {
      const d = new Date(c.date);
      return d >= lastWeekStart && d < thisWeekStart;
    });

    // 各目标对比
    const goalComparisons = goals.map(goal => {
      const thisWeekGoal = thisWeekCheckins.filter(c => c.goalId === goal.id);
      const lastWeekGoal = lastWeekCheckins.filter(c => c.goalId === goal.id);

      const thisWeekDays = new Set(thisWeekGoal.map(c => c.date)).size;
      const lastWeekDays = new Set(lastWeekGoal.map(c => c.date)).size;

      const change = thisWeekDays - lastWeekDays;
      const changePercent = lastWeekDays > 0 ? Math.round(change / lastWeekDays * 100) : (thisWeekDays > 0 ? 100 : 0);

      return {
        id: goal.id,
        name: goal.name,
        icon: goal.icon,
        color: goal.color,
        thisWeek: thisWeekDays,
        lastWeek: lastWeekDays,
        change,
        changePercent,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      };
    });

    // 总体对比
    const thisWeekTotal = thisWeekCheckins.length;
    const lastWeekTotal = lastWeekCheckins.length;
    const totalChange = thisWeekTotal - lastWeekTotal;
    const totalChangePercent = lastWeekTotal > 0 ? Math.round(totalChange / lastWeekTotal * 100) : 0;

    return {
      code: 0,
      data: {
        thisWeek: {
          start: `${thisWeekStart.getFullYear()}-${String(thisWeekStart.getMonth() + 1).padStart(2, '0')}-${String(thisWeekStart.getDate()).padStart(2, '0')}`,
          total: thisWeekTotal,
          uniqueDays: new Set(thisWeekCheckins.map(c => c.date)).size
        },
        lastWeek: {
          start: `${lastWeekStart.getFullYear()}-${String(lastWeekStart.getMonth() + 1).padStart(2, '0')}-${String(lastWeekStart.getDate()).padStart(2, '0')}`,
          total: lastWeekTotal,
          uniqueDays: new Set(lastWeekCheckins.map(c => c.date)).size
        },
        totalChange,
        totalChangePercent,
        trend: totalChange > 0 ? 'up' : totalChange < 0 ? 'down' : 'stable',
        goalComparisons
      }
    };
  },

  // 最佳打卡时段推荐
  async getBestTimeRecommendation() {
    const checkins = getCheckins();
    const goals = getGoals();

    if (checkins.length < 14) {
      return { code: 0, data: { hasData: false, message: '数据不足，需要至少14次打卡' } };
    }

    // 统计每小时的打卡次数
    const hourCounts = new Array(24).fill(0);
    const hourSuccess = new Array(24).fill(0);

    checkins.forEach(c => {
      const hour = new Date(c.timestamp).getHours();
      hourCounts[hour]++;
    });

    // 找出最佳时段（前3个）
    const bestHours = [];
    const tempHourCounts = [...hourCounts];
    for (let i = 0; i < 3; i++) {
      const maxHour = tempHourCounts.indexOf(Math.max(...tempHourCounts));
      if (tempHourCounts[maxHour] > 0) {
        bestHours.push({
          hour: maxHour,
          count: tempHourCounts[maxHour],
          timeStr: `${String(maxHour).padStart(2, '0')}:00`,
          period: maxHour < 6 ? '凌晨' : maxHour < 9 ? '早晨' : maxHour < 12 ? '上午' :
            maxHour < 14 ? '中午' : maxHour < 18 ? '下午' : maxHour < 22 ? '晚上' : '深夜'
        });
      }
      tempHourCounts[maxHour] = 0;
    }

    // 分析工作日/周末差异
    const weekdayCheckins = checkins.filter(c => {
      const day = new Date(c.date).getDay();
      return day >= 1 && day <= 5;
    });
    const weekendCheckins = checkins.filter(c => {
      const day = new Date(c.date).getDay();
      return day === 0 || day === 6;
    });

    const weekdayDays = new Set(weekdayCheckins.map(c => c.date)).size;
    const weekendDays = new Set(weekendCheckins.map(c => c.date)).size;
    const weekdayAvg = weekdayDays > 0 ? Math.round(weekdayCheckins.length / weekdayDays * 10) / 10 : 0;
    const weekendAvg = weekendDays > 0 ? Math.round(weekendCheckins.length / weekendDays * 10) / 10 : 0;

    // 生成建议
    const suggestions = [];
    if (bestHours.length > 0) {
      suggestions.push(`你最常在${bestHours[0].timeStr}打卡，建议在这个时间设置提醒。`);
    }
    if (weekendAvg > weekdayAvg * 1.5) {
      suggestions.push('你周末打卡更积极，建议工作日也保持同样的节奏。');
    } else if (weekdayAvg > weekendAvg * 1.5) {
      suggestions.push('你工作日更稳定，周末也要坚持哦。');
    }

    return {
      code: 0,
      data: {
        hasData: true,
        bestHours,
        weekdayAvg,
        weekendAvg,
        isWeekendBetter: weekendAvg > weekdayAvg,
        suggestions
      }
    };
  },

  // 获取昨日总结
  async getYesterdaySummary() {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    const yesterday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const goals = getGoals();
    const checkins = getCheckins();
    const allStats = getGoalStats();
    const yesterdayCheckins = checkins.filter(c => c.date === yesterday);

    const goalResults = goals.map(goal => {
      const checked = yesterdayCheckins.some(c => c.goalId === goal.id);
      const stat = allStats[goal.id] || { totalDays: 0, currentStreak: 0 };
      return { id: goal.id, name: goal.name, icon: goal.icon, color: goal.color, checked, streak: stat.currentStreak };
    });

    const checkedCount = goalResults.filter(g => g.checked).length;
    const totalCount = goals.length;
    const allChecked = totalCount > 0 && checkedCount === totalCount;

    return {
      code: 0,
      data: {
        date: yesterday,
        checkedCount,
        totalCount,
        allChecked,
        goals: goalResults,
        scoreDeg: totalCount > 0 ? Math.round((checkedCount / totalCount) * 360) : 0
      }
    };
  },

  // 获取周报数据
  async getWeeklyReport() {
    const goals = getGoals();
    const checkins = getCheckins();
    const allStats = getGoalStats();
    const challenges = storage.get('jiese_challenges', []);
    const now = new Date();

    // 获取本周日期范围（周一到周日）
    const dayOfWeek = now.getDay() || 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek + 1);
    weekStart.setHours(0, 0, 0, 0);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      weekDays.push(ds);
    }

    // 各目标本周打卡情况
    const goalReports = goals.map(goal => {
      const goalCheckins = checkins.filter(c => c.goalId === goal.id);
      const weekCheckins = weekDays.map(day => ({
        date: day,
        checked: goalCheckins.some(c => c.date === day)
      }));
      const weekCount = weekCheckins.filter(w => w.checked).length;
      const stat = allStats[goal.id] || { totalDays: 0, currentStreak: 0, longestStreak: 0 };

      return {
        ...goal,
        ...stat,
        weekCount,
        weekRate: Math.round((weekCount / 7) * 100),
        weekCheckins
      };
    });

    // 本周总打卡数
    const totalWeekCheckins = checkins.filter(c => weekDays.includes(c.date)).length;
    const totalPossible = goals.length * 7;
    const weekRate = totalPossible > 0 ? Math.round((totalWeekCheckins / totalPossible) * 100) : 0;

    // 挑战完成情况
    const activeChallenges = challenges.filter(c => c.status === 'active').map(ch => {
      const startDate = new Date(ch.startDate);
      const completedDays = Math.min(
        Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1,
        ch.targetDays
      );
      const progress = Math.min(100, Math.round((completedDays / ch.targetDays) * 100));
      const goal = goals.find(g => g.id === ch.goalId);
      return {
        ...ch,
        completedDays,
        progress,
        goalName: goal ? goal.name : '未知目标',
        goalIcon: goal ? goal.icon : '🎯'
      };
    });

    // 数据分析
    const analysis = [];
    if (weekRate >= 90) {
      analysis.push('本周打卡率极高，保持出色状态！');
    } else if (weekRate >= 70) {
      analysis.push('本周表现不错，继续坚持。');
    } else if (weekRate >= 50) {
      analysis.push('本周打卡过半，还有提升空间。');
    } else {
      analysis.push('本周打卡较少，下周加油！');
    }

    if (goalReports.length > 0) {
      const best = goalReports.reduce((a, b) => a.weekRate > b.weekRate ? a : b);
      if (best.weekRate > 0) {
        analysis.push(`${best.name}完成率最高(${best.weekRate}%)，是你的强项。`);
      }
    }

    const weakGoals = goalReports.filter(g => g.weekRate < 50);
    if (weakGoals.length > 0) {
      analysis.push(`${weakGoals.map(g => g.name).join('、')}需要加强，建议设定提醒。`);
    }

    return {
      code: 0,
      data: {
        weekStart: weekDays[0],
        weekEnd: weekDays[6],
        totalWeekCheckins,
        weekRate,
        goalReports,
        activeChallenges,
        analysis
      }
    };
  }
};

module.exports = statsService;
