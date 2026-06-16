// 守心小程序 - 宠物服务模块
// 包含宠物的领养、投喂、装扮、背景、成就等功能

const storage = require('../storage');
const { PET_TYPES, PET_SKILLS, ITEM_TYPES, COSTUME_TYPES, BG_TYPES, PET_ACHIEVEMENTS } = require('./config');
const { calculateLevel } = require('./utils');

// ========== 内部数据操作 ==========
function getPets() {
  return storage.get('jiese_pets', []);
}

function savePets(pets) {
  storage.set('jiese_pets', pets);
}

function getPetItems() {
  return storage.get('jiese_pet_items', {
    feed: 0, fruit: 0, candy: 0, crystal: 0, star: 0, rainbow: 0
  });
}

function savePetItems(items) {
  storage.set('jiese_pet_items', items);
}

function getPetDiary() {
  return storage.get('jiese_pet_diary', []);
}

function savePetDiary(diary) {
  storage.set('jiese_pet_diary', diary);
}

function getPetCostumes() {
  return storage.get('jiese_pet_costumes', []);
}

function savePetCostumes(costumes) {
  storage.set('jiese_pet_costumes', costumes);
}

function getPetBackgrounds() {
  return storage.get('jiese_pet_backgrounds', []);
}

function savePetBackgrounds(backgrounds) {
  storage.set('jiese_pet_backgrounds', backgrounds);
}

function getPetAchievements() {
  return storage.get('jiese_pet_achievements', []);
}

function savePetAchievements(achievements) {
  storage.set('jiese_pet_achievements', achievements);
}

function getPetStats() {
  return storage.get('jiese_pet_stats', {
    feedCount: 0, interactCount: 0, diaryCount: 0, adoptedTypes: []
  });
}

function savePetStats(stats) {
  storage.set('jiese_pet_stats', stats);
}

// 兼容旧版本单宠物数据
function migratePetData() {
  const oldPet = storage.get('jiese_pet', null);
  if (oldPet) {
    const pets = getPets();
    if (pets.length === 0) {
      pets.push(oldPet);
      savePets(pets);
    }
    storage.remove('jiese_pet');
  }
}

// ========== 宠物服务 ==========
const petService = {
  // 获取宠物类型列表
  getPetTypes() {
    return PET_TYPES;
  },

  // 获取道具类型列表
  getItemTypes() {
    return ITEM_TYPES;
  },

  // 获取装扮类型列表
  getCostumeTypes() {
    return COSTUME_TYPES;
  },

  // 获取背景类型列表
  getBgTypes() {
    return BG_TYPES;
  },

  // 获取所有宠物信息
  getPetsInfo() {
    migratePetData();
    const pets = getPets();
    const petsInfo = pets.map(pet => {
      const petType = PET_TYPES[pet.petId];
      const levelInfo = calculateLevel(pet.exp);
      const stageInfo = petType.stages[levelInfo.stage];
      return {
        ...pet,
        ...levelInfo,
        typeName: petType.name,
        typeIcon: petType.icon,
        typeDesc: petType.desc,
        stageName: stageInfo.name,
        stageIcon: stageInfo.icon
      };
    });
    return { code: 0, data: petsInfo };
  },

  // 获取单个宠物信息
  getPetInfo(petIndex = 0) {
    migratePetData();
    const pets = getPets();
    const pet = pets[petIndex];
    if (!pet) return { code: 0, data: null };

    const petType = PET_TYPES[pet.petId];
    const levelInfo = calculateLevel(pet.exp);
    const stageInfo = petType.stages[levelInfo.stage];

    return {
      code: 0,
      data: {
        ...pet,
        petIndex,
        ...levelInfo,
        typeName: petType.name,
        typeIcon: petType.icon,
        typeDesc: petType.desc,
        stageName: stageInfo.name,
        stageIcon: stageInfo.icon
      }
    };
  },

  // 领养宠物
  async adoptPet(petId, name) {
    migratePetData();
    const pets = getPets();
    if (pets.length >= 2) {
      return { code: 1, message: '最多只能养2只宠物' };
    }

    if (!PET_TYPES[petId]) {
      return { code: 2, message: '无效的宠物类型' };
    }

    const pet = {
      petId,
      name: name || PET_TYPES[petId].name,
      exp: 0,
      adoptTime: Date.now(),
      lastFeedTime: Date.now()
    };

    pets.push(pet);
    savePets(pets);

    // 记录领养的宠物类型
    const stats = getPetStats();
    if (!stats.adoptedTypes.includes(petId)) {
      stats.adoptedTypes.push(petId);
      savePetStats(stats);
    }

    // 添加日记
    this.addPetDiary(`领养了${pet.name}，开始新的旅程！`, 'adopt', pets.length - 1);

    // 检查成就
    this.checkPetAchievements();

    return { code: 0, data: pet };
  },

  // 获取道具列表
  getItems() {
    const items = getPetItems();
    const itemTypes = ITEM_TYPES;

    const itemList = Object.entries(items).map(([id, count]) => ({
      id,
      count,
      ...itemTypes[id]
    }));

    return { code: 0, data: itemList };
  },

  // 使用道具投喂宠物
  async feedPet(itemId, petIndex = 0) {
    migratePetData();
    const pets = getPets();
    const pet = pets[petIndex];
    if (!pet) {
      return { code: 1, message: '请先领养宠物' };
    }

    const items = getPetItems();
    if (!items[itemId] || items[itemId] <= 0) {
      return { code: 2, message: '道具不足' };
    }

    const itemConfig = ITEM_TYPES[itemId];
    if (!itemConfig) {
      return { code: 3, message: '无效的道具' };
    }

    // 计算升级前的等级
    const beforeLevel = calculateLevel(pet.exp);

    // 增加经验值
    pet.exp += itemConfig.exp;
    pet.lastFeedTime = Date.now();

    // 计算升级后的等级
    const afterLevel = calculateLevel(pet.exp);

    // 减少道具
    items[itemId]--;
    savePetItems(items);
    savePets(pets);

    // 更新统计
    const stats = getPetStats();
    stats.feedCount++;
    savePetStats(stats);

    // 判断是否升级或进化
    const leveledUp = afterLevel.level > beforeLevel.level;
    const evolved = afterLevel.stage !== beforeLevel.stage;

    // 添加日记
    if (evolved) {
      this.addPetDiary(`${pet.name}进化为${PET_TYPES[pet.petId].stages[afterLevel.stage].name}！`, 'evolve', petIndex);
    } else if (leveledUp) {
      this.addPetDiary(`${pet.name}升级到${afterLevel.level}级`, 'level', petIndex);
    }

    // 检查成就
    this.checkPetAchievements();

    return {
      code: 0,
      data: {
        pet,
        petIndex,
        levelInfo: afterLevel,
        gainedExp: itemConfig.exp,
        leveledUp,
        evolved,
        oldStage: beforeLevel.stage,
        newStage: afterLevel.stage
      }
    };
  },

  // 发放道具
  async grantItem(itemId, count = 1) {
    const items = getPetItems();
    items[itemId] = (items[itemId] || 0) + count;
    savePetItems(items);

    return {
      code: 0,
      data: { itemId, count, totalCount: items[itemId] }
    };
  },

  // 获取宠物信息（简化版）
  getPetSimple(petIndex = 0) {
    migratePetData();
    const pets = getPets();
    const pet = pets[petIndex];
    if (!pet) return null;

    const petType = PET_TYPES[pet.petId];
    const levelInfo = calculateLevel(pet.exp);
    const stageInfo = petType.stages[levelInfo.stage];

    return {
      ...pet,
      petIndex,
      level: levelInfo.level,
      stage: levelInfo.stage,
      stageIcon: stageInfo.icon,
      stageName: stageInfo.name,
      levelProgress: levelInfo.levelProgress
    };
  },

  // 删除宠物
  async deletePet(petIndex) {
    migratePetData();
    const pets = getPets();
    if (petIndex < 0 || petIndex >= pets.length) {
      return { code: 1, message: '无效的宠物索引' };
    }
    pets.splice(petIndex, 1);
    savePets(pets);
    return { code: 0 };
  },

  // 获取宠物技能
  getPetSkill(petId) {
    return PET_SKILLS[petId] || null;
  },

  // 获取所有拥有宠物的技能
  getAllPetSkills() {
    const pets = getPets();
    const skills = pets.map(pet => ({
      petId: pet.petId,
      petName: pet.name,
      skill: PET_SKILLS[pet.petId]
    })).filter(s => s.skill);
    return skills;
  },

  // 应用所有宠物技能效果
  applyPetSkills() {
    const pets = getPets();
    const effects = {
      extraFeed: 0,
      doubleItemChance: 0,
      streakBonus: 0,
      expBoost: 0,
      luckBoost: 0,
      dailyRandomItem: false
    };

    pets.forEach(pet => {
      const skill = PET_SKILLS[pet.petId];
      if (!skill) return;

      switch (skill.type) {
        case 'extra_feed': effects.extraFeed += 1; break;
        case 'double_item': effects.doubleItemChance += skill.chance; break;
        case 'streak_bonus': effects.streakBonus += skill.value; break;
        case 'exp_boost': effects.expBoost += skill.value; break;
        case 'luck_boost': effects.luckBoost += skill.value; break;
        case 'global_exp_boost': effects.expBoost += skill.value; break;
        case 'daily_random_item': effects.dailyRandomItem = true; break;
      }
    });

    return effects;
  },

  // ========== 宠物日记 ==========
  addPetDiary(content, type, petIndex = 0) {
    const diary = getPetDiary();
    const pets = getPets();
    const pet = pets[petIndex];
    if (!pet) return;

    diary.unshift({
      id: 'diary_' + Date.now(),
      petIndex,
      petName: pet.name,
      content,
      type,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString()
    });

    if (diary.length > 100) diary.length = 100;
    savePetDiary(diary);

    const stats = getPetStats();
    stats.diaryCount++;
    savePetStats(stats);
  },

  getPetDiaryList() {
    return { code: 0, data: getPetDiary() };
  },

  // ========== 宠物装扮 ==========
  getOwnedCostumes() {
    return { code: 0, data: getPetCostumes() };
  },

  unlockCostume(costumeId) {
    const costumes = getPetCostumes();
    if (!costumes.includes(costumeId)) {
      costumes.push(costumeId);
      savePetCostumes(costumes);
    }
    return { code: 0 };
  },

  equipCostume(costumeId, petIndex = 0) {
    const pets = getPets();
    const pet = pets[petIndex];
    if (!pet) return { code: 1, message: '宠物不存在' };

    const costume = COSTUME_TYPES[costumeId];
    if (!costume) return { code: 2, message: '装扮不存在' };

    if (!pet.costumes) pet.costumes = {};
    pet.costumes[costume.part] = costumeId;
    savePets(pets);

    // 检查成就
    this.checkPetAchievements();

    return { code: 0 };
  },

  unequipCostume(part, petIndex = 0) {
    const pets = getPets();
    const pet = pets[petIndex];
    if (!pet) return { code: 1, message: '宠物不存在' };

    if (pet.costumes) {
      delete pet.costumes[part];
      savePets(pets);
    }

    return { code: 0 };
  },

  // ========== 宠物背景 ==========
  getOwnedBackgrounds() {
    return { code: 0, data: getPetBackgrounds() };
  },

  unlockBackground(bgId) {
    const backgrounds = getPetBackgrounds();
    if (!backgrounds.includes(bgId)) {
      backgrounds.push(bgId);
      savePetBackgrounds(backgrounds);
    }
    return { code: 0 };
  },

  setPetBackground(bgId, petIndex = 0) {
    const pets = getPets();
    const pet = pets[petIndex];
    if (!pet) return { code: 1, message: '宠物不存在' };

    pet.background = bgId;
    savePets(pets);

    return { code: 0 };
  },

  // ========== 宠物成就 ==========
  getPetAchievementDefs() {
    return PET_ACHIEVEMENTS;
  },

  getPetAchievementList() {
    const unlocked = getPetAchievements();
    const list = PET_ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: unlocked.includes(a.id)
    }));
    return { code: 0, data: list };
  },

  checkPetAchievements() {
    const pets = getPets();
    const stats = getPetStats();
    const unlocked = getPetAchievements();
    const newAchievements = [];

    PET_ACHIEVEMENTS.forEach(achievement => {
      if (unlocked.includes(achievement.id)) return;

      let earned = false;
      switch (achievement.condition) {
        case 'adopt_first': earned = pets.length >= 1; break;
        case 'have_two': earned = pets.length >= 2; break;
        case 'level_10': earned = pets.some(p => calculateLevel(p.exp).level >= 10); break;
        case 'level_20': earned = pets.some(p => calculateLevel(p.exp).level >= 20); break;
        case 'level_30': earned = pets.some(p => calculateLevel(p.exp).level >= 30); break;
        case 'evolve_once': earned = pets.some(p => calculateLevel(p.exp).stage !== 'baby'); break;
        case 'evolve_full': earned = pets.some(p => calculateLevel(p.exp).stage === 'adult'); break;
        case 'feed_100': earned = stats.feedCount >= 100; break;
        case 'all_types': earned = stats.adoptedTypes.length >= Object.keys(PET_TYPES).length; break;
        case 'wear_costume': earned = pets.some(p => p.costumes && Object.keys(p.costumes).length > 0); break;
        case 'diary_30': earned = stats.diaryCount >= 30; break;
        case 'interact_50': earned = stats.interactCount >= 50; break;
      }

      if (earned) {
        unlocked.push(achievement.id);
        newAchievements.push(achievement);
      }
    });

    savePetAchievements(unlocked);
    return { code: 0, data: { newAchievements } };
  },

  // ========== 宠物互动 ==========
  recordInteract() {
    const stats = getPetStats();
    stats.interactCount++;
    savePetStats(stats);
  },

  interactPets(petIndex1, petIndex2) {
    const pets = getPets();
    if (!pets[petIndex1] || !pets[petIndex2]) {
      return { code: 1, message: '宠物不存在' };
    }

    if (!pets[petIndex1].intimacy) pets[petIndex1].intimacy = {};
    if (!pets[petIndex2].intimacy) pets[petIndex2].intimacy = {};

    pets[petIndex1].intimacy[petIndex2] = (pets[petIndex1].intimacy[petIndex2] || 0) + 1;
    pets[petIndex2].intimacy[petIndex1] = (pets[petIndex2].intimacy[petIndex1] || 0) + 1;

    savePets(pets);

    return {
      code: 0,
      data: {
        intimacy1: pets[petIndex1].intimacy[petIndex2],
        intimacy2: pets[petIndex2].intimacy[petIndex1]
      }
    };
  }
};

module.exports = petService;
