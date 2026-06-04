const api = require('../../utils/api');
const storage = require('../../utils/storage');

const app = getApp();

Page({
  data: {
    themeClass: '',
    // 宠物信息
    pet: null,
    hasPet: false,
    // 宠物类型列表
    petTypes: [],
    // 道具列表
    items: [],
    // 领养弹窗
    showAdopt: false,
    selectedPetId: '',
    petName: '',
    // 投喂弹窗
    showFeed: false,
    selectedItemId: '',
    // 升级/进化提示
    showLevelUp: false,
    levelUpData: null
  },

  onLoad() {
    this.setData({
      themeClass: app.globalData.themeClass,
      petTypes: Object.entries(api.getPetTypes()).map(([id, info]) => ({
        id,
        ...info
      }))
    });
  },

  onShow() {
    app.applyNavBarColor(app.globalData.theme);
    this.setData({ themeClass: app.globalData.themeClass });
    this.loadData();
  },

  loadData() {
    // 加载宠物信息
    const petInfo = api.getPetInfo();
    const hasPet = petInfo.data !== null;

    // 加载道具列表
    const itemsRes = api.getItems();
    const hasItems = itemsRes.data.some(item => item.count > 0);

    this.setData({
      pet: petInfo.data,
      hasPet,
      items: itemsRes.data,
      hasItems
    });
  },

  // 显示领养弹窗
  showAdoptModal() {
    this.setData({
      showAdopt: true,
      selectedPetId: '',
      petName: ''
    });
  },

  hideAdoptModal() {
    this.setData({ showAdopt: false });
  },

  // 选择宠物类型
  selectPet(e) {
    const petId = e.currentTarget.dataset.id;
    this.setData({
      selectedPetId: petId,
      petName: this.data.petTypes.find(p => p.id === petId)?.name || ''
    });
  },

  // 输入宠物昵称
  onPetNameInput(e) {
    this.setData({ petName: e.detail.value });
  },

  // 确认领养
  async adoptPet() {
    const { selectedPetId, petName } = this.data;
    if (!selectedPetId) {
      wx.showToast({ title: '请选择宠物', icon: 'none' });
      return;
    }

    const res = await api.adoptPet(selectedPetId, petName.trim() || undefined);
    if (res.code === 0) {
      wx.showToast({ title: '领养成功！', icon: 'success' });
      this.setData({ showAdopt: false });
      this.loadData();
    } else {
      wx.showToast({ title: res.message, icon: 'none' });
    }
  },

  // 显示投喂弹窗
  showFeedModal() {
    this.setData({
      showFeed: true,
      selectedItemId: ''
    });
  },

  hideFeedModal() {
    this.setData({ showFeed: false });
  },

  // 选择道具
  selectItem(e) {
    const itemId = e.currentTarget.dataset.id;
    this.setData({ selectedItemId: itemId });
  },

  // 确认投喂
  async feedPet() {
    const { selectedItemId } = this.data;
    if (!selectedItemId) {
      wx.showToast({ title: '请选择道具', icon: 'none' });
      return;
    }

    const res = await api.feedPet(selectedItemId);
    if (res.code === 0) {
      const { leveledUp, evolved } = res.data;

      if (evolved || leveledUp) {
        this.setData({
          showFeed: false,
          showLevelUp: true,
          levelUpData: res.data
        });
      } else {
        wx.showToast({ title: '投喂成功', icon: 'success' });
        this.setData({ showFeed: false });
      }

      this.loadData();
    } else {
      wx.showToast({ title: res.message, icon: 'none' });
    }
  },

  // 关闭升级提示
  hideLevelUpModal() {
    this.setData({
      showLevelUp: false,
      levelUpData: null
    });
  },

  // 跳转到宠物选择页面
  goPetSelect() {
    this.showAdoptModal();
  }
});
