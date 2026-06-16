const api = require('../../utils/api');
const storage = require('../../utils/storage');
const app = getApp();

Page({
  data: {
    themeClass: '',
    goals: [],
    selectedGoalId: '',
    selectedGoal: null,
    reminders: [],
    suggestions: [],
    showAddTime: false,
    newTime: '08:00'
  },

  onLoad() {
    this.setData({ themeClass: app.globalData.themeClass });
    this.loadGoals();
  },

  onShow() {
    this.loadGoals();
  },

  loadGoals() {
    const goalsRes = api.getGoals();
    if (goalsRes.code === 0) {
      const goals = goalsRes.data;
      this.setData({ goals });

      if (goals.length > 0 && !this.data.selectedGoalId) {
        this.selectGoal({ currentTarget: { dataset: { goalId: goals[0].id } } });
      }
    }
  },

  selectGoal(e) {
    const goalId = e.currentTarget.dataset.goalId;
    const goal = this.data.goals.find(g => g.id === goalId);
    const reminders = goal?.reminder?.times || [];

    this.setData({
      selectedGoalId: goalId,
      selectedGoal: goal,
      reminders
    });

    this.loadSuggestions(goalId);
  },

  loadSuggestions(goalId) {
    const res = api.getSmartReminderSuggestion(goalId);
    if (res.code === 0) {
      this.setData({ suggestions: res.data.suggestions });
    }
  },

  // 添加提醒时间
  addTime() {
    this.setData({ showAddTime: true });
  },

  onTimeChange(e) {
    this.setData({ newTime: e.detail.value });
  },

  confirmAddTime() {
    const { newTime, reminders, selectedGoalId, goals } = this.data;
    if (reminders.includes(newTime)) {
      wx.showToast({ title: '该时间已存在', icon: 'none' });
      return;
    }

    const newReminders = [...reminders, newTime].sort();
    this.updateGoalReminder(selectedGoalId, newReminders);
    this.setData({ showAddTime: false });
  },

  cancelAddTime() {
    this.setData({ showAddTime: false });
  },

  // 删除提醒时间
  deleteTime(e) {
    const time = e.currentTarget.dataset.time;
    const { reminders, selectedGoalId } = this.data;
    const newReminders = reminders.filter(t => t !== time);
    this.updateGoalReminder(selectedGoalId, newReminders);
  },

  // 使用建议时间
  useSuggestion(e) {
    const time = e.currentTarget.dataset.time;
    const { reminders, selectedGoalId } = this.data;
    if (reminders.includes(time)) {
      wx.showToast({ title: '该时间已存在', icon: 'none' });
      return;
    }

    const newReminders = [...reminders, time].sort();
    this.updateGoalReminder(selectedGoalId, newReminders);
  },

  // 更新目标提醒设置
  updateGoalReminder(goalId, times) {
    const goals = this.data.goals.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          reminder: {
            ...g.reminder,
            times
          }
        };
      }
      return g;
    });

    // 保存到本地
    const goalsRes = api.getGoals();
    if (goalsRes.code === 0) {
      const allGoals = goalsRes.data.map(g => {
        if (g.id === goalId) {
          return { ...g, reminder: { ...g.reminder, times } };
        }
        return g;
      });
      storage.set('jiese_goals', allGoals);
    }

    this.setData({
      goals,
      reminders: times,
      selectedGoal: goals.find(g => g.id === goalId)
    });

    wx.showToast({ title: '已更新', icon: 'success' });
  },

  // 切换工作日/周末设置
  toggleWeekdayOnly() {
    const { selectedGoalId, selectedGoal } = this.data;
    const weekdayOnly = !selectedGoal?.reminder?.weekdayOnly;

    this.updateGoalReminderOption(selectedGoalId, 'weekdayOnly', weekdayOnly);
  },

  toggleWeekendOnly() {
    const { selectedGoalId, selectedGoal } = this.data;
    const weekendOnly = !selectedGoal?.reminder?.weekendOnly;

    this.updateGoalReminderOption(selectedGoalId, 'weekendOnly', weekendOnly);
  },

  updateGoalReminderOption(goalId, key, value) {
    const goals = this.data.goals.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          reminder: {
            ...g.reminder,
            [key]: value
          }
        };
      }
      return g;
    });

    storage.set('jiese_goals', goals);
    this.setData({
      goals,
      selectedGoal: goals.find(g => g.id === goalId)
    });

    wx.showToast({ title: '已更新', icon: 'success' });
  }
});
