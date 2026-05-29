const api = require('../../utils/api');
const dateUtil = require('../../utils/date');

const app = getApp();

Page({
  data: {
    goals: [],
    activeChallenges: [],
    selectedGoalId: '',
    challengeOptions: [
      { days: 7, icon: '🌱', name: '一周坚持', desc: '养成好习惯', selected: false },
      { days: 21, icon: '🌿', name: '习惯养成', desc: '21天形成习惯', selected: false },
      { days: 30, icon: '⭐', name: '月度挑战', desc: '30天蜕变', selected: false },
      { days: 60, icon: '🌟', name: '双月挑战', desc: '60天突破', selected: false },
      { days: 90, icon: '💫', name: '季度挑战', desc: '90天重生', selected: false },
      { days: 180, icon: '👑', name: '半年挑战', desc: '180天王者', selected: false },
      { days: 365, icon: '💎', name: '年度挑战', desc: '365天传奇', selected: false }
    ],
    selectedDays: 0,
    themeClass: ''
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.setData({ themeClass: app.globalData.themeClass });
    this.loadData();
  },

  async loadData() {
    try {
      const goalsRes = await api.getGoals();
      if (goalsRes.code === 0) {
        this.setData({ goals: goalsRes.data });
      }
      await this.loadChallenges();
    } catch (err) {
      console.error('加载数据失败:', err);
    }
  },

  async loadChallenges() {
    try {
      const res = await api.getChallenges();
      if (res.code === 0 && res.data) {
        const now = new Date();
        const active = res.data
          .filter(c => c.status === 'active')
          .map(ch => {
            const startDate = new Date(ch.startDate);
            const completedDays = Math.min(
              Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1,
              ch.targetDays
            );
            const remainingDays = Math.max(0, ch.targetDays - completedDays);
            const progress = Math.min(100, Math.round((completedDays / ch.targetDays) * 100));
            const status = completedDays >= ch.targetDays ? 'completed' : 'active';
            const goal = this.data.goals.find(g => g.id === ch.goalId);
            return {
              ...ch,
              completedDays,
              remainingDays,
              progress,
              status,
              statusText: status === 'completed' ? '挑战成功' : '进行中',
              goalName: goal ? goal.name : '未知目标',
              goalIcon: goal ? goal.icon : '🎯',
              goalColor: goal ? goal.color : '#5B9A6F',
              timeline: this.generateTimeline(ch.targetDays, completedDays)
            };
          });
        this.setData({ activeChallenges: active });
      }
    } catch (err) {
      console.error('加载挑战失败:', err);
    }
  },

  generateTimeline(targetDays, completedDays) {
    const milestones = [
      { day: 1, desc: '迈出第一步' },
      { day: 3, desc: '初见成效' },
      { day: 7, desc: '一周坚持' },
      { day: 14, desc: '两周不辍' },
      { day: 21, desc: '习惯养成' },
      { day: 30, desc: '月度达成' },
      { day: 60, desc: '双月突破' },
      { day: 90, desc: '季度里程碑' },
      { day: 100, desc: '百日征程' },
      { day: 180, desc: '半载坚守' },
      { day: 365, desc: '年度传奇' }
    ];
    return milestones
      .filter(m => m.day <= targetDays)
      .map(m => ({
        ...m,
        passed: completedDays >= m.day,
        current: completedDays < m.day && completedDays >= (m.day - 7)
      }));
  },

  selectGoal(e) {
    const goalId = e.currentTarget.dataset.goalId;
    this.setData({ selectedGoalId: goalId === this.data.selectedGoalId ? '' : goalId });
  },

  selectChallenge(e) {
    const days = e.currentTarget.dataset.days;
    const options = this.data.challengeOptions.map(item => ({
      ...item,
      selected: item.days === days
    }));
    this.setData({ challengeOptions: options, selectedDays: days });
  },

  // 展开/收起某个挑战的详情
  toggleChallengeDetail(e) {
    const id = e.currentTarget.dataset.id;
    const challenges = this.data.activeChallenges.map(c => ({
      ...c,
      expanded: c._id === id ? !c.expanded : false
    }));
    this.setData({ activeChallenges: challenges });
  },

  async startChallenge() {
    const { selectedDays, selectedGoalId } = this.data;
    if (!selectedGoalId) {
      wx.showToast({ title: '请先选择关联目标', icon: 'none' });
      return;
    }
    if (!selectedDays) {
      wx.showToast({ title: '请选择挑战天数', icon: 'none' });
      return;
    }

    // 检查该目标是否已有活跃挑战
    const existing = this.data.activeChallenges.find(
      c => c.goalId === selectedGoalId
    );
    if (existing) {
      wx.showToast({ title: '该目标已有进行中的挑战', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '创建挑战中...' });
    try {
      const res = await api.createChallenge(selectedDays, selectedGoalId);
      wx.hideLoading();
      if (res.code === 0) {
        wx.showToast({ title: '挑战开始！', icon: 'success' });
        this.loadChallenges();
      } else {
        wx.showToast({ title: res.message || '创建失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '创建失败', icon: 'none' });
    }
  }
});
