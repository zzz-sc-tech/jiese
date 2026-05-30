const api = require('../../utils/api');

const app = getApp();

Page({
  data: {
    goalId: '',
    goal: {},
    todayDurationStr: '0分',
    timerMode: 'pomodoro', // pomodoro | clock

    // 番茄钟
    workMin: 25,
    breakMin: 5,
    pomodoroState: 'idle', // idle | running | paused
    pomodoroPhase: 'work', // work | break
    pomodoroDisplay: '25:00',
    pomodoroRemaining: 0, // 秒
    pomodoroSession: 0, // 已完成番茄数

    // 学习时钟
    clockState: 'idle', // idle | running | paused
    clockDisplay: '00:00:00',
    clockElapsed: 0, // 秒
    clockStartTimestamp: 0,

    // 今日会话
    sessions: [],
    themeClass: ''
  },

  _timer: null,
  _canvasCtx: null,
  _canvasSize: 0,

  onLoad(options) {
    app.applyNavBarColor(app.globalData.theme);
    const goalId = options.goalId || '';
    this.setData({ goalId, themeClass: app.globalData.themeClass });
    this.loadGoal(goalId);
    this.loadSessions(goalId);
  },

  onReady() {
    this.initCanvas();
  },

  onUnload() {
    this.clearTimer();
    // 如果时钟正在运行，保存当前进度
    if (this.data.clockState === 'running' || this.data.clockState === 'paused') {
      this.saveClockDuration();
    }
  },

  async loadGoal(goalId) {
    const res = await api.getGoals();
    if (res.code === 0) {
      const goal = res.data.find(g => g.id === goalId);
      if (goal) this.setData({ goal });
    }
  },

  async loadSessions(goalId) {
    const res = await api.getTodaySessions(goalId);
    if (res.code === 0) {
      const sessions = res.data.sessions.map(s => ({
        ...s,
        durationStr: api._formatDuration(s.duration)
      }));
      this.setData({
        sessions,
        todayDurationStr: res.data.totalDurationStr
      });
    }
  },

  // 切换模式
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    if (mode === this.data.timerMode) return;
    // 如果有计时器在运行，先停止
    this.clearTimer();
    this.setData({
      timerMode: mode,
      pomodoroState: 'idle',
      clockState: 'idle',
      clockElapsed: 0,
      clockDisplay: '00:00:00'
    });
    if (mode === 'pomodoro') {
      this.resetPomodoroDisplay();
    }
  },

  // ========== 番茄钟 ==========
  initCanvas() {
    const query = this.createSelectorQuery();
    query.select('#timerCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getWindowInfo().pixelRatio;
        const size = res[0].width;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);
        this._canvasCtx = ctx;
        this._canvasSize = size;
        this.drawRing(1);
      });
  },

  drawRing(percent) {
    const ctx = this._canvasCtx;
    const size = this._canvasSize;
    if (!ctx) return;

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 12;
    const lineWidth = 10;

    ctx.clearRect(0, 0, size, size);

    // 背景环
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#E8F5E9';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 进度环
    if (percent > 0) {
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + Math.PI * 2 * percent;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#5B9A6F');
      gradient.addColorStop(1, '#8BC4A0');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  },

  resetPomodoroDisplay() {
    const totalSec = this.data.workMin * 60;
    this.setData({
      pomodoroDisplay: this.formatTime(totalSec),
      pomodoroRemaining: totalSec,
      pomodoroPhase: 'work'
    });
    this.drawRing(1);
  },

  togglePomodoro() {
    const state = this.data.pomodoroState;
    if (state === 'running') {
      this.pausePomodoro();
    } else {
      this.startPomodoro();
    }
  },

  startPomodoro() {
    if (this.data.pomodoroState === 'idle') {
      const totalSec = this.data.workMin * 60;
      this.setData({
        pomodoroRemaining: totalSec,
        pomodoroPhase: 'work',
        pomodoroDisplay: this.formatTime(totalSec)
      });
    }
    this.setData({ pomodoroState: 'running' });
    this._timer = setInterval(() => this.pomodoroTick(), 1000);
  },

  pausePomodoro() {
    this.clearTimer();
    this.setData({ pomodoroState: 'paused' });
  },

  pomodoroTick() {
    let remaining = this.data.pomodoroRemaining - 1;
    if (remaining < 0) {
      // 阶段结束
      this.clearTimer();
      if (this.data.pomodoroPhase === 'work') {
        // 工作阶段结束，保存时长
        const workSec = this.data.workMin * 60;
        this.saveDuration(workSec, 'pomodoro');
        const session = this.data.pomodoroSession + 1;
        this.setData({ pomodoroSession: session });

        if (session >= 4) {
          // 4个番茄完成，重置
          wx.showToast({ title: '完成4个番茄！休息一下', icon: 'success' });
          this.triggerVibrate();
          this.setData({ pomodoroSession: 0, pomodoroState: 'idle' });
          this.resetPomodoroDisplay();
          return;
        }

        // 专注结束，震动提醒，等待手动切换到休息
        this.triggerVibrate();
        wx.showToast({ title: '专注结束，点击开始休息', icon: 'none' });
        this.setData({ pomodoroState: 'paused' });
      } else {
        // 休息结束，震动提醒，等待手动切换到专注
        this.triggerVibrate();
        wx.showToast({ title: '休息结束，点击开始专注', icon: 'none' });
        this.setData({ pomodoroState: 'paused' });
      }
      return;
    }

    const totalSec = this.data.pomodoroPhase === 'work'
      ? this.data.workMin * 60
      : this.data.breakMin * 60;
    const percent = remaining / totalSec;

    this.setData({
      pomodoroRemaining: remaining,
      pomodoroDisplay: this.formatTime(remaining)
    });
    this.drawRing(percent);
  },

  // 触发震动
  triggerVibrate() {
    const settings = storage.getSettings();
    const intensity = settings.vibrateIntensity || 'medium';
    const mode = settings.vibrateMode || 'auto';

    if (intensity === 'off') return;

    const vibrateType = intensity === 'heavy' ? 'heavy' : 'medium';

    if (mode === 'manual') {
      // 持续震动直到点击屏幕
      this._vibrateInterval = setInterval(() => {
        wx.vibrateShort({ type: vibrateType });
      }, 500);
      // 点击屏幕停止震动
      this._stopVibrateHandler = () => this.stopVibrate();
      wx.onTouchStart(this._stopVibrateHandler);
    } else {
      // 自动停止：震动3次
      let count = 0;
      const vibrateLoop = () => {
        if (count >= 3) return;
        wx.vibrateShort({ type: vibrateType });
        count++;
        setTimeout(vibrateLoop, 300);
      };
      vibrateLoop();
    }
  },

  // 停止震动
  stopVibrate() {
    if (this._vibrateInterval) {
      clearInterval(this._vibrateInterval);
      this._vibrateInterval = null;
    }
    if (this._stopVibrateHandler) {
      wx.offTouchStart(this._stopVibrateHandler);
      this._stopVibrateHandler = null;
    }
  },

  resetPomodoro() {
    this.clearTimer();
    this.setData({ pomodoroState: 'idle', pomodoroSession: 0 });
    this.resetPomodoroDisplay();
  },

  skipPomodoro() {
    this.clearTimer();
    if (this.data.pomodoroPhase === 'work') {
      // 跳过当前工作阶段，保存已用时间
      const used = this.data.workMin * 60 - this.data.pomodoroRemaining;
      if (used > 10) this.saveDuration(used, 'pomodoro');
    }
    // 直接触发 tick 处理阶段切换
    this.setData({ pomodoroRemaining: 0 });
    this.pomodoroTick();
  },

  adjustSetting(e) {
    const target = e.currentTarget.dataset.target;
    const delta = parseInt(e.currentTarget.dataset.delta);
    if (this.data.pomodoroState === 'running') return;

    if (target === 'workMin') {
      let val = this.data.workMin + delta;
      if (val < 5) val = 5;
      if (val < this.data.breakMin) val = this.data.breakMin;
      this.setData({ workMin: val });
    } else {
      let val = this.data.breakMin + delta;
      if (val < 1) val = 1;
      if (val > this.data.workMin) val = this.data.workMin;
      this.setData({ breakMin: val });
    }
    if (this.data.pomodoroState === 'idle') {
      this.resetPomodoroDisplay();
    }
  },

  // ========== 学习时钟 ==========
  toggleClock() {
    const state = this.data.clockState;
    if (state === 'running') {
      this.pauseClock();
    } else {
      this.startClock();
    }
  },

  startClock() {
    if (this.data.clockState === 'idle') {
      this.setData({
        clockElapsed: 0,
        clockStartTimestamp: Date.now(),
        clockDisplay: '00:00:00'
      });
    }
    this.setData({ clockState: 'running' });
    this._timer = setInterval(() => this.clockTick(), 1000);
  },

  pauseClock() {
    this.clearTimer();
    this.setData({ clockState: 'paused' });
  },

  clockTick() {
    const elapsed = this.data.clockElapsed + 1;
    this.setData({
      clockElapsed: elapsed,
      clockDisplay: this.formatClock(elapsed)
    });
  },

  stopClock() {
    this.clearTimer();
    const elapsed = this.data.clockElapsed;
    if (elapsed > 10) {
      this.saveDuration(elapsed, 'clock');
    }
    this.setData({
      clockState: 'idle',
      clockElapsed: 0,
      clockDisplay: '00:00:00'
    });
  },

  async saveClockDuration() {
    const elapsed = this.data.clockElapsed;
    if (elapsed > 10) {
      await this.saveDuration(elapsed, 'clock');
    }
  },

  // ========== 通用 ==========
  async saveDuration(seconds, timerType) {
    try {
      await api.saveDuration(
        this.data.goalId,
        seconds,
        this.data.clockStartTimestamp || Date.now(),
        timerType
      );
      wx.showToast({ title: `已记录${api._formatDuration(seconds)}`, icon: 'success' });
      this.loadSessions(this.data.goalId);
    } catch (e) {
      console.error('保存时长失败:', e);
    }
  },

  clearTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  formatClock(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
});
