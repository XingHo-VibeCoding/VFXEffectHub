// js/collections.js · 收藏夹页逻辑（F7）
// Day 7 初版：新建收藏夹 + 查看每个收藏夹内作品（失效 id 过滤，防「幽灵卡片」）
// Day 13 补齐：loading 骨架 / error 状态框+重试 / 空态统一

(function () {
  var listEl = document.getElementById('collectionList');
  var nameInput = document.getElementById('newCollectionName');
  var createBtn = document.getElementById('createCollectionBtn');
  var createMsg = document.getElementById('createMsg');

  var workById = {}; // id → 作品对象（用于把收藏夹里的 id 还原成卡片）
  var state = { status: 'loading' }; // 'loading' | 'success' | 'error'

  // ---------- 新建收藏夹 ----------
  createBtn.addEventListener('click', function () {
    var name = nameInput.value.trim();
    if (!name) { createMsg.textContent = '请输入收藏夹名字'; return; }
    VFXStore.createCollection(name);
    nameInput.value = '';
    createMsg.textContent = '已新建「' + name + '」，去详情页把作品加进来吧';
    render();
  });
  nameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') createBtn.click();
  });

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
        var all = Array.isArray(data) ? data : (data.works || []);
        all.forEach(function (w) { workById[w.id] = w; });
        state.status = 'success';
        render();
      })
      .catch(function () {
        state.status = 'error';
        render();
      });
  }

  // ---------- 渲染（四态分发） ----------
  function render() {
    if (state.status === 'loading') { renderLoading(); return; }
    if (state.status === 'error') { renderError(); return; }

    var cols = VFXStore.getCollections();
    if (cols.length === 0) { renderEmpty(); return; }
    renderList(cols);
  }

  function renderLoading() {
    var sk = '';
    for (var i = 0; i < 3; i++) sk += '<div class="skeleton-card" aria-hidden="true"></div>';
    listEl.innerHTML = sk;
  }

  function renderError() {
    listEl.innerHTML =
      '<div class="status status--error">' +
        '<div class="status__box">' +
          '<p class="status__title">作品数据加载失败</p>' +
          '<p class="status__desc">网络异常或服务暂时不可用，请稍后重试</p>' +
          '<button id="retryBtn" type="button" class="btn btn--primary">重试</button>' +
        '</div>' +
      '</div>';
    var rb = document.getElementById('retryBtn');
    if (rb) rb.addEventListener('click', load);
  }

  function renderEmpty() {
    listEl.innerHTML =
      '<div class="status status--empty">' +
        '<div class="status__box">' +
          '<p class="status__title">还没有收藏夹</p>' +
          '<p class="status__desc">在作品详情页点「加入收藏夹」即可创建</p>' +
        '</div>' +
      '</div>';
  }

  function renderList(cols) {
    listEl.innerHTML = cols.map(function (c) {
      // 失效 id 过滤：作品可能已从 works.json 下架
      var validWorks = [];
      c.workIds.forEach(function (id) {
        if (workById[id]) validWorks.push(workById[id]);
      });

      var cardsHtml = validWorks.length === 0
        ? '<p class="empty-hint empty-hint--slim">（还没有作品，或作品已下架）</p>'
        : validWorks.map(cardHtml).join('');

      return (
        '<section class="collection-item">' +
          '<h3 class="collection-item-title">' + escapeHtml(c.name) +
            '<span class="collection-item-count">' + validWorks.length + ' 个作品</span>' +
          '</h3>' +
          '<div class="wall wall--in-collection">' + cardsHtml + '</div>' +
        '</section>'
      );
    }).join('');
  }

  function cardHtml(w) {
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
  }

  load();
})();
