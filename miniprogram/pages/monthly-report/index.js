const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    themeClass: '',
    year: 2026,
    month: 6,
    report: null,
    loading: true
  },

  onLoad(options) {
    const year = parseInt(options.year) || new Date().getFullYear();
    const month = parseInt(options.month) || new Date().getMonth() + 1;

    this.setData({
      themeClass: app.globalData.themeClass,
      year,
      month
    });

    this.loadReport();
  },

  async loadReport() {
    this.setData({ loading: true });
    try {
      const res = await api.getMonthlyReport(this.data.year, this.data.month);
      if (res.code === 0) {
        const report = res.data;
        const avgPerDay = report.totalCheckins > 0
          ? (report.totalCheckins / report.daysInMonth).toFixed(1)
          : '0';
        this.setData({ report, avgPerDay, loading: false });
      }
    } catch (err) {
      console.error('加载月度报告失败:', err);
      this.setData({ loading: false });
    }
  },

  // 切换月份
  prevMonth() {
    let { year, month } = this.data;
    month--;
    if (month < 1) {
      month = 12;
      year--;
    }
    this.setData({ year, month });
    this.loadReport();
  },

  nextMonth() {
    let { year, month } = this.data;
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
    this.setData({ year, month });
    this.loadReport();
  },

  // 分享
  onShareAppMessage() {
    const { year, month, report } = this.data;
    return {
      title: `我的${year}年${month}月打卡报告`,
      path: '/pages/index/index'
    };
  }
});
