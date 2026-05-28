App({
  onLaunch() {
    // 一次性迁移：清除所有旧挑战数据（新的挑战模型要求每个目标绑定独立挑战）
    const storage = require('./utils/storage');
    if (!storage.get('jiese_migration_v2_done')) {
      storage.set('jiese_challenges', []);
      storage.set('jiese_migration_v2_done', true);
    }
  },

  globalData: {
    todayChecked: false,
    currentStreak: 0,
    totalDays: 0
  }
});
