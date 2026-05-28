const api = require('../../utils/api');
const storage = require('../../utils/storage');

Page({
  data: {
    posterPath: ''
  },

  onLoad() {
    this.drawPoster();
  },

  async drawPoster() {
    const query = wx.createSelectorQuery();
    query.select('#posterCanvas')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        if (!res[0]) return;

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getWindowInfo().pixelRatio;
        const width = 600;
        const height = 900;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // 获取数据
        let stats = { currentStreak: 0, totalDays: 0, longestStreak: 0 };
        let quote = { content: '自律给我自由。', author: '康德' };

        try {
          const statsRes = await api.getStats();
          if (statsRes.code === 0) {
            stats = statsRes.data;
          }

          const quoteRes = await api.getQuotes(1);
          if (quoteRes.code === 0 && quoteRes.data.length > 0) {
            quote = quoteRes.data[0];
          }
        } catch (err) {
          console.error('获取数据失败:', err);
        }

        // 绘制背景
        const bgGradient = ctx.createLinearGradient(0, 0, width, height);
        bgGradient.addColorStop(0, '#E8F5E9');
        bgGradient.addColorStop(0.5, '#F5F9F7');
        bgGradient.addColorStop(1, '#E8F5E9');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // 绘制装饰圆
        ctx.fillStyle = 'rgba(91, 154, 111, 0.08)';
        ctx.beginPath();
        ctx.arc(width - 80, 80, 120, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(60, height - 120, 80, 0, Math.PI * 2);
        ctx.fill();

        // 顶部标题
        ctx.fillStyle = '#2C3E2D';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('守心', width / 2, 80);

        ctx.fillStyle = '#7A8F7C';
        ctx.font = '20px sans-serif';
        ctx.fillText('坚持自律，遇见更好的自己', width / 2, 115);

        // 分割线
        ctx.strokeStyle = 'rgba(91, 154, 111, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, 145);
        ctx.lineTo(width - 60, 145);
        ctx.stroke();

        // 天数显示区域
        const daysY = 280;
        ctx.fillStyle = '#5B9A6F';
        ctx.font = 'bold 120px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(stats.currentStreak), width / 2, daysY);

        ctx.fillStyle = '#7A8F7C';
        ctx.font = '28px sans-serif';
        ctx.fillText('天连续打卡', width / 2, daysY + 50);

        // 进度环
        const ringY = 440;
        const ringRadius = 50;
        const progress = stats.currentStreak / 365;

        ctx.beginPath();
        ctx.arc(width / 2, ringY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#E0EDE2';
        ctx.lineWidth = 8;
        ctx.stroke();

        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (Math.PI * 2 * Math.min(progress, 1));
        ctx.beginPath();
        ctx.arc(width / 2, ringY, ringRadius, startAngle, endAngle);
        ctx.strokeStyle = '#5B9A6F';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 统计数据
        const statsY = 550;
        ctx.fillStyle = '#2C3E2D';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';

        // 总天数
        ctx.fillText('累计打卡', 150, statsY);
        ctx.fillStyle = '#5B9A6F';
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText(String(stats.totalDays), 150, statsY + 55);

        // 最长连续
        ctx.fillStyle = '#2C3E2D';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('最长连续', width - 150, statsY);
        ctx.fillStyle = '#5B9A6F';
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText(String(stats.longestStreak), width - 150, statsY + 55);

        // 语录区域
        const quoteY = 680;
        ctx.fillStyle = 'rgba(91, 154, 111, 0.05)';
        this.roundRect(ctx, 40, quoteY - 30, width - 80, 140, 16);
        ctx.fill();

        ctx.fillStyle = '#2C3E2D';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';

        // 自动换行绘制语录
        const maxWidth = width - 120;
        const words = quote.content.split('');
        let line = '';
        let lineY = quoteY + 10;

        for (const char of words) {
          const testLine = line + char;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line, width / 2, lineY);
            line = char;
            lineY += 35;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, width / 2, lineY);

        // 作者
        ctx.fillStyle = '#7A8F7C';
        ctx.font = 'italic 18px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`—— ${quote.author}`, width - 60, lineY + 40);

        // 底部小程序信息
        ctx.fillStyle = '#A8BFA9';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('长按识别小程序，开始你的打卡之旅', width / 2, height - 50);

        // 导出图片
        setTimeout(() => {
          wx.canvasToTempFilePath({
            canvas,
            success: (res) => {
              this.setData({ posterPath: res.tempFilePath });
            },
            fail: (err) => {
              console.error('生成海报失败:', err);
            }
          });
        }, 100);
      });
  },

  // 绘制圆角矩形
  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
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
