const api = require('../../utils/api');
const dateUtil = require('../../utils/date');
const ui = require('../../utils/ui');

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
    // 挑战统计（总览）
    challengeStats: null,
    // 挑战勋章（总览）
    challengeMedals: null,
    // 目标挑战数据（筛选时）
    goalChallenges: null,
    // 勋章弹窗
    showMedalDetail: false,
    selectedMedal: null,
    // 日期详情弹窗
    showDayDetail: false,
    selectedDate: '',
    dayCheckins: [],
    // 年度热力图
    heatmapYear: 2026,
    heatmapData: [],
    heatmapMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    heatmapTotalDays: 0,
    heatmapMaxStreak: 0,
    // 统计视图
    statsView: 'week', // week | month | trend
    weekRange: '',
    weekCheckins: 0,
    weekRate: 0,
    // 趋势数据
    trendData: [],
    trendAvg: 0,
    trendMax: 0,
    trendTotal: 0,
    // 时间分布
    timeDistribution: [],
    peakPeriod: ''
  },

  _barCtx: null,
  _barSize: 0,
  _pieCtx: null,
  _pieSize: 0,
  _drawing: false,

  onLoad() {
    const now = new Date();
    this.setData({
      currentMonth: `${now.getMonth() + 1}月`,
      calendarYear: now.getFullYear(),
      calendarMonth: now.getMonth() + 1,
      heatmapYear: now.getFullYear()
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

      // 挑战相关数据
      if (selectedGoalId) {
        // 选中目标时：显示该目标的挑战情况
        this.setData({ challengeStats: null, challengeMedals: null });
        const goalChallengesRes = await api.getGoalChallenges(selectedGoalId);
        if (goalChallengesRes.code === 0) {
          this.setData({ goalChallenges: goalChallengesRes.data });
        }
      } else {
        // 总览：显示挑战统计和勋章
        this.setData({ goalChallenges: null });
        const challengeStatsRes = await api.getChallengeStats();
        if (challengeStatsRes.code === 0) {
          this.setData({ challengeStats: challengeStatsRes.data });
        }
        const medalsRes = await api.getChallengeMedals();
        if (medalsRes.code === 0) {
          this.setData({ challengeMedals: medalsRes.data });
        }
      }

      // 加载热力图数据
      this.loadHeatmapData();

      // 加载趋势数据
      this.loadTrendData();

      // 加载本周统计
      this.loadWeekStats();
    } catch (err) {
      console.error('加载数据失败:', err);
      ui.showError('数据加载失败', () => this.loadData());
    }
  },

  // 加载热力图数据
  loadHeatmapData() {
    const { heatmapYear } = this.data;
    const checkins = api.getCheckins();
    const yearCheckins = checkins.filter(c => c.date.startsWith(heatmapYear.toString()));

    // 统计每天的打卡次数
    const dateCountMap = {};
    yearCheckins.forEach(c => {
      dateCountMap[c.date] = (dateCountMap[c.date] || 0) + 1;
    });

    // 获取所有有打卡的日期（去重）
    const checkedDates = Object.keys(dateCountMap).filter(d => d.startsWith(heatmapYear.toString()));
    const totalDays = checkedDates.length;

    // 计算最长连续天数
    const sortedDates = checkedDates.sort();
    let maxStreak = 0;
    let currentStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }

    // 计算热力图数据（52周 × 7天）
    const heatmapData = [];
    const startDate = new Date(heatmapYear, 0, 1);
    const endDate = new Date(heatmapYear, 11, 31);

    // 找到第一周的周日
    const firstDay = startDate.getDay();
    const firstDate = new Date(startDate);
    firstDate.setDate(firstDate.getDate() - firstDay);

    let currentDate = new Date(firstDate);

    while (currentDate <= endDate || currentDate.getDay() !== 0) {
      const week = { weekIndex: heatmapData.length, days: [] };

      for (let i = 0; i < 7; i++) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const count = dateCountMap[dateStr] || 0;
        const isCurrentYear = currentDate.getFullYear() === heatmapYear;

        let level = 0;
        if (isCurrentYear && count > 0) {
          if (count >= 5) level = 4;
          else if (count >= 3) level = 3;
          else if (count >= 2) level = 2;
          else level = 1;
        }

        week.days.push({
          date: dateStr,
          count: isCurrentYear ? count : 0,
          level: isCurrentYear ? level : 0
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      heatmapData.push(week);

      if (currentDate > endDate && currentDate.getDay() === 0) break;
    }

    this.setData({
      heatmapData,
      heatmapTotalDays: totalDays,
      heatmapMaxStreak: maxStreak
    });
  },

  // 热力图年份切换
  prevHeatmapYear() {
    this.setData({ heatmapYear: this.data.heatmapYear - 1 });
    this.loadHeatmapData();
  },

  nextHeatmapYear() {
    this.setData({ heatmapYear: this.data.heatmapYear + 1 });
    this.loadHeatmapData();
  },

  // 显示热力图详情
  showHeatmapDetail(e) {
    const { date, count } = e.currentTarget.dataset;
    if (count > 0) {
      wx.showToast({
        title: `${date}: ${count}次`,
        icon: 'none'
      });
    }
  },

  // 跳转年度报告
  goAnnualReport() {
    wx.navigateTo({ url: '/pages/annual-report/index' });
  },

  // 跳转月度报告
  goMonthlyReport() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    wx.navigateTo({ url: `/pages/monthly-report/index?year=${year}&month=${month}` });
  },

  // 跳转数据洞察
  goInsights() {
    wx.navigateTo({ url: '/pages/insights/index' });
  },

  // 点击日期查看详情
  onDayTap(e) {
    const date = e.currentTarget.dataset.date;
    if (!date) return;

    const checkins = api.getCheckins();
    const goals = api.getGoals();
    const goalsList = goals.code === 0 ? goals.data : [];

    // 获取当天的打卡记录
    const dayCheckins = checkins
      .filter(c => c.date === date)
      .map(c => {
        const goal = goalsList.find(g => g.id === c.goalId);
        return {
          ...c,
          goalName: goal ? goal.name : '未知目标',
          goalIcon: goal ? goal.icon : '❓',
          goalColor: goal ? goal.color : '#999',
          timeStr: c.timestamp ? new Date(c.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '',
          moodIcon: c.mood === 'happy' ? '😊' : c.mood === 'good' ? '😌' : c.mood === 'normal' ? '😐' : c.mood === 'tired' ? '😮‍💨' : c.mood === 'sad' ? '😔' : ''
        };
      })
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    this.setData({
      showDayDetail: true,
      selectedDate: date,
      dayCheckins
    });
  },

  // 关闭日期详情
  hideDayDetail() {
    this.setData({ showDayDetail: false });
  },

  // 切换统计视图
  switchStatsView(e) {
    const view = e.currentTarget.dataset.view;
    this.setData({ statsView: view });
  },

  // 加载趋势数据
  loadTrendData() {
    const { selectedGoalId } = this.data;
    let checkins = api.getCheckins();

    // 根据选中的目标筛选
    if (selectedGoalId) {
      checkins = checkins.filter(c => c.goalId === selectedGoalId);
    }

    const now = new Date();
    const trendData = [];
    const timeCounts = { '凌晨': 0, '早晨': 0, '上午': 0, '中午': 0, '下午': 0, '晚上': 0, '深夜': 0 };

    // 最近30天数据
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = dateUtil.format(d);
      const dayCheckins = checkins.filter(c => c.date === dateStr);
      const count = dayCheckins.length;

      trendData.push({
        date: dateStr,
        day: d.getDate(),
        count,
        percent: 0
      });

      // 统计时间分布
      dayCheckins.forEach(c => {
        const hour = new Date(c.timestamp).getHours();
        if (hour < 6) timeCounts['凌晨']++;
        else if (hour < 9) timeCounts['早晨']++;
        else if (hour < 12) timeCounts['上午']++;
        else if (hour < 14) timeCounts['中午']++;
        else if (hour < 18) timeCounts['下午']++;
        else if (hour < 22) timeCounts['晚上']++;
        else timeCounts['深夜']++;
      });
    }

    // 计算百分比
    const maxCount = Math.max(...trendData.map(d => d.count), 1);
    trendData.forEach(d => {
      d.percent = Math.round((d.count / maxCount) * 100);
    });

    // 计算统计
    const trendTotal = trendData.reduce((sum, d) => sum + d.count, 0);
    const trendAvg = Math.round(trendTotal / 30 * 10) / 10;
    const trendMax = Math.max(...trendData.map(d => d.count));

    // 计算时间分布百分比
    const totaltimeCounts = Object.values(timeCounts).reduce((a, b) => a + b, 0);
    const timeDistribution = Object.entries(timeCounts).map(([period, count]) => ({
      period,
      count,
      percent: totaltimeCounts > 0 ? Math.round((count / totaltimeCounts) * 100) : 0
    }));

    // 找出峰值时段
    const peakPeriod = timeDistribution.length > 0
      ? timeDistribution.reduce((a, b) => a.count > b.count ? a : b).period
      : '';

    this.setData({
      trendData,
      trendAvg,
      trendMax,
      trendTotal,
      timeDistribution,
      peakPeriod
    });
  },

  // 计算本周统计
  loadWeekStats() {
    const { selectedGoalId } = this.data;
    let checkins = api.getCheckins();

    // 根据选中的目标筛选
    if (selectedGoalId) {
      checkins = checkins.filter(c => c.goalId === selectedGoalId);
    }

    const now = new Date();

    // 计算本周起始（周日）
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // 统计本周打卡天数（去重）
    const weekDates = new Set();
    checkins.forEach(c => {
      const d = new Date(c.date);
      if (d >= weekStart) {
        weekDates.add(c.date);
      }
    });

    const weekCheckins = weekDates.size;
    const weekRate = Math.round((weekCheckins / 7) * 100);

    // 格式化日期范围
    const weekEnd = new Date(now);
    const weekRange = `${dateUtil.format(weekStart)} ~ ${dateUtil.format(weekEnd)}`;

    this.setData({
      weekCheckins,
      weekRate,
      weekRange
    });
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
    // 防止重复绘制
    if (this._drawing) return;
    this._drawing = true;

    if (data && data.dailyTotals) {
      this.initBarCanvas(data.dailyTotals);
    }
    // 当有时长目标时绘制扇形图
    if (data && data.goalDistribution && data.goalDistribution.length > 0) {
      // 短延迟绘制，确保页面已渲染
      setTimeout(() => {
        this.initPieCanvas(data.goalDistribution);
      }, 100);
    }

    setTimeout(() => {
      this._drawing = false;
    }, 300);
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
  },

  // 点击勋章显示详情
  onMedalTap(e) {
    const medal = e.currentTarget.dataset.medal;
    this.setData({
      showMedalDetail: true,
      selectedMedal: medal
    });
  },

  // 关闭勋章弹窗
  hideMedalDetail() {
    this.setData({
      showMedalDetail: false,
      selectedMedal: null
    });
  },
});
