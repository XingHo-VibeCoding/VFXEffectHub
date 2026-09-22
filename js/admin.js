// js/admin.js · 收录工具页逻辑（F6）
// 仅在本地使用：填表 → 生成 JSON 片段 → 复制到 data/works.json → 上传贴图到 images/ → git push

(function () {
  var form = document.getElementById('adminForm');
  var sourceTypeInputs = form.querySelectorAll('input[name="sourceType"]');
  var coverFieldset = document.getElementById('coverFieldset');
  var imageFileFieldset = document.getElementById('imageFileFieldset');
  var generateBtn = document.getElementById('generateBtn');
  var copyBtn = document.getElementById('copyBtn');
  var output = document.getElementById('output');
  var adminMsg = document.getElementById('adminMsg');

  // 切换：Unity/UE 显示封面链接字段；贴图显示文件名字段
  function refreshFieldsets() {
    var t = getSourceType();
    coverFieldset.hidden = (t === 'texture');
    imageFileFieldset.hidden = (t !== 'texture');
  }
  for (var i = 0; i < sourceTypeInputs.length; i++) {
    sourceTypeInputs[i].addEventListener('change', refreshFieldsets);
  }
  refreshFieldsets();

  function getSourceType() {
    for (var i = 0; i < sourceTypeInputs.length; i++) {
      if (sourceTypeInputs[i].checked) return sourceTypeInputs[i].value;
    }
    return '';
  }

  function setMsg(text, type) {
    adminMsg.textContent = text;
    adminMsg.className = 'admin-msg admin-msg--' + (type || 'info');
  }

  function makeId() {
    var d = new Date();
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return 'w' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + Date.now().toString().slice(-4);
  }

  function getTags() {
    var tags = [];
    var boxes = form.querySelectorAll('input[type="checkbox"]:checked');
    for (var i = 0; i < boxes.length; i++) tags.push(boxes[i].value);
    var raw = document.getElementById('customTags').value.trim();
    if (raw) {
      var parts = raw.split(/[,，]/);
      for (var j = 0; j < parts.length; j++) {
        var t = parts[j].trim();
        if (t && tags.indexOf(t) === -1) tags.push(t);
      }
    }
    return tags;
  }

  generateBtn.addEventListener('click', function () {
    setMsg('', 'info');
    var sourceType = getSourceType();
    var title = document.getElementById('title').value.trim();
    var sourceUrl = document.getElementById('sourceUrl').value.trim();
    var coverUrl = document.getElementById('coverUrl').value.trim();
    var imageFile = document.getElementById('imageFile').value.trim();
    var author = document.getElementById('author').value.trim();
    var tags = getTags();

    if (!sourceType) { setMsg('请选择来源类型', 'warn'); return; }
    if (!title) { setMsg('请填写标题', 'warn'); return; }
    if (!sourceUrl) { setMsg('请填写来源链接', 'warn'); return; }
    if (sourceType === 'texture' && !imageFile) {
      setMsg('贴图类必须填写 imageFile（如 w20260922-007.webp），请先把图按规则 A 命名放到 images/', 'warn');
      return;
    }

    var work = {
      id: makeId(),
      sourceType: sourceType,
      title: title,
      sourceUrl: sourceUrl,
      author: author || '',
      tags: tags,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    if (sourceType === 'texture') {
      work.imageFile = imageFile;
    } else if (coverUrl) {
      work.coverUrl = coverUrl;
    }

    output.value = JSON.stringify(work, null, 2);
    copyBtn.disabled = false;
    setMsg('已生成。点击「复制到剪贴板」或手动复制下方文本，粘贴到 data/works.json 数组末尾。', 'info');
  });

  copyBtn.addEventListener('click', function () {
    var text = output.value;
    if (!text) { setMsg('请先生成 JSON', 'warn'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        setMsg('已复制到剪贴板 ✓', 'ok');
      }, function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  });

  function fallbackCopy(text) {
    output.select();
    try {
      var ok = document.execCommand('copy');
      setMsg(ok ? '已复制到剪贴板 ✓' : '复制失败，请手动选中复制', ok ? 'ok' : 'warn');
    } catch (e) {
      setMsg('复制失败，请手动选中复制', 'warn');
    }
  }
})();