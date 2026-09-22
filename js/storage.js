// js/storage.js · localStorage 公共读写模块（详情页 / 收藏夹页共用）
// 三键约定（TECH_DESIGN.md §4 拍板）：
//   vfx-likes       已点赞的作品 id 数组
//   vfx-favs        已收藏（红心）的作品 id 数组
//   vfx-collections 收藏夹列表 [{id, name, workIds, createdAt}]
// 说明：localStorage 是弱持久化（换设备 / 清缓存即丢），详见 TECH_DESIGN §13

var VFXStore = (function () {
  // ---------- 默认收藏夹初始化（Day 7 拍板） ----------
  // 只要没有「默认收藏夹」就自动补一个；用户主动删除后不再自动恢复（flag 版本号控制）
  var DEFAULT_FLAG = 'vfx-collections-init';
  var DEFAULT_COL_ID = 'c-default';
  (function ensureDefault() {
    try {
      // 用版本号强制重跑一次：旧逻辑给 flag='1' 的用户（已有自建夹但没默认夹）也能补上默认夹
      if (localStorage.getItem(DEFAULT_FLAG) === '2') return;
      var list = read('vfx-collections', []);
      var hasDefault = false;
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === DEFAULT_COL_ID) { hasDefault = true; break; }
      }
      if (!hasDefault) {
        list.push({
          id: DEFAULT_COL_ID,
          name: '默认收藏夹',
          workIds: [],
          createdAt: new Date().toISOString().slice(0, 10)
        });
        write('vfx-collections', list);
      }
      localStorage.setItem(DEFAULT_FLAG, '2');
    } catch (e) { /* 静默：localStorage 不可用时不强求默认夹 */ }
  })();

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var val = JSON.parse(raw);
      return val == null ? fallback : val;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      // 隐私模式 / 存储满等场景：静默失败，不阻塞页面
    }
  }
  function toggleInList(key, id) {
    var list = read(key, []);
    var i = list.indexOf(id);
    var added = (i === -1);
    if (added) list.push(id); else list.splice(i, 1);
    write(key, list);
    return added; // true = 已加入，false = 已取消
  }

  return {
    getLikes: function () { return read('vfx-likes', []); },
    isLiked: function (id) { return this.getLikes().indexOf(id) !== -1; },
    toggleLike: function (id) { return toggleInList('vfx-likes', id); },

    getFavs: function () { return read('vfx-favs', []); },
    isFav: function (id) { return this.getFavs().indexOf(id) !== -1; },
    toggleFav: function (id) { return toggleInList('vfx-favs', id); },
    // 只加不减（Day 7 拍板联动规则：加入收藏夹自动点亮红心，已收藏则不重复加）
    addFav: function (id) {
      var list = this.getFavs();
      if (list.indexOf(id) === -1) { list.push(id); write('vfx-favs', list); }
    },

    getCollections: function () { return read('vfx-collections', []); },
    // Day 7 拍板：点红心而不指定夹时，自动落到默认收藏夹；用户删了默认则返回 null
    getDefaultCollection: function () {
      var list = this.getCollections();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === DEFAULT_COL_ID) return list[i];
      }
      return null;
    },
    createCollection: function (name) {
      var list = this.getCollections();
      var col = {
        id: 'c' + Date.now(),
        name: name,
        workIds: [],
        createdAt: new Date().toISOString().slice(0, 10)
      };
      list.push(col);
      write('vfx-collections', list);
      return col;
    },
    addToCollection: function (collectionId, workId) {
      var list = this.getCollections();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === collectionId) {
          if (list[i].workIds.indexOf(workId) === -1) {
            list[i].workIds.push(workId);
          }
          break;
        }
      }
      write('vfx-collections', list);
    },
    // Day 7 拍板对称联动：取消红心时从所有收藏夹移除，返回被移除的次数（用于提示）
    removeFromAllCollections: function (workId) {
      var list = this.getCollections();
      var removed = 0;
      for (var i = 0; i < list.length; i++) {
        var idx = list[i].workIds.indexOf(workId);
        if (idx !== -1) {
          list[i].workIds.splice(idx, 1);
          removed++;
        }
      }
      if (removed > 0) write('vfx-collections', list);
      return removed;
    }
  };
})();

// 工具：转义 HTML 文本 / 属性值（防 XSS）
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}