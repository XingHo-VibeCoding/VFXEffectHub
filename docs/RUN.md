# VFXEffectHub · 本地运行与维护说明

## 启动本地服务器

由于 Windows 的 `python` 命令可能被 Microsoft Store 别名静默拦截，**请使用完整路径**启动 Python 内置服务器。

**⚠️ 必须先切换到项目目录，否则浏览器会列出你的用户根目录**：

```powershell
# 1. 打开 PowerShell

# 2. 切到项目目录（这步不能省，否则根目录不对）
cd D:\VibeCoding

# 3. 用完整路径启动 http.server（不要用 bare `python` 命令）
C:\Users\33935\.workbuddy\binaries\python\versions\3.13.12\python.exe -m http.server 8000
```

成功后会看到类似输出（注意提示符必须是 `D:\VibeCoding>`）：

```
PS D:\VibeCoding> C:\Users\33935\.workbuddy\binaries\python\versions\3.13.12\python.exe -m http.server 8000
Serving HTTP on :: port 8000 (http://[::]:8000/) ...
```

## 访问页面

保持 PowerShell 窗口开启，在浏览器地址栏输入：

- 首页：`http://localhost:8000/`
- Unity 分区：`http://localhost:8000/unity.html`
- UE 分区：`http://localhost:8000/ue.html`
- 贴图分区：`http://localhost:8000/texture.html`
- 收藏夹：`http://localhost:8000/collections.html`
- 收录工具：`http://localhost:8000/admin.html`（仅本地使用，不对外公开）

## 关键规则

- **不要双击 `index.html` 打开**（协议为 `file://`），否则后续 `fetch` 会被浏览器拒绝（CORS 限制）
- **地址栏必须是 `http://localhost:8000/` 开头**，确认无误才算验证有效
- 停止服务器：回到 PowerShell 按 `Ctrl + C`

## 收录新作品（管理员操作）

唯一入口是 `admin.html`。普通访客看不到这个页面（PRD F6 约定）。

### 1. 浏览器打开 admin.html，填表

1. **来源类型**（必填）：Unity / UE（视频类）/ 贴图（图片类）
2. **标题**（必填）
3. **来源链接**（必填）：B 站视频 URL 或花瓣 pin URL 等
4. **视频类**可填封面图链接（可选）；**贴图类**必须填文件名（如 `w20260922-007.webp`）
5. **作者**（可选）
6. **标签**（可选）：勾选预设标签（游戏 4 个 + 引擎/形态 3 个）或在自定义栏输入

点「生成 JSON」→ 下方出现一条作品记录。

### 2. 点「复制到剪贴板」

工具会自动写好 `id` 和 `createdAt` 字段。

### 3. 把 JSON 粘进 `data/works.json`

打开 `data/works.json`，在数组末尾添加一条（注意逗号分隔）：

```json
[
  ...现有作品...,
  { ...刚生成的记录... }
]
```

### 4. 贴图类需要额外一步

把原图右键「图片另存为」存到本地，按**规则 A 命名**为 `{id}.{扩展名}`（如 `w20260922-007.webp`），再放进 `images/` 目录。

### 5. 提交并推送

```powershell
cd D:\VibeCoding
git add data/works.json images/    # 贴图类才需要 images/
git commit -m "Day X｜收录 N 条新作品"
git push
```

推送成功后，`https://github.com/XingHo-VibeCoding/VFXEffectHub` 上立刻能看到新数据（仓库即数据库，详见 TECH_DESIGN §13）。

## 上线部署（启用 GitHub Pages）

仓库本身已是 Public，强持久化已生效。要让别人像普通网站一样浏览页面，再启用 Pages：

1. GitHub 仓库 → Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / 根目录 `/`
4. 保存后等 1-2 分钟，访问 `https://xingho-vibecoding.github.io/VFXEffectHub/`

详见 TECH_DESIGN §9。