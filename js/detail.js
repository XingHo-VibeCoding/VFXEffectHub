// js/detail.js · 详情页逻辑（F5 展示 + F4 点赞收藏 + F7 加入收藏夹）
// URL 形如 detail.html?work=作品id

(function () {
  var params = new URLSearchParams(location.search);
  var workId = params.get('work');
  var container = document.getElementById('detail');

  if (!workId) {
    container.innerHTML = '<p class="empty-hint">缺少作品参数</p>';
    return;
  }

  fetch('data/works.json')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var all = Array.isArray(data) ? data : (data.works || []);
      var work = null;
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === workId) { work = all[i]; break; }
      }
      if (!work) {
        container.innerHTML = '<p class="empty-hint">作品不存在或已下架</p>';
        return;
      }
      render(work);
    })
    .catch(function (err) {
      container.innerHTML = '<p class="empty-hint">加载失败：' + escapeHtml(err.message) + '</p>';
    });

  function render(work) {
    // 返回链接指向作品所属分区
    var back = document.getElementById('backLink');
    if (back && work.sourceType) back.href = work.sourceType + '.html';

    var isTexture = work.sourceType === 'texture';
    var thumb = work.imageFile || work.coverUrl || '';
    var mediaNote = isTexture
      ? ''
      : '<p class="detail-hint">视频类作品 · 点击下方「查看来源」跳转观看</p>';

    var tagsHtml = (work.tags || []).map(function (t) {
      return '<span class="tag-chip">' + escapeHtml(t) + '</span>';
    }).join('');

    container.innerHTML =
      '<figure class="detail-figure">' +
        '<img class="detail-img" src="' + escapeAttr(thumb) + '" alt="' + escapeAttr(work.title) + '" onerror="this.style.background=\'#eaecef\';this.removeAttribute(\'src\');">' +
      '</figure>' +
      mediaNote +
      '<h1 class="detail-title">' + escapeHtml(work.title) + '</h1>' +
      '<p class="detail-meta">作者：' + escapeHtml(work.author || '佚名') + ' · 收录于 ' + escapeHtml(work.createdAt || '') + '</p>' +
      '<div class="detail-tags">' + tagsHtml + '</div>' +
      '<p><a class="detail-source" href="' + escapeAttr(work.sourceUrl || '#') + '" target="_blank" rel="noopener noreferrer">查看来源 ↗</a></p>' +
      '<div class="detail-actions">' +
        '<button id="likeBtn" class="btn" type="button">👍 点赞</button>' +
        '<button id="favBtn" class="btn" type="button">❤ 收藏</button>' +
      '</div>' +
      '<p id="favMsg" class="fav-msg"></p>' +
      '<div class="collection-box">' +
        '<h3 class="collection-title">加入收藏夹</h3>' +
        '<div class="collection-form">' +
          '<select id="colSelect"></select>' +
          '<input id="newColName" type="text" placeholder="新收藏夹名字…" style="display:none">' +
          '<button id="colAddBtn" class="btn" type="button">加入</button>' +
        '</div>' +
        '<p id="colMsg" class="collection-msg"></p>' +
        '<p class="collection-link-hint"><a href="collections.html">管理我的收藏夹 →</a></p>' +
      '</div>';

    bindActions(work);
  }

  function bindActions(work) {
    var likeBtn = document.getElementById('likeBtn');
    var favBtn = document.getElementById('favBtn');

    function refreshBtns() {
      likeBtn.classList.toggle('btn--active', VFXStore.isLiked(work.id));
      likeBtn.textContent = VFXStore.isLiked(work.id) ? '👍 已点赞' : '👍 点赞';
      favBtn.classList.toggle('btn--active', VFXStore.isFav(work.id));
      favBtn.textContent = VFXStore.isFav(work.id) ? '❤ 已收藏' : '❤ 收藏';
    }
    refreshBtns();

    // 对称联动提示用：复用「加入收藏夹」上方的 colMsg 位置（详情页只有这两个动作区，最近的提示位）
    function setFavMsg(text, type) {
      var el = document.getElementById('favMsg');
      if (!el) return;
      el.textContent = text;
      el.className = 'fav-msg fav-msg--' + (type || 'info');
    }

    likeBtn.addEventListener('click', function () {
      VFXStore.toggleLike(work.id);
      refreshBtns();
    });
    favBtn.addEventListener('click', function () {
      // toggleFav 返回 true = 刚点亮，false = 刚取消
      var nowFaved = VFXStore.toggleFav(work.id);
      refreshBtns();
      if (!nowFaved) {
        // Day 7 拍板对称联动：取消红心时从所有收藏夹移除
        var removed = VFXStore.removeFromAllCollections(work.id);
        if (removed > 0) {
          setFavMsg('已从 ' + removed + ' 个收藏夹移除', 'warn');
        } else {
          setFavMsg('已取消收藏', 'info');
        }
      } else {
        // Day 7 拍板：点红心而不指定夹时，自动落到默认收藏夹
        var def = VFXStore.getDefaultCollection();
        if (def) {
          VFXStore.addToCollection(def.id, work.id);
          setFavMsg('已加入收藏夹「' + def.name + '」', 'info');
        } else {
          setFavMsg('已点亮红心', 'info');
        }
      }
    });

    // ---------- 加入收藏夹 ----------
    var colSelect = document.getElementById('colSelect');
    var newColName = document.getElementById('newColName');
    var colAddBtn = document.getElementById('colAddBtn');
    var colMsg = document.getElementById('colMsg');

    var NEW_OPTION_VALUE = '__new__';

    function refreshColSelect() {
      var cols = VFXStore.getCollections();
      var html = cols.map(function (c) {
        return '<option value="' + escapeAttr(c.id) + '">' + escapeHtml(c.name) + '（' + c.workIds.length + '）</option>';
      }).join('');
      html += '<option value="' + NEW_OPTION_VALUE + '">＋ 新建收藏夹…</option>';
      colSelect.innerHTML = html;
    }
    refreshColSelect();

    colSelect.addEventListener('change', function () {
      var isNew = colSelect.value === NEW_OPTION_VALUE;
      newColName.style.display = isNew ? '' : 'none';
      colAddBtn.textContent = isNew ? '新建并加入' : '加入';
    });

    colAddBtn.addEventListener('click', function () {
      colMsg.textContent = '';
      if (colSelect.value === NEW_OPTION_VALUE) {
        var name = newColName.value.trim();
        if (!name) { colMsg.textContent = '请输入新收藏夹的名字'; return; }
        var col = VFXStore.createCollection(name);
        VFXStore.addToCollection(col.id, work.id);
        colMsg.textContent = '已新建「' + name + '」并加入该作品';
      } else {
        VFXStore.addToCollection(colSelect.value, work.id);
        colMsg.textContent = '已加入收藏夹';
      }
      // Day 7 拍板联动规则：加入收藏夹 = 自动点亮红心（进夹即收藏）
      VFXStore.addFav(work.id);
      refreshBtns();
      newColName.value = '';
      newColName.style.display = 'none';
      refreshColSelect();
      colAddBtn.textContent = '加入';
    });
  }
})();