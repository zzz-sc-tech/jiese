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
    const currentPetId = pets.length > 0 ? pets[0].petId : '';

    const skills = Object.entries(petTypes).map(([id, info]) => {
      const skill = api.getPetSkill(id);
      const owned = pets.some(p => p.petId === id);
      return {
        petId: id,
        petName: info.name,
        petIcon: info.icon,
        skill,
        owned,
        isCurrent: id === currentPetId
      };
    });

    this.setData({ skills, currentPetId });
  }
});
