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
- 三个筛选维度（Day 3 拍板，Day 4 微调为「搜索+二次筛选」）：标签完全自定义（不预设字典）；F3 由「仅搜索」升级为「搜索 + 二次筛选」
- 顶层分区（**Day 4 终版，从 Day 3「视频 / 贴图」翻转**）：按 **Unity / UE / 贴图** 三大素材来源作为顶层入口；Unity、UE 分区只放视频类作品（同一视频在收录时只能选一个引擎），贴图分区只放贴图类作品
- 二次筛选（Day 4 拍板）：**游戏名**（预设：原神、鸣潮、绝区零、崩坏：星穹铁道）+ **特效类型**（暂无预设，按需添加）；两筛均可选可不选，叠加在搜索框之上
- 标签体系（Day 4 拍板）：**预设 + 自定义**——预设起点列表 = 游戏：原神、鸣潮、绝区零、崩坏：星穹铁道；引擎/形态：Unity、UE、贴图；特效类型暂无预设，按需添加；自定义标签无需审核直接生效
- **手动收录不必填标签**——只填来源链接 + 来源类型 + 标题即可入库；标签是「想要能筛就填」的进阶操作
- **自定义收藏夹**（Day 3 用户拍板）：用户可为自己建收藏夹、按需命名（如「刀光参考」「鸣潮特效」），把作品收进同一处管理
- 分区入口视觉参考：用户参考魔法盒类横向 tab 导航样式（Unity/UE/AE…），与顶层「Unity/UE/贴图」分区天然契合（2026-09-19 拍板）
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
- **防盗链实测结论**（2026-09-19 实测，影响 Day 7 开发）：
  - B 站图片（i*.hdslb.com）：第三方来源 403，但**无来源（no-referrer）200**，地址稳定 → 视频封面**可外嵌**，站内需加 no-referrer 配置
  - 花瓣图片：地址带 auth_key **短时效签名（当天过期）**，裸地址 403 → **贴图外嵌不可行**，贴图收录必须**把图片文件存进本项目**（右键另存→上传）
  - 花瓣有反爬人机验证墙，AI 抓取过不去，用户浏览器正常
- **付费贴图预览图可用**（2026-09-19 用户实测）：花瓣付费图也能右键另存预览图 → 收录不受「原图是否收费」影响，一律只用免费预览版
- Day 4 已完成：docs/prd.md 终版（F1–F7 + 总体验收标准 9 条）；顶层分区从「视频/贴图」翻转为「Unity/UE/贴图」，新增二次筛选（游戏名+特效类型）与预设标签起点列表；**上线前每分区预收录 10 条真实内容**（验收标准第 8 条，3 分区合计 30 条）
- Day 5 已完成：docs/TECH_DESIGN.md——技术路线：**纯 HTML/CSS/JS（零依赖）+ data/works.json + localStorage + GitHub Pages**；收录用本地工具页 admin.html；页面规划 index/unity/ue/texture/detail/admin.html；no-referrer 用 meta 标签；本地开发 python -m http.server（fetch 需 http，不能 file://）；localStorage 键名 vfx-likes / vfx-favs / vfx-collections
- Day 6 已完成：AGENTS.md 末尾新增「八、我的个人规则」三条——**A 贴图命名存放**（images/ + {id}.{ext} 严格对应，防孤儿记录）、**B http://localhost 验证**（禁 file:// 双击，防 fetch 假成功）、**C 中文优先**（UI/文档/对话中文，技术名词保留英文）；原有 7 节基线规则一字未动
