Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    quote: {
      type: Object,
      value: {
        content: '自律给我自由。',
        author: '康德'
      }
    },
    quotes: {
      type: Array,
      value: []
    },
    stats: {
      type: Object,
      value: {
        currentStreak: 0,
        totalDays: 0,
        longestStreak: 0
      }
    },
    newAchievements: {
      type: Array,
      value: []
    }
  },

  data: {
    currentIndex: 0
  },

  methods: {
    preventTouchMove() {
      // 阻止背景滚动
    },

    onClose() {
      this.triggerEvent('close');
    },

    onShare() {
      this.triggerEvent('share', { quote: this.data.quote });
    },

    onPoster() {
      this.triggerEvent('poster', { quote: this.data.quote });
    },

    // 切换语录
    switchQuote(direction) {
      const { quotes, currentIndex } = this.data;
      if (quotes.length <= 1) return;

      let newIndex = currentIndex;
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % quotes.length;
      } else {
        newIndex = (currentIndex - 1 + quotes.length) % quotes.length;
      }

      this.setData({
        currentIndex: newIndex,
        quote: quotes[newIndex]
      });
    }
  }
});
