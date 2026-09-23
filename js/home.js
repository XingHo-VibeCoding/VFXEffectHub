// js/home.js · Day 8 主视图：mock 数据 + 四状态切换
// 板块 ① 一句话生成页面 · 板块 ③ mock 数据渲染

(function () {
  'use strict';

  // ---------- Mock 数据（前端内嵌常量，不依赖 fetch，错误态可控） ----------
  // 字段对齐 works.json：id / sourceType / title / author / game / tags / coverUrl | fileName / sourceUrl
  var MOCK_WORKS = [
    { id: 'w20260922-001', sourceType: 'unity',    title: 'Unity 粒子系统火焰特效示例',     author: '测试作者 A', game: '原神',         tags: ['Unity', '刀光', '火焰'],     coverUrl: 'https://picsum.photos/seed/001/400/600', sourceUrl: 'https://example.com/001' },
    { id: 'w20260922-002', sourceType: 'unity',    title: 'Unity Shader Graph 刀光溶解',     author: '测试作者 B', game: '鸣潮',         tags: ['Unity', '刀光', '溶解'],     coverUrl: 'https://picsum.photos/seed/002/400/500', sourceUrl: 'https://example.com/002' },
    { id: 'w20260922-003', sourceType: 'ue',       title: 'UE Niagara 魔法阵展开',           author: '测试作者 C', game: '原神',         tags: ['UE', '魔法阵'],              coverUrl: 'https://picsum.photos/seed/003/400/550', sourceUrl: 'https://example.com/003' },
    { id: 'w20260922-004', sourceType: 'ue',       title: 'UE5 材质溶解与粒子联动',          author: '测试作者 D', game: '绝区零',       tags: ['UE', '溶解', '火焰'],         coverUrl: 'https://picsum.photos/seed/004/400/650', sourceUrl: 'https://example.com/004' },
    { id: 'w20260922-005', sourceType: 'texture',  title: '手绘序列帧：火焰冲击',            author: '测试作者 E', game: '原神',         tags: ['贴图', '火焰', '冲击'],       fileName: 'images/w20260922-005.svg',           sourceUrl: 'https://example.com/005' },
    { id: 'w20260922-006', sourceType: 'texture',  title: '法阵贴图素材',                    author: '测试作者 F', game: '崩坏：星穹铁道', tags: ['贴图', '魔法阵'],            fileName: 'images/w20260922-006.svg',           sourceUrl: 'https://example.com/006' }
  ];

  // 预设：游戏名（PRD 拍板起点列表）
  var GAME_PRESETS = ['原神', '鸣潮', '绝区零', '崩坏：星穹铁道'];
  // 引擎/形态标签：特效类型下拉时排除，不算「特效类型」
  var ENGINE_TAGS = ['Unity', 'UE', '贴图'];

  // ---------- 应用状态 ----------
  var state = {
    tab: 'unity',       // 'unity' | 'ue' | 'texture' | 'collections'
    search: '',
    game: '',
    effect: '',
    status: 'loading',  // 'loading' | 'success' | 'error'
    forceError: false
  };

  // ---------- DOM ----------
  var tabBtns, searchInput, gameFilter, effectFilter, errorBtn, statusArea, grid;

  // ---------- 工具 ----------
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // ---------- 数据处理 ----------
  function getCurrentWorks() {
    if (state.tab === 'collections') {
      // 从 localStorage 读收藏夹作品 id（与 js/collections.js 同步约定）
      var cols = [];
      try {
        cols = JSON.parse(localStorage.getItem('vfx-collections') || '[]');
      } catch (e) { cols = []; }
      var ids = {};
      cols.forEach(function (c) { (c.workIds || []).forEach(function (id) { ids[id] = 1; }); });
      return MOCK_WORKS.filter(function (w) { return ids[w.id]; });
    }
    return MOCK_WORKS.filter(function (w) { return w.sourceType === state.tab; });
  }

  function applyFilters(list) {
    var r = list;
    if (state.search) {
      var q = state.search.toLowerCase();
      r = r.filter(function (w) {
        if ((w.title || '').toLowerCase().indexOf(q) !== -1) return true;
        return (w.tags || []).some(function (t) { return String(t).toLowerCase().indexOf(q) !== -1; });
      });
    }
    if (state.game) r = r.filter(function (w) { return w.game === state.game; });
    if (state.effect) r = r.filter(function (w) { return (w.tags || []).indexOf(state.effect) !== -1; });
    return r;
  }

  // ---------- 状态过滤选项 ----------
  function rebuildGameFilter() {
    if (!gameFilter) return;
    var html = '<option value="">游戏名：全部</option>';
    GAME_PRESETS.forEach(function (g) {
      html += '<option value="' + escapeAttr(g) + '">' + escapeHtml(g) + '</option>';
    });
    gameFilter.innerHTML = html;
    gameFilter.value = state.game;
  }

  function rebuildEffectFilter() {
    if (!effectFilter) return;
    var all = getCurrentWorks();
    var counts = {};
    all.forEach(function (w) {
      (w.tags || []).forEach(function (t) {
        if (ENGINE_TAGS.indexOf(t) === -1) counts[t] = (counts[t] || 0) + 1;
      });
    });
    var keys = Object.keys(counts).sort();
    var html = '<option value="">特效类型：全部</option>';
    keys.forEach(function (k) {
      html += '<option value="' + escapeAttr(k) + '">' + escapeHtml(k) + '（' + counts[k] + '）</option>';
    });
    effectFilter.innerHTML = html;
    if (keys.indexOf(state.effect) === -1) state.effect = '';
    effectFilter.value = state.effect;
  }

  // ---------- 四状态渲染 ----------
  function renderLoading() {
    statusArea.innerHTML = '';
    statusArea.className = 'status status--loading';
    grid.className = 'grid';
    var sk = '';
    for (var i = 0; i < 6; i++) sk += '<div class="skeleton-card" aria-hidden="true"></div>';
    grid.innerHTML = sk;
  }

  function renderError() {
    statusArea.className = 'status status--error';
    statusArea.innerHTML =
      '<div class="status__box">' +
        '<p class="status__title">作品加载失败</p>' +
        '<p class="status__desc">网络异常或服务暂时不可用，请稍后重试</p>' +
        '<button id="retryBtn" type="button" class="btn btn--primary">重试</button>' +
      '</div>';
    grid.innerHTML = '';
    var rb = document.getElementById('retryBtn');
    if (rb) rb.addEventListener('click', function () {
      state.forceError = false;
      state.status = 'success';
      render();
    });
  }

  function renderEmpty() {
    statusArea.className = 'status status--empty';
    statusArea.innerHTML =
      '<div class="status__box">' +
        '<p class="status__title">没有符合条件的作品</p>' +
        '<p class="status__desc">试着清除搜索或筛选条件</p>' +
        '<button id="clearBtn" type="button" class="btn btn--ghost">清除筛选</button>' +
      '</div>';
    grid.innerHTML = '';
    var cb = document.getElementById('clearBtn');
    if (cb) cb.addEventListener('click', function () {
      state.search = ''; state.game = ''; state.effect = '';
      if (searchInput) searchInput.value = '';
      gameFilter.value = '';
      effectFilter.value = '';
      render();
    });
  }

  function renderGrid(list) {
    statusArea.className = 'status status--ok';
    statusArea.innerHTML = '';
    grid.className = 'grid';
    var html = '';
    list.forEach(function (w) {
      var cover = w.coverUrl
        ? '<img src="' + escapeAttr(w.coverUrl) + '" alt="' + escapeAttr(w.title) + '" loading="lazy" referrerpolicy="no-referrer">'
        : '<img src="' + escapeAttr(w.fileName || '') + '" alt="' + escapeAttr(w.title) + '" loading="lazy">';
      var tagHtml = (w.tags || []).map(function (t) {
        return '<span class="chip">' + escapeHtml(t) + '</span>';
      }).join('');
      html +=
        '<a class="card" href="detail.html?work=' + encodeURIComponent(w.id) + '">' +
          '<div class="card__cover">' + cover + '</div>' +
          '<div class="card__body">' +
            '<h3 class="card__title">' + escapeHtml(w.title) + '</h3>' +
            '<p class="card__author">' + escapeHtml(w.author) + '</p>' +
            '<div class="card__tags">' + tagHtml + '</div>' +
          '</div>' +
        '</a>';
    });
    grid.innerHTML = html;
  }

  // ---------- 主渲染 ----------
  function render() {
    if (state.forceError) { renderError(); return; }
    if (state.status === 'loading') { renderLoading(); return; }
    var all = getCurrentWorks();
    var filtered = applyFilters(all);
    if (filtered.length === 0) { renderEmpty(); return; }
    renderGrid(filtered);
  }

  // ---------- 事件 ----------
  function bindTabs() {
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.getAttribute('data-tab');
        if (t === state.tab) return;
        state.tab = t;
        state.search = ''; state.game = ''; state.effect = '';
        if (searchInput) searchInput.value = '';
        tabBtns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        rebuildGameFilter();
        rebuildEffectFilter();
        render();
      });
    });
  }

  function bindToolbar() {
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.search = searchInput.value || '';
        render();
      });
    }
    if (gameFilter) {
      gameFilter.addEventListener('change', function () {
        state.game = gameFilter.value || '';
        render();
      });
    }
    if (effectFilter) {
      effectFilter.addEventListener('change', function () {
        state.effect = effectFilter.value || '';
        render();
      });
    }
    if (errorBtn) {
      errorBtn.addEventListener('click', function () {
        state.forceError = !state.forceError;
        errorBtn.textContent = state.forceError ? '恢复正常' : '模拟错误';
        render();
      });
    }
  }

  // ---------- 初始化 ----------
  function init() {
    tabBtns = Array.prototype.slice.call(document.querySelectorAll('.tab'));
    searchInput = document.getElementById('searchInput');
    gameFilter = document.getElementById('gameFilter');
    effectFilter = document.getElementById('effectFilter');
    errorBtn = document.getElementById('errorBtn');
    statusArea = document.getElementById('statusArea');
    grid = document.getElementById('grid');

    rebuildGameFilter();
    rebuildEffectFilter();
    bindTabs();
    bindToolbar();

    // 模拟首屏加载：500ms 后进入成功态
    setTimeout(function () {
      state.status = 'success';
      render();
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();