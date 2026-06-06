const api = require('../../utils/api');
const storage = require('../../utils/storage');

const app = getApp();
const POMODORO_SESSION_PREFIX = 'jiese_pomodoro_session';

function normalizePomodoroSession(session) {
  const value = Number(session) || 0;
  return Math.min(Math.max(value, 0), 4);
}

function getPomodoroSessionKey(goalId) {
  return `${POMODORO_SESSION_PREFIX}_${storage.getTodayStr()}_${goalId || 'default'}`;
}

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
    themeClass: '',
    showVibrateAlert: false,
    vibrateAlertText: '时间到！',
    vibrateAlertHint: '点击任意位置停止震动'
  },

  _timer: null,
  _pomodoroEndTimestamp: 0,
  _pomodoroPhaseStartedAt: 0,
  _clockRunStartedAt: 0,
  _clockElapsedBeforeStart: 0,
  _clockSessionStartedAt: 0,
  _vibrateTimers: [],

  onLoad(options) {
    app.applyNavBarColor(app.globalData.theme);
    const goalId = options.goalId || '';
    const pomodoroSession = this.loadPomodoroSession(goalId);
    this.setData({
      goalId,
      themeClass: app.globalData.themeClass,
      pomodoroSession
    });
    this.loadGoal(goalId);
    this.loadSessions(goalId);
  },

  onHide() {
    // 页面隐藏时停止震动
    this.stopVibrate();
  },

  onUnload() {
    this.saveCurrentProgress(true);
    this.clearTimer();
    this.stopVibrate();
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
  async switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    if (mode === this.data.timerMode) return;
    await this.saveCurrentProgress(true);
    this.clearTimer();
    this._pomodoroEndTimestamp = 0;
    this._pomodoroPhaseStartedAt = 0;
    this._clockRunStartedAt = 0;
    this._clockElapsedBeforeStart = 0;
    this._clockSessionStartedAt = 0;
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
    this.loadSessions(this.data.goalId);
  },

  // ========== 番茄钟 ==========
  loadPomodoroSession(goalId) {
    return normalizePomodoroSession(storage.get(getPomodoroSessionKey(goalId), 0));
  },

  savePomodoroSession(session, goalId) {
    const targetGoalId = goalId || this.data.goalId;
    storage.set(getPomodoroSessionKey(targetGoalId), normalizePomodoroSession(session), 2 * 24 * 60 * 60 * 1000);
  },

  setPomodoroSession(session, goalId) {
    const nextSession = normalizePomodoroSession(session);
    this.savePomodoroSession(nextSession, goalId);
    this.setData({ pomodoroSession: nextSession });
    return nextSession;
  },

  resetPomodoroDisplay() {
    const totalSec = this.data.workMin * 60;
    this._pomodoroEndTimestamp = 0;
    this._pomodoroPhaseStartedAt = 0;
    this.setData({
      pomodoroDisplay: this.formatTime(totalSec),
      pomodoroRemaining: totalSec,
      pomodoroPhase: 'work'
    });
  },

  togglePomodoro() {
    const state = this.data.pomodoroState;
    const phase = this.data.pomodoroPhase;
    const remaining = this.data.pomodoroRemaining;

    if (state === 'running') {
      this.pausePomodoro();
    } else if (state === 'paused' && remaining <= 0) {
      // 阶段结束后的暂停，切换到下一阶段
      this.stopVibrate();
      if (phase === 'work') {
        // 专注结束，切换到休息
        const breakSec = this.data.breakMin * 60;
        this.setData({
          pomodoroPhase: 'break'
        });
        this.startPomodoroPhase('break', breakSec);
      } else {
        // 休息结束，切换到专注
        const workSec = this.data.workMin * 60;
        this.setData({
          pomodoroPhase: 'work'
        });
        this.startPomodoroPhase('work', workSec);
      }
    } else {
      this.startPomodoro();
    }
  },

  startPomodoro() {
    if (this.data.pomodoroState === 'idle') {
      const totalSec = this.data.workMin * 60;
      this.startPomodoroPhase('work', totalSec);
      return;
    }
    const remaining = this.getPomodoroRemaining();
    this._pomodoroEndTimestamp = Date.now() + remaining * 1000;
    this.setData({
      pomodoroState: 'running',
      pomodoroRemaining: remaining,
      pomodoroDisplay: this.formatTime(remaining)
    });
    this.clearTimer();
    this._timer = setInterval(() => this.pomodoroTick(), 1000);
  },

  startPomodoroPhase(phase, seconds) {
    this.clearTimer();
    this._pomodoroEndTimestamp = Date.now() + seconds * 1000;
    this._pomodoroPhaseStartedAt = Date.now();
    const shouldResetSession = phase === 'work' && this.data.pomodoroSession >= 4;
    const session = shouldResetSession ? 0 : normalizePomodoroSession(this.data.pomodoroSession);
    if (shouldResetSession) {
      this.setPomodoroSession(0);
    }
    this.setData({
      pomodoroPhase: phase,
      pomodoroRemaining: seconds,
      pomodoroDisplay: this.formatTime(seconds),
      pomodoroState: 'running',
      pomodoroSession: session
    });
    this._timer = setInterval(() => this.pomodoroTick(), 1000);
  },

  getPomodoroRemaining() {
    if (!this._pomodoroEndTimestamp) return this.data.pomodoroRemaining;
    return Math.max(0, Math.ceil((this._pomodoroEndTimestamp - Date.now()) / 1000));
  },

  pausePomodoro() {
    const remaining = this.getPomodoroRemaining();
    this.clearTimer();
    this._pomodoroEndTimestamp = 0;
    this.setData({
      pomodoroState: 'paused',
      pomodoroRemaining: remaining,
      pomodoroDisplay: this.formatTime(remaining)
    });
  },

  pomodoroTick() {
    const remaining = this.getPomodoroRemaining();
    if (remaining <= 0) {
      this.finishPomodoroPhase({ skipped: false });
      return;
    }

    this.setData({
      pomodoroRemaining: remaining,
      pomodoroDisplay: this.formatTime(remaining)
    });
  },

  finishPomodoroPhase(options) {
    const skipped = !!(options && options.skipped);
    const phase = this.data.pomodoroPhase;
    const workSec = this.data.workMin * 60;
    const remaining = this.getPomodoroRemaining();
    const used = skipped ? Math.max(0, workSec - remaining) : workSec;
    const isWork = phase === 'work';
    const currentSession = normalizePomodoroSession(this.data.pomodoroSession);
    const nextSession = isWork ? Math.min(currentSession + 1, 4) : currentSession;
    const alertText = isWork ? '专注结束' : '休息结束';
    const alertHint = isWork ? '点击开始休息' : '点击开始专注';

    this.clearTimer();
    this._pomodoroEndTimestamp = 0;
    this._pomodoroPhaseStartedAt = 0;
    if (isWork) {
      this.setPomodoroSession(nextSession);
    }

    this.setData({
      pomodoroRemaining: 0,
      pomodoroDisplay: this.formatTime(0),
      pomodoroState: 'paused',
      pomodoroSession: nextSession,
      showVibrateAlert: true,
      vibrateAlertText: alertText,
      vibrateAlertHint: alertHint
    });

    this.triggerPomodoroAlert();

    if (isWork) {
      if (used > 10) {
        const startAt = Date.now() - used * 1000;
        this.saveDuration(used, 'pomodoro', startAt, true);
      }
      if (used > 10) {
        api.grantItem('candy', 1);
      }
      if (nextSession >= 4) {
        api.grantItem('crystal', 1);
        wx.showToast({ title: '完成4个番茄！休息一下', icon: 'success' });
      } else {
        wx.showToast({ title: skipped ? '已跳过，点击开始休息' : '专注结束，点击开始休息', icon: 'none' });
      }
      return;
    }

    wx.showToast({ title: skipped ? '已跳过，点击开始专注' : '休息结束，点击开始专注', icon: 'none' });
  },

  triggerPomodoroAlert() {
    this.triggerVibrate({ showAlert: true });
  },

  // 触发震动
  triggerVibrate(options) {
    options = options || {};
    this.clearVibrateTimers();

    const settings = storage.getSettings();
    const validIntensities = ['light', 'medium', 'heavy'];
    const validModes = ['auto', 'manual'];
    const intensity = validIntensities.includes(settings.vibrateIntensity)
      ? settings.vibrateIntensity
      : 'medium';
    const mode = validModes.includes(settings.vibrateMode)
      ? settings.vibrateMode
      : 'auto';

    if (options.showAlert || mode === 'manual') {
      // 番茄钟阶段结束必须有可见提示，避免用户错过。
      this.setData({ showVibrateAlert: true });
    }

    if (mode === 'manual') {
      // 持续震动 + 显示弹窗
      this._doContinuousVibrate(intensity);
    } else {
      // 自动停止
      this._doAutoVibrate(intensity);
    }
  },

  // 自动停止震动
  _doAutoVibrate(intensity) {
    if (intensity === 'light') {
      // 轻微：长震动1次
      this._doVibrateOnce(intensity);
    } else if (intensity === 'medium') {
      // 中等：长震动2次
      this._doVibrateOnce(intensity);
      this._scheduleVibrate(800, intensity);
    } else if (intensity === 'heavy') {
      // 强烈：长震动3次
      this._doVibrateOnce(intensity);
      this._scheduleVibrate(600, intensity);
      this._scheduleVibrate(1200, intensity);
    }
  },

  // 持续震动（长震动）
  _doContinuousVibrate(intensity) {
    const that = this;
    // 立即震动一次
    this._doVibrateOnce(intensity);
    if (intensity === 'light') {
      // 轻微：每2秒长震动
      that._vibrateInterval = setInterval(() => {
        that._doVibrateOnce(intensity);
      }, 2000);
    } else if (intensity === 'medium') {
      // 中等：每1.2秒长震动
      that._vibrateInterval = setInterval(() => {
        that._doVibrateOnce(intensity);
      }, 1200);
    } else if (intensity === 'heavy') {
      // 强烈：每0.8秒长震动
      that._vibrateInterval = setInterval(() => {
        that._doVibrateOnce(intensity);
      }, 800);
    }
  },

  _scheduleVibrate(delay, intensity) {
    const timer = setTimeout(() => {
      this._doVibrateOnce(intensity);
    }, delay);
    this._vibrateTimers.push(timer);
  },

  _doVibrateOnce(intensity) {
    const type = intensity === 'heavy' ? 'heavy' : intensity === 'light' ? 'light' : 'medium';
    const fallback = () => wx.vibrateShort && wx.vibrateShort({ type });

    try {
      if (wx.vibrateLong) {
        wx.vibrateLong({ fail: fallback });
      } else {
        fallback();
      }
    } catch (err) {
      fallback();
    }
  },

  // 停止震动
  clearVibrateTimers() {
    if (this._vibrateInterval) {
      clearInterval(this._vibrateInterval);
      this._vibrateInterval = null;
    }
    if (this._vibrateTimers.length > 0) {
      this._vibrateTimers.forEach(timer => clearTimeout(timer));
      this._vibrateTimers = [];
    }
  },

  stopVibrate() {
    this.clearVibrateTimers();
    this.setData({ showVibrateAlert: false });
  },

  resetPomodoro() {
    this.clearTimer();
    this._pomodoroEndTimestamp = 0;
    this._pomodoroPhaseStartedAt = 0;
    this.setPomodoroSession(0);
    this.setData({
      pomodoroState: 'idle',
      pomodoroSession: 0
    });
    this.resetPomodoroDisplay();
  },

  async skipPomodoro() {
    this.finishPomodoroPhase({ skipped: true });
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
      const now = Date.now();
      this._clockElapsedBeforeStart = 0;
      this._clockSessionStartedAt = now;
      this.setData({
        clockElapsed: 0,
        clockStartTimestamp: now,
        clockDisplay: '00:00:00'
      });
    } else {
      this._clockElapsedBeforeStart = this.data.clockElapsed;
    }
    this._clockRunStartedAt = Date.now();
    this.clearTimer();
    this.setData({ clockState: 'running' });
    this._timer = setInterval(() => this.clockTick(), 1000);
  },

  pauseClock() {
    const elapsed = this.getClockElapsed();
    this.clearTimer();
    this._clockRunStartedAt = 0;
    this._clockElapsedBeforeStart = elapsed;
    this.setData({
      clockState: 'paused',
      clockElapsed: elapsed,
      clockDisplay: this.formatClock(elapsed)
    });
  },

  clockTick() {
    const elapsed = this.getClockElapsed();
    this.setData({
      clockElapsed: elapsed,
      clockDisplay: this.formatClock(elapsed)
    });
  },

  getClockElapsed() {
    if (this.data.clockState !== 'running' || !this._clockRunStartedAt) {
      return this.data.clockElapsed;
    }
    return this._clockElapsedBeforeStart + Math.floor((Date.now() - this._clockRunStartedAt) / 1000);
  },

  async stopClock() {
    const elapsed = this.getClockElapsed();
    this.clearTimer();
    if (elapsed > 10) {
      await this.saveDuration(elapsed, 'clock', this._clockSessionStartedAt || this.data.clockStartTimestamp || Date.now() - elapsed * 1000);
    }
    this._clockRunStartedAt = 0;
    this._clockElapsedBeforeStart = 0;
    this._clockSessionStartedAt = 0;
    this.setData({
      clockState: 'idle',
      clockElapsed: 0,
      clockDisplay: '00:00:00'
    });
  },

  async saveClockDuration(silent) {
    silent = !!silent;
    const elapsed = this.getClockElapsed();
    if (elapsed > 10) {
      await this.saveDuration(elapsed, 'clock', this._clockSessionStartedAt || this.data.clockStartTimestamp || Date.now() - elapsed * 1000, silent);
    }
  },

  async savePomodoroProgress(silent) {
    silent = !!silent;
    if (this.data.timerMode !== 'pomodoro') return;
    if (this.data.pomodoroPhase !== 'work') return;
    if (this.data.pomodoroState !== 'running' && this.data.pomodoroState !== 'paused') return;

    const remaining = this.getPomodoroRemaining();
    if (remaining <= 0) return;

    const used = this.data.workMin * 60 - remaining;
    if (used > 10) {
      await this.saveDuration(used, 'pomodoro', this._pomodoroPhaseStartedAt || Date.now() - used * 1000, silent);
    }
  },

  async saveCurrentProgress(silent) {
    silent = !!silent;
    if (this.data.clockState === 'running' || this.data.clockState === 'paused') {
      await this.saveClockDuration(silent);
      return;
    }
    await this.savePomodoroProgress(silent);
  },

  // ========== 通用 ==========
  async saveDuration(seconds, timerType, startTimestamp, silent) {
    silent = !!silent;
    try {
      await api.saveDuration(
        this.data.goalId,
        seconds,
        startTimestamp || Date.now() - seconds * 1000,
        timerType
      );
      if (!silent) {
        wx.showToast({ title: `已记录${api._formatDuration(seconds)}`, icon: 'success' });
        this.loadSessions(this.data.goalId);
      }
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
