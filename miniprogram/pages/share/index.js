const api = require('../../utils/api');
const storage = require('../../utils/storage');
const poster = require('../../utils/poster');

const app = getApp();

Page({
  data: {
    posterPath: '',
    themeClass: ''
  },

  onLoad() {
    app.applyNavBarColor(app.globalData.theme);
    this.setData({ themeClass: app.globalData.themeClass });
    this.drawPoster();
  },

  async drawPoster() {
    const query = wx.createSelectorQuery();
    query.select('#posterCanvas')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        if (!res[0]) return;

        const canvas = res[0].node;

        // 获取数据
        let stats = { currentStreak: 0, totalDays: 0, longestStreak: 0 };
        let quote = { content: '自律给我自由。', author: '康德' };

        try {
          const [statsRes, quoteRes] = await Promise.all([
            api.getStats(),
            api.getQuotes(1)
          ]);
          if (statsRes.code === 0) {
            stats = statsRes.data;
          }
          if (quoteRes.code === 0 && quoteRes.data.length > 0) {
            quote = quoteRes.data[0];
          }
        } catch (err) {
          console.error('获取数据失败:', err);
        }

        try {
          const path = await poster.generatePoster(canvas, stats, quote);
          this.setData({ posterPath: path });
        } catch (err) {
          console.error('生成海报失败:', err);
        }
      });
  },

  async savePoster() {
    if (!this.data.posterPath) {
      wx.showToast({ title: '海报生成中...', icon: 'none' });
      return;
    }

    try {
      await wx.saveImageToPhotosAlbum({
        filePath: this.data.posterPath
      });
      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (err) {
      if (err.errMsg.includes('auth deny')) {
        wx.showModal({
          title: '提示',
          content: '需要您授权保存图片到相册',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting();
            }
          }
        });
      }
    }
  },

  onShareAppMessage() {
    return {
      title: `守心打卡第${getApp().globalData.currentStreak}天`,
      path: '/pages/index/index',
      imageUrl: this.data.posterPath
    };
  }
});
