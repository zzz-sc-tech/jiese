Component({
  properties: {
    name: {
      type: String,
      value: ''
    },
    desc: {
      type: String,
      value: ''
    },
    unlocked: {
      type: Boolean,
      value: false
    },
    icon: {
      type: String,
      value: '🏆'
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', {
        name: this.data.name,
        desc: this.data.desc,
        unlocked: this.data.unlocked
      });
    }
  }
});
