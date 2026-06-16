const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    themeClass: '',
    cardData: null,
    loading: true
  },

  onLoad() {
    this.setData({ themeClass: app.globalData.themeClass });
    this.generateCard();
  },

  async generateCard() {
    try {
      const statsRes = await api.getStats();
      const global = statsRes.code === 0 ? statsRes.data : {};

      const shareData = api.generateShareData();

      this.setData({
        cardData: {
          totalDays: shareData.totalDays,
          longestStreak: shareData.longestStreak,
          goalCount: shareData.goalCount,
          achievementCount: shareData.achievementCount,
          petCount: shareData.petCount,
          topGoals: shareData.topGoals,
          date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
        },
        loading: false
      });

      // 延迟绘制卡片
      setTimeout(() => this.drawCard(), 300);
    } catch (err) {
      console.error('生成卡片失败:', err);
      this.setData({ loading: false });
    }
  },

  drawCard() {
    const query = wx.createSelectorQuery();
    query.select('#cardCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) return;

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getWindowInfo().pixelRatio;
        const width = 600;
        const height = 800;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const { cardData } = this.data;

        // 背景
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#5B9A6F');
        gradient.addColorStop(1, '#8BC4A0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 装饰圆
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(width - 80, 80, 120, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(60, height - 100, 80, 0, Math.PI * 2);
        ctx.fill();

        // 标题
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('守心 · 打卡记录', width / 2, 80);

        // 日期
        ctx.font = '16px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(cardData.date, width / 2, 110);

        // 主要数据
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 72px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cardData.totalDays.toString(), width / 2, 240);

        ctx.font = '18px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText('累计打卡天数', width / 2, 270);

        // 统计数据
        const statsY = 340;
        const statsGap = 140;

        // 最长连续
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cardData.longestStreak.toString(), width / 2 - statsGap, statsY);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('最长连续', width / 2 - statsGap, statsY + 24);

        // 目标数
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cardData.goalCount.toString(), width / 2, statsY);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('进行中目标', width / 2, statsY + 24);

        // 成就数
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cardData.achievementCount.toString(), width / 2 + statsGap, statsY);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('解锁成就', width / 2 + statsGap, statsY + 24);

        // 目标列表
        if (cardData.topGoals.length > 0) {
          const listY = 440;
          ctx.font = '16px sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.textAlign = 'left';
          ctx.fillText('热门目标', 60, listY);

          cardData.topGoals.forEach((goal, i) => {
            const y = listY + 40 + i * 50;
            const rx = 60;
            const ry = y - 16;
            const rw = width - 120;
            const rh = 40;
            const radius = 8;

            // 绘制圆角矩形
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.moveTo(rx + radius, ry);
            ctx.lineTo(rx + rw - radius, ry);
            ctx.arcTo(rx + rw, ry, rx + rw, ry + radius, radius);
            ctx.lineTo(rx + rw, ry + rh - radius);
            ctx.arcTo(rx + rw, ry + rh, rx + rw - radius, ry + rh, radius);
            ctx.lineTo(rx + radius, ry + rh);
            ctx.arcTo(rx, ry + rh, rx, ry + rh - radius, radius);
            ctx.lineTo(rx, ry + radius);
            ctx.arcTo(rx, ry, rx + radius, ry, radius);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${goal.icon} ${goal.name}`, 80, y + 8);

            ctx.textAlign = 'right';
            ctx.fillText(`${goal.days}天`, width - 80, y + 8);
          });
        }

        // 底部
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('自律给我自由 · 守心', width / 2, height - 40);
      });
  },

  // 保存到相册
  async saveToAlbum() {
    try {
      wx.canvasToTempFilePath({
        canvas: this._canvas,
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({ title: '已保存到相册', icon: 'success' });
            },
            fail: () => {
              wx.showToast({ title: '保存失败', icon: 'none' });
            }
          });
        },
        fail: () => {
          wx.showToast({ title: '保存失败', icon: 'none' });
        }
      });
    } catch (err) {
      console.error('保存失败:', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `我已累计打卡${this.data.cardData?.totalDays || 0}天，快来看看！`,
      path: '/pages/index/index'
    };
  }
});
