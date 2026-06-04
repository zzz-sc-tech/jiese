const api = require('../../utils/api');
const storage = require('../../utils/storage');
const dateUtil = require('../../utils/date');

const app = getApp();

Page({
  data: {
    statusBarHeight: 0,
    todayStr: '',
    goals: [],
    allChecked: false,
    anyChecked: false,
    globalTotalDays: 0,
    showAddGoal: false,
    newGoalName: '',
    editingGoal: null,
    presetIcons: [],
    selectedPreset: 0,
    selectedType: 'single',
    targetCount: 3,
    customIcon: '',
    showQuote: false,
    currentQuote: { content: '自律给我自由。', author: '康德' },
    stats: { currentStreak: 0, totalDays: 0, longestStreak: 0 },
    newAchievements: [],
    // 昨日总结
    showYesterday: false,
    yesterdaySummary: null,
    // 周报
    showWeekly: false,
    weeklyReport: null,
    themeClass: '',
    // 倒数日
    countdown: null,
    showCountdown: false,
    countdownName: '',
    countdownDate: ''
  },

  onLoad() {
    const sysInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
      todayStr: dateUtil.format(new Date(), 'MM月DD日 星期') + dateUtil.getWeekDay(new Date()),
      presetIcons: api.getGoalPresets()
    });
  },

  onShow() {
    app.applyNavBarColor(app.globalData.theme);
    this.setData({ themeClass: app.globalData.themeClass });
    this.loadData();
  },

  async loadData() {
    try {
      const [statusRes, statsRes, quoteRes] = await Promise.all([
        api.getTodayStatus(),
        api.getStats(),
        api.getQuotes(1)
      ]);

      if (statusRes.code === 0) {
        this.setData({
          goals: statusRes.data.goals,
          allChecked: statusRes.data.allChecked,
          anyChecked: statusRes.data.anyChecked
        });
      }

      if (statsRes.code === 0) {
        this.setData({
          globalTotalDays: statsRes.data.totalDays,
          stats: {
            currentStreak: statsRes.data.currentStreak,
            totalDays: statsRes.data.totalDays,
            longestStreak: statsRes.data.longestStreak
          }
        });
        app.globalData.totalDays = statsRes.data.totalDays;
        app.globalData.currentStreak = statsRes.data.currentStreak;
      }

      if (quoteRes.code === 0 && quoteRes.data.length > 0) {
        this.setData({ currentQuote: quoteRes.data[0] });
      }

      // 加载倒数日
      this.loadCountdown();

      // 检查是否需要弹出昨日总结或周报
      this.checkReports();
    } catch (err) {
      console.error('加载数据失败:', err);
    }
  },

  // 加载倒数日
  loadCountdown() {
    const settings = storage.getSettings();
    const countdowns = settings.countdowns || [];
    if (countdowns.length > 0) {
      // 取第一个倒数日
      const cd = countdowns[0];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(cd.date);
      targetDate.setHours(0, 0, 0, 0);
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.setData({
        countdown: {
          ...cd,
          days: diffDays > 0 ? diffDays : 0,
          isPast: diffDays < 0,
          isToday: diffDays === 0
        }
      });
    } else {
      this.setData({ countdown: null });
    }
  },

  async checkReports() {
    const today = dateUtil.today();
    const settings = storage.getSettings();

    // 昨日总结：每天只弹一次
    if (settings.lastYesterdayShow !== today) {
      try {
        const res = await api.getYesterdaySummary();
        if (res.code === 0 && res.data.totalCount > 0) {
          const summary = res.data;
          summary.scoreDeg = summary.totalCount > 0 ? Math.round((summary.checkedCount / summary.totalCount) * 360) : 0;
          this.setData({ yesterdaySummary: summary, showYesterday: true });
          settings.lastYesterdayShow = today;
          storage.saveSettings(settings);
        }
      } catch (e) {}
      return; // 不要同时弹两个
    }

    // 周报：每周一弹出，只弹一次
    const now = new Date();
    if (now.getDay() === 1) {
      const weekKey = `${now.getFullYear()}-W${Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7)}`;
      if (settings.lastWeeklyShow !== weekKey) {
        try {
          const res = await api.getWeeklyReport();
          if (res.code === 0) {
            this.setData({ weeklyReport: res.data, showWeekly: true });
            settings.lastWeeklyShow = weekKey;
            storage.saveSettings(settings);
          }
        } catch (e) {}
      }
    }
  },

  hideYesterday() {
    this.setData({ showYesterday: false });
  },

  hideWeekly() {
    this.setData({ showWeekly: false });
  },

  showWeeklyReport() {
    wx.showLoading({ title: '加载中...' });
    api.getWeeklyReport().then(res => {
      wx.hideLoading();
      if (res.code === 0) {
        this.setData({ weeklyReport: res.data, showWeekly: true });
      }
    }).catch(() => wx.hideLoading());
  },

  // 打卡某个目标（根据类型分发）
  async doCheckin(e) {
    const goalId = e.currentTarget.dataset.goalId;
    const goal = this.data.goals.find(g => g.id === goalId);
    if (!goal) return;

    const type = goal.type || 'single';

    // duration 类型跳转到计时器页面
    if (type === 'duration') {
      wx.navigateTo({ url: `/pages/timer/index?goalId=${goalId}` });
      return;
    }

    // single 类型：已打卡则提示
    if (type === 'single' && goal.checked) {
      wx.showToast({ title: '该目标今日已打卡', icon: 'none' });
      return;
    }

    // count 类型：已达上限则提示
    if (type === 'count' && goal.countDone) {
      wx.showToast({ title: `今日已完成${goal.targetCount}次`, icon: 'none' });
      return;
    }

    wx.showLoading({ title: '打卡中...' });

    try {
      const res = type === 'count'
        ? await api.checkinCount(goalId)
        : await api.checkin(goalId);

      if (res.code === 0) {
        this.setData({
          currentQuote: res.data.quote,
          newAchievements: res.data.newAchievements || [],
          globalTotalDays: res.data.globalTotalDays,
          showQuote: true
        });

        if (res.data.newAchievements && res.data.newAchievements.length > 0) {
          wx.vibrateShort({ type: 'medium' });
        }

        wx.hideLoading();
        wx.showToast({ title: `${goal.name} 打卡成功`, icon: 'success' });

        this.loadData();
      } else {
        wx.hideLoading();
        wx.showToast({ title: res.message || '打卡失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '打卡失败，请重试', icon: 'none' });
      console.error('打卡失败:', err);
    }
  },

  // 显示添加目标弹窗
  showAddGoalModal() {
    const presets = this.data.presetIcons;
    this.setData({
      showAddGoal: true,
      newGoalName: '',
      editingGoal: null,
      selectedPreset: Math.floor(Math.random() * presets.length),
      selectedType: 'single',
      targetCount: 3,
      customIcon: ''
    });
  },

  // 编辑目标
  editGoal(e) {
    const goalId = e.currentTarget.dataset.goalId;
    const goal = this.data.goals.find(g => g.id === goalId);
    if (!goal) return;

    wx.showActionSheet({
      itemList: ['编辑目标', '删除目标'],
      success: (res) => {
        if (res.tapIndex === 0) {
          const presets = this.data.presetIcons;
          const presetIdx = presets.findIndex(p => p.icon === goal.icon);
          this.setData({
            showAddGoal: true,
            editingGoal: goal,
            newGoalName: goal.name,
            selectedPreset: presetIdx >= 0 ? presetIdx : 0,
            selectedType: goal.type || 'single',
            targetCount: goal.targetCount || 3
          });
        } else if (res.tapIndex === 1) {
          this.deleteGoalConfirm(goalId);
        }
      }
    });
  },

  selectGoalType(e) {
    this.setData({ selectedType: e.currentTarget.dataset.type });
  },

  onTargetCountInput(e) {
    let val = parseInt(e.detail.value) || 1;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    this.setData({ targetCount: val });
  },

  hideAddGoalModal() {
    this.setData({ showAddGoal: false, editingGoal: null });
  },

  preventBubble() {},

  onGoalNameInput(e) {
    this.setData({ newGoalName: e.detail.value });
  },

  onCustomIconInput(e) {
    this.setData({ customIcon: e.detail.value });
  },

  selectPreset(e) {
    this.setData({ selectedPreset: e.currentTarget.dataset.index });
  },

  // 保存目标（新建或编辑）
  async saveGoal() {
    const { newGoalName, selectedPreset, presetIcons, editingGoal, selectedType, targetCount, customIcon } = this.data;
    const name = newGoalName.trim();

    if (!name) {
      wx.showToast({ title: '请输入目标名称', icon: 'none' });
      return;
    }

    const preset = presetIcons[selectedPreset];
    // 优先使用自定义图标
    const icon = customIcon.trim() || preset.icon;
    const color = customIcon.trim() ? '#5BAEBF' : preset.color;

    try {
      if (editingGoal) {
        await api.updateGoal(editingGoal.id, {
          name,
          icon,
          color,
          type: selectedType,
          targetCount: selectedType === 'count' ? targetCount : 0
        });
        wx.showToast({ title: '已更新', icon: 'success' });
      } else {
        await api.createGoal(name, icon, color, selectedType, targetCount);
        wx.showToast({ title: '目标已创建', icon: 'success' });
      }

      this.setData({ showAddGoal: false, editingGoal: null, customIcon: '' });
      this.loadData();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  // 删除目标
  deleteGoalConfirm(goalId) {
    const goal = this.data.goals.find(g => g.id === goalId);
    if (!goal) return;

    wx.showModal({
      title: '删除目标',
      content: `确定删除「${goal.name}」？该目标的所有打卡记录也将被删除。`,
      success: async (res) => {
        if (res.confirm) {
          await api.deleteGoal(goalId);
          wx.showToast({ title: '已删除', icon: 'success' });
          this.loadData();
        }
      }
    });
  },

  // 倒数日相关
  showCountdownModal() {
    const { countdown } = this.data;
    if (countdown) {
      // 已有倒数日，显示操作菜单
      wx.showActionSheet({
        itemList: ['修改倒数日', '删除倒数日'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 修改
            this.setData({
              showCountdown: true,
              countdownName: countdown.name,
              countdownDate: countdown.date
            });
          } else {
            // 删除
            this.deleteCountdown();
          }
        }
      });
    } else {
      // 没有倒数日，显示添加弹窗
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = dateUtil.format(tomorrow, 'YYYY-MM-DD');
      this.setData({
        showCountdown: true,
        countdownName: '',
        countdownDate: tomorrowStr
      });
    }
  },

  hideCountdownModal() {
    this.setData({ showCountdown: false });
  },

  onCountdownNameInput(e) {
    this.setData({ countdownName: e.detail.value });
  },

  onCountdownDateChange(e) {
    this.setData({ countdownDate: e.detail.value });
  },

  saveCountdown() {
    const { countdownName, countdownDate } = this.data;
    if (!countdownName.trim()) {
      wx.showToast({ title: '请输入事件名称', icon: 'none' });
      return;
    }
    if (!countdownDate) {
      wx.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }

    const settings = storage.getSettings();
    settings.countdowns = [{
      id: 'cd_' + Date.now(),
      name: countdownName.trim(),
      date: countdownDate
    }];
    storage.saveSettings(settings);
    this.loadCountdown();
    this.setData({ showCountdown: false });
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  deleteCountdown() {
    wx.showModal({
      title: '删除倒数日',
      content: '确定删除倒数日？',
      success: (res) => {
        if (res.confirm) {
          const settings = storage.getSettings();
          settings.countdowns = [];
          storage.saveSettings(settings);
          this.setData({ countdown: null });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  // 隐藏语录弹窗
  hideQuoteModal() {
    this.setData({ showQuote: false });
  },

  onGeneratePoster() {
    wx.navigateTo({ url: '/pages/share/index' });
  },

  goPet() {
    wx.navigateTo({ url: '/pages/pet/index' });
  },

  goChallenge() {
    wx.navigateTo({ url: '/pages/challenge/index' });
  },

  goShare() {
    wx.navigateTo({ url: '/pages/share/index' });
  },

  goHistory() {
    wx.switchTab({ url: '/pages/history/index' });
  },

  onShareAppMessage() {
    const { globalTotalDays, currentQuote } = this.data;
    return {
      title: `守心打卡第${globalTotalDays}天 - ${currentQuote.content}`,
      path: '/pages/index/index'
    };
  },

  onShareTimeline() {
    return {
      title: `守心打卡第${this.data.globalTotalDays}天`,
      path: '/pages/index/index'
    };
  }
});
