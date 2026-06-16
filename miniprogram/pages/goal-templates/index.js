const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    themeClass: '',
    categories: [],
    templates: [],
    selectedCategory: '',
    filteredTemplates: []
  },

  onLoad() {
    this.setData({ themeClass: app.globalData.themeClass });
    this.loadData();
  },

  loadData() {
    const templates = api.getGoalTemplates();
    const categories = api.getGoalTemplateCategories();

    this.setData({
      templates,
      categories,
      selectedCategory: categories[0] || '',
      filteredTemplates: templates.filter(t => t.category === categories[0])
    });
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      selectedCategory: category,
      filteredTemplates: this.data.templates.filter(t => t.category === category)
    });
  },

  useTemplate(e) {
    const templateId = e.currentTarget.dataset.id;
    const template = this.data.templates.find(t => t.id === templateId);

    if (template) {
      // 跳转到主页并传递模板数据
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage) {
        prevPage.setData({
          showAddGoal: true,
          newGoalName: template.name,
          selectedType: template.type,
          targetCount: template.targetCount || 3
        });
      }
      wx.navigateBack();
    }
  }
});
