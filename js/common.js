// js/common.js · 公共逻辑：加载作品数据 + 按分区过滤 + 搜索/二次筛选 + 渲染瀑布流
// Step 2：F1 分区显示 + F2 瀑布流
// Step 3：F3 搜索（标题/标签任一命中即匹配）+ 二次筛选（游戏名/特效类型，可勾可不勾）

// 预设：游戏名（PRD 拍板起点列表）
var GAME_PRESETS = ['原神', '鸣潮', '绝区零', '崩坏：星穹铁道'];
// 引擎/形态标签（用于特效类型下拉时排除，不算「特效类型」）
var ENGINE_TAGS = ['Unity', 'UE', '贴图'];

(function () {
  var section = document.body.dataset.section; // 'unity' / 'ue' / 'texture'
  var wall = document.getElementById('wall');
  if (!section || !wall) return;

  var searchInput = document.getElementById('searchInput');
  var gameFilter = document.getElementById('gameFilter');
  var typeFilter = document.getElementById('typeFilter');

  var sectionWorks = []; // 当前分区的全部作品

  // ---------- 数据加载 ----------
  fetch('data/works.json')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      // 兼容两种顶层结构：[{...}] 或 {works: [{...}]}
      var all = Array.isArray(data) ? data : (data.works || []);
      sectionWorks = all.filter(function (w) { return w.sourceType === section; });

      buildGameFilterOptions();
      buildTypeFilterOptions();
      bindEvents();
      render();
    })
    .catch(function (err) {
      wall.innerHTML = '<p class="empty-hint">作品加载失败：' + escapeHtml(err.message) + '</p>';
    });

  // ---------- 筛选逻辑 ----------

  // 搜索：标题 或 标签 任一字段含关键词即命中（Day 4 拍板，不要求同时匹配）
  function matchSearch(work, keyword) {
    if (!keyword) return true;
    var kw = keyword.trim().toLowerCase();
    if (!kw) return true;
    if ((work.title || '').toLowerCase().indexOf(kw) !== -1) return true;
    var tags = work.tags || [];
    for (var i = 0; i < tags.length; i++) {
      if (String(tags[i]).toLowerCase().indexOf(kw) !== -1) return true;
    }
    return false;
  }

  // 二次筛选：作品的 tags 里必须包含所选值（不选 = 不筛）
  function matchFilter(work, value) {
    if (!value) return true;
    return (work.tags || []).indexOf(value) !== -1;
  }

  function getFilteredWorks() {
    var keyword = searchInput ? searchInput.value : '';
    var game = gameFilter ? gameFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';
    return sectionWorks.filter(function (w) {
      return matchSearch(w, keyword) && matchFilter(w, game) && matchFilter(w, type);
    });
  }

  // ---------- 游戏名下拉：预设起点列表（PRD 拍板） ----------
  function buildGameFilterOptions() {
    if (!gameFilter) return;
    GAME_PRESETS.forEach(function (g) {
      var opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      gameFilter.appendChild(opt);
    });
  }

  // ---------- 特效类型下拉：聚合当前分区作品标签（无预设，按需出现） ----------
  function buildTypeFilterOptions() {
    if (!typeFilter) return;
    var seen = {};
    var options = [];
    sectionWorks.forEach(function (w) {
      (w.tags || []).forEach(function (t) {
        if (seen[t]) return;
        if (GAME_PRESETS.indexOf(t) !== -1) return; // 游戏名不算特效类型
        if (ENGINE_TAGS.indexOf(t) !== -1) return;  // 引擎/形态不算特效类型
        seen[t] = true;
        options.push(t);
      });
    });
    options.sort();
    options.forEach(function (t) {
      var opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      typeFilter.appendChild(opt);
    });
  }

  // ---------- 事件 ----------
  function bindEvents() {
    if (searchInput) searchInput.addEventListener('input', render);
    if (gameFilter) gameFilter.addEventListener('change', render);
    if (typeFilter) typeFilter.addEventListener('change', render);
  }

  // ---------- 渲染 ----------
  function render() {
    var list = getFilteredWorks();
    if (list.length === 0) {
      wall.innerHTML = '<p class="empty-hint">没有找到相关结果</p>';
      return;
    }
    wall.innerHTML = list.map(function (w) {
      var thumb = w.imageFile || w.coverUrl || '';
      return (
        '<article class="card">' +
          '<a class="card-link" href="detail.html?work=' + encodeURIComponent(w.id) + '">' +
            '<img class="card-thumb" src="' + escapeAttr(thumb) + '" alt="' + escapeAttr(w.title) + '" loading="lazy" onerror="this.style.background=\'#eaecef\';this.removeAttribute(\'src\');">' +
            '<h3 class="card-title">' + escapeHtml(w.title) + '</h3>' +
            '<p class="card-author">' + escapeHtml(w.author || '') + '</p>' +
          '</a>' +
        '</article>'
      );
    }).join('');
  }
})();

// 工具：转义 HTML 文本（防 XSS / 显示异常）
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 工具：转义 HTML 属性值
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}