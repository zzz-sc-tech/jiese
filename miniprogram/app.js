App({
  onLaunch() {
    const storage = require('./utils/storage');

    // 一次性迁移：清除所有旧挑战数据（新的挑战模型要求每个目标绑定独立挑战）
    if (!storage.get('jiese_migration_v2_done')) {
      storage.set('jiese_challenges', []);
      storage.set('jiese_migration_v2_done', true);
    }

    // 初始化主题
    const settings = storage.getSettings();
    this.globalData.theme = settings.theme || 'green';
    this.globalData.themeClass = this.globalData.theme === 'pink' ? 'theme-pink' : '';
  },

  // 切换主题
  applyTheme(theme) {
    this.globalData.theme = theme;
    this.globalData.themeClass = theme === 'pink' ? 'theme-pink' : '';
  },

  globalData: {
    todayChecked: false,
    currentStreak: 0,
    totalDays: 0,
    theme: 'green',
    themeClass: ''
  }
});
