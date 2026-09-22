// js/collections.js · 收藏夹页逻辑（F7）
// 新建收藏夹 + 查看每个收藏夹内的作品列表（失效 id 过滤，防「幽灵卡片」）

(function () {
  var listEl = document.getElementById('collectionList');
  var nameInput = document.getElementById('newCollectionName');
  var createBtn = document.getElementById('createCollectionBtn');
  var createMsg = document.getElementById('createMsg');

  var workById = {}; // id → 作品对象（用于把收藏夹里的 id 还原成卡片）

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

  // ---------- 渲染 ----------
  fetch('data/works.json')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var all = Array.isArray(data) ? data : (data.works || []);
      all.forEach(function (w) { workById[w.id] = w; });
      render();
    })
    .catch(function (err) {
      listEl.innerHTML = '<p class="empty-hint">作品数据加载失败：' + escapeHtml(err.message) + '</p>';
    });

  function render() {
    var cols = VFXStore.getCollections();

    if (cols.length === 0) {
      listEl.innerHTML = '<p class="empty-hint">还没有收藏夹 · 在作品详情页点「加入收藏夹」即可创建</p>';
      return;
    }

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
})();