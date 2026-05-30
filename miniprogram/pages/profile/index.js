const api = require('../../utils/api');
const storage = require('../../utils/storage');

const ALL_ACHIEVEMENTS = [
  { id: 'first_day', name: '初出茅庐', desc: '完成第一次打卡', icon: '🌱' },
  { id: 'three_days', name: '三日之约', desc: '连续打卡3天', icon: '🌿' },
  { id: 'one_week', name: '一周坚持', desc: '连续打卡7天', icon: '🍀' },
  { id: 'two_weeks', name: '两周不辍', desc: '连续打卡14天', icon: '🌲' },
  { id: 'habit_formed', name: '习惯养成', desc: '连续打卡21天', icon: '🌳' },
  { id: 'one_month', name: '月度之星', desc: '连续打卡30天', icon: '⭐' },
  { id: 'two_months', name: '双月达人', desc: '连续打卡60天', icon: '🌟' },
  { id: 'quarter', name: '季度楷模', desc: '连续打卡90天', icon: '💫' },
  { id: 'century', name: '百日征程', desc: '连续打卡100天', icon: '🎯' },
  { id: 'half_year', name: '半载坚守', desc: '连续打卡180天', icon: '👑' },
  { id: 'one_year', name: '年度传奇', desc: '连续打卡365天', icon: '💎' },
  { id: 'total_10', name: '十日积累', desc: '累计打卡10天', icon: '🔥' },
  { id: 'total_50', name: '半百之志', desc: '累计打卡50天', icon: '⚡' },
  { id: 'total_100', name: '百日修行', desc: '累计打卡100天', icon: '🏆' },
  { id: 'total_200', name: '二百里程', desc: '累计打卡200天', icon: '🎖️' },
  { id: 'total_365', name: '一年有成', desc: '累计打卡365天', icon: '🥇' },
  { id: 'total_500', name: '五百传奇', desc: '累计打卡500天', icon: '🌈' },
  { id: 'total_1000', name: '千日不辍', desc: '累计打卡1000天', icon: '✨' }
];

const app = getApp();

Page({
  data: {
    avatarUrl: '',
    nickname: '打卡用户',
    totalDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievements: [],
    lockedAchievements: [],
    totalAchievements: ALL_ACHIEVEMENTS.length,
    remindEnabled: false,
    remindTime: '08:00',
    themeClass: '',
    themeName: '清新绿',
    vibrateIntensity: 'medium',
    vibrateIntensityName: '中等',
    vibrateMode: 'auto',
    vibrateModeName: '自动停止'
  },

  onLoad() {
    this.loadUserData();
  },

  onShow() {
    app.applyNavBarColor(app.globalData.theme);
    this.loadUserData();
  },

  async loadUserData() {
    try {
      const res = await api.getStats();
      if (res.code === 0) {
        const { totalDays, currentStreak, longestStreak, achievements } = res.data;

        const unlockedIds = (achievements || []).map(a => a.id);
        const unlocked = ALL_ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id));
        const locked = ALL_ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id));

        this.setData({
          totalDays,
          currentStreak,
          longestStreak,
          achievements: unlocked,
          lockedAchievements: locked
        });
      }

      // 加载设置
      const settings = storage.getSettings();
      const theme = settings.theme || 'green';
      const themeNameMap = { green: '清新绿', pink: '裸粉', dark: '墨夜' };
      const vibrateIntensityNameMap = { off: '关闭', light: '轻微', medium: '中等', heavy: '强烈' };
      const vibrateModeNameMap = { auto: '自动停止', manual: '持续震动' };
      this.setData({
        nickname: settings.nickname || '打卡用户',
        remindEnabled: settings.remindEnabled,
        remindTime: settings.remindTime,
        themeClass: app.globalData.themeClass,
        themeName: themeNameMap[theme] || '清新绿',
        vibrateIntensity: settings.vibrateIntensity || 'medium',
        vibrateIntensityName: vibrateIntensityNameMap[settings.vibrateIntensity || 'medium'],
        vibrateMode: settings.vibrateMode || 'auto',
        vibrateModeName: vibrateModeNameMap[settings.vibrateMode || 'auto']
      });
    } catch (err) {
      console.error('加载用户数据失败:', err);
    }
  },

  editNickname() {
    wx.showModal({
      title: '修改昵称',
      content: this.data.nickname,
      editable: true,
      placeholderText: '请输入昵称',
      success: (res) => {
        if (res.confirm && res.content) {
          const name = res.content.trim();
          if (name) {
            const settings = storage.getSettings();
            settings.nickname = name;
            storage.saveSettings(settings);
            this.setData({ nickname: name });
            wx.showToast({ title: '已修改', icon: 'success' });
          }
        }
      }
    });
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        this.setData({
          avatarUrl: res.tempFiles[0].tempFilePath
        });
      }
    });
  },

  goChallenge() {
    wx.navigateTo({ url: '/pages/challenge/index' });
  },

  goShare() {
    wx.navigateTo({ url: '/pages/share/index' });
  },

  setReminder() {
    wx.showActionSheet({
      itemList: ['开启每日提醒', '关闭每日提醒', '设置提醒时间'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.enableReminder();
        } else if (res.tapIndex === 1) {
          this.disableReminder();
        } else if (res.tapIndex === 2) {
          this.setRemindTime();
        }
      }
    });
  },

  enableReminder() {
    const settings = storage.getSettings();
    settings.remindEnabled = true;
    storage.saveSettings(settings);
    this.setData({ remindEnabled: true });
    wx.showToast({ title: '提醒已开启', icon: 'success' });
  },

  disableReminder() {
    const settings = storage.getSettings();
    settings.remindEnabled = false;
    storage.saveSettings(settings);
    this.setData({ remindEnabled: false });
    wx.showToast({ title: '提醒已关闭', icon: 'success' });
  },

  setRemindTime() {
    // 使用时间选择器
    wx.showModal({
      title: '设置提醒时间',
      content: '当前提醒时间：' + this.data.remindTime,
      editable: true,
      placeholderText: '08:00',
      success: (res) => {
        if (res.confirm && res.content) {
          const settings = storage.getSettings();
          settings.remindTime = res.content;
          storage.saveSettings(settings);
          this.setData({ remindTime: res.content });
          wx.showToast({ title: '设置成功', icon: 'success' });
        }
      }
    });
  },

  selectTheme() {
    wx.showActionSheet({
      itemList: ['清新绿', '裸粉', '墨夜'],
      success: (res) => {
        const themes = ['green', 'pink', 'dark'];
        const theme = themes[res.tapIndex];
        const settings = storage.getSettings();
        settings.theme = theme;
        storage.saveSettings(settings);
        app.applyTheme(theme);
        const themeClassMap = { green: '', pink: 'theme-pink', dark: 'theme-dark' };
        const themeNameMap = { green: '清新绿', pink: '裸粉', dark: '墨夜' };
        this.setData({
          themeClass: themeClassMap[theme] || '',
          themeName: themeNameMap[theme] || '清新绿'
        });
        wx.showToast({ title: '已切换主题', icon: 'success' });
      }
    });
  },

  setVibrateIntensity() {
    wx.showActionSheet({
      itemList: ['关闭', '轻微', '中等', '强烈'],
      success: (res) => {
        const intensities = ['off', 'light', 'medium', 'heavy'];
        const intensity = intensities[res.tapIndex];
        const settings = storage.getSettings();
        settings.vibrateIntensity = intensity;
        storage.saveSettings(settings);
        const nameMap = { off: '关闭', light: '轻微', medium: '中等', heavy: '强烈' };
        this.setData({
          vibrateIntensity: intensity,
          vibrateIntensityName: nameMap[intensity]
        });
        // 震动反馈
        if (intensity !== 'off') {
          wx.vibrateShort({ type: intensity === 'heavy' ? 'heavy' : 'medium' });
        }
        wx.showToast({ title: '已设置', icon: 'success' });
      }
    });
  },

  setVibrateMode() {
    wx.showActionSheet({
      itemList: ['震动几次后自动停止', '持续震动（点击弹窗停止）'],
      success: (res) => {
        const modes = ['auto', 'manual'];
        const mode = modes[res.tapIndex];
        const settings = storage.getSettings();
        settings.vibrateMode = mode;
        storage.saveSettings(settings);
        const nameMap = { auto: '自动停止', manual: '持续震动' };
        this.setData({
          vibrateMode: mode,
          vibrateModeName: nameMap[mode]
        });
        wx.showToast({ title: '已设置', icon: 'success' });
      }
    });
  },

  showAbout() {
    wx.showModal({
      title: '关于守心',
      content: '守心是一款帮助你培养自律习惯的小程序。\n\n每日打卡，记录你的坚持；\n语录激励，给你前行的力量；\n挑战模式，突破自我极限。\n\n自律给我自由！',
      showCancel: false
    });
  },

  onShareAppMessage() {
    return {
      title: '守心 - 自律给我自由',
      path: '/pages/index/index'
    };
  }
});
