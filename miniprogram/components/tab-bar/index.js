Component({
  properties: {
    selected: {
      type: Number,
      value: 0
    }
  },

  methods: {
    switchTab(e) {
      const { index, path } = e.currentTarget.dataset;
      if (index === this.data.selected) return;

      wx.switchTab({
        url: `/${path}`
      });
    }
  }
});
