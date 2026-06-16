// 守心小程序 - API 模块
// 组合所有服务模块，提供统一的接口

const goalService = require('./services/goalService');
const petService = require('./services/petService');
const challengeService = require('./services/challengeService');
const statsService = require('./services/statsService');
const { QUOTES } = require('./services/config');

// 组合所有服务
const api = {
  // ========== 目标服务 ==========
  getGoalPresets: goalService.getGoalPresets.bind(goalService),
  getGoalTemplates: goalService.getGoalTemplates.bind(goalService),
  getGoalTemplateCategories: goalService.getGoalTemplateCategories.bind(goalService),
  getCheckins: goalService.getCheckins.bind(goalService),
  getTotalCheckins: goalService.getTotalCheckins.bind(goalService),
  getActualCheckinDays: goalService.getActualCheckinDays.bind(goalService),
  createGoal: goalService.createGoal.bind(goalService),
  updateGoal: goalService.updateGoal.bind(goalService),
  deleteGoal: goalService.deleteGoal.bind(goalService),
  getGoals: goalService.getGoals.bind(goalService),
  checkin: goalService.checkin.bind(goalService),
  checkinCount: goalService.checkinCount.bind(goalService),
  saveDuration: goalService.saveDuration.bind(goalService),
  getTodayStatus: goalService.getTodayStatus.bind(goalService),
  getTodaySessions: goalService.getTodaySessions.bind(goalService),
  getCheckinDiaries: goalService.getCheckinDiaries.bind(goalService),
  getMilestones: goalService.getMilestones.bind(goalService),

  // ========== 宠物服务 ==========
  getPetTypes: petService.getPetTypes.bind(petService),
  getItemTypes: petService.getItemTypes.bind(petService),
  getCostumeTypes: petService.getCostumeTypes.bind(petService),
  getBgTypes: petService.getBgTypes.bind(petService),
  getPetsInfo: petService.getPetsInfo.bind(petService),
  getPetInfo: petService.getPetInfo.bind(petService),
  adoptPet: petService.adoptPet.bind(petService),
  getItems: petService.getItems.bind(petService),
  feedPet: petService.feedPet.bind(petService),
  grantItem: petService.grantItem.bind(petService),
  getPetSimple: petService.getPetSimple.bind(petService),
  deletePet: petService.deletePet.bind(petService),
  getPetSkill: petService.getPetSkill.bind(petService),
  getAllPetSkills: petService.getAllPetSkills.bind(petService),
  applyPetSkills: petService.applyPetSkills.bind(petService),
  addPetDiary: petService.addPetDiary.bind(petService),
  getPetDiaryList: petService.getPetDiaryList.bind(petService),
  getOwnedCostumes: petService.getOwnedCostumes.bind(petService),
  unlockCostume: petService.unlockCostume.bind(petService),
  equipCostume: petService.equipCostume.bind(petService),
  unequipCostume: petService.unequipCostume.bind(petService),
  getOwnedBackgrounds: petService.getOwnedBackgrounds.bind(petService),
  unlockBackground: petService.unlockBackground.bind(petService),
  setPetBackground: petService.setPetBackground.bind(petService),
  getPetAchievementDefs: petService.getPetAchievementDefs.bind(petService),
  getPetAchievementList: petService.getPetAchievementList.bind(petService),
  checkPetAchievements: petService.checkPetAchievements.bind(petService),
  recordInteract: petService.recordInteract.bind(petService),
  interactPets: petService.interactPets.bind(petService),

  // ========== 挑战服务 ==========
  getChallenges: challengeService.getChallenges.bind(challengeService),
  createChallenge: challengeService.createChallenge.bind(challengeService),
  getChallengeStats: challengeService.getChallengeStats.bind(challengeService),
  getChallengeMedals: challengeService.getChallengeMedals.bind(challengeService),
  getGoalChallenges: challengeService.getGoalChallenges.bind(challengeService),
  getChallengeMedalDefs: challengeService.getChallengeMedalDefs.bind(challengeService),

  // ========== 统计服务 ==========
  getStats: statsService.getStats.bind(statsService),
  getDurationStats: statsService.getDurationStats.bind(statsService),
  getCountStats: statsService.getCountStats.bind(statsService),
  getQuotes: statsService.getQuotes.bind(statsService),
  getYesterdaySummary: statsService.getYesterdaySummary.bind(statsService),
  getWeeklyReport: statsService.getWeeklyReport.bind(statsService),
  getStabilityScore: statsService.getStabilityScore.bind(statsService),
  getComparisonAnalysis: statsService.getComparisonAnalysis.bind(statsService),
  getBestTimeRecommendation: statsService.getBestTimeRecommendation.bind(statsService),
  getDailyQuestion: statsService.getDailyQuestion.bind(statsService),
  getHabitTip: statsService.getHabitTip.bind(statsService),
  getHabitGuides: statsService.getHabitGuides.bind(statsService)
};

module.exports = api;
