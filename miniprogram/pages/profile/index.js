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
    totalCheckins: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievements: [],
    lockedAchievements: [],
    totalAchievements: ALL_ACHIEVEMENTS.length,
    themeClass: '',
    themeName: '清新绿',
    vibrateIntensity: 'medium',
    vibrateMode: 'auto',
    vibrateName: '中等·自动停止'
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
        const { currentStreak, longestStreak, achievements } = res.data;

        const unlockedIds = (achievements || []).map(a => a.id);
        const unlocked = ALL_ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id));
        const locked = ALL_ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id));

        // 获取实际打卡天数（去重）和总打卡次数
        const totalDays = api.getActualCheckinDays();
        const totalCheckins = api.getTotalCheckins();

        this.setData({
          totalDays,
          totalCheckins,
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
      const validIntensities = ['light', 'medium', 'heavy'];
      const validModes = ['auto', 'manual'];
      const intensity = validIntensities.includes(settings.vibrateIntensity) ? settings.vibrateIntensity : 'medium';
      const mode = validModes.includes(settings.vibrateMode) ? settings.vibrateMode : 'auto';
      const intensityNameMap = { light: '轻微', medium: '中等', heavy: '强烈' };
      const modeNameMap = { auto: '自动停止', manual: '持续震动' };
      const vibrateName = `${intensityNameMap[intensity]}·${modeNameMap[mode]}`;
      if (settings.vibrateIntensity !== intensity || settings.vibrateMode !== mode) {
        settings.vibrateIntensity = intensity;
        settings.vibrateMode = mode;
        storage.saveSettings(settings);
      }
      this.setData({
        nickname: settings.nickname || '打卡用户',
        avatarUrl: settings.avatarUrl || '',
        themeClass: app.globalData.themeClass,
        themeName: themeNameMap[theme] || '清新绿',
        vibrateIntensity: intensity,
        vibrateMode: mode,
        vibrateName
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
        const avatarUrl = res.tempFiles[0].tempFilePath;
        const settings = storage.getSettings();
        settings.avatarUrl = avatarUrl;
        storage.saveSettings(settings);
        this.setData({
          avatarUrl
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

  setVibrate() {
    const that = this;
    wx.showActionSheet({
      itemList: ['轻微', '中等', '强烈'],
      success: (res) => {
        const intensities = ['light', 'medium', 'heavy'];
        const intensity = intensities[res.tapIndex];
        wx.showActionSheet({
          itemList: ['自动停止（震动几次后停止）', '持续震动（弹窗点击停止）'],
          success: (res2) => {
            const mode = res2.tapIndex === 0 ? 'auto' : 'manual';
            that._saveVibrateSetting(intensity, mode);
          }
        });
      }
    });
  },

  _saveVibrateSetting(intensity, mode) {
    const settings = storage.getSettings();
    settings.vibrateIntensity = intensity;
    settings.vibrateMode = mode;
    storage.saveSettings(settings);

    const intensityNameMap = { light: '轻微', medium: '中等', heavy: '强烈' };
    const modeNameMap = { auto: '自动停止', manual: '持续震动' };
    const vibrateName = `${intensityNameMap[intensity]}·${modeNameMap[mode]}`;

    this.setData({
      vibrateIntensity: intensity,
      vibrateMode: mode,
      vibrateName
    });

    // 震动反馈
    const type = intensity === 'heavy' ? 'heavy' : 'light';
    wx.vibrateShort({ type: type });

    wx.showToast({ title: '已设置', icon: 'success' });
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
