// 海报生成工具
const poster = {
  /**
   * 绘制圆角矩形
   */
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

  /**
   * 绘制渐变背景
   */
  drawGradientBg(ctx, width, height) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#E8F5E9');
    gradient.addColorStop(0.5, '#F5F9F7');
    gradient.addColorStop(1, '#E8F5E9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  },

  /**
   * 绘制装饰元素
   */
  drawDecorations(ctx, width, height) {
    ctx.fillStyle = 'rgba(91, 154, 111, 0.08)';
    ctx.beginPath();
    ctx.arc(width - 80, 80, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(60, height - 120, 80, 0, Math.PI * 2);
    ctx.fill();
  },

  /**
   * 绘制文字（支持换行）
   */
  drawTextWrap(ctx, text, x, y, maxWidth, lineHeight) {
    const chars = text.split('');
    let line = '';
    let currentY = y;

    for (const char of chars) {
      const testLine = line + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, x, currentY);
        line = char;
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);

    return currentY;
  },

  /**
   * 绘制进度环
   */
  drawProgressRing(ctx, centerX, centerY, radius, progress, lineWidth = 8) {
    // 背景环
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#E0EDE2';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // 进度环
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * Math.min(progress, 1));
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = '#5B9A6F';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  },

  /**
   * 生成海报图片
   */
  async generatePoster(canvas, stats, quote) {
    const ctx = canvas.getContext('2d');
    const dpr = wx.getWindowInfo().pixelRatio;
    const width = 600;
    const height = 900;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 绘制背景
    this.drawGradientBg(ctx, width, height);
    this.drawDecorations(ctx, width, height);

    // 标题
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

    // 天数
    const daysY = 280;
    ctx.fillStyle = '#5B9A6F';
    ctx.font = 'bold 120px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(stats.currentStreak), width / 2, daysY);

    ctx.fillStyle = '#7A8F7C';
    ctx.font = '28px sans-serif';
    ctx.fillText('天连续打卡', width / 2, daysY + 50);

    // 进度环
    this.drawProgressRing(ctx, width / 2, 440, 50, stats.currentStreak / 365);

    // 统计
    const statsY = 550;
    ctx.fillStyle = '#2C3E2D';
    ctx.font = 'bold 24px sans-serif';

    ctx.fillText('累计打卡', 150, statsY);
    ctx.fillStyle = '#5B9A6F';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(String(stats.totalDays), 150, statsY + 55);

    ctx.fillStyle = '#2C3E2D';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('最长连续', width - 150, statsY);
    ctx.fillStyle = '#5B9A6F';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(String(stats.longestStreak), width - 150, statsY + 55);

    // 语录背景
    ctx.fillStyle = 'rgba(91, 154, 111, 0.05)';
    this.roundRect(ctx, 40, 650, width - 80, 140, 16);
    ctx.fill();

    // 语录
    ctx.fillStyle = '#2C3E2D';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    const lastY = this.drawTextWrap(ctx, quote.content, width / 2, 690, width - 120, 35);

    // 作者
    ctx.fillStyle = '#7A8F7C';
    ctx.font = 'italic 18px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`—— ${quote.author}`, width - 60, lastY + 40);

    // 底部
    ctx.fillStyle = '#A8BFA9';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('保存海报，分享你的坚持', width / 2, height - 50);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvas,
          success: (res) => resolve(res.tempFilePath),
          fail: reject
        });
      }, 100);
    });
  }
};

module.exports = poster;
