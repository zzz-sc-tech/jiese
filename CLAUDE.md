# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

"守心"（shouxin）是一款微信小程序，用于自律打卡。用户可创建不同类型的目标（单次打卡、多次计数、时长打卡），每日打卡记录并查看统计数据、成就系统和周报分析。

## 技术栈

- 微信小程序原生框架（WXML + WXSS + JS）
- 无第三方依赖，纯本地存储（wx.setStorageSync）
- 自定义 TabBar 组件
- Canvas 2D 绘制图表（柱状图、饼图、环形进度条）

## 项目结构

```
miniprogram/
├── app.js / app.json / app.wxss   # 入口和全局配置
├── styles/theme.wxss               # CSS 变量定义（颜色、圆角、阴影、间距、字号）
├── utils/
│   ├── api.js                      # 核心业务逻辑层（非 HTTP API，纯本地数据操作）
│   ├── storage.js                  # 本地缓存封装（带过期时间的 key-value）
│   └── date.js                     # 日期工具函数
├── pages/
│   ├── index/                      # 主页：目标列表、打卡操作、昨日总结/周报弹窗
│   ├── history/                    # 历史：日历视图、统计图表、按目标筛选
│   ├── challenge/                  # 挑战：设定天数目标并跟踪进度
│   ├── timer/                      # 计时器：番茄钟 + 学习时钟（duration 类型目标）
│   ├── share/                      # 分享海报生成
│   └── profile/                    # 我的：成就、设置
└── components/
    ├── tab-bar/                    # 自定义底部导航栏
    ├── quote-modal/                # 打卡成功后的语录弹窗
    └── achievement-badge/          # 成就解锁提示
```

## 核心架构

**数据层全部在 `utils/api.js`**：这不是 HTTP API，而是本地业务逻辑层。所有数据读写通过 `utils/storage.js` 的 `wx.setStorageSync` 实现。页面通过 `require('../../utils/api')` 调用，接口返回格式统一为 `{ code: 0, data: ... }`。

**三种目标类型**：
- `single`：单次打卡（每天一次，如早起）
- `count`：多次计数打卡（每天可多次，有目标次数，如三餐）
- `duration`：时长打卡（绑定计时器页面，记录学习时长）

**数据存储 key 命名**：所有 key 以 `jiese_` 前缀命名（如 `jiese_goals`、`jiese_checkins`、`jiese_challenges`）。storage 工具支持带过期时间的缓存。

**成就系统**：基于连续打卡天数（streak）和累计打卡天数（total）两类条件自动解锁，定义在 `api.js` 的 `ACHIEVEMENTS` 数组。

## 开发要点

- 使用**微信开发者工具**打开项目根目录进行开发调试
- `miniprogramRoot` 配置为 `miniprogram/`，源码均在此目录下
- 样式使用 CSS 变量系统（`styles/theme.wxss`），修改主题色只需改 `--color-primary` 等变量
- Canvas 图表需要处理 DPR 适配（`canvas.width = w * dpr`），参考 `pages/history/index.js` 和 `pages/timer/index.js`
- `app.js` 中有数据迁移逻辑（`jiese_migration_v2_done`），新增迁移时参考此模式
- 语录库（约 100 条）硬编码在 `api.js` 的 `QUOTES` 数组中，按类别分组（自律、修身、克己、坚忍、省思、定力、慎独、智慧）
