/**
 * @author 64j
 * @type {Multifields|*}
 */
var Multifields = (function(a) {
  'use strict';

  var __ = function(a) {
    this.id = a.id;
    this.name = a.name;
    this.tpl = null;
    var _this = this;
    this._field = document.getElementById('tv' + a.id);
    this._field.oncomplete = function(e) {
      _this.oncomplete.call(_this, e);
    };
    this._element = document.getElementById('multifields_tv' + a.id);
    this._element.addEventListener('keyup', function(e) {
      _this.on.call(_this, e);
    });
    this._element.addEventListener('click', function(e) {
      _this.on.call(_this, e);
    });
    this._element.addEventListener('mousemove', function(e) {
      _this.on.call(_this, e);
    });

    this.draggable('.multifields, .mf-row-move.mf-group, .mf-item.mf-group');
  };

  __.prototype.on = function(e) {
    switch (e.type) {
      case 'click':
        switch (true) {
          case e.target.classList.contains('mf-add'):
            this.add(e);
            break;
          case e.target.classList.contains('mf-del'):
            this.del(e);
            break;
          default:
            this.oncomplete();
            break;
        }
        break;
      case 'keyup':
        this.oncomplete();
        break;
    }
  };

  __.prototype.add = function(e) {
    var el = e.target, row, toolbar, group, tpl;
    if (el.parentElement.classList.contains('mf-toolbar')) {
      toolbar = el.parentElement;
      tpl = toolbar.querySelector('select') || toolbar.querySelector('input[type="hidden"]');
      group = toolbar.parentNode;
      if (tpl) {
        this.tpl = tpl.value;
        this.loadTemplate(function(data) {
          if (data) {
            group.insertAdjacentHTML('beforeend', data);
            if (group.classList.contains('mf-group')) {
              this.draggable(group);
            }
            this.oncomplete();
          }
        });
      }
    } else {
      row = el.closest('.mf-row');
      if (row && row.dataset && row.dataset.tpl) {
        this.tpl = row.dataset.tpl.split('__')[0];
        this.loadTemplate(function(data) {
          if (data) {
            row.insertAdjacentHTML('afterend', data);
            this.oncomplete();
          }
        });
      }
    }
  };

  __.prototype.del = function(e) {
    var el = e.target, els, row, group;
    row = el.closest('.mf-row');
    if (el.parentElement.parentElement.firstElementChild.classList.contains('mf-toolbar')) {
      if (row) {
        if (row.classList.contains('item-row-group')) {
          group = row.firstElementChild;
          if (group) {
            els = group.querySelectorAll('.mf-row, .mf-item');
            if (els.length && confirm('Delete all ?')) {
              for (var i = 0; i < els.length; i++) {
                els[i].parentNode.removeChild(els[i]);
              }
            } else {
              if (!row.parentNode.classList.contains('mf-section')) {
                row.parentNode.removeChild(row);
              } else {
                alert('Not deleted !');
              }
            }
          }
        } else {
          row.parentNode.removeChild(row);
        }
      } else {
        row = el.closest('.multifields');
        if (row) {
          els = row.querySelectorAll('.mf-row, .mf-item');
          if (els.length && confirm('Delete all ?')) {
            for (var i = 0; i < els.length; i++) {
              els[i].parentNode.removeChild(els[i]);
            }
          }
        }
      }
    } else {
      if (row) {
        row.parentNode.removeChild(row);
      }
    }
    this.oncomplete();
  };

  __.prototype.oncomplete = function() {
    var a = JSON.stringify(this.convertArrayToObject(this.build(this._element)));
    this._field.value = a === '{}' ? '' : a;
    if (typeof tinymce !== 'undefined') {
      [].forEach.call(this._element.querySelectorAll('.mf-item.richtext'), function(el) {
        var textarea = el.querySelector('textarea');
        if (tinymce.get(textarea.id)) {
          tinymce.execCommand('mceRemoveEditor', true, textarea.id);
        }
        tinymce.execCommand('mceAddEditor', false, textarea.id);
      });
    }
  };

  __.prototype.build = function(a) {
    var _this = this, b = [], r;
    [].forEach.call(a.children, function(el, i) {
      switch (true) {
        case el.classList.contains('mf-toolbar'):
          break;

        case el.classList.contains('mf-row'):
          r = _this.build(el);
          var tpl = el.getAttribute('data-tpl') || '';
          if (tpl) {
            r['tpl'] = tpl;
          }
          if (el.classList.contains('mf-group')) {
            r['type'] = 'group';
            var elTitle = el.querySelector('.mf-toolbar .mf-group-title');
            if (elTitle && elTitle.firstElementChild) {
              r['value'] = elTitle.firstElementChild['value'];
            } else {
              //rows['value'] = elTitle.innerHTML;
            }
          } else if (el.classList.contains('mf-thumb')) {
            r['type'] = 'thumb';
          }
          b.push(r);
          break;

        case el.classList.contains('mf-item'):
          if (el.classList.contains('mf-group')) {
            r = _this.build(el);
            r['type'] = 'group';
            b.push(r);
          } else {
            r = [];
            var item = el.querySelector('[data-name]');
            if (item) {
              var id = item.id.split('__');
              r['type'] = id[2].replace('[]', '');
              r['name'] = (id[3].replace('[]', '') || id[1].replace('[]', ''));
              r['value'] = item.value;
              if (item.nodeName === 'DIV') {
                r['value'] = item.innerHTML;
              }
              switch (r['type']) {
                case 'checkbox':
                case 'option': {
                  var els = el.querySelectorAll('[name]:checked');
                  var values = [];
                  [].forEach.call(els, function(el) {
                    values.push(el.value);
                  });
                  r['value'] = values.join('||');
                  break;
                }
              }
            }
            var _ = _this.build(el);
            if (_.length) {
              r.push(_);
            }
            if (r['value'] === '') {
              delete r['value'];
            }
            delete r['type'];
            b.push(r);
          }
          break;

        default:
          break;
      }
    });

    return b;
  };

  __.prototype.loadTemplate = function(callback) {
    var _this = this, xhr = new XMLHttpRequest();
    xhr.open('POST', '../assets/tvs/multifields/tv.ajax.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-REQUESTED-WITH', 'XMLHttpRequest');
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (typeof callback === 'function') {
          callback.call(_this, this.response);
        }
        var a = [], b, c = /<script[^>]*>([\s\S]*?)<\/script>/gi;
        while ((b = c.exec(this.response))) {
          a.push(b[1]);
        }
        if (a.length) {
          /** @namespace window.execScript */
          (window.execScript) ? window.execScript(a.join('\n')) : window.setTimeout(a.join('\n'), 0);
        }
        var DatePickers = document.querySelectorAll('input.DatePicker');
        if (DatePickers) {
          for (var i = 0; i < DatePickers.length; i++) {
            new DatePicker(DatePickers[i], {
              yearOffset: dpOffset, format: dpformat, dayNames: dpdayNames, monthNames: dpmonthNames, startDay: dpstartDay
            });
          }
        }
      }
    };
    xhr.send('field_id=' + this.id + '&field_name=' + this.name + '&template_name=' + this.tpl);
  };

  __.prototype.convertArrayToObject = function(a) {
    var b = Object.create(null);
    if (typeof a === 'object') {
      for (var i in a) {
        b[i] = this.convertArrayToObject(a[i]);
      }
    } else {
      b = a;
    }
    return b;
  };

  __.prototype.draggable = function(els) {
    els = typeof els === 'string' ? this._element.parentElement.querySelectorAll(els) : [els];
    var _this = this;
    els.forEach(function(el) {
      Sortable.create(el, {
        draggable: '.mf-row-move',
        animation: 150,
        ghostClass: 'active',
        dragClass: 'placeholder',
        handle: '.mf-move',
        onEnd: function() {
          _this.oncomplete();
        },
        onMove: function(a) {
          if (a.dragged.parentElement !== a.related.parentElement) {
            return false;
          }
        }
      });
    });
  };

  return new __(a);
});

Multifields.openBrowseServer = function(event, el, type, tvID) {
  if (event.target.tagName === 'I') {
    return;
  }
  var target;
  switch (type) {
    case 'image':
      target = el.querySelector('[tvname="image"]');
      Multifields.BrowseServer(target.id, 'images');
      break;

    case 'file':
      target = el.querySelector('[tvname="file"]');
      Multifields.BrowseServer(target.id, 'files');
      break;
  }
  target.onchange = function() {
    if (this.value !== '') {
      el.style.backgroundImage = type === 'image' ? 'url("../' + this.value + '")' : 'url()';
    } else {
      el.style.backgroundImage = '';
    }
    document.getElementById(tvID).oncomplete();
  };
};

Multifields.openRTEinWindow = function(id, tvID, options) {
  options = options && '?options=' + options || '';
  var multiFieldsOpenRTEinWindow;
  var url = '../assets/tvs/multifields/tv.richtext.php' + options;
  if (parent.modx) {
    multiFieldsOpenRTEinWindow = parent.modx.popup({
      iframe: 'iframe',
      height: '70%',
      width: '80%',
      draggable: 0,
      overlay: 1,
      margin: 0,
      resize: 0,
      hover: 0,
      hide: 0,
      url: url
    });
    multiFieldsOpenRTEinWindow.frame.addEventListener('load', function() {
      var w = this.contentWindow;
      var form = w.document.getElementById('ta_form');
      var textarea = w.document.getElementById('ta');
      textarea.value = document.getElementById(id).value;
      if (typeof w.tinymce !== 'undefined') {
        w.tinymce.get('ta').remove();
        w.tinymce.execCommand('mceAddEditor', false, 'ta');
      }
      form.addEventListener('submit', function(e) {
        textarea = this.querySelector('textarea#ta');
        setTimeout(function() {
          document.getElementById(id).value = textarea.value;
          document.getElementById(tvID).oncomplete();
          w.documentDirty = false;
          multiFieldsOpenRTEinWindow.close();
        }, 200);
        e.preventDefault();
      }, false);
    }, false);
  } else {
    alert('parent.modx not found !');
  }
};

Multifields.openThumbWindow = function(e, el, tvID) {
  var multiFieldsOpenThumbWindow;
  if (parent.modx) {
    multiFieldsOpenThumbWindow = parent.modx.popup({
      height: 'auto',
      width: '80%',
      draggable: 0,
      overlay: 1,
      margin: 0,
      resize: 0,
      hover: 0,
      hide: 0,
      content: '' +
          '<div id="actions" class="multifields actions">' +
          ' <span class="btn btn-success btn-sm" onclick="Multifields.changeThumbWindow(\'' + el.id + '\',\'' + tvID + '\'); this.offsetParent.offsetParent.close();">' +
          '   <i class="fa fa-floppy-o"></i>' +
          ' </span>' +
          ' <span class="btn btn-sm" onclick="this.offsetParent.offsetParent.close();">' +
          '   <i class="fa fa-times-circle"></i>' +
          ' </span>' +
          '</div>' +
          '<div id="open_' + el.id + '" class="multifields table">' + el.innerHTML + '</div>'
    });
    multiFieldsOpenThumbWindow.el.onchange = function(e) {
      if (e.target.dataset && e.target.dataset.name) {
        Multifields.changeThumbWindow(el.id, tvID);
      }
    };
    multiFieldsOpenThumbWindow.el.onkeyup = function(e) {
      if (e.target.dataset && e.target.dataset.name) {
        Multifields.changeThumbWindow(el.id, tvID);
      }
    };
  } else {
    alert('parent.modx not found !');
  }
  e.preventDefault();
};

Multifields.changeThumbWindow = function(thumbID, tvID) {
  var els = document.querySelectorAll('#open_' + thumbID + ' [name]');
  var thumb = document.querySelector('#' + thumbID);
  var type = thumb.getAttribute('data-type');
  els.forEach(function(el) {
    var _el = thumb.getElementById(el.id), _type = _el.getAttribute('tvname');
    if (el.tagName === 'TEXTAREA') {
      _el.innerHTML = el.value;
    } else {
      _el.setAttribute('value', el.value);
      if (type && _type === type) {
        if (_el.value !== '') {
          thumb.style.backgroundImage = type === 'image' ? 'url("../' + _el.value + '")' : 'url()';
        } else {
          thumb.style.backgroundImage = '';
        }
        type = null;
      }
    }
  });
  document.getElementById(tvID).oncomplete();
};

Multifields.lastImageCtrl = null;
Multifields.lastFileCtrl = null;

Multifields.BrowseServer = function(ctrl, type) {
  Multifields.lastImageCtrl = ctrl;
  type = type || 'images';
  var w = screen.width * 0.5;
  var h = screen.height * 0.5;
  Multifields.OpenServerBrowser(Multifields.urlBrowseServer + '?type=' + type, w, h);
};

Multifields.OpenServerBrowser = function(url, width, height) {
  var iLeft = (screen.width - width) / 2;
  var iTop = (screen.height - height) / 2;

  var sOptions = 'toolbar=no,status=no,resizable=yes,dependent=yes';
  sOptions += ',width=' + width;
  sOptions += ',height=' + height;
  sOptions += ',left=' + iLeft;
  sOptions += ',top=' + iTop;

  var oWindow = window.open(url, 'FCKBrowseWindow', sOptions);

  var mf_setCallback = setInterval(function() {
    if (typeof window.KCFinder !== 'undefined') {
      clearInterval(mf_setCallback);
      window.KCFinder.callBack = Multifields.SetUrl;
      window.KCFinder.callBackMultiple = function(files) {
        Multifields.SetUrl(files[0]);
        //              for (var i = 1; i < files.length; i++) {
        //                // callBackMultiple
        //              }
      };
    }
  }, 100);
};

Multifields.SetUrlChange = function(el) {
  if ('createEvent' in document) {
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent('change', false, true);
    el.dispatchEvent(evt);
  } else {
    el.fireEvent('onchange');
  }
};

Multifields.SetUrl = function(url) {
  var c;
  if (Multifields.lastFileCtrl) {
    c = typeof Multifields.lastFileCtrl === 'object' ? Multifields.lastFileCtrl : document.getElementById(
        Multifields.lastFileCtrl);
    if (c && c.value !== url) {
      c.value = url;
      Multifields.SetUrlChange(c);
    }
    Multifields.lastFileCtrl = '';
  } else if (Multifields.lastImageCtrl) {
    c = typeof Multifields.lastImageCtrl === 'object' ? Multifields.lastImageCtrl : document.getElementById(
        Multifields.lastImageCtrl);
    if (c && c.value !== url) {
      c.value = url;
      Multifields.SetUrlChange(c);
    }
    Multifields.lastImageCtrl = '';
  } else {

  }
};

/*! Sortable 1.8.1 - MIT | git://github.com/SortableJS/Sortable.git */
!function(t) {
  'use strict';
  'function' == typeof define && define.amd ? define(t) : 'undefined' != typeof module && void 0 !== module.exports ? module.exports = t() : window.Sortable = t();
}(function() {
  'use strict';
  if ('undefined' == typeof window || !window.document) return function() {throw new Error('Sortable.js requires a window with a document');};
  var V, q, G, u, K, Z, h, Y, M, k, Q, o, J, $, l, s, c, f, P, tt, et, nt, ot, it, rt, I = [], at = !1, p = !1, lt = !1, d = [], st = !1, ct = !1, i = /\s+/g, dt = 'Sortable' + (new Date).getTime(), ht = window, ut = ht.document, g = ht.parseInt, ft = ht.setTimeout, e = ht.jQuery || ht.Zepto, n = ht.Polymer, r = {capture: !1, passive: !1}, pt = !!navigator.userAgent.match(/(?:Trident.*rv[ :]?11\.|msie|iemobile)/i), v = !!navigator.userAgent.match(/Edge/i), m = v || pt ? 'cssFloat' : 'float', a = 'draggable' in ut.createElement('div'), b = function() {
    if (pt) return !1;
    var t = ut.createElement('x');
    return t.style.cssText = 'pointer-events:auto', 'auto' === t.style.pointerEvents;
  }(), gt = !1, w = !1, vt = Math.abs, _ = Math.min, y = [], D = function(t, e) {
    var n = B(t), o = g(n.width), i = W(t, 0, e), r = W(t, 1, e), a = i && B(i), l = r && B(r), s = a && g(a.marginLeft) + g(a.marginRight) + Mt(i).width, c = l && g(l.marginLeft) + g(l.marginRight) + Mt(r).width;
    return 'flex' === n.display ? 'column' === n.flexDirection || 'column-reverse' === n.flexDirection ? 'vertical' : 'horizontal' : i && ('block' === a.display || 'flex' === a.display || 'table' === a.display || 'grid' === a.display || o <= s && 'none' === n[m] || r && 'none' === n[m] && o < s + c) ? 'vertical' : 'horizontal';
  }, mt = function(t, e) {
    if (!t || !t.getBoundingClientRect) return ht;
    var n = t, o = !1;
    do {
      if (n.clientWidth < n.scrollWidth || n.clientHeight < n.scrollHeight) {
        var i = B(n);
        if (n.clientWidth < n.scrollWidth && ('auto' == i.overflowX || 'scroll' == i.overflowX) || n.clientHeight < n.scrollHeight && ('auto' == i.overflowY || 'scroll' == i.overflowY)) {
          if (!n || !n.getBoundingClientRect || n === ut.body) return ht;
          if (o || e) return n;
          o = !0;
        }
      }
    } while (n = n.parentNode);
    return ht;
  }, C = j(function(n, t, e, o) {
    if (t.scroll) {
      var i = e ? e[dt] : window, r = t.scrollSensitivity, a = t.scrollSpeed, l = n.clientX, s = n.clientY, c = (window.innerWidth, window.innerHeight, !1);
      M !== e && (A(), Y = t.scroll, k = t.scrollFn, !0 === Y && (Y = mt(e, !0), M = Y));
      var d = 0, h = Y;
      do {
        var u, f, p, g, v, m, b, w, _, y = h, D = Mt(y), C = D.top, S = D.bottom, T = D.left, E = D.right, x = D.width, N = D.height;
        if (_ = y !== ht ? (u = y.scrollWidth, f = y.scrollHeight, p = B(y), m = x < u && ('auto' === p.overflowX || 'scroll' === p.overflowX), b = N < f && ('auto' === p.overflowY || 'scroll' === p.overflowY), w = y.scrollLeft, y.scrollTop) : (u = ut.documentElement.scrollWidth, f = ut.documentElement.scrollHeight, p = B(ut.documentElement), m = x < u && ('auto' === p.overflowX || 'scroll' === p.overflowX || 'visible' === p.overflowX), b = N < f && ('auto' === p.overflowY || 'scroll' === p.overflowY || 'visible' === p.overflowY), w = ut.documentElement.scrollLeft, ut.documentElement.scrollTop), g = m && (vt(E - l) <= r && w + x < u) - (vt(T - l) <= r && !!w), v = b && (vt(S - s) <= r && _ + N < f) - (vt(C - s) <= r && !!_), !I[d]) {for (var X = 0; X <= d; X++) {I[X] || (I[X] = {});}}
        I[d].vx == g && I[d].vy == v && I[d].el === y || (I[d].el = y, I[d].vx = g, I[d].vy = v, clearInterval(I[d].pid), !y || 0 == g && 0 == v || (c = !0, I[d].pid = setInterval(function() {
          o && 0 === this.layer && _t.active._emulateDragOver(!0);
          var t = I[this.layer].vy ? I[this.layer].vy * a : 0, e = I[this.layer].vx ? I[this.layer].vx * a : 0;
          'function' == typeof k && 'continue' !== k.call(i, e, t, n, P, I[this.layer].el) || (I[this.layer].el === ht ? ht.scrollTo(ht.pageXOffset + e, ht.pageYOffset + t) : (I[this.layer].el.scrollTop += t, I[this.layer].el.scrollLeft += e));
        }.bind({layer: d}), 24))), d++;
      } while (t.bubbleScroll && h !== ht && (h = mt(h, !1)));
      at = c;
    }
  }, 30), A = function() {I.forEach(function(t) {clearInterval(t.pid);}), I = [];}, S = function(t) {
    function s(a, l)
    {
      return function(t, e, n, o) {
        var i = t.options.group.name && e.options.group.name && t.options.group.name === e.options.group.name;
        if (null == a && (l || i)) return !0;
        if (null == a || !1 === a) return !1;
        if (l && 'clone' === a) return a;
        if ('function' == typeof a) return s(a(t, e, n, o), l)(t, e, n, o);
        var r = (l ? t : e).options.group.name;
        return !0 === a || 'string' == typeof a && a === r || a.join && -1 < a.indexOf(r);
      };
    }

    var e = {}, n = t.group;
    n && 'object' == typeof n || (n = {name: n}), e.name = n.name, e.checkPull = s(n.pull, !0), e.checkPut = s(n.put), e.revertClone = n.revertClone, t.group = e;
  }, T = function(t) {V && V.parentNode && V.parentNode[dt] && V.parentNode[dt]._computeIsAligned(t);}, bt = function(t, e) {
    for (var n = e; !n[dt];) {n = n.parentNode;}
    return t === n;
  }, wt = function(t, e, n) {
    for (var o = t.parentNode; o && !o[dt];) {o = o.parentNode;}
    o && o[dt][n](U(e, {artificialBubble: !0}));
  }, E = function() {!b && G && B(G, 'display', 'none');}, x = function() {!b && G && B(G, 'display', '');};
  ut.addEventListener('click', function(t) {if (lt) return t.preventDefault(), t.stopPropagation && t.stopPropagation(), t.stopImmediatePropagation && t.stopImmediatePropagation(), lt = !1;}, !0);
  var N, t = function(t) {
    if (V) {
      var e = function(t, e) {
        for (var n = 0; n < d.length; n++) {
          if (!d[n].children.length) {
            var o = Mt(d[n]), i = d[n][dt].options.emptyInsertThreshold, r = t >= o.left - i && t <= o.right + i, a = e >= o.top - i && e <= o.bottom + i;
            if (r && a) return d[n];
          }
        }
      }(t.clientX, t.clientY);
      e && e[dt]._onDragOver({clientX: t.clientX, clientY: t.clientY, target: e, rootEl: e});
    }
  };

  function _t(t, e)
  {
    if (!t || !t.nodeType || 1 !== t.nodeType) throw'Sortable: `el` must be HTMLElement, not ' + {}.toString.call(t);
    this.el = t, this.options = e = U({}, e), t[dt] = this;
    var n = {group: null, sort: !0, disabled: !1, store: null, handle: null, scroll: !0, scrollSensitivity: 30, scrollSpeed: 10, bubbleScroll: !0, draggable: /[uo]l/i.test(t.nodeName) ? 'li' : '>*', swapThreshold: 1, invertSwap: !1, invertedSwapThreshold: null, removeCloneOnHide: !0, direction: function() {return D(t, this.options);}, ghostClass: 'sortable-ghost', chosenClass: 'sortable-chosen', dragClass: 'sortable-drag', ignore: 'a, img', filter: null, preventOnFilter: !0, animation: 0, easing: null, setData: function(t, e) {t.setData('Text', e.textContent);}, dropBubble: !1, dragoverBubble: !1, dataIdAttr: 'data-id', delay: 0, touchStartThreshold: g(window.devicePixelRatio, 10) || 1, forceFallback: !1, fallbackClass: 'sortable-fallback', fallbackOnBody: !1, fallbackTolerance: 0, fallbackOffset: {x: 0, y: 0}, supportPointer: !1 !== _t.supportPointer && ('PointerEvent' in window || window.navigator && 'msPointerEnabled' in window.navigator), emptyInsertThreshold: 5};
    for (var o in n) {!(o in e) && (e[o] = n[o]);}
    for (var i in S(e), this) {'_' === i.charAt(0) && 'function' == typeof this[i] && (this[i] = this[i].bind(this));}
    this.nativeDraggable = !e.forceFallback && a, e.supportPointer ? X(t, 'pointerdown', this._onTapStart) : (X(t, 'mousedown', this._onTapStart), X(t, 'touchstart', this._onTapStart)), this.nativeDraggable && (X(t, 'dragover', this), X(t, 'dragenter', this)), d.push(this.el), e.store && e.store.get && this.sort(e.store.get(this) || []);
  }

  function yt(t, e, n, o)
  {
    if (t) {
      n = n || ut;
      do {
        if ('>*' === e && t.parentNode === n || z(t, e) || o && t === n) return t;
        if (t === n) break;
      } while (t = (i = t).host && i !== ut && i.host.nodeType ? i.host : i.parentNode);
    }
    var i;
    return null;
  }

  function X(t, e, n) {t.addEventListener(e, n, r);}

  function O(t, e, n) {t.removeEventListener(e, n, r);}

  function Dt(t, e, n)
  {
    if (t && e) {
      if (t.classList) {t.classList[n ? 'add' : 'remove'](e);} else {
        var o = (' ' + t.className + ' ').replace(i, ' ').replace(' ' + e + ' ', ' ');
        t.className = (o + (n ? ' ' + e : '')).replace(i, ' ');
      }
    }
  }

  function B(t, e, n)
  {
    var o = t && t.style;
    if (o) {
      if (void 0 === n) return ut.defaultView && ut.defaultView.getComputedStyle ? n = ut.defaultView.getComputedStyle(t, '') : t.currentStyle && (n = t.currentStyle), void 0 === e ? n : n[e];
      e in o || -1 !== e.indexOf('webkit') || (e = '-webkit-' + e), o[e] = n + ('string' == typeof n ? '' : 'px');
    }
  }

  function H(t)
  {
    var e = '';
    do {
      var n = B(t, 'transform');
      n && 'none' !== n && (e = n + ' ' + e);
    } while (t = t.parentNode);
    return window.DOMMatrix ? new DOMMatrix(e) : window.WebKitCSSMatrix ? new WebKitCSSMatrix(e) : window.CSSMatrix ? new CSSMatrix(e) : void 0;
  }

  function R(t, e, n)
  {
    if (t) {
      var o = t.getElementsByTagName(e), i = 0, r = o.length;
      if (n) {for (; i < r; i++) {n(o[i], i);}}
      return o;
    }
    return [];
  }

  function Ct(t, e, n, o, i, r, a, l, s)
  {
    var c, d = (t = t || e[dt]).options, h = 'on' + n.charAt(0).toUpperCase() + n.substr(1);
    !window.CustomEvent || pt || v ? (c = ut.createEvent('Event')).initEvent(n, !0, !0) : c = new CustomEvent(n, {bubbles: !0, cancelable: !0}), c.to = i || e, c.from = r || e, c.item = o || e, c.clone = u, c.oldIndex = a, c.newIndex = l, c.originalEvent = s, e && e.dispatchEvent(c), d[h] && d[h].call(t, c);
  }

  function St(t, e, n, o, i, r, a, l)
  {
    var s, c, d = t[dt], h = d.options.onMove;
    return !window.CustomEvent || pt || v ? (s = ut.createEvent('Event')).initEvent('move', !0, !0) : s = new CustomEvent('move', {bubbles: !0, cancelable: !0}), s.to = e, s.from = t, s.dragged = n, s.draggedRect = o, s.related = i || e, s.relatedRect = r || Mt(e), s.willInsertAfter = l, s.originalEvent = a, t.dispatchEvent(s), h && (c = h.call(d, s, a)), c;
  }

  function L(t) {t.draggable = !1;}

  function Tt() {gt = !1;}

  function W(t, e, n)
  {
    for (var o = 0, i = 0, r = t.children; i < r.length;) {
      if ('none' !== r[i].style.display && r[i] !== G && r[i] !== V && yt(r[i], n.draggable, t, !1)) {
        if (o === e) return r[i];
        o++;
      }
      i++;
    }
    return null;
  }

  function Et(t)
  {
    var e = t.lastElementChild;
    return e === G && (e = t.children[t.childElementCount - 2]), e || null;
  }

  function F(t)
  {
    for (var e = t.tagName + t.className + t.src + t.href + t.textContent, n = e.length, o = 0; n--;) {o += e.charCodeAt(n);}
    return o.toString(36);
  }

  function xt(t, e)
  {
    var n = 0;
    if (!t || !t.parentNode) return -1;
    for (; t && (t = t.previousElementSibling);) {'TEMPLATE' !== t.nodeName.toUpperCase() && t !== u && n++;}
    return n;
  }

  function z(t, e)
  {
    if (t) {
      try {
        if (t.matches) return t.matches(e);
        if (t.msMatchesSelector) return t.msMatchesSelector(e);
        if (t.webkitMatchesSelector) return t.webkitMatchesSelector(e);
      } catch (t) {return !1;}
    }
    return !1;
  }

  function j(n, o)
  {
    return function() {
      if (!N) {
        var t = arguments, e = this;
        N = ft(function() {1 === t.length ? n.call(e, t[0]) : n.apply(e, t), N = void 0;}, o);
      }
    };
  }

  function U(t, e)
  {
    if (t && e) {for (var n in e) {e.hasOwnProperty(n) && (t[n] = e[n]);}}
    return t;
  }

  function Nt(t) {return n && n.dom ? n.dom(t).cloneNode(!0) : e ? e(t).clone(!0)[0] : t.cloneNode(!0);}

  function Xt(t) {return ft(t, 0);}

  function Yt(t) {return clearTimeout(t);}

  function Mt(t, e, n)
  {
    if (t.getBoundingClientRect || t === ht) {
      var o, i, r, a, l, s, c;
      if (c = t !== ht ? (i = (o = t.getBoundingClientRect()).top, r = o.left, a = o.bottom, l = o.right, s = o.height, o.width) : (r = i = 0, a = window.innerHeight, l = window.innerWidth, s = window.innerHeight, window.innerWidth), n && t !== ht) {
        if (e = e || t.parentNode, !pt) {
          do {
            if (e && e.getBoundingClientRect && 'none' !== B(e, 'transform')) {
              var d = e.getBoundingClientRect();
              i -= d.top + g(B(e, 'border-top-width')), r -= d.left + g(B(e, 'border-left-width')), a = i + o.height, l = r + o.width;
              break;
            }
          } while (e = e.parentNode);
        }
        var h = H(t), u = h && h.a, f = h && h.d;
        h && (a = (i /= f) + (s /= f), l = (r /= u) + (c /= u));
      }
      return {top: i, left: r, bottom: a, right: l, width: c, height: s};
    }
  }

  return ut.addEventListener('dragover', t), ut.addEventListener('mousemove', t), _t.prototype = {
    constructor: _t, _computeIsAligned: function(t) {
      var e;
      if (G && !b ? (E(), e = ut.elementFromPoint(t.clientX, t.clientY), x()) : e = t.target, e = yt(e, this.options.draggable, this.el, !1), !w && V && V.parentNode === this.el) {
        for (var n, o, i, r, a, l, s, c, d = this.el.children, h = 0; h < d.length; h++) {yt(d[h], this.options.draggable, this.el, !1) && d[h] !== e && (d[h].sortableMouseAligned = (n = t.clientX, o = t.clientY, i = d[h], r = this._getDirection(t, null), this.options, void 0, a = Mt(i), l = 'vertical' === r ? a.left : a.top, s = 'vertical' === r ? a.right : a.bottom, l < (c = 'vertical' === r ? n : o) && c < s));}
        yt(e, this.options.draggable, this.el, !0) || (et = null), w = !0, ft(function() {w = !1;}, 30);
      }
    }, _getDirection: function(t, e) {return 'function' == typeof this.options.direction ? this.options.direction.call(this, t, e, V) : this.options.direction;}, _onTapStart: function(t) {
      if (t.cancelable) {
        var e, n = this, o = this.el, i = this.options, r = i.preventOnFilter, a = t.type, l = t.touches && t.touches[0], s = (l || t).target, c = t.target.shadowRoot && (t.path && t.path[0] || t.composedPath && t.composedPath()[0]) || s, d = i.filter;
        if (function(t) {
          y.length = 0;
          var e = t.getElementsByTagName('input'), n = e.length;
          for (; n--;) {
            var o = e[n];
            o.checked && y.push(o);
          }
        }(o), (!pt || t.artificialBubble || bt(o, s)) && !V && !(/mousedown|pointerdown/.test(a) && 0 !== t.button || i.disabled || c.isContentEditable)) {
          if (s = yt(s, i.draggable, o, !1)) {
            if (h !== s) {
              if (e = xt(s, i.draggable), 'function' == typeof d) {if (d.call(this, t, s, this)) return Ct(n, c, 'filter', s, o, o, e), void (r && t.cancelable && t.preventDefault());} else if (d && (d = d.split(',').some(function(t) {if (t = yt(c, t.trim(), o, !1)) return Ct(n, t, 'filter', s, o, o, e), !0;}))) return void (r && t.cancelable && t.preventDefault());
              i.handle && !yt(c, i.handle, o, !1) || this._prepareDragStart(t, l, s, e);
            }
          } else {pt && wt(o, t, '_onTapStart');}
        }
      }
    }, _handleAutoScroll: function(e, n) {
      if (V && this.options.scroll) {
        var o = e.clientX, i = e.clientY, t = ut.elementFromPoint(o, i), r = this;
        if (n || v || pt) {
          C(e, r.options, t, n);
          var a = mt(t, !0);
          !at || l && o === s && i === c || (l && clearInterval(l), l = setInterval(function() {
            if (V) {
              var t = mt(ut.elementFromPoint(o, i), !0);
              t !== a && (a = t, A(), C(e, r.options, a, n));
            }
          }, 10), s = o, c = i);
        } else {
          if (!r.options.bubbleScroll || mt(t, !0) === window) return void A();
          C(e, r.options, mt(t, !1), !1);
        }
      }
    }, _prepareDragStart: function(t, e, n, o) {
      var i, r = this, a = r.el, l = r.options, s = a.ownerDocument;
      n && !V && n.parentNode === a && (K = a, q = (V = n).parentNode, Z = V.nextSibling, h = n, J = l.group, Q = o, f = {target: V, clientX: (e || t).clientX, clientY: (e || t).clientY}, this._lastX = (e || t).clientX, this._lastY = (e || t).clientY, V.style['will-change'] = 'all', V.style.transition = '', V.style.transform = '', i = function() {r._disableDelayedDrag(), V.draggable = r.nativeDraggable, r._triggerDragStart(t, e), Ct(r, K, 'choose', V, K, K, Q), Dt(V, l.chosenClass, !0);}, l.ignore.split(',').forEach(function(t) {R(V, t.trim(), L);}), l.supportPointer ? (X(s, 'pointerup', r._onDrop), X(s, 'pointercancel', r._onDrop)) : (X(s, 'mouseup', r._onDrop), X(s, 'touchend', r._onDrop), X(s, 'touchcancel', r._onDrop)), l.delay ? (X(s, 'mouseup', r._disableDelayedDrag), X(s, 'touchend', r._disableDelayedDrag), X(s, 'touchcancel', r._disableDelayedDrag), X(s, 'mousemove', r._delayedDragTouchMoveHandler), X(s, 'touchmove', r._delayedDragTouchMoveHandler), l.supportPointer &&
      X(s, 'pointermove', r._delayedDragTouchMoveHandler), r._dragStartTimer = ft(i, l.delay)) : i());
    }, _delayedDragTouchMoveHandler: function(t) {
      var e = t.touches ? t.touches[0] : t;
      _(vt(e.clientX - this._lastX), vt(e.clientY - this._lastY)) >= this.options.touchStartThreshold && this._disableDelayedDrag();
    }, _disableDelayedDrag: function() {
      var t = this.el.ownerDocument;
      clearTimeout(this._dragStartTimer), O(t, 'mouseup', this._disableDelayedDrag), O(t, 'touchend', this._disableDelayedDrag), O(t, 'touchcancel', this._disableDelayedDrag), O(t, 'mousemove', this._delayedDragTouchMoveHandler), O(t, 'touchmove', this._delayedDragTouchMoveHandler), O(t, 'pointermove', this._delayedDragTouchMoveHandler);
    }, _triggerDragStart: function(t, e) {
      e = e || ('touch' == t.pointerType ? t : null), !this.nativeDraggable || e ? this.options.supportPointer ? X(ut, 'pointermove', this._onTouchMove) : X(ut, e ? 'touchmove' : 'mousemove', this._onTouchMove) : (X(V, 'dragend', this), X(K, 'dragstart', this._onDragStart));
      try {ut.selection ? Xt(function() {ut.selection.empty();}) : window.getSelection().removeAllRanges();} catch (t) {}
    }, _dragStarted: function(t) {
      if (p = !1, K && V) {
        this.nativeDraggable && (X(ut, 'dragover', this._handleAutoScroll), X(ut, 'dragover', T));
        var e = this.options;
        !t && Dt(V, e.dragClass, !1), Dt(V, e.ghostClass, !0), B(V, 'transform', ''), _t.active = this, t && this._appendGhost(), Ct(this, K, 'start', V, K, K, Q);
      } else {this._nulling();}
    }, _emulateDragOver: function(t) {
      if (P) {
        if (this._lastX === P.clientX && this._lastY === P.clientY && !t) return;
        this._lastX = P.clientX, this._lastY = P.clientY, E();
        for (var e = ut.elementFromPoint(P.clientX, P.clientY), n = e; e && e.shadowRoot;) {n = e = e.shadowRoot.elementFromPoint(P.clientX, P.clientY);}
        if (n) {
          do {
            if (n[dt]) if (n[dt]._onDragOver({clientX: P.clientX, clientY: P.clientY, target: e, rootEl: n}) && !this.options.dragoverBubble) break;
            e = n;
          } while (n = n.parentNode);
        }
        V.parentNode[dt]._computeIsAligned(P), x();
      }
    }, _onTouchMove: function(t) {
      if (f) {
        if (!t.cancelable) return;
        var e = this.options, n = e.fallbackTolerance, o = e.fallbackOffset, i = t.touches ? t.touches[0] : t, r = G && H(G), a = G && r && r.a, l = G && r && r.d, s = (i.clientX - f.clientX + o.x) / (a || 1), c = (i.clientY - f.clientY + o.y) / (l || 1), d = t.touches ? 'translate3d(' + s + 'px,' + c + 'px,0)' : 'translate(' + s + 'px,' + c + 'px)';
        if (!_t.active && !p) {
          if (n && _(vt(i.clientX - this._lastX), vt(i.clientY - this._lastY)) < n) return;
          this._onDragStart(t, !0);
        }
        this._handleAutoScroll(i, !0), tt = !0, P = i, B(G, 'webkitTransform', d), B(G, 'mozTransform', d), B(G, 'msTransform', d), B(G, 'transform', d), t.cancelable && t.preventDefault();
      }
    }, _appendGhost: function() {
      if (!G) {
        var t = Mt(V, this.options.fallbackOnBody ? ut.body : K, !0), e = (B(V), this.options);
        Dt(G = V.cloneNode(!0), e.ghostClass, !1), Dt(G, e.fallbackClass, !0), Dt(G, e.dragClass, !0), B(G, 'box-sizing', 'border-box'), B(G, 'margin', 0), B(G, 'top', t.top), B(G, 'left', t.left), B(G, 'width', t.width), B(G, 'height', t.height), B(G, 'opacity', '0.8'), B(G, 'position', 'fixed'), B(G, 'zIndex', '100000'), B(G, 'pointerEvents', 'none'), e.fallbackOnBody && ut.body.appendChild(G) || K.appendChild(G);
      }
    }, _onDragStart: function(t, e) {
      var n = this, o = t.dataTransfer, i = n.options;
      (u = Nt(V)).draggable = !1, u.style['will-change'] = '', this._hideClone(), Dt(u, n.options.chosenClass, !1), n._cloneId = Xt(function() {n.options.removeCloneOnHide || K.insertBefore(u, V), Ct(n, K, 'clone', V);}), !e && Dt(V, i.dragClass, !0), e ? (lt = !0, n._loopId = setInterval(n._emulateDragOver, 50)) : (O(ut, 'mouseup', n._onDrop), O(ut, 'touchend', n._onDrop), O(ut, 'touchcancel', n._onDrop), O(ut, 'pointercancel', n._onDrop), o && (o.effectAllowed = 'move', i.setData && i.setData.call(n, o, V)), X(ut, 'drop', n), B(V, 'transform', 'translateZ(0)')), p = !0, n._dragStartId = Xt(n._dragStarted.bind(n, e)), X(ut, 'selectstart', n);
    }, _onDragOver: function(t) {
      var e, n, o, i = this.el, r = t.target, a = this.options, l = a.group, s = _t.active, c = J === l, d = a.sort, h = this;
      if (!gt && (!pt || t.rootEl || t.artificialBubble || bt(i, r))) {
        if (void 0 !== t.preventDefault && t.cancelable && t.preventDefault(), tt = !0, r = yt(r, a.draggable, i, !0), yt(t.target, null, V, !0) || r.animated) return j();
        if (r !== V && (lt = !1), s && !a.disabled && (c ? d || (o = !K.contains(V)) : $ === this || (this.lastPutMode = J.checkPull(this, s, V, t)) && l.checkPut(this, s, V, t))) {
          var u = this._getDirection(t, r);
          if (e = Mt(V), o) return this._hideClone(), q = K, Z ? K.insertBefore(V, Z) : K.appendChild(V), j();
          if (0 === i.children.length || i.children[0] === G || (O = t, B = u, H = Mt(Et(i)), R = 'vertical' === B ? O.clientY : O.clientX, L = 'vertical' === B ? O.clientX : O.clientY, W = 'vertical' === B ? H.bottom : H.right, F = 'vertical' === B ? H.left : H.top, z = 'vertical' === B ? H.right : H.bottom, F < L && L < z && W < R && !V.animated)) {if (0 !== i.children.length && i.children[0] !== G && i === t.target && (r = Et(i)), r && (n = Mt(r)), c ? s._hideClone() : s._showClone(this), !1 !== St(K, i, V, e, r, n, t, !!r)) return i.appendChild(V), q = i, rt = null, U(), this._animate(e, V), r && this._animate(n, r), j();} else if (r && r !== V && void 0 !== r.parentNode[dt] && r !== i) {
            var f, p = 0, g = r.sortableMouseAligned, v = V.parentNode !== i, m = function(t, e) {
              var n = mt(n, !0), o = Mt(t)[e];
              for (; n;) {
                var i = Mt(n)[e];
                if (!('top' === e || 'left' === e ? i <= o : o <= i)) return !0;
                if (n === ht) break;
                n = mt(n, !1);
              }
              return !1;
            }(r, 'vertical' === u ? 'top' : 'left');
            if (et !== r && (ot = null, f = Mt(r)['vertical' === u ? 'top' : 'left'], st = !1), E = r, x = u, N = (T = V) === V && rt || Mt(T), X = E === V && rt || Mt(E), Y = 'vertical' === x ? N.left : N.top, M = 'vertical' === x ? N.right : N.bottom, k = 'vertical' === x ? N.width : N.height, P = 'vertical' === x ? X.left : X.top, I = 'vertical' === x ? X.right : X.bottom, A = 'vertical' === x ? X.width : X.height, ot = (Y === P || M === I || Y + k / 2 === P + A / 2) && g || v || m || a.invertSwap || 'insert' === ot || 'swap' === ot ? ('swap' !== ot && (ct = a.invertSwap || v || at || m), p = function(t, e, n, o, i, r, a) {
              var l = Mt(e), s = 'vertical' === n ? t.clientY : t.clientX, c = 'vertical' === n ? l.height : l.width, d = 'vertical' === n ? l.top : l.left, h = 'vertical' === n ? l.bottom : l.right, u = Mt(V), f = !1;
              if (!r) {
                if (a && it < c * o) {
                  if (!st && (1 === nt ? d + c * i / 2 < s : s < h - c * i / 2) && (st = !0), st) {f = !0;} else {
                    'vertical' === n ? u.top : u.left, 'vertical' === n ? u.bottom : u.right;
                    if (1 === nt ? s < d + it : h - it < s) return -1 * nt;
                  }
                } else if (d + c * (1 - o) / 2 < s && s < h - c * (1 - o) / 2) return d + c / 2 < s ? -1 : 1;
              }
              if ((f = f || r) && (s < d + c * i / 2 || h - c * i / 2 < s)) return d + c / 2 < s ? 1 : -1;
              return 0;
            }(t, r, u, a.swapThreshold, null == a.invertedSwapThreshold ? a.swapThreshold : a.invertedSwapThreshold, ct, et === r), 'swap') : (y = r, C = xt(V, (D = a).draggable), S = xt(y, D.draggable), p = C < S ? 1 : -1, 'insert'), 0 === p) {return j();}
            rt = null, nt = p, n = Mt(et = r);
            var b = r.nextElementSibling, w = !1, _ = St(K, i, V, e, r, n, t, w = 1 === p);
            if (!1 !== _) return 1 !== _ && -1 !== _ || (w = 1 === _), gt = !0, ft(Tt, 30), c ? s._hideClone() : s._showClone(this), w && !b ? i.appendChild(V) : r.parentNode.insertBefore(V, w ? b : r), q = V.parentNode, void 0 === f || ct || (it = vt(f - Mt(r)['vertical' === u ? 'top' : 'left'])), U(), !v && this._animate(n, r), this._animate(e, V), j();
          }
          if (i.contains(V)) return j();
        }
        var y, D, C, S, T, E, x, N, X, Y, M, k, P, I, A, O, B, H, R, L, W, F, z;
        return pt && !t.rootEl && wt(i, t, '_onDragOver'), !1;
      }

      function j() {return s && (Dt(V, $ ? $.options.ghostClass : s.options.ghostClass, !1), Dt(V, a.ghostClass, !0)), $ !== h && h !== _t.active ? $ = h : h === _t.active && ($ = null), (r === V && !V.animated || r === i && !r.animated) && (et = null), a.dragoverBubble || t.rootEl || r === ut || (h._handleAutoScroll(t), V.parentNode[dt]._computeIsAligned(t)), !a.dragoverBubble && t.stopPropagation && t.stopPropagation(), !0;}

      function U() {Ct(h, K, 'change', r, i, K, Q, xt(V, a.draggable), t);}
    }, _animate: function(t, e) {
      var n = this.options.animation;
      if (n) {
        var o = Mt(e);
        if (e === V && (rt = o), 1 === t.nodeType && (t = Mt(t)), t.left + t.width / 2 !== o.left + o.width / 2 || t.top + t.height / 2 !== o.top + o.height / 2) {
          var i = H(this.el), r = i && i.a, a = i && i.d;
          B(e, 'transition', 'none'), B(e, 'transform', 'translate3d(' + (t.left - o.left) / (r || 1) + 'px,' + (t.top - o.top) / (a || 1) + 'px,0)'), e.offsetWidth, B(e, 'transition', 'transform ' + n + 'ms' + (this.options.easing ? ' ' + this.options.easing : '')), B(e, 'transform', 'translate3d(0,0,0)');
        }
        'number' == typeof e.animated && clearTimeout(e.animated), e.animated = ft(function() {B(e, 'transition', ''), B(e, 'transform', ''), e.animated = !1;}, n);
      }
    }, _offUpEvents: function() {
      var t = this.el.ownerDocument;
      O(ut, 'touchmove', this._onTouchMove), O(ut, 'pointermove', this._onTouchMove), O(t, 'mouseup', this._onDrop), O(t, 'touchend', this._onDrop), O(t, 'pointerup', this._onDrop), O(t, 'touchcancel', this._onDrop), O(t, 'pointercancel', this._onDrop), O(ut, 'selectstart', this);
    }, _onDrop: function(t) {
      var e = this.el, n = this.options;
      st = ct = at = p = !1, clearInterval(this._loopId), clearInterval(l), A(), clearTimeout(N), N = void 0, clearTimeout(this._dragStartTimer), Yt(this._cloneId), Yt(this._dragStartId), O(ut, 'mousemove', this._onTouchMove), this.nativeDraggable && (O(ut, 'drop', this), O(e, 'dragstart', this._onDragStart), O(ut, 'dragover', this._handleAutoScroll), O(ut, 'dragover', T)), this._offUpEvents(), t &&
      (tt && (t.cancelable && t.preventDefault(), !n.dropBubble && t.stopPropagation()), G && G.parentNode && G.parentNode.removeChild(G), (K === q || $ && 'clone' !== $.lastPutMode) && u && u.parentNode && u.parentNode.removeChild(u), V && (this.nativeDraggable && O(V, 'dragend', this), L(V), V.style['will-change'] = '', Dt(V, $ ? $.options.ghostClass : this.options.ghostClass, !1), Dt(V, this.options.chosenClass, !1), Ct(this, K, 'unchoose', V, q, K, Q, null, t), K !== q ? (0 <= (o = xt(V, n.draggable)) && (Ct(null, q, 'add', V, q, K, Q, o, t), Ct(this, K, 'remove', V, q, K, Q, o, t), Ct(null, q, 'sort', V, q, K, Q, o, t), Ct(this, K, 'sort', V, q, K, Q, o, t)), $ && $.save()) : V.nextSibling !== Z && 0 <= (o = xt(V, n.draggable)) && (Ct(this, K, 'update', V, q, K, Q, o, t), Ct(this, K, 'sort', V, q, K, Q, o, t)), _t.active && (null != o && -1 !== o || (o = Q), Ct(this, K, 'end', V, q, K, Q, o, t), this.save()))), this._nulling();
    }, _nulling: function() {K = V = q = G = Z = u = h = Y = M = I.length = l = s = c = f = P = tt = o = Q = et = nt = rt = $ = J = _t.active = null, y.forEach(function(t) {t.checked = !0;}), y.length = 0;}, handleEvent: function(t) {
      switch (t.type) {
        case'drop':
        case'dragend':
          this._onDrop(t);
          break;
        case'dragenter':
        case'dragover':
          V && (this._onDragOver(t), function(t) {
            t.dataTransfer && (t.dataTransfer.dropEffect = 'move');
            t.cancelable && t.preventDefault();
          }(t));
          break;
        case'selectstart':
          t.preventDefault();
      }
    }, toArray: function() {
      for (var t, e = [], n = this.el.children, o = 0, i = n.length, r = this.options; o < i; o++) {yt(t = n[o], r.draggable, this.el, !1) && e.push(t.getAttribute(r.dataIdAttr) || F(t));}
      return e;
    }, sort: function(t) {
      var o = {}, i = this.el;
      this.toArray().forEach(function(t, e) {
        var n = i.children[e];
        yt(n, this.options.draggable, i, !1) && (o[t] = n);
      }, this), t.forEach(function(t) {o[t] && (i.removeChild(o[t]), i.appendChild(o[t]));});
    }, save: function() {
      var t = this.options.store;
      t && t.set && t.set(this);
    }, closest: function(t, e) {return yt(t, e || this.options.draggable, this.el, !1);}, option: function(t, e) {
      var n = this.options;
      if (void 0 === e) return n[t];
      n[t] = e, 'group' === t && S(n);
    }, destroy: function() {
      var t = this.el;
      t[dt] = null, O(t, 'mousedown', this._onTapStart), O(t, 'touchstart', this._onTapStart), O(t, 'pointerdown', this._onTapStart), this.nativeDraggable && (O(t, 'dragover', this), O(t, 'dragenter', this)), Array.prototype.forEach.call(t.querySelectorAll('[draggable]'), function(t) {t.removeAttribute('draggable');}), this._onDrop(), d.splice(d.indexOf(this.el), 1), this.el = t = null;
    }, _hideClone: function() {u.cloneHidden || (B(u, 'display', 'none'), u.cloneHidden = !0, u.parentNode && this.options.removeCloneOnHide && u.parentNode.removeChild(u));}, _showClone: function(t) {'clone' === t.lastPutMode ? u.cloneHidden && (K.contains(V) && !this.options.group.revertClone ? K.insertBefore(u, V) : Z ? K.insertBefore(u, Z) : K.appendChild(u), this.options.group.revertClone && this._animate(V, u), B(u, 'display', ''), u.cloneHidden = !1) : this._hideClone();}
  }, X(ut, 'touchmove', function(t) {(_t.active || p) && t.cancelable && t.preventDefault();}), _t.utils = {on: X, off: O, css: B, find: R, is: function(t, e) {return !!yt(t, e, t, !1);}, extend: U, throttle: j, closest: yt, toggleClass: Dt, clone: Nt, index: xt, nextTick: Xt, cancelNextTick: Yt, detectDirection: D, getChild: W}, _t.create = function(t, e) {return new _t(t, e);}, _t.version = '1.8.1', _t;
});