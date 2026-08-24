Page({
  showFeature(event) {
    wx.showToast({ title: event.currentTarget.dataset.name, icon: "none" });
  }
});
