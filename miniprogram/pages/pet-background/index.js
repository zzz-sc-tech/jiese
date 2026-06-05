const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    themeClass: '',
    petIndex: 0,
    pet: null,
    backgrounds: [],
    ownedBackgrounds: [],
    currentBg: '',
    currentBgStyle: ''
  },

  onLoad(options) {
    const petIndex = parseInt(options.petIndex) || 0;
    this.setData({
      themeClass: app.globalData.themeClass,
      petIndex
    });
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const { petIndex } = this.data;

    // 加载宠物信息
    const petInfo = api.getPetInfo(petIndex);
    const pet = petInfo.data;

    // 加载背景列表
    const bgTypes = api.getBgTypes();
    const ownedRes = api.getOwnedBackgrounds();
    const ownedBackgrounds = ownedRes.data || [];

    const backgrounds = Object.entries(bgTypes).map(([id, info]) => ({
      id,
      ...info,
      owned: ownedBackgrounds.includes(id),
      selected: pet && pet.background === id
    }));

    // 计算当前背景样式
    let currentBgStyle = '';
    if (pet && pet.background && bgTypes[pet.background]) {
      currentBgStyle = bgTypes[pet.background].gradient;
    }

    this.setData({
      pet,
      backgrounds,
      ownedBackgrounds,
      currentBg: pet ? (pet.background || '') : '',
      currentBgStyle
    });
  },

  selectBackground(e) {
    const { id } = e.currentTarget.dataset;
    const { petIndex, ownedBackgrounds } = this.data;

    if (!ownedBackgrounds.includes(id)) {
      // 解锁背景
      api.unlockBackground(id);
    }

    const res = api.setPetBackground(id, petIndex);
    if (res.code === 0) {
      wx.showToast({ title: '已更换', icon: 'success' });
      this.loadData();
    } else {
      wx.showToast({ title: res.message, icon: 'none' });
    }
  }
});
