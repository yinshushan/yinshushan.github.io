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

final result: passed
