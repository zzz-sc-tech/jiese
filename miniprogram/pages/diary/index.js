const api = require('../../utils/api');
const ui = require('../../utils/ui');
const app = getApp();

Page({
  data: {
    themeClass: '',
    diaries: [],
    loading: true,
    filterGoalId: '',
    goals: []
  },

  onLoad() {
    this.setData({ themeClass: app.globalData.themeClass });
  },

  onShow() {
    this.loadDiaries();
  },

  async loadDiaries() {
    this.setData({ loading: true });
    try {
      const goalsRes = await api.getGoals();
      const goals = goalsRes.code === 0 ? goalsRes.data : [];

      const res = await api.getCheckinDiaries(100);
      if (res.code === 0) {
        let diaries = res.data;

        // 按目标筛选
        if (this.data.filterGoalId) {
          diaries = diaries.filter(d => d.goalId === this.data.filterGoalId);
        }

        this.setData({
          diaries,
          goals,
          loading: false
        });
      }
    } catch (err) {
      console.error('加载日记失败:', err);
      this.setData({ loading: false });
      ui.showError('加载失败', () => this.loadDiaries());
    }
  },

  // 筛选目标
  filterByGoal(e) {
    const goalId = e.currentTarget.dataset.goalId;
    this.setData({
      filterGoalId: goalId === this.data.filterGoalId ? '' : goalId
    });
    this.loadDiaries();
  },

  // 获取心情图标
  getMoodIcon(mood) {
    const moodMap = {
      happy: '😊',
      good: '😌',
      normal: '😐',
      tired: '😮‍💨',
      sad: '😔'
    };
    return moodMap[mood] || '';
  },

  // 格式化日期
  formatDate(timestamp) {
    const d = new Date(timestamp);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    return `${month}月${day}日 ${hour}:${minute}`;
  }
});
