Page({
  data: {
    member: false,
    points: 0,
    couponCount: 0,
    menuItems: ["我的拼团", "我的收藏", "产品溯源记录", "跨境物流", "会员权益说明"]
  },
  onShow() {
    const member = wx.getStorageSync("yuTeaMember");
    this.setData({
      member: Boolean(member),
      points: member ? member.points : 0,
      couponCount: member ? member.couponCount : 0
    });
  },
  showFeature(event) {
    wx.showToast({ title: event.currentTarget.dataset.name, icon: "none" });
  }
});
