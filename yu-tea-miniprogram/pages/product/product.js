Page({
  data: {
    product: {},
    favorite: false,
    cartCount: 0,
    feedbackVisible: false
  },
  onLoad(options) {
    try {
      const product = JSON.parse(decodeURIComponent(options.data || ""));
      this.setData({ product }, () => this.refreshState());
    } catch (error) {
      wx.showToast({ title: "商品信息加载失败", icon: "none" });
    }
  },
  onShow() {
    if (this.data.product.name) this.refreshState();
  },
  onUnload() {
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
  },
  refreshState() {
    const favorites = wx.getStorageSync("yuTeaFavorites") || [];
    const cartItems = wx.getStorageSync("yuTeaCartItems") || [];
    this.setData({
      favorite: favorites.some((item) => item.name === this.data.product.name),
      cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  },
  goBack() {
    wx.navigateBack();
  },
  switchTab(event) {
    wx.switchTab({ url: event.currentTarget.dataset.url });
  },
  toggleFavorite() {
    const product = this.data.product;
    const favorites = wx.getStorageSync("yuTeaFavorites") || [];
    const favorite = !favorites.some((item) => item.name === product.name);
    const nextFavorites = favorite
      ? [...favorites, product]
      : favorites.filter((item) => item.name !== product.name);
    wx.setStorageSync("yuTeaFavorites", nextFavorites);
    this.setData({ favorite });
  },
  addToCart() {
    const product = this.data.product;
    const cartItems = wx.getStorageSync("yuTeaCartItems") || [];
    const existing = cartItems.find((item) => item.name === product.name);
    const nextItems = existing
      ? cartItems.map((item) => item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cartItems, { ...product, quantity: 1 }];
    const cartCount = nextItems.reduce((sum, item) => sum + item.quantity, 0);
    wx.setStorageSync("yuTeaCartItems", nextItems);
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    this.setData({ feedbackVisible: false }, () => {
      this.setData({ cartCount, feedbackVisible: true });
      this.feedbackTimer = setTimeout(() => this.setData({ feedbackVisible: false }), 1800);
    });
  },
  onShareAppMessage() {
    return {
      title: `${this.data.product.name}｜予茶选品`,
      path: `/pages/product/product?data=${encodeURIComponent(JSON.stringify(this.data.product))}`
    };
  }
});
