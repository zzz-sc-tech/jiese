const api = require('../../utils/api');
const storage = require('../../utils/storage');
const dateUtil = require('../../utils/date');
const app = getApp();

Page({
  data: {
    themeClass: '',
    goals: [],
    chains: [],
    showAddChain: false,
    newChainName: '',
    selectedGoals: [],
    chainType: 'sequence', // sequence: 顺序, parallel: 并行
    // 预设模板
    templates: [
      { name: '早起习惯链', icon: '🌅', goals: ['早起', '运动', '阅读'], desc: '早起后运动，然后阅读' },
      { name: '学习习惯链', icon: '📚', goals: ['背单词', '阅读', '练字'], desc: '每日学习三部曲' },
      { name: '健康习惯链', icon: '💪', goals: ['运动', '喝水', '早睡'], desc: '健康生活从这开始' },
      { name: '心灵习惯链', icon: '🧘', goals: ['冥想', '写日记', '感恩'], desc: '每日心灵修养' }
    ]
  },

  onLoad() {
    this.setData({ themeClass: app.globalData.themeClass });
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const goalsRes = api.getGoals();
    const goals = goalsRes.code === 0 ? goalsRes.data : [];

    // 加载习惯链
    const chains = storage.get('jiese_habit_chains', []);

    // 计算每个链的今日进度
    const checkins = api.getCheckins();
    const today = dateUtil.today();

    const chainsWithProgress = chains.map(chain => {
      const progress = chain.goals.map(g => {
        const goal = goals.find(goal => goal.id === g.goalId);
        const checked = checkins.some(c => c.goalId === g.goalId && c.date === today);
        return {
          ...g,
          goalName: goal?.name || '未知',
          goalIcon: goal?.icon || '❓',
          goalColor: goal?.color || '#999',
          checked
        };
      });

      const completedCount = progress.filter(g => g.checked).length;
      const isCompleted = chain.type === 'sequence'
        ? progress.every(g => g.checked)
        : progress.some(g => g.checked);

      return {
        ...chain,
        progress,
        completedCount,
        totalCount: progress.length,
        isCompleted,
        completionRate: Math.round(completedCount / progress.length * 100)
      };
    });

    this.setData({
      goals,
      chains: chainsWithProgress
    });
  },

  // 显示添加习惯链弹窗
  showAddChainModal() {
    this.setData({
      showAddChain: true,
      newChainName: '',
      selectedGoals: [],
      chainType: 'sequence'
    });
  },

  hideAddChainModal() {
    this.setData({ showAddChain: false });
  },

  // 输入链名称
  onChainNameInput(e) {
    this.setData({ newChainName: e.detail.value });
  },

  // 选择目标
  toggleGoal(e) {
    const goalId = e.currentTarget.dataset.goalId;
    let { selectedGoals } = this.data;

    if (selectedGoals.includes(goalId)) {
      selectedGoals = selectedGoals.filter(id => id !== goalId);
    } else {
      selectedGoals.push(goalId);
    }

    this.setData({ selectedGoals });
  },

  // 切换链类型
  switchChainType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ chainType: type });
  },

  // 使用模板
  useTemplate(e) {
    const index = e.currentTarget.dataset.index;
    const template = this.data.templates[index];
    const { goals } = this.data;

    // 根据模板名称匹配目标
    const selectedGoals = [];
    template.goals.forEach(name => {
      const goal = goals.find(g => g.name.includes(name));
      if (goal) {
        selectedGoals.push(goal.id);
      }
    });

    this.setData({
      newChainName: template.name,
      selectedGoals,
      chainType: 'sequence'
    });
  },

  // 保存习惯链
  saveChain() {
    const { newChainName, selectedGoals, chainType, goals } = this.data;

    if (!newChainName.trim()) {
      wx.showToast({ title: '请输入习惯链名称', icon: 'none' });
      return;
    }

    if (selectedGoals.length < 2) {
      wx.showToast({ title: '请至少选择2个目标', icon: 'none' });
      return;
    }

    const chains = storage.get('jiese_habit_chains', []);
    const newChain = {
      id: 'chain_' + Date.now(),
      name: newChainName.trim(),
      type: chainType,
      goals: selectedGoals.map((goalId, index) => {
        const goal = goals.find(g => g.id === goalId);
        return {
          goalId,
          order: index + 1,
          name: goal?.name || ''
        };
      }),
      createdAt: Date.now()
    };

    chains.push(newChain);
    storage.set('jiese_habit_chains', chains);

    this.setData({ showAddChain: false });
    this.loadData();
    wx.showToast({ title: '创建成功', icon: 'success' });
  },

  // 删除习惯链
  deleteChain(e) {
    const chainId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除习惯链',
      content: '确定删除这个习惯链吗？',
      success: (res) => {
        if (res.confirm) {
          let chains = storage.get('jiese_habit_chains', []);
          chains = chains.filter(c => c.id !== chainId);
          storage.set('jiese_habit_chains', chains);
          this.loadData();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  // 阻止冒泡
  preventBubble() {}
});
