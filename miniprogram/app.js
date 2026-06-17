App({
  onLaunch() {
    const storage = require('./utils/storage');

    // 一次性迁移：保留旧挑战数据，避免升级时丢失历史记录。
    if (!storage.get('jiese_migration_v2_done')) {
      const oldChallenges = storage.get('jiese_challenges', []);
      if (oldChallenges.length > 0 && !storage.get('jiese_challenges_v1_backup')) {
        storage.set('jiese_challenges_v1_backup', oldChallenges);
      }
      // 如果主挑战列表被清空但备份存在，将旧数据合并回来
      const currentChallenges = storage.get('jiese_challenges', []);
      const backup = storage.get('jiese_challenges_v1_backup', []);
      if (currentChallenges.length === 0 && backup.length > 0) {
        storage.set('jiese_challenges', backup);
      }
      storage.set('jiese_migration_v2_done', true);
    }

    // 初始化主题
    const settings = storage.getSettings();
    const validThemes = ['green', 'pink', 'dark'];
    const theme = validThemes.includes(settings.theme) ? settings.theme : 'green';
    if (settings.theme !== theme) {
      settings.theme = theme;
      storage.saveSettings(settings);
    }

    this.globalData.theme = theme;
    const themeClassMap = { green: '', pink: 'theme-pink', dark: 'theme-dark' };
    this.globalData.themeClass = themeClassMap[this.globalData.theme] || '';

    // 应用导航栏颜色
    this.applyNavBarColor(this.globalData.theme);

    // 检查数据备份提醒
    this.checkBackupReminder();
  },

  // 检查数据备份提醒
  checkBackupReminder() {
    const storage = require('./utils/storage');
    const settings = storage.getSettings();
    const lastBackup = settings.lastBackupTime || 0;
    const now = Date.now();
    const daysSinceBackup = (now - lastBackup) / (1000 * 60 * 60 * 24);

    // 如果超过7天没有备份，设置提醒标记
    if (daysSinceBackup >= 7) {
      this.globalData.showBackupReminder = true;
    }
  },

  // 切换主题
  applyTheme(theme) {
    this.globalData.theme = theme;
    const themeClassMap = { green: '', pink: 'theme-pink', dark: 'theme-dark' };
    this.globalData.themeClass = themeClassMap[theme] || '';
    this.applyNavBarColor(theme);
  },

  // 设置导航栏颜色
  applyNavBarColor(theme) {
    const colors = {
      green: {
        frontColor: '#ffffff',
        backgroundColor: '#5B9A6F'
      },
      pink: {
        frontColor: '#ffffff',
        backgroundColor: '#C4A0A0'
      },
      dark: {
        frontColor: '#ffffff',
        backgroundColor: '#2A2A2E'
      }
    };
    const color = colors[theme] || colors.green;
    wx.setNavigationBarColor(color);
  },

  globalData: {
    todayChecked: false,
    currentStreak: 0,
    totalDays: 0,
    theme: 'green',
    themeClass: ''
  }
});
