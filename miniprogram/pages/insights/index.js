const api = require('../../utils/api');
const dateUtil = require('../../utils/date');
const app = getApp();

Page({
  data: {
    themeClass: '',
    loading: true,
    // 概览数据
    overview: {
      totalDays: 0,
      totalCheckins: 0,
      avgPerDay: 0,
      completionRate: 0
    },
    // 打卡规律
    patterns: {
      bestHour: 0,
      bestHourStr: '',
      bestDay: '',
      weekdayAvg: 0,
      weekendAvg: 0,
      isWeekendBetter: false
    },
    // 趋势数据
    trends: {
      thisWeek: 0,
      lastWeek: 0,
      change: 0,
      changePercent: 0
    },
    // 建议
    suggestions: [],
    // 各目标分析
    goalAnalysis: [],
    // 习惯稳定性
    stability: null,
    // 对比分析
    comparison: null,
    // 最佳时段推荐
    bestTime: null
  },

  onLoad() {
    this.setData({ themeClass: app.globalData.themeClass });
    this.analyzeData();
  },

  onShow() {
    this.analyzeData();
  },

  analyzeData() {
    this.setData({ loading: true });

    try {
      const checkins = api.getCheckins();
      const goalsRes = api.getGoals();
      const goals = goalsRes.code === 0 ? goalsRes.data : [];

      // 概览数据
      const uniqueDates = new Set(checkins.map(c => c.date));
      const totalDays = uniqueDates.size;
      const totalCheckins = checkins.length;
      const avgPerDay = totalDays > 0 ? Math.round(totalCheckins / totalDays * 10) / 10 : 0;

      // 计算完成率（最近30天）
      const now = new Date();
      let completedDays = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = dateUtil.format(d);
        if (uniqueDates.has(dateStr)) {
          completedDays++;
        }
      }
      const completionRate = Math.round(completedDays / 30 * 100);

      // 打卡规律分析
      const hourCounts = new Array(24).fill(0);
      const dayCounts = { '周一': 0, '周二': 0, '周三': 0, '周四': 0, '周五': 0, '周六': 0, '周日': 0 };
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

      checkins.forEach(c => {
        const hour = new Date(c.timestamp).getHours();
        hourCounts[hour]++;

        const dayOfWeek = new Date(c.date).getDay();
        dayCounts[dayNames[dayOfWeek]]++;
      });

      const bestHour = hourCounts.indexOf(Math.max(...hourCounts));
      const bestDay = Object.entries(dayCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];

      // 工作日/周末分析
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

      // 趋势分析（本周 vs 上周）
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - now.getDay());
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(thisWeekStart.getDate() - 7);

      const thisWeekCheckins = checkins.filter(c => new Date(c.date) >= thisWeekStart).length;
      const lastWeekCheckins = checkins.filter(c => {
        const d = new Date(c.date);
        return d >= lastWeekStart && d < thisWeekStart;
      }).length;

      const weekChange = thisWeekCheckins - lastWeekCheckins;
      const weekChangePercent = lastWeekCheckins > 0 ? Math.round(weekChange / lastWeekCheckins * 100) : 0;

      // 生成建议
      const suggestions = this.generateSuggestions({
        completionRate,
        bestHour,
        weekdayAvg,
        weekendAvg,
        isWeekendBetter: weekendAvg > weekdayAvg,
        weekChange
      });

      // 各目标分析
      const goalAnalysis = goals.map(goal => {
        const goalCheckins = checkins.filter(c => c.goalId === goal.id);
        const goalDays = new Set(goalCheckins.map(c => c.date)).size;
        const goalTotal = goalCheckins.length;
        const goalAvg = goalDays > 0 ? Math.round(goalTotal / goalDays * 10) / 10 : 0;

        // 最近7天
        let recent7 = 0;
        for (let i = 0; i < 7; i++) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = dateUtil.format(d);
          if (goalCheckins.some(c => c.date === dateStr)) {
            recent7++;
          }
        }

        return {
          ...goal,
          totalDays: goalDays,
          totalCheckins: goalTotal,
          avgPerDay: goalAvg,
          recent7,
          recent7Rate: Math.round(recent7 / 7 * 100)
        };
      }).sort((a, b) => b.totalDays - a.totalDays);

      this.setData({
        loading: false,
        overview: {
          totalDays,
          totalCheckins,
          avgPerDay,
          completionRate
        },
        patterns: {
          bestHour,
          bestHourStr: `${String(bestHour).padStart(2, '0')}:00`,
          bestDay,
          weekdayAvg,
          weekendAvg,
          isWeekendBetter: weekendAvg > weekdayAvg
        },
        trends: {
          thisWeek: thisWeekCheckins,
          lastWeek: lastWeekCheckins,
          change: weekChange,
          changePercent: weekChangePercent
        },
        suggestions,
        goalAnalysis
      });
    } catch (err) {
      console.error('数据分析失败:', err);
      this.setData({ loading: false });
    }
  },

  generateSuggestions(data) {
    const suggestions = [];

    // 完成率建议
    if (data.completionRate < 50) {
      suggestions.push({
        icon: '📉',
        title: '打卡率较低',
        desc: '最近30天打卡率只有' + data.completionRate + '%，建议设置提醒，坚持每天打卡。'
      });
    } else if (data.completionRate >= 80) {
      suggestions.push({
        icon: '🌟',
        title: '表现优秀',
        desc: '最近30天打卡率' + data.completionRate + '%，继续保持！'
      });
    }

    // 最佳时间建议
    suggestions.push({
      icon: '⏰',
      title: '最佳打卡时间',
      desc: '你最常在' + data.bestHourStr + '打卡，建议在这个时间设置提醒。'
    });

    // 工作日/周末建议
    if (data.isWeekendBetter) {
      suggestions.push({
        icon: '📅',
        title: '周末更积极',
        desc: '你周末打卡比工作日更积极，建议工作日也保持同样的节奏。'
      });
    } else {
      suggestions.push({
        icon: '📅',
        title: '工作日更稳定',
        desc: '你工作日打卡更稳定，周末也要坚持哦。'
      });
    }

    // 趋势建议
    if (data.weekChange < 0) {
      suggestions.push({
        icon: '📊',
        title: '本周有所下降',
        desc: '本周打卡次数比上周少' + Math.abs(data.weekChange) + '次，需要加油！'
      });
    } else if (data.weekChange > 0) {
      suggestions.push({
        icon: '📊',
        title: '本周进步明显',
        desc: '本周打卡次数比上周多' + data.weekChange + '次，继续努力！'
      });
    }

    return suggestions;
  },

  // 跳转到目标详情
  goGoalDetail(e) {
    const goalId = e.currentTarget.dataset.goalId;
    wx.navigateTo({ url: `/pages/history/index?goalId=${goalId}` });
  },

  // 分享洞察
  onShareAppMessage() {
    const { overview } = this.data;
    return {
      title: `我已累计打卡${overview.totalDays}天，快来看看我的数据洞察！`,
      path: '/pages/index/index'
    };
  }
});
