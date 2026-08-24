Page({
  data: {
    quickActions: [
      { label: "新人茶礼", note: "满 199 减 30", mark: "礼" },
      { label: "三人成团", note: "古树白茶 7 折", mark: "团" },
      { label: "今日秒杀", note: "20:00 开始", mark: "秒" },
      { label: "茶分兑礼", note: "860 茶分可用", mark: "分" }
    ]
  },

  joinMember() {
    wx.showModal({
      title: "欢迎加入山席会员",
      content: "新会员可领取 30 元茶礼券，并获得 100 茶分。",
      confirmText: "领取茶礼",
      confirmColor: "#183b2d",
      success: ({ confirm }) => {
        if (!confirm) return;
        wx.setStorageSync("yuTeaMember", { level: 1, points: 100, couponCount: 1 });
        wx.showToast({ title: "茶礼已入账", icon: "success" });
      }
    });
  },

  goShop() {
    wx.switchTab({ url: "/pages/shop/shop" });
  },

  goCommunity() {
    wx.switchTab({ url: "/pages/community/community" });
  },

  showFeature(event) {
    wx.showToast({ title: event.currentTarget.dataset.name, icon: "none" });
  },

  onShareAppMessage() {
    return {
      title: "予茶｜一叶连山海，一席聚知己",
      path: "/pages/home/home"
    };
  }
});
