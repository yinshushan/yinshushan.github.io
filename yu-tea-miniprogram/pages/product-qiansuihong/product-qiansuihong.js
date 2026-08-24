const product = {
  name: "千岁红千年野生古树晒红",
  note: "陈甜深邃，余韵悠长",
  size: "100g / 罐",
  price: 698,
  image: "/assets/images/products/red-tin.png",
  subcategory: "野生晒红"
};

Page({
  data: {
    favorite: false,
    cartCount: 0,
    feedbackVisible: false
  },
  onShow() {
    const favorites = wx.getStorageSync("yuTeaFavorites") || [];
    const cartItems = wx.getStorageSync("yuTeaCartItems") || [];
    this.setData({
      favorite: favorites.some((item) => item.name === product.name),
      cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  },
  onUnload() {
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
  },
  goBack() {
    wx.navigateBack();
  },
  toggleFavorite() {
    const favorites = wx.getStorageSync("yuTeaFavorites") || [];
    const favorite = !favorites.some((item) => item.name === product.name);
    const nextFavorites = favorite
      ? [...favorites, product]
      : favorites.filter((item) => item.name !== product.name);
    wx.setStorageSync("yuTeaFavorites", nextFavorites);
    this.setData({ favorite });
    wx.showToast({ title: favorite ? "已收藏" : "已取消收藏", icon: "none" });
  },
  addToCart() {
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
      title: "千岁红｜千年野生古树红茶",
      path: "/pages/product-qiansuihong/product-qiansuihong"
    };
  }
});
