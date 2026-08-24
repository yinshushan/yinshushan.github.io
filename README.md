# 予茶 · 数字化转型的新茶道

这是予茶微信小程序的合作评审版本，包含可交互网页预览、原生微信小程序源码和后端接口原型。

## 在线预览

访问：<https://yinshushan.github.io/>

网页预览适合在手机或电脑浏览器中查看产品流程和视觉设计。目前展示的是业务原型，不连接真实微信支付或生产订单。

## 项目结构

- `tea-dao-preview/`：面向合作伙伴的可交互网页预览，也是 GitHub Pages 的发布来源。
- `yu-tea-miniprogram/`：原生微信小程序源码。
- `yu-tea-backend/`：会员、商品、购物车、订单、营销等接口原型。

## 本地运行网页预览

```bash
cd tea-dao-preview
npm install
npm run dev
```

## 发布方式

推送到 `main` 分支后，GitHub Actions 会执行构建并自动更新 GitHub Pages。

## 验证边界

- 浏览器预览已完成构建、交互和视觉检查。
- 原生小程序源码已完成语法与配置检查。
- 正式微信体验版仍需绑定真实小程序 AppID，并在微信开发者工具和真机中验证。

