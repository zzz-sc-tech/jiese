// 简单状态管理工具
class Store {
  constructor() {
    this._state = {};
    this._listeners = {};
  }

  // 获取状态
  get(key) {
    return this._state[key];
  }

  // 设置状态
  set(key, value) {
    const oldValue = this._state[key];
    this._state[key] = value;

    // 通知监听器
    if (this._listeners[key]) {
      this._listeners[key].forEach(listener => {
        listener(value, oldValue);
      });
    }
  }

  // 监听状态变化
  on(key, listener) {
    if (!this._listeners[key]) {
      this._listeners[key] = [];
    }
    this._listeners[key].push(listener);

    // 返回取消监听函数
    return () => {
      this._listeners[key] = this._listeners[key].filter(l => l !== listener);
    };
  }

  // 批量更新
  update(obj) {
    Object.keys(obj).forEach(key => {
      this.set(key, obj[key]);
    });
  }

  // 获取所有状态
  getAll() {
    return { ...this._state };
  }

  // 清除所有状态
  clear() {
    this._state = {};
    this._listeners = {};
  }
}

// 创建全局 store 实例
const store = new Store();

// 初始化默认状态
store.update({
  theme: 'green',
  themeClass: '',
  currentPetIndex: 0,
  goals: [],
  pets: []
});

module.exports = store;
