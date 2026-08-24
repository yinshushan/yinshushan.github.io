Page({
  data: {},
  goBack() {
    wx.navigateBack();
  },
  addToCart() {
    wx.showToast({ title: "已加入茶席", icon: "none" });
  },
  onShareAppMessage() {
    return {
      title: "千岁红｜千年野生古树红茶",
      path: "/pages/product-qiansuihong/product-qiansuihong"
    };
  }
});
