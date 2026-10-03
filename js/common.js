// js/common.js · 公共逻辑：分区页四态（加载/成功/空/错误）+ 搜索/二次筛选 + 瀑布流
// Day 7 初版：F1 分区显示 + F2 瀑布流 + F3 搜索/筛选
// Day 13 补齐：loading 骨架屏 / empty 状态框+清除筛选 / error 状态框+重试

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
  var state = { status: 'loading' }; // 'loading' | 'success' | 'error'

  // ---------- 数据加载（可重试） ----------
  function load() {
    state.status = 'loading';
    render();
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
        state.status = 'success';
        render();
      })
      .catch(function () {
        state.status = 'error';
        render();
      });
  }

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

  // ---------- 游戏名下拉：预设起点列表（PRD 拍板；重建以防重试重复追加） ----------
  function buildGameFilterOptions() {
    if (!gameFilter) return;
    gameFilter.innerHTML = '<option value="">游戏名：全部</option>';
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
    typeFilter.innerHTML = '<option value="">特效类型：全部</option>';
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

  // ---------- 四态渲染 ----------
  function render() {
    if (state.status === 'loading') { renderLoading(); return; }
    if (state.status === 'error') { renderError(); return; }
    var list = getFilteredWorks();
    if (list.length === 0) { renderEmpty(); return; }
    renderGrid(list);
  }

  function renderLoading() {
    wall.classList.remove('wall--status');
    var sk = '';
    for (var i = 0; i < 6; i++) sk += '<div class="skeleton-card" aria-hidden="true"></div>';
    wall.innerHTML = sk;
  }

  function renderError() {
    wall.classList.add('wall--status');
    wall.innerHTML =
      '<div class="status status--error">' +
        '<div class="status__box">' +
          '<p class="status__title">作品加载失败</p>' +
          '<p class="status__desc">网络异常或服务暂时不可用，请稍后重试</p>' +
          '<button id="retryBtn" type="button" class="btn btn--primary">重试</button>' +
        '</div>' +
      '</div>';
    var rb = document.getElementById('retryBtn');
    if (rb) rb.addEventListener('click', load);
  }

  function renderEmpty() {
    wall.classList.add('wall--status');
    wall.innerHTML =
      '<div class="status status--empty">' +
        '<div class="status__box">' +
          '<p class="status__title">没有符合条件的作品</p>' +
          '<p class="status__desc">试着清除搜索或筛选条件</p>' +
          '<button id="clearBtn" type="button" class="btn btn--ghost">清除筛选</button>' +
        '</div>' +
      '</div>';
    var cb = document.getElementById('clearBtn');
    if (cb) cb.addEventListener('click', function () {
      if (searchInput) searchInput.value = '';
      if (gameFilter) gameFilter.value = '';
      if (typeFilter) typeFilter.value = '';
      render();
    });
  }

  function renderGrid(list) {
    wall.classList.remove('wall--status');
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

  bindEvents();
  load();
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
