# 项目长期记忆

## 项目性质
21 天 vibe coding 学习项目（第一周 Day 1 于 2026-09-15 开始）。用户零基础，以学习为目的，不是纯交付。

## 协作规则（最高优先级）
- 每天用户发「今日任务清单」，清单即当日唯一任务范围，不做清单外工作
- 一次只做一个板块，做完停下等「进入下一板块」指令
- 人机分工：账号注册/截图等人工操作只给指引；生成内容等用户明确说了再做
- 验证必须用户亲眼可确认；commit 格式 `Day X｜一句话说明`，一天全部完成并核对后才提交
- 详见 D:\VibeCoding\AGENTS.md

## 环境
- Git 2.55.0.windows.3、Node.js v22.22.2 已装，GitHub 账号已登录
- 工作区：D:\VibeCoding
- GitHub 仓库：https://github.com/XingHo-VibeCoding/VFXEffectHub（Public）
- 网络：Git 推送到 GitHub 需经 Clash 本地代理 7897，凭据通过 Git Credential Manager 弹窗授权

## 项目
- 当前方向：游戏特效**素材参考收集**网站（VFXEffectHub）
- 项目定位：**参考为主**——找参考、看受启发、自己回去画贴图，不是下载即用
- 目标用户：游戏特效制作者
- 三个筛选维度（Day 3 用户拍板）：**标签完全自定义，不预设字典**；用户给任意作品打任意标签（写「刀光」「鸣潮」「UE」都可以）；搜索 = 在搜索框输入任意标签关键词
- 顶层分区（Day 3 用户拍板）：按**素材形态分「视频参考区 / 贴图参考区」**，用户进站二选一
- **手动收录不必填标签**——只填来源链接即可入库；标签是「想要能筛就填」的进阶操作（Day 3 用户拍板）
- **自定义收藏夹**（Day 3 用户拍板）：用户可为自己建收藏夹、按需命名（如「刀光参考」「鸣潮特效」），把作品收进同一处管理
- 三家产品都没做的两个机会点：自定义标签 + 自定义收藏夹
- **手动收录的官方内容来源**（Day 3 用户提供，Day 7 起 MVP 收录时用）——米哈游四游戏官方 Wiki 人物图鉴：
  - 星穹铁道：https://bbs.mihoyo.com/sr/wiki/channel/map/17/18?bbs_presentation_style=no_header
  - 原神：https://baike.mihoyo.com/ys/obc/channel/map/189/25?bbs_presentation_style=no_header&visit_device=pc
  - 崩坏三：https://baike.mihoyo.com/bh3/wiki/channel/map/17/47?bbs_presentation_style=no_header
  - 绝区零（ZZZ）：https://baike.mihoyo.com/zzz/wiki/channel/map/2/43
  - 结构：首页为角色列表（原神 120+ 人），详情页有人物信息/技能说明；AI 抓取只能拿文字与数值表，动态内容（视频/动图）抓不到，以用户浏览器所见为准
- 主要研究产品：魔法盒（直接对标）+ B 站（视频范式）+ 花瓣网（特效师去那找参考）
- 强制排除：**付费 / 商业化**（用户明确「不用考虑」，删干净）
- 工作链路认知（用户视角）：找参考 → 画贴图 → 引擎实现……，本项目**只覆盖「找参考」一段**
- 技术准备：HTML 占位页、Git 仓库、.gitignore 已就位；Day 7 进入 MVP 功能开发
- Day 4 待做：PRD（以 docs/research.md 为输入）
