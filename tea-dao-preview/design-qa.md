# Design QA

**Comparison target**

- Left-menu source: `/Users/shushan/Downloads/IMG_9049.PNG` (1320 x 2868).
- Floating-cart and bottom-navigation source: `/Users/shushan/Downloads/IMG_9050.PNG` (1320 x 2868).
- Tea classification and product-copy source: `/var/folders/rn/4nfy1g555plf4lcgmd4zwg280000gn/T/codex-clipboard-9ddc8af5-a7d8-4850-8690-cc448179cd7e.jpg` (736 x 1451).
- Browser-rendered implementation: `/Users/shushan/Downloads/codex仓库/予/tea-dao-preview/qa/implementation-shop-primary-only.png` (393 x 852).
- Combined comparison evidence: `/Users/shushan/Downloads/codex仓库/予/tea-dao-preview/qa/shop-side-by-side-primary-only.png`.
- State: iPhone, 393 x 852 CSS pixels, device scale factor 1, `选茶` active, `白茶` selected, empty cart.
- Homepage scoped-annotation source: `/Users/shushan/Downloads/codex仓库/予/tea-dao-preview/qa/implementation-home-annotation.png` (393 x 852), together with the user annotations to remove `云南 · 景迈山` / `2026 春茶` and replace the `茶会` icon.
- Homepage post-fix implementation: `/Users/shushan/Downloads/codex仓库/予/tea-dao-preview/qa/implementation-home-meta-removed.png` (393 x 852).
- Homepage combined comparison evidence: `/Users/shushan/Downloads/codex仓库/予/tea-dao-preview/qa/home-meta-icon-side-by-side.png` (786 x 852).
- Homepage state: iPhone, 393 x 852 CSS pixels, device scale factor 1, `首页` active, page at scroll origin.
- Cart-sheet source: the two `browser:Selected browser region` annotation captures supplied in the current turn, showing the populated floating-cart target and the requested phone-scoped bottom-drawer form.
- Cart-sheet implementation evidence: `/Users/shushan/Downloads/codex仓库/予/tea-dao-preview/qa/implementation-cart-sheet-stage.png`, with two selected white-tea products and a ¥940 total.
- Cart annotation source: the four `browser:Selected browser region` captures supplied in the current turn, showing the clipped right quantity control, undersized remove glyph, obscured total, and left-flush product rows.
- Cart annotation post-fix implementation: `/Users/shushan/Downloads/codex仓库/予/tea-dao-preview/qa/implementation-cart-sheet-spacing-pass.png` (465 x 762 browser capture; iPhone cart sheet open with two products and ¥458 total).
- Cart-control cascade post-fix implementation: `/Users/shushan/Downloads/codex仓库/予/tea-dao-preview/qa/implementation-cart-controls-pass.png` (465 x 762 browser capture; same two-product/¥458 state).

**Full-view comparison evidence**

- The implementation follows the first source's dense catalog structure: fixed left category rail, product imagery, two-line product copy, price, and a circular add control.
- The left rail now contains only the requested first-level tea categories; no `全部` or secondary entries appear.
- The implementation follows the third source's persistent commerce layers: a rounded floating cart sits directly above an unchanged four-item tab bar.
- The implementation keeps the existing Yu Tea forest, paper, moss, and clay tokens instead of copying another brand's green or gold palette.

**Focused region comparison evidence**

- Menu region: `白茶` is visibly active and is followed directly by the remaining first-level categories from the supplied classification table: `普洱生茶 / 普洱熟茶 / 红茶 / 花茶 / 绿茶 / 茶膏 / 礼盒`. Browser inspection confirms there is no `全部` button and no secondary-menu container.
- Product region: every visible row uses a real 313 x 313 raster product photograph, compact description, net weight, price, and Radix add icon.
- Bottom region: the floating cart exposes cart icon, count/total state, selected-item copy, and checkout action while the persistent bottom navigation remains `首页 / 选茶 / 茶会 / 我的`.
- Home annotation region: the gateway gradient now reaches the hero's bottom edge. Browser measurement reports `quickTop - gatewayBottom = 0`, eliminating the exposed 77-pixel image strip.
- Latest home annotation region: the before/after comparison visibly confirms both mountain metadata labels are absent in the revised capture and the third tab now uses the Radix `ChatBubbleIcon` instead of the prior video icon.
- Cart-sheet region: tapping the populated floating cart now replaces the generic demo notice with real selected-product rows. Each row shows the catalog image, name, weight, unit price, Radix remove control, and Radix minus/plus quantity controls; the footer shows the derived item count, total, and checkout action.
- Latest cart annotation region: the product list now has explicit 28-pixel left and 22-pixel right insets. Both quantity controls sit fully inside the sheet edge, the remove action uses a 32-pixel neutral circular target with a 19-pixel Radix glyph, and the total/checkout footer has its own top divider plus bottom safe spacing.
- Latest control cascade region: cart controls explicitly override the generic sheet button minimum height, padding, radius, background, and 100%-width rules. The stepper is a fixed 92 x 30 pixel capsule with three dedicated tracks; the remove action is a fixed 36 x 36 pixel circle.

**Required fidelity surfaces**

- Fonts and typography: passed. Compact sans-serif catalog copy and Songti-style section titles reproduce the references' retail density while retaining the established Yu Tea brand hierarchy.
- Spacing and layout rhythm: passed. The 100-pixel rail, 293-pixel product column, 136-pixel product rows, 66-pixel floating cart, and 77-pixel persistent tab bar remain readable at the normalized viewport.
- Colors and visual tokens: passed. The reference structure is preserved with Yu Tea's forest green, ivory paper, moss, and clay accent tokens; active and disabled states have adequate contrast.
- Image quality and asset fidelity: passed. Sixteen original tea packshots were generated as high-resolution raster assets, cropped to 313 x 313, visually inspected, and loaded successfully in the browser. No placeholder boxes, emoji, handcrafted SVG, or CSS-drawn product art is used.
- Copy and content: passed. First-level categories and representative product names, weights, and prices come from the supplied classification table; commerce labels and bottom navigation use the user's own product language.
- Latest homepage copy/icon scope: passed. All non-targeted hero copy, image crop, gateway layout, and four navigation labels remain unchanged; only the two requested metadata strings were removed and the `茶会` glyph changed.
- Cart-sheet content and hierarchy: passed. The requested bottom-drawer form is retained while the former `演示交互已连接` placeholder copy is absent. The populated drawer has one clear title, one concise description, scrollable product rows, and one checkout footer.
- Latest cart spacing and control visibility: passed. The annotated rows no longer touch the left screen curve, the right controls are not clipped, and the total remains readable above the iOS home indicator.

**Interaction checks**

- First-level category selection updates the complete product group; selecting `普洱生茶` shows `2023 大雪山高杆古树生茶`.
- Secondary category controls are absent as requested.
- Product add control updates the floating cart count and total; the tested white-tea item produced `1 / ¥198 / 已选 1 件茶品`.
- All 4 visible product images completed loading with natural width 313.
- Persistent navigation labels remain `首页 / 选茶 / 茶会 / 我的`.
- Browser console errors and warnings: none.
- Latest homepage DOM inspection reports neither removed metadata string and confirms the third tab renders the Radix conversation-bubble path; browser errors and warnings remain empty.
- Cart interaction inspection passed: adding two products produced `购物车 · 2 件茶品` and `¥940`; increasing the first item produced `2 / ¥1360`, decreasing it restored `1 / ¥680`, and removal produced the explicit empty-cart state.
- The populated floating-cart summary is hidden while its drawer is open, preventing a duplicated total/checkout layer behind the cart contents.
- Current cart-flow browser console errors and warnings: none.
- Post-annotation quantity interaction passed: increasing `月上枝欧盟有机白茶` changed the cart to `3 件 / ¥656`; decreasing it restored `2 件 / ¥458`. Browser console errors and warnings remained empty.

**Validation**

- Protected mobile runtime integrity: 28/28 files passed.
- Production build: passed.
- Sites worker tests: 4/4 passed.
- Native mini-program JavaScript syntax, JSON parsing, WXML basic tag checks, and 16 product-image presence check: passed.
- Real WeChat Developer Tools and device validation remain pending.

**Comparison history**

- Pass 1 [P2]: the homepage gateway ended 77 pixels above the hero, exposing a disconnected tea-image strip during scrolling.
- Fix: extended the gateway gradient to the hero bottom and moved its content padding above the persistent tab bar.
- Pass 2 evidence: `gatewayBottom`, `heroBottom`, and `quickTop` align, with a measured gap of 0.
- Shop pass 1: no actionable P0, P1, or P2 visual mismatch remains for the requested menu, product-list, cart, and bottom-navigation structure.
- Shop pass 2 [P2]: annotation feedback identified the expanded `全部 / 老树白茶 / 有机白茶` level as unwanted.
- Fix: removed secondary-category state, controls, styles, and native mini-program handlers; retained only eight first-level categories.
- Pass 2 evidence: `qa/implementation-shop-primary-only.png` shows a clean one-level rail, and browser inspection reports zero secondary-menu containers and zero `全部` buttons.
- Home annotation pass 3 [P2]: the user identified two unwanted mountain metadata labels and requested a more suitable `茶会` icon.
- Fix: removed both metadata elements and their unused styles in browser/native implementations; replaced the video glyph with the Radix conversation-bubble icon and regenerated native inactive/active PNG tab assets from the same library icon.
- Pass 3 evidence: `qa/home-meta-icon-side-by-side.png` shows the exact before/after state at equal 393 x 852 scale. The required fidelity surfaces remain stable: typography, spacing, color, full-bleed tea-mountain image quality, gateway copy, and navigation labels are unchanged. No actionable P0, P1, or P2 mismatch remains.
- Cart pass 4 [P1]: the floating-cart target previously opened a generic demonstration message instead of a view of the selected products.
- Fix: connected the summary to real cart-line state and added the requested phone-scoped drawer with item imagery, quantity adjustment, deletion, derived total, and checkout. Mirrored the same interaction and generated Radix-derived PNG control assets for the native WeChat mini-program.
- Pass 4 evidence: browser DOM confirms the real product rows and the absence of the former demo copy; plus, minus, and delete checks all update count and total correctly. The drawer capture is stored at `qa/implementation-cart-sheet-stage.png`. No actionable P0, P1, or P2 mismatch remains for this cart interaction.
- Cart pass 5 [P1]: user annotations showed that the right quantity stepper was clipped, the remove icon was too small, the total was partially obscured, and the product block sat too close to the left rounded edge.
- Fix: restored cart-specific sheet padding after the generic sheet override, reduced the action column width, moved controls inward, enlarged the Radix trash control, added a separated footer with bottom safe spacing, and mirrored equivalent padding/icon changes in the native mini-program drawer.
- Pass 5 evidence: `qa/implementation-cart-sheet-spacing-pass.png` shows the same two-product/¥458 state with both steppers fully visible, enlarged remove controls, readable footer, and evenly inset product rows. Plus/minus interaction and browser log checks passed. No actionable P0, P1, or P2 mismatch remains.
- Cart pass 6 [P1]: follow-up annotations showed that the generic `.sheet-content button` rules still forced the inner stepper buttons to 100% width and retained a 38-pixel minimum height; the remove action inherited the same minimum height, turning its nominal circle into an ellipse.
- Fix: added cart-scoped final cascade overrides for explicit width, height, minimum dimensions, padding, radius, background, and box sizing; widened the action track to 92 pixels. Mirrored fixed square/capsule dimensions in native WXSS.
- Pass 6 evidence: `qa/implementation-cart-controls-pass.png` shows both stepper capsules and all `− / 1 / +` content fully visible, with two true circular remove controls. Quantity increase/decrease restored `3 件 / ¥656` and `2 件 / ¥458`; browser logs remained empty. No actionable P0, P1, or P2 mismatch remains.

**Follow-up polish**

- [P3] Product photos are original catalog mockups without production packaging labels; final brand packaging photography can replace them later without changing the layout.

## 千岁红详情页追加验收

**视觉真值与状态**

- 用户选定源图：`/var/folders/rn/4nfy1g555plf4lcgmd4zwg280000gn/T/codex-clipboard-4690eb09-7ff6-4478-af8d-33e2f63c2ea3.png`，853 x 1844 像素。
- 等尺寸首屏真值：`qa/qiansuihong-reference-screen.jpg`，273 x 591 像素。
- 浏览器实现首屏：`qa/qiansuihong-implementation-final.jpg`，273 x 591 像素。
- 同屏对照证据：`qa/qiansuihong-side-by-side-final.jpg`；公开对照页为 `public/qa/qiansuihong-comparison.html`。
- 运行状态：iPhone 容器，393 x 852 CSS 像素；Codex 浏览器面板按 0.694 倍显示为约 273 x 591 像素；`选茶 → 红茶 → 千岁红`，详情页位于滚动起点，购买栏固定，无弹层。

**全屏与重点区域对照**

- 首屏复现了源图的暗色千年森林、大比例朱红茶罐、左对齐中英文标题、引语、弧形纸面过渡、四项产地信息、干茶香气画面和固定购买栏。
- 信息层级、深森林绿、朱红罐体和暖象牙纸面的关系与源图一致；手机系统栏及浏览器模板中的自定义光标属于受保护运行时，不计入产品内容差异。
- 购买栏完整显示 `100g / 罐`、`¥698`、茶篮入口和 `加入茶席`；浏览器测量确认购买栏四边均位于设备屏幕内。
- 源图首屏以下没有完整长页参考；实现按已提取的公众号原文继续组织产地、树种、滋味、古树特征和叶底内容，并使用已核对的真实文章照片，不臆造产品事实。

**交互、资源与可用性**

- 点击红茶分类中的 `千岁红千年野生古树晒红` 可进入详情；返回后购物车状态保留。
- `加入茶席` 已连接现有购物车；验证结果为 1 件、合计 ¥698，购物车抽屉能显示千岁红商品。
- 详情长页滚动容器为 852 像素可视高度、2889 像素内容高度，能够滚动查看全部文章内容。
- 详情页 7 张运行时图片均完成加载，破图数为 0；Vite 错误覆盖层不存在。
- 浏览器日志仅含 Vite 连接、热更新和 React 开发提示；错误与警告均为 0。
- 原生微信小程序已新增独立详情页及红茶入口；JavaScript 语法和 JSON 解析通过。微信开发者工具与真机运行仍待后续验证，不将源码检查表述为微信运行验证。

**比较历史**

- 千岁红 Pass 1 [P2]：首版茶罐主体偏小，香气区只有干茶图，和源图的罐体重量感、白瓷盘构图不一致。
- 修复：重新生成并换入更大比例朱红茶罐的森林主图，同时生成透明背景白瓷盘干茶资产。
- 千岁红 Pass 2：同尺寸并排对照确认首屏结构、图像主体、色彩、文字层级、弧形转场和底部购买栏均无剩余 P0、P1、P2 问题。

## 千岁红收藏与加入反馈追加验收

**标注范围与实现证据**

- 用户标注范围仅包含详情页固定购买栏的 `收藏` 与 `加入茶席` 两项交互；其余千岁红长页、首屏图像、事实区与导航结构均保持不变。
- 加入反馈实现证据：`qa/qiansui-favorite-cart-feedback.png`（465 x 762 浏览器视口，详情页首屏，已收藏，加入成功提示与 `1件` 持久计数同时可见）。
- 收藏展示实现证据：`qa/me-favorites-qiansui.png`（465 x 762 浏览器视口，`我的 → 我的收藏` 展开，显示千岁红图片、名称、规格与价格）。

**视觉与交互检查**

- 原茶篮图标已替换为明确的 `收藏 / 已收藏` 文字状态；收藏态使用既有陶土色，不引入新的视觉语言。
- 点击 `加入茶席` 后，深森林绿提示条以短促上浮动画出现，文案为 `已加入茶席 · 共 N 件茶品`；主按钮同时保留 `N件`，提示消失后顾客仍能知道累计数量。
- 连续两次加入的状态检查依次得到 `共 1 件茶品 / 加入茶席 · 1件` 与 `共 2 件茶品 / 加入茶席 · 2件`。
- 收藏状态使用本地持久化；刷新页面并进入 `我的` 后，`我的收藏` 仍显示 `千岁红千年野生古树晒红 / 100g / 罐 / ¥698`。
- 465 x 762 同尺寸触控检查确认详情页从滚动起点打开，购买栏、收藏态、加入反馈和件数均位于设备屏幕内；`我的收藏` 商品卡不与底部导航重叠。
- 浏览器控制台错误与警告均为 0。

**验证边界**

- 浏览器生产构建、受保护运行时 28/28、Sites worker 4/4 均通过。
- 原生微信小程序已同步收藏存储、`我的收藏` 商品展示、跨页面购物车存储、加入动画与累计件数；JavaScript 语法、JSON 与 WXML 基础标签检查通过。
- 微信开发者工具与真机运行仍待后续验证，不将源码检查表述为微信运行验证。

## 全商品详情底栏追加验收

**参考与实现证据**

- 既有购物栏参考：`qa/reference-shop-cart.png`；用户本轮补充的四栏导航参考：`/var/folders/rn/4nfy1g555plf4lcgmd4zwg280000gn/T/codex-clipboard-6a00107b-917b-486a-96f3-b255c8089fbd.png`。
- 浏览器实现全屏：`qa/product-detail-bar-implementation-768x1280.png`，768 x 1103 像素；设备内容为 393 x 852 CSS 像素。
- 底栏同屏对照：`qa/product-detail-bar-side-by-side.png`。左侧为现有选茶购物栏与四栏导航结构，右侧为商品详情中的价格、收藏、加入购物车与原四栏导航。

**视觉与交互检查**

- 所有 8 个一级分类、共 31 件目录商品均能从商品卡进入详情页；循环检查为 31/31，通过且无缺失入口。
- 每个详情页底部固定栏均读取当前商品自己的规格与价格，并提供 `收藏 / 已收藏`、购物车图标、`加入购物车` 与累计件数。
- 固定操作栏位于四栏导航正上方；浏览器实测操作栏完全位于设备屏幕内，与导航垂直间距约 5.6 像素，不遮挡 `首页 / 选茶 / 茶会 / 我的`。
- 千岁红保留专属长图文故事页，其价格、收藏和购物车操作已收敛到同一底栏结构；其他商品使用统一的品牌详情模板。
- 点击收藏可切换并持久保存状态；连续加入购物车时会显示 `已加入购物车 · 共 N 件茶品` 动画提示，底栏在提示消失后仍保留累计件数。
- 视觉对照确认延续现有暖白悬浮栏、深森林绿主操作、圆角胶囊与四栏导航层级；本轮无剩余 P0、P1、P2 视觉问题。

**原生同步与边界**

- 原生微信小程序新增通用商品详情页，全部非千岁红商品通过真实目录数据进入；千岁红继续使用独立详情页。
- 两类原生详情页均增加与浏览器一致的商品操作栏，并在其下方保留 `首页 / 选茶 / 茶会 / 我的` 导航，导航按钮接入 `wx.switchTab`。
- 原生收藏与购物车继续使用既有本地存储键，商品卡、我的收藏和购物车状态保持互通。
- JavaScript、JSON、WXML 基础结构与静态资源检查通过；微信开发者工具及真机显示仍待后续验证，不将静态检查表述为微信运行验证。

## 购物车持久化与结算流程追加验收

**参考、状态与证据**

- 行为真值：用户本轮标注要求购物车在结算完成前跨页面持续存在，并要求 `去结算` 进入完整确认订单页。
- 视觉语言参考：`qa/reference-shop-cart.png`（原始 1320 x 2868 像素，归一化至 393 x 852）；结算实现：`qa/checkout-implementation-screen.png`（392 x 852 像素，设备 CSS 视口 393 x 852，密度 1）。
- 同屏对照：`qa/checkout-style-side-by-side.png`。左侧用于核对参考中的暖白底栏、茶色强调、浅纸面与信息密度；右侧为新结算页。
- 完整舞台证据：`qa/checkout-stage-final.png`；支付成功状态：`qa/checkout-success-stage-final.png`。

**购物车行为验证**

- 加入 `2017 老树森林古树白茶` 后，购物栏显示 `1 / ¥680 / 已选 1 件茶品`。
- 从 `选茶` 切换到 `茶会` 再返回，购物栏仍为 `1 / ¥680`；刷新浏览器后仍为 `1 / ¥680`，证明状态已从页面局部状态提升并写入持久存储。
- 进入结算、切换跨境直邮、返回购物车后，原商品及金额仍存在；只有点击支付并进入订单成功状态后，返回选茶才显示 `¥0 / 请先选购茶品`。
- 浏览器错误与警告日志为 0。

**结算页视觉与交互检查**

- 结算页包含收货信息、境内配送与跨境直邮切换、商品核对、会员券、茶分抵扣、微信支付方式、金额汇总及固定支付栏。
- 境内配送状态为商品 ¥680、优惠 ¥38、包邮、应付 ¥642；切换跨境直邮后配送费 ¥48，应付实时更新为 ¥690。
- 支付成功页延续深森林绿与暖象牙配色，显示订单编号、正确的 ¥642 对应茶分、查看订单和继续选茶入口。
- 字体沿用宋体展示标题与苹方正文；间距、卡片半径、描边、茶色状态和森林绿主操作延续现有小程序，不引入新的视觉体系。
- 商品继续使用目录中的真实产品图；导航、锁、定位、成功状态使用 Radix 图标，未使用表情、CSS 图形或占位图。
- 同屏检查无可执行的 P0、P1、P2 视觉问题；结算页可滚动查看被固定支付栏遮挡前的全部金额明细。

**原生同步与验证边界**

- 原生微信小程序新增 `pages/checkout/checkout`，购物车继续使用 `yuTeaCartItems` 本地存储；切换 Tab 和进入/退出详情不会清空。
- 原生结算页同步配送选择、商品复核、优惠、实付和成功状态；支付示意成功时保存最近订单并清空购物车。
- JavaScript、JSON、WXML 基础结构检查通过；微信开发者工具及真机支付能力仍待后续验证，当前不表述为微信运行或真实支付验证。

## 首页品牌 Logo 替换追加验收

**源图与实现资产**

- 品牌源图：`public/assets/brand/yu-logo-source.jpg`，2550 x 2550 像素；中文 `予` 的原始笔画轮廓为唯一视觉真值。
- 最终白色标记：`public/assets/brand/yu-mark-white.png`，512 x 640 像素，RGBA 透明背景；仅包含源图中文 `予`，不含下方 `YU`。
- 图像检查确认标记为纯白、透明背景、无阴影、无描边，并保留横画、点画、右侧收笔和长竖弧形笔画的源图比例。

**实现与验证状态**

- 网页首页已将宋体字形替换为真实图片资产，宽度 52 CSS 像素；茶山背景、文案、入口与导航未改动。
- 原生微信小程序首页同步使用同一品牌资产，宽度 104rpx；静态源码、JSON、受保护运行时 28/28、生产构建与 Sites worker 4/4 检查通过。
- 本轮 Codex 浏览器对 `http://localhost:4173/` 的截图请求被浏览器 URL 安全策略拒绝，因此没有新的浏览器渲染截图、同视口并排对照或控制台日志证据。未改用其他浏览器或自动化方式绕过该限制。
- 阻塞项：需要用户在已打开的本地预览中刷新后确认 Logo 的实际尺寸与位置，或在后续浏览器策略允许时补采 393 x 852 设备内容截图并完成同屏比较。

final result: blocked
