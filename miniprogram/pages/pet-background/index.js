const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    themeClass: '',
    petIndex: 0,
    pet: null,
    backgrounds: [],
    ownedBackgrounds: [],
    currentBg: ''
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

    this.setData({
      pet,
      backgrounds,
      ownedBackgrounds,
      currentBg: pet ? (pet.background || '') : ''
    });
  },

  selectBackground(e) {
    const { id } = e.currentTarget.dataset;
    const { petIndex, ownedBackgrounds } = this.data;

    if (!ownedBackgrounds.includes(id)) {
      // 解锁背景（这里简化处理）
      api.unlockBackground(id);
    }

    api.setPetBackground(id, petIndex);
    this.loadData();
    wx.showToast({ title: '已更换', icon: 'success' });
  }
});
