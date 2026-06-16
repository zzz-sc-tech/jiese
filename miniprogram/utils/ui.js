// 守心小程序 - UI 工具模块
// 统一处理动画、加载、错误提示等

const ui = {
  // ========== 加载状态 ==========
  _loadingCount: 0,

  // 显示加载
  showLoading(title = '加载中...') {
    this._loadingCount++;
    wx.showLoading({ title, mask: true });
  },

  // 隐藏加载
  hideLoading() {
    this._loadingCount--;
    if (this._loadingCount <= 0) {
      this._loadingCount = 0;
      wx.hideLoading();
    }
  },

  // ========== 错误处理 ==========
  // 统一错误提示
  showError(message, retry = null) {
    if (retry) {
      wx.showModal({
        title: '出错了',
        content: message,
        confirmText: '重试',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm && retry) {
            retry();
          }
        }
      });
    } else {
      wx.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 网络错误处理
  handleNetworkError(retry = null) {
    this.showError('网络连接失败，请检查网络后重试', retry);
  },

  // ========== 成功提示 ==========
  showSuccess(message) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration: 1500
    });
  },

  // ========== 确认弹窗 ==========
  async confirm(title, content, options = {}) {
    return new Promise((resolve) => {
      wx.showModal({
        title,
        content,
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
        confirmColor: options.confirmColor || '#5B9A6F',
        success: (res) => {
          resolve(res.confirm);
        }
      });
    });
  },

  // ========== 震动反馈 ==========
  vibrate(type = 'light') {
    try {
      if (type === 'long') {
        wx.vibrateLong();
      } else {
        wx.vibrateShort({ type });
      }
    } catch (e) {
      // 静默失败
    }
  },

  // ========== 打卡动画 ==========
  // 显示打卡成功动画
  showCheckinAnimation(page) {
    // 撒花特效
    page.setData({ showConfetti: true });
    setTimeout(() => {
      page.setData({ showConfetti: false });
    }, 2500);

    // 连击天数展示
    const streak = page.data.currentStreak || page.data.stats?.currentStreak || 0;
    if (streak > 1) {
      setTimeout(() => {
        page.setData({ showStreakBadge: true });
      }, 300);
      setTimeout(() => {
        page.setData({ showStreakBadge: false });
      }, 2000);
    }
  },

  // 显示升级动画
  showLevelUpAnimation(page, level) {
    page.setData({
      showLevelUp: true,
      levelUpLevel: level
    });
    this.vibrate('medium');
    setTimeout(() => {
      page.setData({ showLevelUp: false });
    }, 2500);
  },

  // 显示成就解锁动画
  showAchievementAnimation(page, achievement) {
    page.setData({
      showAchievement: true,
      currentAchievement: achievement
    });
    this.vibrate('long');
    setTimeout(() => {
      page.setData({ showAchievement: false });
    }, 3000);
  },

  // 显示连击特效
  showComboEffect(page, combo) {
    if (combo >= 30) {
      // 月度连击：满屏烟花
      page.setData({ showFireworks: true });
      this.vibrate('long');
      setTimeout(() => page.setData({ showFireworks: false }), 3000);
    } else if (combo >= 7) {
      // 周连击：撒花
      page.setData({ showConfetti: true });
      this.vibrate('medium');
      setTimeout(() => page.setData({ showConfetti: false }), 2500);
    } else if (combo >= 3) {
      // 3天连击：简单特效
      this.vibrate('light');
    }
  },

  // ========== 空状态 ==========
  // 获取空状态配置
  getEmptyState(type) {
    const emptyStates = {
      goals: {
        icon: '🎯',
        title: '还没有设置目标',
        desc: '点击「模板」快速创建或自定义添加',
        action: '创建目标'
      },
      checkins: {
        icon: '📝',
        title: '还没有打卡记录',
        desc: '坚持打卡，记录你的成长',
        action: '去打卡'
      },
      diaries: {
        icon: '📖',
        title: '还没有打卡日记',
        desc: '开启打卡日记功能，记录每天的心情',
        action: '开启日记'
      },
      pets: {
        icon: '🐾',
        title: '还没有宠物',
        desc: '领养一只宠物，陪伴你自律成长',
        action: '领养宠物'
      },
      items: {
        icon: '🎒',
        title: '暂无道具',
        desc: '坚持打卡会获得道具哦~',
        action: null
      },
      achievements: {
        icon: '🏆',
        title: '还没有成就',
        desc: '坚持打卡解锁成就',
        action: null
      },
      medals: {
        icon: '🏅',
        title: '还没有勋章',
        desc: '完成挑战解锁勋章',
        action: null
      },
      chains: {
        icon: '🔗',
        title: '还没有习惯链',
        desc: '创建习惯链，将多个目标串联起来',
        action: '创建习惯链'
      }
    };
    return emptyStates[type] || emptyStates.goals;
  },

  // ========== 列表项动画 ==========
  // 列表项进入动画
  animateListItem(element, delay = 0) {
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, delay);
  },

  // ========== 滑动删除 ==========
  // 处理滑动删除
  handleSwipeDelete(e, page, deleteCallback) {
    const { startX, startY } = page.data._touchStart || {};
    const endX = e.touches[0].clientX;
    const endY = e.touches[0].clientY;

    const diffX = startX - endX;
    const diffY = Math.abs(startY - endY);

    // 水平滑动超过80px，且垂直偏移小于50px
    if (diffX > 80 && diffY < 50) {
      const itemId = e.currentTarget.dataset.id;
      deleteCallback(itemId);
    }
  },

  // 记录触摸开始位置
  recordTouchStart(e, page) {
    page.setData({
      _touchStart: {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY
      }
    });
  },

  // ========== 下拉刷新 ==========
  // 处理下拉刷新
  async handlePullRefresh(page, loadFunction) {
    page.setData({ isRefreshing: true });
    try {
      await loadFunction();
    } finally {
      page.setData({ isRefreshing: false });
      wx.stopPullDownRefresh();
    }
  },

  // ========== 长按操作 ==========
  // 处理长按
  handleLongPress(callback, delay = 500) {
    let timer = null;
    return {
      start: () => {
        timer = setTimeout(() => {
          callback();
          ui.vibrate('medium');
        }, delay);
      },
      end: () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      }
    };
  }
};

module.exports = ui;
