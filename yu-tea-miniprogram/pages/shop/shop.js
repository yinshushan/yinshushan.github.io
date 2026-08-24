const categories = [
  {
    name: "白茶", note: "清甜柔润 · 久藏生香", subcategories: ["全部", "老树白茶", "有机白茶"],
    products: [
      { name: "2017 老树森林古树白茶", note: "陈香温润，山野甜感", size: "357g / 饼", price: 680, image: "/assets/images/products/white-wrapped.png", subcategory: "老树白茶", tag: "珍藏" },
      { name: "大雪山古树白茶龙珠", note: "一粒一泡，清甜便携", size: "200g / 罐", price: 260, image: "/assets/images/products/white-loose.png", subcategory: "老树白茶" },
      { name: "月上枝欧盟有机白茶", note: "欧标茶园，毫香清鲜", size: "50g / 罐", price: 198, image: "/assets/images/products/white-wrapped.png", subcategory: "有机白茶", tag: "欧标" }
    ]
  },
  {
    name: "普洱生茶", note: "山野兰香 · 回甘生津", subcategories: ["全部", "古树生茶", "名山茶"],
    products: [
      { name: "2023 大雪山高杆古树生茶", note: "高香清劲，甜润耐泡", size: "200g / 饼", price: 198, image: "/assets/images/products/raw-cake.png", subcategory: "古树生茶", tag: "春茶" },
      { name: "2021 梅子箐普洱生茶", note: "梅香清雅，回甘鲜明", size: "357g / 饼", price: 680, image: "/assets/images/products/raw-wrapped.png", subcategory: "名山茶" },
      { name: "2023 忙肺正山古树生茶", note: "香高味厚，山韵清晰", size: "200g / 饼", price: 680, image: "/assets/images/products/raw-cake.png", subcategory: "古树生茶" }
    ]
  },
  {
    name: "普洱熟茶", note: "醇厚温润 · 枣香木香", subcategories: ["全部", "古树熟茶", "欧标小罐"],
    products: [
      { name: "2020 欧标熟茶", note: "干净甜醇，日常顺饮", size: "357g / 饼", price: 298, image: "/assets/images/products/ripe-cake.png", subcategory: "古树熟茶", tag: "欧标" },
      { name: "2012 大雪山熟茶", note: "陈香沉稳，汤质顺滑", size: "357g / 饼", price: 598, image: "/assets/images/products/ripe-cake.png", subcategory: "古树熟茶" },
      { name: "欧标小爱心熟茶", note: "便携小沱，一粒一泡", size: "100g / 罐", price: 128, image: "/assets/images/products/ripe-tin.png", subcategory: "欧标小罐" }
    ]
  },
  {
    name: "红茶", note: "蜜甜花香 · 温暖醇柔", subcategories: ["全部", "古树烤红", "野生晒红"],
    products: [
      { name: "枕涵香欧盟有机老树红茶", note: "蜜香清甜，柔润鲜活", size: "100g / 罐", price: 168, image: "/assets/images/products/red-tin.png", subcategory: "古树烤红", tag: "欧标" },
      { name: "东方骑百年古树烤红", note: "焦糖甜香，醇厚温暖", size: "100g / 罐", price: 158, image: "/assets/images/products/red-jar.png", subcategory: "古树烤红" },
      { name: "荒野红百年古树晒红", note: "日晒果香，山野气息", size: "100g / 罐", price: 198, image: "/assets/images/products/red-jar.png", subcategory: "野生晒红", tag: "人气" },
      { name: "千岁红千年野生古树晒红", note: "陈甜深邃，余韵悠长", size: "100g / 罐", price: 698, image: "/assets/images/products/red-tin.png", subcategory: "野生晒红" }
    ]
  },
  {
    name: "花茶", note: "鲜花窨制 · 香入茶骨", subcategories: ["全部", "茉莉花茶", "桂花玫瑰"],
    products: [
      { name: "欧标茉莉红螺", note: "花香清透，甜润耐泡", size: "100g / 罐", price: 298, image: "/assets/images/products/jasmine-tin.png", subcategory: "茉莉花茶", tag: "窨制" },
      { name: "欧标茉莉银针", note: "银针细嫩，香气轻盈", size: "50g / 罐", price: 228, image: "/assets/images/products/jasmine-tin.png", subcategory: "茉莉花茶" },
      { name: "墨红玫瑰红茶", note: "玫瑰馥郁，汤感柔和", size: "100g / 罐", price: 260, image: "/assets/images/products/rose-jar.png", subcategory: "桂花玫瑰" }
    ]
  },
  {
    name: "绿茶", note: "鲜爽清雅 · 春日嫩香", subcategories: ["全部", "高山绿茶", "春尖"],
    products: [
      { name: "山岚欧标黄芽绿茶", note: "嫩香鲜爽，清甜明亮", size: "50g / 罐", price: 168, image: "/assets/images/products/green-tin.png", subcategory: "高山绿茶", tag: "春茶" },
      { name: "无量山春尖", note: "芽尖细嫩，栗香清鲜", size: "100g / 罐", price: 198, image: "/assets/images/products/green-jar.png", subcategory: "春尖" },
      { name: "景迈云雾绿茶", note: "兰香轻柔，入口鲜甜", size: "50g / 罐", price: 188, image: "/assets/images/products/green-tin.png", subcategory: "高山绿茶" }
    ]
  },
  {
    name: "茶膏", note: "一颗一泡 · 随身茶席", subcategories: ["全部", "普洱茶膏", "花香茶膏"],
    products: [
      { name: "普洱熟茶膏", note: "醇厚便携，冷热皆宜", size: "50g / 袋", price: 260, image: "/assets/images/products/paste-box.png", subcategory: "普洱茶膏", tag: "纯茶" },
      { name: "茉莉普洱熟茶膏", note: "茉莉清香，温润顺口", size: "25g / 袋", price: 198, image: "/assets/images/products/paste-jar.png", subcategory: "花香茶膏" },
      { name: "陈皮普洱熟茶膏", note: "陈皮清润，熟茶醇甜", size: "50g / 袋", price: 268, image: "/assets/images/products/paste-box.png", subcategory: "普洱茶膏" }
    ]
  },
  {
    name: "礼盒", note: "多味组合 · 体面茶礼", subcategories: ["全部", "九宫格", "二十宫格"],
    products: [
      { name: "6 泡茉莉红礼盒", note: "轻巧茶礼，六席花香", size: "6g × 6 / 盒", price: 188, image: "/assets/images/products/paste-box.png", subcategory: "九宫格" },
      { name: "欧标有机白茶九宫格套装", note: "九种风味，一盒尝鲜", size: "6g × 9 / 盒", price: 266, image: "/assets/images/products/gift-nine.png", subcategory: "九宫格", tag: "茶礼" },
      { name: "欧标有机白茶二十宫格套装", note: "一盒二十席，分享更从容", size: "6g × 20 / 盒", price: 400, image: "/assets/images/products/gift-twenty.png", subcategory: "二十宫格" }
    ]
  }
];

Page({
  data: {
    categories,
    activeCategoryIndex: 0,
    activeCategory: categories[0].name,
    activeNote: categories[0].note,
    visibleProducts: categories[0].products,
    cartItems: [],
    cartCount: 0,
    cartTotal: 0,
    cartOpen: false
  },
  onShow() {
    const cartItems = wx.getStorageSync("yuTeaCartItems") || [];
    this.updateCart(cartItems);
  },
  selectCategory(event) {
    const index = Number(event.currentTarget.dataset.index);
    const group = categories[index];
    this.setData({
      activeCategoryIndex: index,
      activeCategory: group.name,
      activeNote: group.note,
      visibleProducts: group.products
    });
  },
  addProduct(event) {
    const product = this.data.visibleProducts[Number(event.currentTarget.dataset.index)];
    const existing = this.data.cartItems.find((item) => item.name === product.name);
    const cartItems = existing
      ? this.data.cartItems.map((item) => item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item)
      : [...this.data.cartItems, { ...product, quantity: 1 }];
    this.updateCart(cartItems);
    wx.showToast({ title: "已加入购物车", icon: "none" });
  },
  openProduct(event) {
    const product = this.data.visibleProducts[Number(event.currentTarget.dataset.index)];
    if (product && product.name === "千岁红千年野生古树晒红") {
      wx.navigateTo({ url: "/pages/product-qiansuihong/product-qiansuihong" });
      return;
    }
    if (product) {
      wx.navigateTo({ url: `/pages/product/product?data=${encodeURIComponent(JSON.stringify(product))}` });
    }
  },
  viewCart() {
    if (!this.data.cartCount) {
      wx.showToast({ title: "购物车还是空的", icon: "none" });
      return;
    }
    this.setData({ cartOpen: true });
  },
  closeCart() {
    this.setData({ cartOpen: false });
  },
  stopPropagation() {},
  changeCartQuantity(event) {
    const name = event.currentTarget.dataset.name;
    const delta = Number(event.currentTarget.dataset.delta);
    const cartItems = this.data.cartItems
      .map((item) => item.name === name ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0);
    this.updateCart(cartItems);
  },
  removeCartItem(event) {
    const name = event.currentTarget.dataset.name;
    this.updateCart(this.data.cartItems.filter((item) => item.name !== name));
  },
  updateCart(cartItems) {
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    wx.setStorageSync("yuTeaCartItems", cartItems);
    this.setData({ cartItems, cartCount, cartTotal, cartOpen: cartCount ? this.data.cartOpen : false });
  },
  checkout() {
    if (!this.data.cartCount) {
      wx.showToast({ title: "请先选购茶品", icon: "none" });
      return;
    }
    this.setData({ cartOpen: false });
    wx.navigateTo({ url: "/pages/checkout/checkout" });
  },
  showFeature(event) {
    wx.showToast({ title: event.currentTarget.dataset.name, icon: "none" });
  }
});
