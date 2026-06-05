const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    themeClass: '',
    petIndex: 0,
    pet: null,
    costumes: [],
    ownedCostumes: [],
    currentCostumes: {}
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

    // 加载装扮列表
    const costumeTypes = api.getCostumeTypes();
    const ownedRes = api.getOwnedCostumes();
    const ownedCostumes = ownedRes.data || [];

    const costumes = Object.entries(costumeTypes).map(([id, info]) => ({
      id,
      ...info,
      owned: ownedCostumes.includes(id),
      equipped: pet && pet.costumes && pet.costumes[info.part] === id
    }));

    this.setData({
      pet,
      costumes,
      ownedCostumes,
      currentCostumes: pet ? (pet.costumes || {}) : {}
    });
  },

  equipCostume(e) {
    const { id } = e.currentTarget.dataset;
    const { petIndex, ownedCostumes } = this.data;

    if (!ownedCostumes.includes(id)) {
      // 解锁装扮（这里简化处理，实际可以通过成就或购买解锁）
      api.unlockCostume(id);
    }

    api.equipCostume(id, petIndex);
    this.loadData();
    wx.showToast({ title: '已穿戴', icon: 'success' });
  },

  unequipCostume(e) {
    const { part } = e.currentTarget.dataset;
    const { petIndex } = this.data;
    api.unequipCostume(part, petIndex);
    this.loadData();
    wx.showToast({ title: '已卸下', icon: 'success' });
  }
});
