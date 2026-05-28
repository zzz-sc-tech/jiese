// 日期工具函数
const dateUtil = {
  // 格式化日期
  format(date, fmt = 'YYYY-MM-DD') {
    const d = date instanceof Date ? date : new Date(date);
    const map = {
      'YYYY': d.getFullYear(),
      'MM': String(d.getMonth() + 1).padStart(2, '0'),
      'DD': String(d.getDate()).padStart(2, '0'),
      'HH': String(d.getHours()).padStart(2, '0'),
      'mm': String(d.getMinutes()).padStart(2, '0'),
      'ss': String(d.getSeconds()).padStart(2, '0')
    };
    let result = fmt;
    for (const [key, val] of Object.entries(map)) {
      result = result.replace(key, val);
    }
    return result;
  },

  // 获取今天字符串
  today() {
    return this.format(new Date());
  },

  // 获取昨天字符串
  yesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return this.format(d);
  },

  // 获取某月天数
  getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  },

  // 获取某月第一天是星期几（0-6，0是周日）
  getFirstDayOfMonth(year, month) {
    return new Date(year, month - 1, 1).getDay();
  },

  // 计算两个日期之间的天数
  daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = Math.abs(d2 - d1);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },

  // 获取友好的时间描述
  getFriendlyTime(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days === 2) return '前天';
    if (days < 7) return `${days}天前`;
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    if (days < 365) return `${Math.floor(days / 30)}个月前`;
    return `${Math.floor(days / 365)}年前`;
  },

  // 获取星期几
  getWeekDay(date) {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const d = date instanceof Date ? date : new Date(date);
    return days[d.getDay()];
  },

  // 判断是否是同一天
  isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  },

  // 获取今日时间戳范围
  getTodayRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }
};

module.exports = dateUtil;
