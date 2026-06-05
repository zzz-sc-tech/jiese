const api = require('../../utils/api');
const storage = require('../../utils/storage');

const app = getApp();

Page({
  data: {
    themeClass: '',
    // 宠物信息
    pets: [],
    currentPetIndex: 0,
    currentPet: null,
    hasPet: false,
    // 宠物类型列表
    petTypes: [],
    // 道具列表
    items: [],
    hasItems: false,
    // 领养弹窗
    showAdopt: false,
    selectedPetId: '',
    petName: '',
    // 投喂弹窗
    showFeed: false,
    selectedItemId: '',
    // 升级/进化提示
    showLevelUp: false,
    levelUpData: null,
    // 删除确认
    showDeleteConfirm: false,
    // 背景样式
    currentBgStyle: '',
    // 装扮图标
    costumeHatIcon: '',
    costumeGlassesIcon: '',
    costumeHatStyle: '',
    costumeGlassesStyle: '',
    // 互动弹窗
    showInteractModal: false,
    interactResult: null,
    // 动画状态
    petAnimation: '',
    isBlinking: false,
    showBubble: false,
    bubbleText: '',
    showHeart: false,
    showStars: false,
    // 心情
    moodIcon: '😊',
    moodText: '心情不错',
    // 技能
    currentSkill: null
  },

  _blinkTimer: null,

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
    this.startBlinking();
  },

  onHide() {
    this.stopBlinking();
  },

  onUnload() {
    this.stopBlinking();
  },

  // 开始眨眼动画
  startBlinking() {
    this._blinkTimer = setInterval(() => {
      this.setData({ isBlinking: true });
      setTimeout(() => {
        this.setData({ isBlinking: false });
      }, 200);
    }, 3000);
  },

  // 停止眨眼动画
  stopBlinking() {
    if (this._blinkTimer) {
      clearInterval(this._blinkTimer);
      this._blinkTimer = null;
    }
  },

  loadData() {
    // 加载所有宠物信息
    const petsRes = api.getPetsInfo();
    const pets = petsRes.data || [];
    const hasPet = pets.length > 0;
    const currentPetIndex = this.data.currentPetIndex;
    const currentPet = pets[currentPetIndex] || null;

    // 加载道具列表
    const itemsRes = api.getItems();
    const hasItems = itemsRes.data.some(item => item.count > 0);

    // 加载所有宠物技能
    const allSkills = api.getAllPetSkills();

    // 计算心情
    let moodIcon = '😊';
    let moodText = '心情不错';
    if (currentPet) {
      const lastFeed = currentPet.lastFeedTime;
      const now = Date.now();
      const hoursSinceFeed = (now - lastFeed) / (1000 * 60 * 60);

      if (hoursSinceFeed < 1) {
        moodIcon = '🥰';
        moodText = '非常开心';
      } else if (hoursSinceFeed < 6) {
        moodIcon = '😊';
        moodText = '心情不错';
      } else if (hoursSinceFeed < 24) {
        moodIcon = '😐';
        moodText = '有点无聊';
      } else {
        moodIcon = '😢';
        moodText = '想你了';
      }
    }

    // 检查宠物成就
    api.checkPetAchievements();

    // 计算背景样式
    let currentBgStyle = '';
    if (currentPet && currentPet.background) {
      const bgTypes = api.getBgTypes();
      const bg = bgTypes[currentPet.background];
      if (bg) {
        currentBgStyle = bg.gradient;
      }
    }

    // 计算装扮图标和位置
    const costumeTypes = api.getCostumeTypes();
    let costumeHatIcon = '';
    let costumeGlassesIcon = '';
    let costumeHatStyle = '';
    let costumeGlassesStyle = '';

    // 每种宠物的装扮位置配置
    const costumePositions = {
      pet_seedling: { hat: 'top: -25rpx;', glasses: 'top: 30rpx;' },
      pet_cat: { hat: 'top: -15rpx;', glasses: 'top: 45rpx;' },
      pet_dog: { hat: 'top: -20rpx;', glasses: 'top: 40rpx;' },
      pet_rabbit: { hat: 'top: -30rpx;', glasses: 'top: 35rpx;' },
      pet_panda: { hat: 'top: -20rpx;', glasses: 'top: 40rpx;' },
      pet_dragon: { hat: 'top: -25rpx;', glasses: 'top: 30rpx;' },
      pet_fox: { hat: 'top: -20rpx;', glasses: 'top: 40rpx;' },
      pet_penguin: { hat: 'top: -15rpx;', glasses: 'top: 50rpx;' },
      pet_hamster: { hat: 'top: -20rpx;', glasses: 'top: 40rpx;' },
      pet_turtle: { hat: 'top: -25rpx;', glasses: 'top: 25rpx;' },
      pet_butterfly: { hat: 'top: -30rpx;', glasses: 'top: 30rpx;' },
      pet_unicorn: { hat: 'top: -30rpx;', glasses: 'top: 35rpx;' }
    };

    if (currentPet && currentPet.costumes) {
      const petId = currentPet.petId;
      const positions = costumePositions[petId] || costumePositions.pet_cat;

      if (currentPet.costumes.hat && costumeTypes[currentPet.costumes.hat]) {
        costumeHatIcon = costumeTypes[currentPet.costumes.hat].icon;
        costumeHatStyle = positions.hat;
      }
      if (currentPet.costumes.glasses && costumeTypes[currentPet.costumes.glasses]) {
        costumeGlassesIcon = costumeTypes[currentPet.costumes.glasses].icon;
        costumeGlassesStyle = positions.glasses;
      }
    }

    this.setData({
      pets,
      currentPet,
      hasPet,
      items: itemsRes.data,
      hasItems,
      moodIcon,
      moodText,
      allSkills,
      currentBgStyle,
      costumeHatIcon,
      costumeGlassesIcon,
      costumeHatStyle,
      costumeGlassesStyle
    });
  },

  // 切换宠物
  switchPet(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentPetIndex: index });
    this.loadData();
  },

  // 点击宠物
  onPetTap() {
    this.setData({
      petAnimation: 'happy',
      showBubble: true,
      bubbleText: this.getRandomBubble()
    });

    setTimeout(() => {
      this.setData({ petAnimation: '' });
    }, 500);

    setTimeout(() => {
      this.setData({ showBubble: false });
    }, 2000);
  },

  // 长按宠物
  onPetLongPress() {
    this.setData({
      showHeart: true,
      showBubble: true,
      bubbleText: '好舒服~'
    });

    setTimeout(() => {
      this.setData({ showHeart: false });
    }, 1000);

    setTimeout(() => {
      this.setData({ showBubble: false });
    }, 2000);
  },

  // 摸摸宠物
  onPetPat() {
    this.setData({
      petAnimation: 'happy',
      showHeart: true,
      showStars: true,
      showBubble: true,
      bubbleText: '嘿嘿~'
    });

    setTimeout(() => {
      this.setData({ petAnimation: '' });
    }, 500);

    setTimeout(() => {
      this.setData({ showHeart: false, showStars: false });
    }, 1000);

    setTimeout(() => {
      this.setData({ showBubble: false });
    }, 2000);
  },

  // 获取随机气泡文字
  getRandomBubble() {
    const bubbles = [
      '你好呀~',
      '今天也要加油！',
      '想你了~',
      '陪我玩吧！',
      '嘿嘿~',
      '喵~',
      '汪！',
      '咕咕~'
    ];
    return bubbles[Math.floor(Math.random() * bubbles.length)];
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
    const { selectedItemId, currentPetIndex } = this.data;
    if (!selectedItemId) {
      wx.showToast({ title: '请选择道具', icon: 'none' });
      return;
    }

    const res = await api.feedPet(selectedItemId, currentPetIndex);
    if (res.code === 0) {
      const { leveledUp, evolved } = res.data;

      // 播放吃东西动画
      this.setData({
        showFeed: false,
        petAnimation: 'eat',
        showBubble: true,
        bubbleText: '好吃~',
        showStars: true
      });

      setTimeout(() => {
        this.setData({ petAnimation: '', showStars: false });
      }, 500);

      setTimeout(() => {
        this.setData({ showBubble: false });
      }, 2000);

      // 延迟显示升级/进化提示
      if (evolved || leveledUp) {
        setTimeout(() => {
          this.setData({
            showLevelUp: true,
            levelUpData: res.data
          });
        }, 800);
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
  },

  // 显示删除确认
  showDeleteConfirm() {
    this.setData({ showDeleteConfirm: true });
  },

  // 隐藏删除确认
  hideDeleteConfirm() {
    this.setData({ showDeleteConfirm: false });
  },

  // 确认删除宠物
  async confirmDelete() {
    const { currentPetIndex } = this.data;
    const res = await api.deletePet(currentPetIndex);
    if (res.code === 0) {
      wx.showToast({ title: '已放生', icon: 'success' });
      this.setData({
        showDeleteConfirm: false,
        currentPetIndex: 0
      });
      this.loadData();
    } else {
      wx.showToast({ title: res.message, icon: 'none' });
    }
  },

  // 功能入口
  goDiary() {
    wx.navigateTo({ url: '/pages/pet-diary/index' });
  },

  goAchievement() {
    wx.navigateTo({ url: '/pages/pet-achievement/index' });
  },

  goSkill() {
    wx.navigateTo({ url: '/pages/pet-skill/index' });
  },

  goCostume() {
    wx.navigateTo({ url: '/pages/pet-costume/index?petIndex=' + this.data.currentPetIndex });
  },

  goBackground() {
    wx.navigateTo({ url: '/pages/pet-background/index?petIndex=' + this.data.currentPetIndex });
  },

  // 宠物互动
  showInteract() {
    this.setData({ showInteractModal: true });
  },

  hideInteractModal() {
    this.setData({ showInteractModal: false, interactResult: null });
  },

  async doInteract() {
    const res = api.interactPets(0, 1);
    if (res.code === 0) {
      // 记录互动
      api.recordInteract();

      // 添加日记
      api.addPetDiary('两只宠物一起玩耍，感情更好了！', 'interact');

      this.setData({
        interactResult: res.data,
        showBubble: true,
        bubbleText: '好开心~',
        showHeart: true
      });

      setTimeout(() => {
        this.setData({ showBubble: false, showHeart: false });
      }, 2000);

      // 检查成就
      api.checkPetAchievements();
    }
  },

  // 获取装扮图标
  getCostumeIcon(costumeId) {
    const costumeTypes = api.getCostumeTypes();
    const costume = costumeTypes[costumeId];
    return costume ? costume.icon : '';
  }
});
