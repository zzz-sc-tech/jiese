const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    themeClass: '',
    achievements: [],
    unlockedCount: 0,
    totalCount: 0
  },

  onLoad() {
    this.setData({ themeClass: app.globalData.themeClass });
  },

  onShow() {
    this.loadAchievements();
  },

  loadAchievements() {
    const res = api.getPetAchievementList();
    if (res.code === 0) {
      const achievements = res.data;
      const unlockedCount = achievements.filter(a => a.unlocked).length;
      this.setData({
        achievements,
        unlockedCount,
        totalCount: achievements.length
      });
    }
  }
});
