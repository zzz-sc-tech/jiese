const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    themeClass: '',
    diaryList: []
  },

  onLoad() {
    this.setData({ themeClass: app.globalData.themeClass });
  },

  onShow() {
    this.loadDiary();
  },

  loadDiary() {
    const res = api.getPetDiaryList();
    if (res.code === 0) {
      this.setData({ diaryList: res.data });
    }
  },

  getDiaryIcon(type) {
    const icons = {
      adopt: '🏠',
      evolve: '✨',
      level: '📈',
      feed: '🍖',
      interact: '💕',
      milestone: '🏆'
    };
    return icons[type] || '📝';
  }
});
