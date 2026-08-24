Page({
  data: {
    cartItems: [],
    cartCount: 0,
    goodsTotal: 0,
    couponDiscount: 0,
    pointsDiscount: 0,
    deliveryMode: "domestic",
    shippingFee: 0,
    payable: 0,
    paid: false,
    orderNo: ""
  },
  onShow() {
    if (!this.data.paid) this.refreshOrder();
  },
  refreshOrder() {
    const cartItems = wx.getStorageSync("yuTeaCartItems") || [];
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const goodsTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const couponDiscount = goodsTotal >= 199 ? 30 : 0;
    const pointsDiscount = goodsTotal ? 8 : 0;
    const shippingFee = this.data.deliveryMode === "cross" ? 48 : 0;
    const payable = Math.max(0, goodsTotal + shippingFee - couponDiscount - pointsDiscount);
    this.setData({ cartItems, cartCount, goodsTotal, couponDiscount, pointsDiscount, shippingFee, payable });
  },
  selectDelivery(event) {
    this.setData({ deliveryMode: event.currentTarget.dataset.mode }, () => this.refreshOrder());
  },
  goBack() {
    wx.navigateBack();
  },
  pay() {
    if (!this.data.cartCount) {
      wx.showToast({ title: "购物车还是空的", icon: "none" });
      return;
    }
    const orderNo = `YU${Date.now().toString().slice(-12)}`;
    wx.setStorageSync("yuTeaLastOrder", {
      orderNo,
      items: this.data.cartItems,
      amount: this.data.payable,
      createdAt: Date.now()
    });
    wx.setStorageSync("yuTeaCartItems", []);
    this.setData({ paid: true, orderNo });
  },
  continueTea() {
    wx.switchTab({ url: "/pages/shop/shop" });
  },
  viewOrders() {
    wx.switchTab({ url: "/pages/me/me" });
  }
});
