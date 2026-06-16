// 数据存取服务
const storage = require('../storage');

const KEYS = {
  GOALS: 'jiese_goals',
  GOAL_STATS: 'jiese_goal_stats',
  CHECKINS: 'jiese_checkins',
  DURATION_SESSIONS: 'jiese_duration_sessions',
  CHALLENGES: 'jiese_challenges',
  GLOBAL_STATS: 'jiese_global_stats',
  PETS: 'jiese_pets',
  PET_ITEMS: 'jiese_pet_items',
  PET_DIARY: 'jiese_pet_diary',
  PET_COSTUMES: 'jiese_pet_costumes',
  PET_BACKGROUNDS: 'jiese_pet_backgrounds',
  PET_ACHIEVEMENTS: 'jiese_pet_achievements',
  PET_STATS: 'jiese_pet_stats'
};

const dataService = {
  // 目标
  getGoals() {
    return storage.get(KEYS.GOALS, []);
  },

  saveGoals(goals) {
    storage.set(KEYS.GOALS, goals);
  },

  // 目标统计
  getGoalStats() {
    return storage.get(KEYS.GOAL_STATS, {});
  },

  saveGoalStats(stats) {
    storage.set(KEYS.GOAL_STATS, stats);
  },

  // 打卡记录
  getCheckins() {
    return storage.get(KEYS.CHECKINS, []);
  },

  saveCheckins(list) {
    storage.set(KEYS.CHECKINS, list);
  },

  // 时长记录
  getDurationSessions() {
    return storage.get(KEYS.DURATION_SESSIONS, []);
  },

  saveDurationSessions(list) {
    storage.set(KEYS.DURATION_SESSIONS, list);
  },

  // 挑战
  getChallenges() {
    return storage.get(KEYS.CHALLENGES, []);
  },

  saveChallenges(list) {
    storage.set(KEYS.CHALLENGES, list);
  },

  // 全局统计
  getGlobalStats() {
    return storage.get(KEYS.GLOBAL_STATS, {
      totalDays: 0,
      longestStreak: 0,
      achievements: []
    });
  },

  saveGlobalStats(data) {
    storage.set(KEYS.GLOBAL_STATS, data);
  },

  // 宠物
  getPets() {
    return storage.get(KEYS.PETS, []);
  },

  savePets(pets) {
    storage.set(KEYS.PETS, pets);
  },

  // 宠物道具
  getPetItems() {
    return storage.get(KEYS.PET_ITEMS, {
      feed: 0,
      fruit: 0,
      candy: 0,
      crystal: 0,
      star: 0,
      rainbow: 0
    });
  },

  savePetItems(items) {
    storage.set(KEYS.PET_ITEMS, items);
  },

  // 宠物日记
  getPetDiary() {
    return storage.get(KEYS.PET_DIARY, []);
  },

  savePetDiary(diary) {
    storage.set(KEYS.PET_DIARY, diary);
  },

  // 宠物装扮
  getPetCostumes() {
    return storage.get(KEYS.PET_COSTUMES, []);
  },

  savePetCostumes(costumes) {
    storage.set(KEYS.PET_COSTUMES, costumes);
  },

  // 宠物背景
  getPetBackgrounds() {
    return storage.get(KEYS.PET_BACKGROUNDS, []);
  },

  savePetBackgrounds(backgrounds) {
    storage.set(KEYS.PET_BACKGROUNDS, backgrounds);
  },

  // 宠物成就
  getPetAchievements() {
    return storage.get(KEYS.PET_ACHIEVEMENTS, []);
  },

  savePetAchievements(achievements) {
    storage.set(KEYS.PET_ACHIEVEMENTS, achievements);
  },

  // 宠物统计
  getPetStats() {
    return storage.get(KEYS.PET_STATS, {
      feedCount: 0,
      interactCount: 0,
      diaryCount: 0,
      adoptedTypes: []
    });
  },

  savePetStats(stats) {
    storage.set(KEYS.PET_STATS, stats);
  },

  // 数据导出
  exportAll() {
    return {
      version: '1.0.0',
      exportTime: new Date().toISOString(),
      goals: this.getGoals(),
      checkins: this.getCheckins(),
      challenges: this.getChallenges(),
      settings: storage.getSettings(),
      pets: this.getPets(),
      petItems: this.getPetItems(),
      globalStats: this.getGlobalStats()
    };
  },

  // 数据导入
  importAll(data) {
    if (!data.version || !data.goals) {
      return { code: 1, message: '数据格式错误' };
    }

    if (data.goals) this.saveGoals(data.goals);
    if (data.checkins) this.saveCheckins(data.checkins);
    if (data.challenges) this.saveChallenges(data.challenges);
    if (data.settings) storage.saveSettings(data.settings);
    if (data.pets) this.savePets(data.pets);
    if (data.petItems) this.savePetItems(data.petItems);
    if (data.globalStats) this.saveGlobalStats(data.globalStats);

    return { code: 0, message: '导入成功' };
  }
};

module.exports = dataService;
