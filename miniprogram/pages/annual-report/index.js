const api = require('../../utils/api');
const dateUtil = require('../../utils/date');
const app = getApp();

Page({
  data: {
    themeClass: '',
    year: 2026,
    report: null,
    loading: true
  },

  onLoad() {
    const now = new Date();
    this.setData({
      themeClass: app.globalData.themeClass,
      year: now.getFullYear()
    });
    this.generateReport();
  },

  generateReport() {
    const { year } = this.data;
    const checkins = api.getCheckins();
    const yearCheckins = checkins.filter(c => c.date.startsWith(year.toString()));

    // 总打卡天数
    const uniqueDates = new Set(yearCheckins.map(c => c.date));
    const totalDays = uniqueDates.size;

    // 最长连续天数
    const sortedDates = [...uniqueDates].sort();
    let maxStreak = 0;
    let currentStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }

    // 各月打卡天数
    const monthlyData = [];
    for (let m = 1; m <= 12; m++) {
      const monthStr = `${year}-${String(m).padStart(2, '0')}`;
      const monthDays = [...uniqueDates].filter(d => d.startsWith(monthStr)).length;
      monthlyData.push({
        month: m,
        days: monthDays,
        label: `${m}月`
      });
    }

    // 各目标统计
    const goalsRes = api.getGoals();
    const goals = goalsRes.code === 0 ? goalsRes.data : [];
    const goalStats = goals.map(goal => {
      const goalCheckins = yearCheckins.filter(c => c.goalId === goal.id);
      const goalDays = new Set(goalCheckins.map(c => c.date)).size;
      return {
        ...goal,
        days: goalDays
      };
    }).filter(g => g.days > 0).sort((a, b) => b.days - a.days);

    // 最常打卡时段
    const hourCounts = new Array(24).fill(0);
    yearCheckins.forEach(c => {
      const hour = new Date(c.timestamp).getHours();
      hourCounts[hour]++;
    });
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    const peakPeriod = peakHour < 6 ? '凌晨' : peakHour < 9 ? '早晨' : peakHour < 12 ? '上午' :
      peakHour < 14 ? '中午' : peakHour < 18 ? '下午' : peakHour < 22 ? '晚上' : '深夜';

    // 宠物信息
    const pets = api.getPets();
    const petInfo = pets.length > 0 ? {
      name: pets[0].name,
      icon: api.getPetTypes()[pets[0].petId]?.icon || '🐾',
      level: api.getPetInfo(0).data?.level || 1
    } : null;

    // 成就统计
    const achievements = api.getStats().data?.achievements || [];

    // 生成报告
    const report = {
      year,
      totalDays,
      totalCheckins: yearCheckins.length,
      maxStreak,
      monthlyData,
      goalStats: goalStats.slice(0, 5),
      peakHour,
      peakPeriod,
      petInfo,
      achievementCount: achievements.length,
      // 趣味数据
      yearProgress: Math.round((totalDays / 365) * 100),
      avgPerMonth: Math.round(totalDays / 12),
      bestMonth: monthlyData.reduce((a, b) => a.days > b.days ? a : b).label,
      bestMonthDays: monthlyData.reduce((a, b) => a.days > b.days ? a : b).days
    };

    this.setData({ report, loading: false });
  },

  // 分享报告
  onShareAppMessage() {
    const { report } = this.data;
    return {
      title: `我的${report.year}年打卡报告：坚持${report.totalDays}天！`,
      path: '/pages/index/index'
    };
  },

  // 切换年份
  prevYear() {
    this.setData({ year: this.data.year - 1, loading: true });
    this.generateReport();
  },

  nextYear() {
    this.setData({ year: this.data.year + 1, loading: true });
    this.generateReport();
  }
});
