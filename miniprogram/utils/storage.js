// 本地缓存工具
const KEYS = {
  USER_INFO: 'jiese_user_info',
  TODAY_CHECKED: 'jiese_today_checked',
  LAST_CHECK_DATE: 'jiese_last_check_date',
  CACHED_STATS: 'jiese_cached_stats',
  SETTINGS: 'jiese_settings',
  QUOTES_CACHE: 'jiese_quotes_cache'
};

const storage = {
  // 设置缓存
  set(key, value, expireMs = null) {
    const data = {
      value,
      timestamp: Date.now()
    };
    if (expireMs) {
      data.expire = Date.now() + expireMs;
    }
    try {
      wx.setStorageSync(key, JSON.stringify(data));
    } catch (e) {
      console.error('缓存写入失败:', e);
    }
  },

  // 获取缓存
  get(key, defaultValue = null) {
    try {
      const raw = wx.getStorageSync(key);
      if (!raw) return defaultValue;
      const data = JSON.parse(raw);
      if (data.expire && Date.now() > data.expire) {
        wx.removeStorageSync(key);
        return defaultValue;
      }
      return data.value;
    } catch (e) {
      return defaultValue;
    }
  },

  // 删除缓存
  remove(key) {
    try {
      wx.removeStorageSync(key);
    } catch (e) {
      console.error('缓存删除失败:', e);
    }
  },

  // 检查今日是否已打卡
  isTodayChecked() {
    const lastDate = this.get(KEYS.LAST_CHECK_DATE);
    const today = this.getTodayStr();
    return lastDate === today;
  },

  // 标记今日已打卡
  markTodayChecked() {
    this.set(KEYS.LAST_CHECK_DATE, this.getTodayStr());
  },

  // 获取今日日期字符串
  getTodayStr() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  },

  // 缓存统计数据
  cacheStats(stats) {
    this.set(KEYS.CACHED_STATS, stats, 5 * 60 * 1000); // 5分钟过期
  },

  // 获取缓存的统计
  getCachedStats() {
    return this.get(KEYS.CACHED_STATS);
  },

  // 获取设置
  getSettings() {
    return this.get(KEYS.SETTINGS, {
      remindEnabled: true,
      remindTime: '08:00',
      theme: 'light',
      nickname: '打卡用户',
      vibrateIntensity: 'medium', // off, light, medium, heavy
      vibrateMode: 'auto' // auto: 震动几次后停止, manual: 持续震动直到点击
    });
  },

  // 保存设置
  saveSettings(settings) {
    this.set(KEYS.SETTINGS, settings);
  }
};

module.exports = storage;
