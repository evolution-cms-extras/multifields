Multifields.element('table', {
  class: 'Multifields\\Elements\\Table\\Table',
  el: null,
  menu: null,
  target: null,

  draggable: function(el) {
    let tbody = el.querySelector('tbody');
    if (tbody) {
      Sortable.create(tbody, {
        animation: 0,
        draggable: 'tr',
        dragClass: 'mf-drag',
        ghostClass: 'mf-active',
        selectedClass: 'mf-selected',
        handle: '.mf-actions-move',
        forceFallback: false,
        onEnd: Multifields.elements.table.setIndexes
      });
    }
  },

  build: function(el, item) {
    item.items = {};
    let els = el.querySelector('.table thead');
    if (els && els.rows) {
      item.items['thead'] = {
        type: 'table:head',
        items: Multifields.elements.table.rows(els.rows, true)
      };
    }
    els = el.querySelector('.table tbody');
    if (els && els.rows) {
      item.items['tbody'] = {
        type: 'table:body',
        items: Multifields.elements.table.rows(els.rows, false)
      };
    }
    return item;
  },

  rows: function(rows, thead) {
    let data = [];
    [...rows].map(function(row, rowIndex) {
      data[rowIndex] = {
        type: 'table:row',
        name: row.dataset.name,
        items: []
      };
      [...row.cells].map(function(cell) {
        let el = cell.querySelector('.col');
        if (el && el.dataset.type) {
          data[rowIndex]['items'].push({
            type: thead ? 'table:th' : 'table:td',
            items: [
              {
                type: thead ? cell.dataset.type : el.dataset.type,
                name: el.dataset.name,
                value: el.querySelector('input').value
              }
            ]
          });
        }
      });
    });
    return data;
  },

  actionAddRow: function(e) {
    let el = e.target.closest('tr'), clone;
    clone = Multifields.clone(true, el);
    el.after(clone);
    Multifields.elements.table.setIndexes();
  },

  actionDelRow: function(e) {
    let el = e.target.closest('tr');
    if (el.parentElement.rows.length === 1) {
      Multifields.elements.table.actionAddRow(e);
    }
    el.parentElement.removeChild(el);
    Multifields.elements.table.setIndexes();
  },

  columnMenu: function(e) {
    e.stopPropagation();
    Multifields.elements.table.el = e.target.closest('.mf-table');
    Multifields.elements.table.menu = Multifields.elements.table.el.querySelector('.mf-column-menu');
    if (Multifields.elements.table.menu) {
      Multifields.elements.table.menu.querySelectorAll('.selected').forEach(function(el) {
        el.classList.remove('selected');
      });
      Multifields.elements.table.menu.style.left = e.target.parentElement.offsetLeft + e.target.parentElement.offsetWidth + 'px';
      if (Multifields.elements.table.target === e.target.parentElement) {
        Multifields.elements.table.menu.classList.toggle('open');
      } else {
        Multifields.elements.table.menu.classList.add('open');
      }
      Multifields.elements.table.target = e.target.parentElement;
      if (Multifields.elements.table.target.dataset['type'] === 'id') {
        [...Multifields.elements.table.menu.children].map(function(el) {
          if (el.dataset['action'] !== 'addColumn') {
            el.style.display = 'none';
          }
        });
      } else {
        [...Multifields.elements.table.menu.children].map(function(el) {
          if (el.dataset['action'] !== 'addColumn') {
            el.style.display = 'block';
          }
        });
      }
      let el = Multifields.elements.table.menu.querySelector('[data-type="' + Multifields.elements.table.target.dataset['type'] + '"]');
      if (el) {
        el.classList.add('selected');
      }
    }
  },

  addColumn: function(e) {
    let tbody = Multifields.el.querySelector('tbody');
    Multifields.elements.table.target.after(Multifields.clone(true, Multifields.elements.table.target));
    [...tbody.rows].map(function(row) {
      row.cells[Multifields.elements.table.target.cellIndex].after(Multifields.clone(true, row.cells[Multifields.elements.table.target.cellIndex]));
    });
  },

  delColumn: function(e) {
    if (Multifields.elements.table.target.parentElement.cells.length < 5) {
      Multifields.elements.table.addColumn();
    }
    Multifields.el.querySelectorAll('tbody tr').forEach(function(row) {
      row.cells[Multifields.elements.table.target.cellIndex].parentElement.removeChild(row.cells[Multifields.elements.table.target.cellIndex]);
    });
    Multifields.elements.table.target.parentElement.removeChild(Multifields.elements.table.target);
  },

  setType: function(e, type) {
    if (type === 'number' && !confirm('If you select the "Number" type, you may lose text data.')) {
      return;
    }

    let id = Multifields.uniqid();

    Multifields.getAction({
      action: 'getElementByType',
      class: this.class,
      type: type,
      name: Multifields.elements.table.target.querySelector('.col').dataset['name'],
      id: id
    }, function(data) {
      Multifields.elements.table.target.dataset['type'] = type;
      Multifields.elements.table.el.querySelectorAll('tbody tr').forEach(function(row, i) {
        let _input = row.cells[Multifields.elements.table.target.cellIndex].querySelector('input'),
            input;
        row.cells[Multifields.elements.table.target.cellIndex].innerHTML = data.html.replace(new RegExp(id, 'g'), id + '_' + i);
        input = row.cells[Multifields.elements.table.target.cellIndex].querySelector('input');
        input.value = _input.value;
        if (type === 'date') {
          format = input.dataset['format'];
          new DatePicker(input, {
            yearOffset: dpOffset,
            format: format !== null ? format : dpformat,
            dayNames: dpdayNames,
            monthNames: dpmonthNames,
            startDay: dpstartDay
          });
        }
      });
    });
  },

  setIndexes: function() {
    Multifields.el.querySelectorAll('td[data-type="id"]').forEach(function(cell, i) {
      cell.querySelector('input').value = (i + 1).toString();
    });
  }
});
