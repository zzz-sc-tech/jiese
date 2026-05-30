const api = require('../../utils/api');
const dateUtil = require('../../utils/date');

const app = getApp();

Page({
  data: {
    currentMonth: '',
    currentStreak: 0,
    longestStreak: 0,
    monthCheckins: 0,
    totalCheckins: 0,
    weekData: [],
    calendarYear: 0,
    calendarMonth: 0,
    calendarDays: [],
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    goals: [],
    selectedGoalId: '',
    selectedGoalType: '', // '' | 'single' | 'count' | 'duration'
    goalStats: [],
    monthlyData: [],
    // 时长统计
    durationStats: null,
    showPie: false,
    // 计数统计
    countStats: null,
    themeClass: '',
    // 挑战统计
    challengeStats: null,
    // 挑战勋章
    challengeMedals: null
  },

  _barCtx: null,
  _barSize: 0,
  _pieCtx: null,
  _pieSize: 0,

  onLoad() {
    const now = new Date();
    this.setData({
      currentMonth: `${now.getMonth() + 1}月`,
      calendarYear: now.getFullYear(),
      calendarMonth: now.getMonth() + 1
    });
  },

  onShow() {
    app.applyNavBarColor(app.globalData.theme);
    this.setData({ themeClass: app.globalData.themeClass });
    this.loadData();
  },

  async loadData() {
    try {
      const goalsRes = await api.getGoals();
      if (goalsRes.code === 0) {
        this.setData({ goals: goalsRes.data });
      }

      const { selectedGoalId, goals } = this.data;
      const selectedGoal = selectedGoalId ? goals.find(g => g.id === selectedGoalId) : null;
      const goalType = selectedGoal ? (selectedGoal.type || 'single') : '';
      this.setData({ selectedGoalType: goalType });

      // 基础统计
      const res = await api.getStats(selectedGoalId || undefined);
      if (res.code === 0) {
        const { totalDays, currentStreak, longestStreak, monthlyData, weeklyData, goalStats } = res.data;
        const today = dateUtil.today();
        const weekData = weeklyData.map(item => ({
          ...item,
          isToday: item.date === today
        }));
        const monthCheckins = monthlyData.filter(item => item.checked).length;

        this.setData({
          currentStreak: currentStreak || 0,
          longestStreak: longestStreak || 0,
          totalCheckins: totalDays || 0,
          monthCheckins,
          weekData,
          monthlyData: monthlyData || [],
          goalStats: goalStats || []
        });
        this.buildCalendar();
      }

      // 时长统计
      this.setData({ durationStats: null, showPie: false });
      const durRes = await api.getDurationStats(14, selectedGoalId || undefined);
      if (durRes.code === 0 && durRes.data.hasDurationGoals) {
        this.setData({
          durationStats: durRes.data,
          showPie: durRes.data.showPie || false
        });
        // 延迟绘制图表
        setTimeout(() => this.redrawCharts(durRes.data), 300);
      }

      // 计数统计
      this.setData({ countStats: null });
      const countRes = await api.getCountStats(14, selectedGoalId || undefined);
      if (countRes.code === 0 && countRes.data.hasCountGoals) {
        this.setData({ countStats: countRes.data });
      }
    } catch (err) {
      console.error('加载数据失败:', err);
    }
  },

  // 切换目标筛选
  selectGoal(e) {
    const goalId = e.currentTarget.dataset.goalId;
    const newId = goalId === this.data.selectedGoalId ? '' : goalId;
    this.setData({ selectedGoalId: newId });
    // 重置 canvas 引用
    this._barCtx = null;
    this._pieCtx = null;
    this.loadData();
  },

  buildCalendar() {
    const { calendarYear, calendarMonth, monthlyData } = this.data;
    const daysInMonth = dateUtil.getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = dateUtil.getFirstDayOfMonth(calendarYear, calendarMonth);
    const today = dateUtil.today();

    const checkedMap = {};
    (monthlyData || []).forEach(item => {
      if (item.checked) checkedMap[item.date] = true;
    });

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push({ empty: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      calendarDays.push({
        day: d,
        date: dateStr,
        isToday: dateStr === today,
        checked: !!checkedMap[dateStr]
      });
    }
    this.setData({ calendarDays });
  },

  prevMonth() {
    let { calendarYear, calendarMonth } = this.data;
    calendarMonth--;
    if (calendarMonth < 1) { calendarMonth = 12; calendarYear--; }
    this.setData({ calendarYear, calendarMonth });
    this.loadData();
  },

  nextMonth() {
    let { calendarYear, calendarMonth } = this.data;
    calendarMonth++;
    if (calendarMonth > 12) { calendarMonth = 1; calendarYear++; }
    this.setData({ calendarYear, calendarMonth });
    this.loadData();
  },

  // ========== Canvas 图表 ==========
  redrawCharts(data) {
    if (data && data.dailyTotals) {
      this.initBarCanvas(data.dailyTotals);
    }
    if (data && data.showPie && data.goalDistribution) {
      this.initPieCanvas(data.goalDistribution);
    }
  },

  initBarCanvas(dailyTotals) {
    const query = this.createSelectorQuery();
    query.select('#barCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getWindowInfo().pixelRatio;
        const w = res[0].width;
        const h = res[0].height;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
        this._barCtx = ctx;
        this._barSize = { w, h };
        this.drawBarChart(dailyTotals);
      });
  },

  initPieCanvas(goalDistribution) {
    const query = this.createSelectorQuery();
    query.select('#pieCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getWindowInfo().pixelRatio;
        const size = res[0].width;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);
        this._pieCtx = ctx;
        this._pieSize = size;
        this.drawPieChart(goalDistribution);
      });
  },

  drawBarChart(dailyTotals) {
    const ctx = this._barCtx;
    const { w, h } = this._barSize;
    if (!ctx || !dailyTotals || dailyTotals.length === 0) return;

    const colors = this._getChartColors();
    ctx.clearRect(0, 0, w, h);

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const barCount = dailyTotals.length;
    const barGap = 6;
    const barW = (chartW - barGap * (barCount - 1)) / barCount;
    const maxVal = Math.max(...dailyTotals.map(d => d.totalMinutes), 1);

    // Y 轴刻度
    const ySteps = 4;
    ctx.fillStyle = colors.labelText;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= ySteps; i++) {
      const val = Math.round((maxVal / ySteps) * i);
      const y = padding.top + chartH - (chartH / ySteps) * i;
      ctx.fillText(`${val}分`, padding.left - 8, y + 4);
      if (i > 0) {
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.strokeStyle = colors.gridLine;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 绘制柱子
    dailyTotals.forEach((item, i) => {
      const x = padding.left + i * (barW + barGap);
      const barH = maxVal > 0 ? (item.totalMinutes / maxVal) * chartH : 0;
      const y = padding.top + chartH - barH;

      const gradient = ctx.createLinearGradient(x, y, x, padding.top + chartH);
      gradient.addColorStop(0, colors.barGradientStart);
      gradient.addColorStop(1, colors.barGradientEnd);

      const radius = Math.min(barW / 2, 6);
      ctx.beginPath();
      if (barH > radius * 2) {
        ctx.moveTo(x, y + radius);
        ctx.arcTo(x, y, x + barW, y, radius);
        ctx.arcTo(x + barW, y, x + barW, y + barH, radius);
        ctx.lineTo(x + barW, padding.top + chartH);
        ctx.lineTo(x, padding.top + chartH);
      } else if (barH > 0) {
        ctx.rect(x, y, barW, barH);
      }
      ctx.fillStyle = gradient;
      ctx.fill();

      // 日期标签：柱子多时只显示部分
      ctx.fillStyle = colors.labelText;
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      const showLabel = barCount <= 7 || i % 2 === 0;
      if (showLabel) {
        ctx.fillText(item.day, x + barW / 2, padding.top + chartH + 16);
      }

      if (item.totalMinutes > 0) {
        ctx.fillStyle = colors.barText;
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(`${item.totalMinutes}`, x + barW / 2, y - 6);
      }
    });
  },

  drawPieChart(goalDistribution) {
    const ctx = this._pieCtx;
    const size = this._pieSize;
    if (!ctx || !goalDistribution || goalDistribution.length === 0) return;

    const colors = this._getChartColors();
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 30;
    const innerR = r * 0.55;
    const total = goalDistribution.reduce((sum, g) => sum + g.totalSeconds, 0);
    if (total === 0) return;

    let startAngle = -Math.PI / 2;

    goalDistribution.forEach((goal, i) => {
      const sliceAngle = (goal.totalSeconds / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = goal.color;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(startAngle), cy + innerR * Math.sin(startAngle));
      ctx.lineTo(cx + r * Math.cos(startAngle), cy + r * Math.sin(startAngle));
      ctx.strokeStyle = colors.pieDivider;
      ctx.lineWidth = 2;
      ctx.stroke();

      const midAngle = startAngle + sliceAngle / 2;
      const labelR = r + 18;
      const lx = cx + labelR * Math.cos(midAngle);
      const ly = cy + labelR * Math.sin(midAngle);

      ctx.fillStyle = colors.pieText;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = midAngle > Math.PI / 2 && midAngle < Math.PI * 1.5 ? 'right' : 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${goal.icon}${goal.percent}%`, lx, ly);

      startAngle = endAngle;
    });

    ctx.fillStyle = colors.pieText;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this._formatDurationShort(total), cx, cy - 8);
    ctx.fillStyle = colors.pieSubText;
    ctx.font = '10px sans-serif';
    ctx.fillText('总时长', cx, cy + 12);
  },

  _formatDurationShort(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}时${m}分`;
    return `${m}分`;
  },

  // 获取当前主题的图表颜色
  _getChartColors() {
    const theme = app.globalData.theme;
    if (theme === 'dark') {
      return {
        barGradientStart: '#5A8A9E',
        barGradientEnd: '#7AACBE',
        barText: '#5A8A9E',
        labelText: '#9A9690',
        gridLine: 'rgba(255,255,255,0.05)',
        pieText: '#E8E4E0',
        pieSubText: '#9A9690',
        pieDivider: '#2A2A2E'
      };
    }
    return {
      barGradientStart: '#5B9A6F',
      barGradientEnd: '#8BC4A0',
      barText: '#5B9A6F',
      labelText: '#999',
      gridLine: 'rgba(0,0,0,0.05)',
      pieText: '#2C3E2D',
      pieSubText: '#7A8F7C',
      pieDivider: '#fff'
    };
  }
});
