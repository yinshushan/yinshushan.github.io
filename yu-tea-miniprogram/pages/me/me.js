Page({
  data: {
    member: false,
    points: 0,
    couponCount: 0,
    favorites: [],
    menuItems: ["我的拼团", "产品溯源记录", "跨境物流", "会员权益说明"]
  },
  onShow() {
    const member = wx.getStorageSync("yuTeaMember");
    this.setData({
      member: Boolean(member),
      points: member ? member.points : 0,
      couponCount: member ? member.couponCount : 0,
      favorites: wx.getStorageSync("yuTeaFavorites") || []
    });
  },
  openFavorite(event) {
    if (event.currentTarget.dataset.name === "千岁红千年野生古树晒红") {
      wx.navigateTo({ url: "/pages/product-qiansuihong/product-qiansuihong" });
    }
  },
  showFeature(event) {
    wx.showToast({ title: event.currentTarget.dataset.name, icon: "none" });
  }
});
