const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    themeClass: '',
    skills: [],
    currentPetId: ''
  },

  onLoad() {
    this.setData({ themeClass: app.globalData.themeClass });
  },

  onShow() {
    this.loadSkills();
  },

  loadSkills() {
    const petTypes = api.getPetTypes();
    const petsRes = api.getPetsInfo();
    const pets = petsRes.data || [];
    const ownedPetIds = pets.map(p => p.petId);

    const skills = Object.entries(petTypes).map(([id, info]) => {
      const skill = api.getPetSkill(id);
      const owned = ownedPetIds.includes(id);
      return {
        petId: id,
        petName: info.name,
        petIcon: info.icon,
        skill,
        owned,
        isCurrent: owned
      };
    });

    // 已拥有的排前面
    skills.sort((a, b) => (b.owned ? 1 : 0) - (a.owned ? 1 : 0));

    this.setData({ skills });
  }
});
