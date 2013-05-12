Ext.UpdateManager.defaults.indicatorText = '<div class="loading-indicator">加载中...</div>';

if (Ext.DataView) {
    Ext.DataView.prototype.emptyText = "";
}

if (Ext.grid.GridPanel) {
    Ext.grid.GridPanel.prototype.ddText = "选择了 {0} 行";
}

//if(Ext.TabPanelItem){
//    Ext.TabPanelItem.prototype.closeText = "关闭此标签";
//}

if (Ext.form.Field) {
    Ext.form.Field.prototype.invalidText = "输入值非法";
}

if (Ext.LoadMask) {
    Ext.LoadMask.prototype.msg = "读取中...";
}

Date.monthNames = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月"
];


Date.monthNumbers = {
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 3,
    "5": 4,
    "6": 5,
    "7": 6,
    "8": 7,
    "9": 8,
    "10": 9,
    "11": 10,
    "12": 11
};
Date.getShortMonthName = function (month) {
    return "" + (month + 1);
};
Date.getMonthNumber = function (name) {
    return Date.monthNumbers[name.substring(0, name.length - 1)];
};

Date.dayNames = [
    "日",
    "一",
    "二",
    "三",
    "四",
    "五",
    "六"
];

Date.formatCodes.a = "(this.getHours() < 12 ? '上午' : '下午')";
Date.formatCodes.A = "(this.getHours() < 12 ? '上午' : '下午')";

if (Ext.MessageBox) {
    Ext.MessageBox.buttonText = {
        ok: "确定",
        cancel: "取消",
        yes: "是",
        no: "否"
    };
}

if (Ext.util.Format) {
    Ext.util.Format.date = function (v, format) {
        if (!v) return "";
        if (!(v instanceof Date)) v = new Date(Date.parse(v));
        return v.dateFormat(format || "Y-m-d");
    };
}

if (Ext.DatePicker) {
    Ext.apply(Ext.DatePicker.prototype, {
        todayText: "今天",
        minText: "日期必须大于最小允许日期",
        maxText: "日期必须小于最大允许日期",
        disabledDaysText: "",
        disabledDatesText: "",
        monthNames: Date.monthNames,
        dayNames: Date.dayNames,
        nextText: '下个月 (Ctrl+Right)',
        prevText: '上个月 (Ctrl+Left)',
        monthYearText: '选择一个月 (Control+Up/Down 来改变年份)',
        todayTip: "{0} (空格键选择)",
        format: "Y-m-d",
        okText: "确定",
        cancelText: "取消"
    });
}

if (Ext.PagingToolbar) {
    Ext.apply(Ext.PagingToolbar.prototype, {
        beforePageText: "第",
        afterPageText: "页,共 {0} 页",
        firstText: "第一页",
        prevText: "上一页",
        nextText: "下一页",
        lastText: "最后页",
        refreshText: "刷新",
        displayMsg: "显示 {0} - {1}条，共 {2} 条",
        emptyMsg: '没有数据'
    });
}

if (Ext.form.TextField) {
    Ext.apply(Ext.form.TextField.prototype, {
        minLengthText: "该输入项的最小长度是 {0} 个字符",
        maxLengthText: "该输入项的最大长度是 {0} 个字符",
        blankText: "该输入项不能为空",
        regexText: "",
        emptyText: null
    });
}

if (Ext.form.NumberField) {
    Ext.apply(Ext.form.NumberField.prototype, {
        minText: "该输入项的最小值是 {0}",
        maxText: "该输入项的最大值是 {0}",
        nanText: "{0} 不是有效数值"
    });
}

if (Ext.form.DateField) {
    Ext.apply(Ext.form.DateField.prototype, {
        disabledDaysText: "禁用",
        disabledDatesText: "禁用",
        minText: "该输入项的日期必须在 {0} 之后",
        maxText: "该输入项的日期必须在 {0} 之前",
        invalidText: "{0} 是无效的日期 - 必须符合格式： {1}",
        format: "Y年m月d日"
    });
}

if (Ext.form.ComboBox) {
    Ext.apply(Ext.form.ComboBox.prototype, {
        loadingText: "加载中...",
        valueNotFoundText: undefined
    });
}

if (Ext.form.VTypes) {
    Ext.apply(Ext.form.VTypes, {
        emailText: '该输入项必须是电子邮件地址，格式如： "user@domain.com"',
        urlText: '该输入项必须是URL地址，格式如： "http:/' + '/www.domain.com"',
        alphaText: '该输入项只能包含半角字母和_',
        alphanumText: '该输入项只能包含半角字母,数字和_'
    });
}

if (Ext.form.HtmlEditor) {
    Ext.apply(Ext.form.HtmlEditor.prototype, {
        createLinkText: '添加超级链接:',
        buttonTips: {
            bold: {
                title: '粗体 (Ctrl+B)',
                text: '将选中的文字设置为粗体',
                cls: 'x-html-editor-tip'
            },
            italic: {
                title: '斜体 (Ctrl+I)',
                text: '将选中的文字设置为斜体',
                cls: 'x-html-editor-tip'
            },
            underline: {
                title: '下划线 (Ctrl+U)',
                text: '给所选文字加下划线',
                cls: 'x-html-editor-tip'
            },
            increasefontsize: {
                title: '增大字体',
                text: '增大字号',
                cls: 'x-html-editor-tip'
            },
            decreasefontsize: {
                title: '缩小字体',
                text: '减小字号',
                cls: 'x-html-editor-tip'
            },
            backcolor: {
                title: '以不同颜色突出显示文本',
                text: '使文字看上去像是用荧光笔做了标记一样',
                cls: 'x-html-editor-tip'
            },
            forecolor: {
                title: '字体颜色',
                text: '更改字体颜色',
                cls: 'x-html-editor-tip'
            },
            justifyleft: {
                title: '左对齐',
                text: '将文字左对齐',
                cls: 'x-html-editor-tip'
            },
            justifycenter: {
                title: '居中',
                text: '将文字居中对齐',
                cls: 'x-html-editor-tip'
            },
            justifyright: {
                title: '右对齐',
                text: '将文字右对齐',
                cls: 'x-html-editor-tip'
            },
            insertunorderedlist: {
                title: '项目符号',
                text: '开始创建项目符号列表',
                cls: 'x-html-editor-tip'
            },
            insertorderedlist: {
                title: '编号',
                text: '开始创建编号列表',
                cls: 'x-html-editor-tip'
            },
            createlink: {
                title: '转成超级链接',
                text: '将所选文本转换成超级链接',
                cls: 'x-html-editor-tip'
            },
            sourceedit: {
                title: '代码视图',
                text: '以代码的形式展现文本',
                cls: 'x-html-editor-tip'
            }
        }
    });
}


if (Ext.grid.GridView) {
    Ext.apply(Ext.grid.GridView.prototype, {
        sortAscText: "升序",
        sortDescText: "降序",
        lockText: "锁定列",
        unlockText: "解除锁定",
        columnsText: "列"
    });
}

if (Ext.grid.PropertyColumnModel) {
    Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
        nameText: "名称",
        valueText: "值",
        dateFormat: "Y-m-d"
    });
}

if (Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion) {
    Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
        splitTip: "拖动来改变尺寸.",
        collapsibleSplitTip: "拖动来改变尺寸. 双击隐藏."
    });
}


Ext.override(Ext.form.Field, {
    onRender: Ext.form.Field.prototype.onRender.createSequence(function () {
        if (this.readOnly === true) {
            this.el.addClass('x-form-readonly');
        } else if (this.allowBlank === false) {
            this.el.addClass('x-form-required');
        }
    })
});

od.TreeLoader = Ext.extend(Ext.tree.TreeLoader, {
    processResponse: function (response, node, callback, scope) {
        var listResult = Ext.decode(response.responseText);
        if (listResult.root) {
            response.responseData = listResult.root;
        }
        od.TreeLoader.superclass.processResponse.apply(this,arguments);
    },
    load:function(node, callback, scope){
        var tree = node.getOwnerTree();
        if(tree && this.async){
            this.dataUrl = tree.dataUrl+'/'+node.id;
        }
        od.TreeLoader.superclass.load.apply(this,arguments);
    },
    getParams:function(node){
        var ret = od.TreeLoader.superclass.getParams.apply(this,arguments);
        delete ret[this.nodeParameter];
        return ret;
    }
});

od.TreePanel = Ext.extend(Ext.tree.TreePanel, {
    pidCode:'pid',
    indexCode:'seq',
    pathCode:'path',
    initComponent: function () {
        this.loader = new od.TreeLoader({
            baseParams:{
                pidCode:this.pidCode,
                indexCode:this.indexCode,
                pathCode:this.pathCode
            },
            async:this.async,
            dataUrl: this.dataUrl,
            requestMethod: this.requestMethod
        });
        od.TreePanel.superclass.initComponent.call(this);
        this.addEvents('selectionchange','beforenodeselect');
    },
    getSelectionModel : function(){
        if(!this.selModel){
            this.selModel = new Ext.tree.DefaultSelectionModel();
            this.selModel.on('selectionchange',this.onSelectionChange,this);
            this.selModel.on('beforeselect',this.onBeforeNodeSelect,this);
        }
        return this.selModel;
    },
    onSelectionChange:function(sm,node){
        this.fireEvent('selectionchange',this,node);
    },
    onBeforeNodeSelect:function(sm,node){
        this.fireEvent('beforenodeselect',this,node);
    }
});

Ext.reg('treepanel', od.TreePanel);

od.GroupingView = Ext.extend(Ext.grid.GroupingView, {
    doGroupStart: function (buf, g, cs, ds, colCount) {
        if (this.getExtGroupText) {
            g.text = this.getExtGroupText(g, cs, ds, colCount);
        }
        od.GroupingView.superclass.doGroupStart.call(this, buf, g, cs, ds, colCount);
    }
});

od.CheckboxSelectionModel = Ext.extend(Ext.grid.CheckboxSelectionModel, {
    getEditor: function () {
        return null;
    }
});

od.GridView = Ext.extend(Ext.grid.GridView, {
    getTotalWidth: function () {
        return (this.cm.getColumnCount() * 2 + this.cm.getTotalWidth()) + 'px';
    },
    onHeaderClick:function(g,i){
        od.GridView.superclass.onHeaderClick.apply(this,arguments);
        var c = this.cm.getColumnAt(i);
        if(c.xtype == 'checkcolumn'){
            var hd = Ext.fly(this.getHeaderCell(i));
            hd.toggleClass('check-all');
            var b=hd.hasClass('check-all');
            g.getStore().each(function(rec){
                rec.set(c.dataIndex, b);
            });
        }
    }
});

od.GridPanel = Ext.extend(Ext.grid.GridPanel, {
    rowNumberer: false,
    useGroupView: false,
    useRowEditor: false,
    showSummary: false,
    initComponent: function () {
        if (this.selectionModel == "CheckboxSelectionModel") {
            var chkSm = new od.CheckboxSelectionModel({
                checkOnly:this.selectCheckOnly ===  true
            });
            this.columns = [chkSm].concat(this.columns);
            this.selModel = chkSm;
            this.selModel.on('rowselect',this.rowSelect,this);
            this.selModel.on('rowdeselect',this.rowDeselect,this);
        } else if (this.rowNumberer) {
            var rowNum = new Ext.grid.RowNumberer();
            this.columns = [rowNum].concat(this.columns);
        }

        this.plugins = this.plugins || [];

        if (this.useRowEditor) {
            this.plugins.push(new Ext.ux.grid.RowEditor());
        }

        if (this.showSummary) {
            this.plugins.push(new Ext.ux.grid.GroupSummary());
        }

        this.store = Ext.StoreMgr.lookup(this.store);
        od.GridPanel.superclass.initComponent.call(this);
        this.addEvents('rowselect','rowdeselect');
    },
    rowSelect:function(sm,idx,rec){
        this.fireEvent('rowselect',this,idx,rec);
    },
    rowDeselect:function(sm,idx,rec){
        this.fireEvent('rowdeselect',this,idx,rec);
    },
    getSelectionModel: function () {
        if (!this.selModel) {
            if (this.selectionModel == "CellSelectionModel") {
                this.selModel = new Ext.grid.CellSelectionModel();
            }else{
                this.selModel = new Ext.grid.RowSelectionModel(this.disableSelection ? {selectRow: Ext.emptyFn} : null);
                this.selModel.on('rowselect',this.rowSelect,this);
                this.selModel.on('rowdeselect',this.rowDeselect,this);
            }
        }
        return this.selModel;
    },
    getViewConfig: function () {
        var viewConfigProps = ["autoFill", "forceFit", "markDirty", "enableRowBody", "selectedRowClass", "rowOverCls"];
        var ret = {};
        Ext.each(viewConfigProps, function (prop) {
            if (!Ext.isEmpty(this[prop])) {
                ret[prop] = this[prop];
                delete this[prop];
            }
        }, this);
        return ret;
    },
    getGroupViewConfig: function () {
        var ret = this.getViewConfig();
        var groupViewConfigProps = ["useGroupView", "cancelEditOnToggle", "emptyGroupText", "enableGrouping", "enableGroupingMenu", "groupByText", "enableNoGroups", "showGroupName", "startCollapsed", "showGroupsText", "ignorAdd", "hideGroupedColumn", "groupTextTpl", "groupMode", "getExtGroupText"];
        Ext.each(groupViewConfigProps, function (prop) {
            if (!Ext.isEmpty(this[prop])) {
                ret[prop] = this[prop];
                delete this[prop];
            }
        }, this);
        return ret;
    },
    getView: function () {
        if (!this.view) {
            if (this.useGroupView) {
                this.view = new od.GroupingView(this.getGroupViewConfig());
            } else {
                this.view = new od.GridView(this.getViewConfig());
            }
        }
        return this.view;
    }
});
Ext.reg('grid', od.GridPanel);

od.CheckboxGroup = Ext.extend(Ext.form.CheckboxGroup, {
    getValue: function () {
        var out = [];
        this.eachItem(function (item) {
            if (item.checked) {
                out.push(item.inputValue);
            }
        });
        return out.join(',');
    }
//    getName: function () {
//        if (this.items.items) {
//            for (var i = 0; i < this.items.items.length; i++) {
//                if (!Ext.isEmpty(this.items.items[i])) {
//                    if (this.items.items[i].getName) {
//                        var ret = this.items.items[i].getName();
//                        if (!Ext.isEmpty(ret)) {
//                            return ret;
//                        }
//                    }
//                }
//            }
//        }
//    }
});
Ext.reg('checkboxgroup', od.CheckboxGroup);
od.Checkbox = Ext.extend(Ext.form.Checkbox, {
    onClick: function () {
        if (this.readOnly == true || this.disabled) {
            return false;
        }
        od.Checkbox.superclass.onClick.call(this);
    }
});
Ext.reg('checkbox', od.Checkbox);
od.JsonGroupStore = Ext.extend(Ext.data.GroupingStore, {
    constructor: function (config) {
        od.JsonGroupStore.superclass.constructor.call(this, Ext.apply(config, {
            reader: new Ext.data.JsonReader(config)
        }));
    }
});
Ext.reg('jsongroupstore', od.JsonGroupStore);

od.PagingToolbar = Ext.extend(Ext.PagingToolbar, {
    displayInfo: true,
    showPageSizeCombo: false,
    pageSize: 20,
    initComponent: function () {
        if (this.showPageSizeCombo) {
            this.pageSizeCombo = new Ext.form.ComboBox({
                store: new Ext.data.ArrayStore({
                    fields: ['text', 'value'],
                    data: [
                        ['每页20行', 20],
                        ['每页50行', 50],
                        ['每页100行', 100],
                        ['每页300行', 300],
                        ['每页500行', 500],
                        ['每页1000行', 1000]
                    ]
                }),
                mode: 'local',
                displayField: 'text',
                valueField: 'value',
                forceSelection: true,
                triggerAction: 'all',
                selectOnFocus: true,
                width: 90,
                value: this.pageSize,
                editable: false,
                listeners: {
                    'select': function (me, record, idx) {
                        this.pageSize = record.data.value;
                        this.doLoad(0);
                    },
                    scope: this
                }
            });

            if (this.items) {
                this.items.push(this.pageSizeCombo);
            } else {
                this.items = [this.pageSizeCombo];
            }
        }
        od.PagingToolbar.superclass.initComponent.call(this);

        if (this.inputItem) {
            this.inputItem.width = 40;
        }
    },
    bindStore: function (store, initial) {
        od.PagingToolbar.superclass.bindStore.call(this, store, initial);
        if (this.store != null) {
            this.store.setBaseParam('start', 0);
            this.store.setBaseParam('limit', this.pageSize);
        }
    }
});
Ext.reg('paging', od.PagingToolbar);

Ext.form.ClearableComboBox = Ext.extend(Ext.form.ComboBox, {
    initComponent: function () {
        Ext.form.ClearableComboBox.superclass.initComponent.call(this);
        this.triggerConfig = {
            tag: 'span',
            cls: 'x-form-twin-triggers',
            style: 'padding-right:2px',
            cn: [
                {
                    tag: "img",
                    src: Ext.BLANK_IMAGE_URL,
                    cls: "x-form-trigger x-form-clear-trigger"
                },
                {
                    tag: "img",
                    src: Ext.BLANK_IMAGE_URL,
                    cls: "x-form-trigger"
                }
            ]
        };
    },

    getTrigger: function (index) {
        return this.triggers[index];
    },

    initTrigger: function () {
        var ts = this.trigger.select('.x-form-trigger', true);
        this.wrap.setStyle('overflow', 'hidden');
        var triggerField = this;
        ts.each(function (t, all, index) {
            t.hide = function () {
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = 'none';
                triggerField.el.setWidth(w - triggerField.trigger.getWidth());
            };
            t.show = function () {
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = '';
                triggerField.el.setWidth(w - triggerField.trigger.getWidth());
            };
            var triggerIndex = 'Trigger' + (index + 1);

            if (this.forceSelection) {
                this.hideTrigger1 = true;
            }

            if (this['hide' + triggerIndex]) {
                t.dom.style.display = 'none';
            }
            t.on("click", this['on' + triggerIndex + 'Click'], this, {preventDefault: true});
            t.addClassOnOver('x-form-trigger-over');
            t.addClassOnClick('x-form-trigger-click');
        }, this);
        this.triggers = ts.elements;
    },

    onTrigger1Click: function () {
        this.reset();
    },     // clear contents of combobox
    onTrigger2Click: function () {
        this.onTriggerClick();
    }     // pass to original combobox trigger handler
});

Ext.reg('combo', Ext.form.ClearableComboBox);

od.DataView = Ext.extend(Ext.DataView, {
    dragSelector: false,
    labelEditor: false,
    ddSupport: false,
    initComponent: function () {
        this.plugins = this.plugins || [];
        if (this.dragSelector) {
            this.plugins.push(new Ext.DataView.DragSelector());
        }

        if (this.labelEditor) {
            if (this.store) {
                this.plugins.push(new Ext.DataView.LabelEditor({dataIndex: this.store.idProperty}));
            }
        }

        od.DataView.superclass.initComponent.call(this);
    },
    afterRender: function () {
        if (this.ddSupport) {
            this.dragZone = new od.DataView.DD(this);
        }
        od.DataView.superclass.afterRender.call(this);
    }
});

Ext.reg("dataview", od.DataView);

od.DataView.DD = Ext.extend(Ext.dd.DragSource, {
    constructor: function (dataView, config) {
        this.proxy = new od.DataView.DDProxy();
        od.DataView.DD.superclass.constructor.call(this, dataView.el, config);
        this.dataView = dataView;
    },
    getDragData: function (e) {
        var sourceEl = e.getTarget(this.dataView.itemSelector, 5);
        if (sourceEl) {
            var d = sourceEl.cloneNode(true);
            var size = Ext.fly(sourceEl).getStyleSize();
            d.style.height = size.height;
            d.style.width = size.width;
            d.id = Ext.id();
            return {
                ddel: d,
                sourceEl: sourceEl,
                repairXY: Ext.fly(sourceEl).getXY()
            }
        }
    },
    onInitDrag: function (x, y) {
        this.proxy.update(this.dragData.ddel.cloneNode(true));
        this.onStartDrag(x, y);
        return true;
    },
    startDrag: function (x, y) {
        od.DataView.DD.superclass.startDrag.call(this, x, y);
        Ext.fly(this.dragData.sourceEl).mask();
    },
    autoOffset: function (x, y) {
        x -= this.dragData.repairXY[0];
        y -= this.dragData.repairXY[1];
        this.setDelta(x, y);
    },
    getRepairXY: function () {
        return this.dragData.repairXY;
    },
    afterRepair: function (e) {
        this.dragging = false;
        Ext.fly(this.dragData.sourceEl).unmask();
    }
});

od.DataView.DDProxy = Ext.extend(Ext.dd.StatusProxy, {
    repairDuration: .2,
    constructor: function (el, config) {
        Ext.apply(this, config);
        this.id = this.id || Ext.id();
        this.el = new Ext.Layer({
            dh: {id: this.id, tag: "div", children: [
                {tag: "div", cls: "od-dataview-dd-ghost"}
            ]}
        });
        this.ghost = Ext.get(this.el.dom.childNodes[0]);
    }
});

(function () {
    Ext.override(Ext.list.Column, {
        init: function () {
            var types = Ext.data.Types,
                st = this.sortType;

            if (this.type) {
                if (Ext.isString(this.type)) {
                    this.type = Ext.data.Types[this.type.toUpperCase()] || types.AUTO;
                }
            } else {
                this.type = types.AUTO;
            }

            if (Ext.isString(st)) {
                this.sortType = Ext.data.SortTypes[st];
            } else if (Ext.isEmpty(st)) {
                this.sortType = this.type.sortType;
            }
        }
    });

    Ext.tree.Column = Ext.extend(Ext.list.Column, {});
    Ext.tree.NumberColumn = Ext.extend(Ext.list.NumberColumn, {});
    Ext.tree.DateColumn = Ext.extend(Ext.list.DateColumn, {});
    Ext.tree.BooleanColumn = Ext.extend(Ext.list.BooleanColumn, {});

    Ext.reg('tgcolumn', Ext.tree.Column);
    Ext.reg('tgnumbercolumn', Ext.tree.NumberColumn);
    Ext.reg('tgdatecolumn', Ext.tree.DateColumn);
    Ext.reg('tgbooleancolumn', Ext.tree.BooleanColumn);
})();

Ext.ux.tree.TreeGridNodeUI = Ext.extend(Ext.tree.TreeNodeUI, {
    isTreeGridNodeUI: true,

    renderElements: function (n, a, targetNode, bulkRender) {
        var t = n.getOwnerTree(),
            cols = t.columns,
            c = cols[0],
            i, buf, len;

        this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() : '';

        buf = [
            '<tbody class="x-tree-node">',
            '<tr ext:tree-node-id="', n.id , '" class="x-tree-node-el x-tree-node-leaf ', a.cls, '">',
            '<td class="x-treegrid-col">',
            '<span class="x-tree-node-indent">', this.indentMarkup, "</span>",
            '<img src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />',
            '<img src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon', (a.icon ? " x-tree-node-inline-icon" : ""), (a.iconCls ? " " + a.iconCls : ""), '" unselectable="on" />',
            '<a hidefocus="on" class="x-tree-node-anchor" href="', a.href ? a.href : '#', '" tabIndex="1" ',
            a.hrefTarget ? ' target="' + a.hrefTarget + '"' : '', '>',
            '<span unselectable="on">', (c.tpl ? c.tpl.apply(a) : a[c.dataIndex] || c.text), '</span></a>',
            '</td>'
        ];

        for (i = 1, len = cols.length; i < len; i++) {
            c = cols[i];
            buf.push(
                '<td class="x-treegrid-col ', (c.cls ? c.cls : ''), '">',
                '<div unselectable="on" class="x-treegrid-text"', (c.align ? ' style="text-align: ' + c.align + ';"' : ''), '>',
                (c.tpl ? c.tpl.apply(a) : a[c.dataIndex]),
                '</div>',
                '</td>'
            );
        }

        buf.push(
            '</tr><tr class="x-tree-node-ct"><td colspan="', cols.length, '">',
            '<table class="x-treegrid-node-ct-table" cellpadding="0" cellspacing="0" style="table-layout: fixed; display: none; width: ', t.innerCt.getWidth(), 'px;"><colgroup>'
        );
        for (i = 0, len = cols.length; i < len; i++) {
            buf.push('<col style="width: ', (cols[i].hidden ? 0 : cols[i].width), 'px;" />');
        }
        buf.push('</colgroup></table></td></tr></tbody>');

        if (bulkRender !== true && n.nextSibling && n.nextSibling.ui.getEl()) {
            this.wrap = Ext.DomHelper.insertHtml("beforeBegin", n.nextSibling.ui.getEl(), buf.join(''));
        } else {
            this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf.join(''));
        }

        this.elNode = this.wrap.childNodes[0];
        this.ctNode = this.wrap.childNodes[1].firstChild.firstChild;
        var cs = this.elNode.firstChild.childNodes;
        this.indentNode = cs[0];
        this.ecNode = cs[1];
        this.iconNode = cs[2];
        this.anchor = cs[3];
        this.textNode = cs[3].firstChild;
    },

    animExpand: function (cb) {
        this.ctNode.style.display = "";
        Ext.ux.tree.TreeGridNodeUI.superclass.animExpand.call(this, cb);
    }
});

Ext.ux.tree.TreeGridRootNodeUI = Ext.extend(Ext.tree.TreeNodeUI, {
    isTreeGridNodeUI: true,

    render: function () {
        if (!this.rendered) {
            this.wrap = this.ctNode = this.node.ownerTree.innerCt.dom;
            this.node.expanded = true;
        }

        if (Ext.isWebKit) {
            var ct = this.ctNode;
            ct.style.tableLayout = null;
            (function () {
                ct.style.tableLayout = 'fixed';
            }).defer(1);
        }
    },

    destroy: function () {
        if (this.elNode) {
            Ext.dd.Registry.unregister(this.elNode.id);
        }
        delete this.node;
    },

    collapse: Ext.emptyFn,
    expand: Ext.emptyFn
});

Ext.ux.tree.TreeGridSorter = Ext.extend(Ext.tree.TreeSorter, {
    sortClasses: ['sort-asc', 'sort-desc'],
    sortAscText: 'Sort Ascending',
    sortDescText: 'Sort Descending',

    constructor: function (tree, config) {
        if (!Ext.isObject(config)) {
            config = {
                property: tree.columns[0].dataIndex || 'text',
                folderSort: true
            }
        }

        Ext.ux.tree.TreeGridSorter.superclass.constructor.apply(this, arguments);

        this.tree = tree;
        tree.on('headerclick', this.onHeaderClick, this);
        tree.ddAppendOnly = true;

        var me = this;
        this.defaultSortFn = function (n1, n2) {

            var desc = me.dir && me.dir.toLowerCase() == 'desc',
                prop = me.property || 'text',
                sortType = me.sortType,
                caseSensitive = me.caseSensitive === true,
                leafAttr = me.leafAttr || 'leaf',
                attr1 = n1.attributes,
                attr2 = n2.attributes;

            if (me.folderSort) {
                if (attr1[leafAttr] && !attr2[leafAttr]) {
                    return 1;
                }
                if (!attr1[leafAttr] && attr2[leafAttr]) {
                    return -1;
                }
            }
            var prop1 = attr1[prop],
                prop2 = attr2[prop],
                v1 = sortType ? sortType(prop1) : (caseSensitive ? prop1 : prop1.toUpperCase());
            v2 = sortType ? sortType(prop2) : (caseSensitive ? prop2 : prop2.toUpperCase());

            if (v1 < v2) {
                return desc ? +1 : -1;
            } else if (v1 > v2) {
                return desc ? -1 : +1;
            } else {
                return 0;
            }
        };

        tree.on('afterrender', this.onAfterTreeRender, this, {single: true});
        tree.on('headermenuclick', this.onHeaderMenuClick, this);
    },

    onAfterTreeRender: function () {
        if (this.tree.hmenu) {
            this.tree.hmenu.insert(0,
                {itemId: 'asc', text: this.sortAscText, cls: 'xg-hmenu-sort-asc'},
                {itemId: 'desc', text: this.sortDescText, cls: 'xg-hmenu-sort-desc'}
            );
        }
        this.updateSortIcon(0, 'asc');
    },

    onHeaderMenuClick: function (c, id, index) {
        if (id === 'asc' || id === 'desc') {
            this.onHeaderClick(c, null, index);
            return false;
        }
    },

    onHeaderClick: function (c, el, i) {
        if (c && !this.tree.headersDisabled) {
            var me = this;

            me.property = c.dataIndex;
            me.dir = c.dir = (c.dir === 'desc' ? 'asc' : 'desc');
            me.sortType = c.sortType;
            me.caseSensitive === Ext.isBoolean(c.caseSensitive) ? c.caseSensitive : this.caseSensitive;
            me.sortFn = c.sortFn || this.defaultSortFn;

            this.tree.root.cascade(function (n) {
                if (!n.isLeaf()) {
                    me.updateSort(me.tree, n);
                }
            });

            this.updateSortIcon(i, c.dir);
        }
    },

    updateSortIcon: function (col, dir) {
        var sc = this.sortClasses,
            hds = this.tree.innerHd.select('td').removeClass(sc);
        hds.item(col).addClass(sc[dir == 'desc' ? 1 : 0]);
    }
});

Ext.tree.ColumnResizer = Ext.extend(Ext.util.Observable, {
    minWidth: 14,

    constructor: function (config) {
        Ext.apply(this, config);
        Ext.tree.ColumnResizer.superclass.constructor.call(this);
    },

    init: function (tree) {
        this.tree = tree;
        tree.on('render', this.initEvents, this);
    },

    initEvents: function (tree) {
        tree.mon(tree.innerHd, 'mousemove', this.handleHdMove, this);
        this.tracker = new Ext.dd.DragTracker({
            onBeforeStart: this.onBeforeStart.createDelegate(this),
            onStart: this.onStart.createDelegate(this),
            onDrag: this.onDrag.createDelegate(this),
            onEnd: this.onEnd.createDelegate(this),
            tolerance: 3,
            autoStart: 300
        });
        this.tracker.initEl(tree.innerHd);
        tree.on('beforedestroy', this.tracker.destroy, this.tracker);
    },

    handleHdMove: function (e, t) {
        var hw = 5,
            x = e.getPageX(),
            hd = e.getTarget('.x-treegrid-hd', 3, true);

        if (hd) {
            var r = hd.getRegion(),
                ss = hd.dom.style,
                pn = hd.dom.parentNode;

            if (x - r.left <= hw && hd.dom !== pn.firstChild) {
                var ps = hd.dom.previousSibling;
                while (ps && Ext.fly(ps).hasClass('x-treegrid-hd-hidden')) {
                    ps = ps.previousSibling;
                }
                if (ps) {
                    this.activeHd = Ext.get(ps);
                    ss.cursor = Ext.isWebKit ? 'e-resize' : 'col-resize';
                }
            } else if (r.right - x <= hw) {
                var ns = hd.dom;
                while (ns && Ext.fly(ns).hasClass('x-treegrid-hd-hidden')) {
                    ns = ns.previousSibling;
                }
                if (ns) {
                    this.activeHd = Ext.get(ns);
                    ss.cursor = Ext.isWebKit ? 'w-resize' : 'col-resize';
                }
            } else {
                delete this.activeHd;
                ss.cursor = '';
            }
        }
    },

    onBeforeStart: function (e) {
        this.dragHd = this.activeHd;
        return !!this.dragHd;
    },

    onStart: function (e) {
        this.dragHeadersDisabled = this.tree.headersDisabled;
        this.tree.headersDisabled = true;
        this.proxy = this.tree.body.createChild({cls: 'x-treegrid-resizer'});
        this.proxy.setHeight(this.tree.body.getHeight());

        var x = this.tracker.getXY()[0];

        this.hdX = this.dragHd.getX();
        this.hdIndex = this.tree.findHeaderIndex(this.dragHd);

        this.proxy.setX(this.hdX);
        this.proxy.setWidth(x - this.hdX);

        this.maxWidth = this.tree.outerCt.getWidth() - this.tree.innerBody.translatePoints(this.hdX).left;
    },

    onDrag: function (e) {
        var cursorX = this.tracker.getXY()[0];
        this.proxy.setWidth((cursorX - this.hdX).constrain(this.minWidth, this.maxWidth));
    },

    onEnd: function (e) {
        var nw = this.proxy.getWidth(),
            tree = this.tree,
            disabled = this.dragHeadersDisabled;

        this.proxy.remove();
        delete this.dragHd;

        tree.columns[this.hdIndex].width = nw;
        tree.updateColumnWidths();

        setTimeout(function () {
            tree.headersDisabled = disabled;
        }, 100);
    }
});

Ext.ux.tree.TreeGridLoader = Ext.extend(Ext.tree.TreeLoader, {
    createNode: function (attr) {
        if (!attr.uiProvider) {
            attr.uiProvider = Ext.ux.tree.TreeGridNodeUI;
        }
        return Ext.tree.TreeLoader.prototype.createNode.call(this, attr);
    }
});

Ext.ux.tree.TreeGrid = Ext.extend(Ext.tree.TreePanel, {
    rootVisible: false,
    useArrows: true,
    lines: false,
    borderWidth: Ext.isBorderBox ? 0 : 2,
    cls: 'x-treegrid',

    columnResize: true,
    enableSort: true,
    reserveScrollOffset: true,
    enableHdMenu: true,

    columnsText: 'Columns',

    initComponent: function () {
        if (!this.root) {
            this.root = new Ext.tree.AsyncTreeNode({text: 'Root'});
        }

        var l = this.loader;
        if (!l) {
            l = new Ext.ux.tree.TreeGridLoader({
                dataUrl: this.dataUrl,
                requestMethod: this.requestMethod,
                store: this.store
            });
        } else if (Ext.isObject(l) && !l.load) {
            l = new Ext.ux.tree.TreeGridLoader(l);
        }
        this.loader = l;

        Ext.ux.tree.TreeGrid.superclass.initComponent.call(this);

        this.initColumns();

        if (this.enableSort) {
            this.treeGridSorter = new Ext.ux.tree.TreeGridSorter(this, this.enableSort);
        }

        if (this.columnResize) {
            this.colResizer = new Ext.tree.ColumnResizer(this.columnResize);
            this.colResizer.init(this);
        }

        var c = this.columns;
        if (!this.internalTpl) {
            this.internalTpl = new Ext.XTemplate(
                '<div class="x-grid3-header">',
                '<div class="x-treegrid-header-inner">',
                '<div class="x-grid3-header-offset">',
                '<table style="table-layout: fixed;" cellspacing="0" cellpadding="0" border="0"><colgroup><tpl for="columns"><col /></tpl></colgroup>',
                '<thead><tr class="x-grid3-hd-row">',
                '<tpl for="columns">',
                '<td class="x-grid3-hd x-grid3-cell x-treegrid-hd" style="text-align: {align};" id="', this.id, '-xlhd-{#}">',
                '<div class="x-grid3-hd-inner x-treegrid-hd-inner" unselectable="on">',
                this.enableHdMenu ? '<a class="x-grid3-hd-btn" href="#"></a>' : '',
                '{header}<img class="x-grid3-sort-icon" src="', Ext.BLANK_IMAGE_URL, '" />',
                '</div>',
                '</td></tpl>',
                '</tr></thead>',
                '</table>',
                '</div></div>',
                '</div>',
                '<div class="x-treegrid-root-node">',
                '<table class="x-treegrid-root-table" cellpadding="0" cellspacing="0" style="table-layout: fixed;"></table>',
                '</div>'
            );
        }

        if (!this.colgroupTpl) {
            this.colgroupTpl = new Ext.XTemplate(
                '<colgroup><tpl for="columns"><col style="width: {width}px"/></tpl></colgroup>'
            );
        }
    },

    initColumns: function () {
        var cs = this.columns,
            len = cs.length,
            columns = [],
            i, c;

        for (i = 0; i < len; i++) {
            c = cs[i];
            if (!c.isColumn) {
                c.xtype = c.xtype ? (/^tg/.test(c.xtype) ? c.xtype : 'tg' + c.xtype) : 'tgcolumn';
                c = Ext.create(c);
            }
            c.init(this);
            columns.push(c);

            if (this.enableSort !== false && c.sortable !== false) {
                c.sortable = true;
                this.enableSort = true;
            }
        }

        this.columns = columns;
    },

    onRender: function () {
        Ext.tree.TreePanel.superclass.onRender.apply(this, arguments);

        this.el.addClass('x-treegrid');

        this.outerCt = this.body.createChild({
            cls: 'x-tree-root-ct x-treegrid-ct ' + (this.useArrows ? 'x-tree-arrows' : this.lines ? 'x-tree-lines' : 'x-tree-no-lines')
        });

        this.internalTpl.overwrite(this.outerCt, {columns: this.columns});

        this.mainHd = Ext.get(this.outerCt.dom.firstChild);
        this.innerHd = Ext.get(this.mainHd.dom.firstChild);
        this.innerBody = Ext.get(this.outerCt.dom.lastChild);
        this.innerCt = Ext.get(this.innerBody.dom.firstChild);

        this.colgroupTpl.insertFirst(this.innerCt, {columns: this.columns});

        if (this.hideHeaders) {
            this.el.child('.x-grid3-header').setDisplayed('none');
        }
        else if (this.enableHdMenu !== false) {
            this.hmenu = new Ext.menu.Menu({id: this.id + '-hctx'});
            if (this.enableColumnHide !== false) {
                this.colMenu = new Ext.menu.Menu({id: this.id + '-hcols-menu'});
                this.colMenu.on({
                    scope: this,
                    beforeshow: this.beforeColMenuShow,
                    itemclick: this.handleHdMenuClick
                });
                this.hmenu.add({
                    itemId: 'columns',
                    hideOnClick: false,
                    text: this.columnsText,
                    menu: this.colMenu,
                    iconCls: 'x-cols-icon'
                });
            }
            this.hmenu.on('itemclick', this.handleHdMenuClick, this);
        }
    },

    setRootNode: function (node) {
        node.attributes.uiProvider = Ext.ux.tree.TreeGridRootNodeUI;
        node = Ext.ux.tree.TreeGrid.superclass.setRootNode.call(this, node);
        if (this.innerCt) {
            this.colgroupTpl.insertFirst(this.innerCt, {columns: this.columns});
        }
        return node;
    },

    clearInnerCt: function () {
        if (Ext.isIE) {
            var dom = this.innerCt.dom;
            while (dom.firstChild) {
                dom.removeChild(dom.firstChild);
            }
        } else {
            Ext.ux.tree.TreeGrid.superclass.clearInnerCt.call(this);
        }
    },

    initEvents: function () {
        Ext.ux.tree.TreeGrid.superclass.initEvents.apply(this, arguments);

        this.mon(this.innerBody, 'scroll', this.syncScroll, this);
        this.mon(this.innerHd, 'click', this.handleHdDown, this);
        this.mon(this.mainHd, {
            scope: this,
            mouseover: this.handleHdOver,
            mouseout: this.handleHdOut
        });
    },

    onResize: function (w, h) {
        Ext.ux.tree.TreeGrid.superclass.onResize.apply(this, arguments);

        var bd = this.innerBody.dom;
        var hd = this.innerHd.dom;

        if (!bd) {
            return;
        }

        if (Ext.isNumber(h)) {
            bd.style.height = this.body.getHeight(true) - hd.offsetHeight + 'px';
        }

        if (Ext.isNumber(w)) {
            var sw = Ext.num(this.scrollOffset, Ext.getScrollBarWidth());
            if (this.reserveScrollOffset || ((bd.offsetWidth - bd.clientWidth) > 10)) {
                this.setScrollOffset(sw);
            } else {
                var me = this;
                setTimeout(function () {
                    me.setScrollOffset(bd.offsetWidth - bd.clientWidth > 10 ? sw : 0);
                }, 10);
            }
        }
    },

    updateColumnWidths: function () {
        var cols = this.columns,
            colCount = cols.length,
            groups = this.outerCt.query('colgroup'),
            groupCount = groups.length,
            c, g, i, j;

        for (i = 0; i < colCount; i++) {
            c = cols[i];
            for (j = 0; j < groupCount; j++) {
                g = groups[j];
                g.childNodes[i].style.width = (c.hidden ? 0 : c.width) + 'px';
            }
        }

        for (i = 0, groups = this.innerHd.query('td'), len = groups.length; i < len; i++) {
            c = Ext.fly(groups[i]);
            if (cols[i] && cols[i].hidden) {
                c.addClass('x-treegrid-hd-hidden');
            }
            else {
                c.removeClass('x-treegrid-hd-hidden');
            }
        }

        var tcw = this.getTotalColumnWidth();
        Ext.fly(this.innerHd.dom.firstChild).setWidth(tcw + (this.scrollOffset || 0));
        this.outerCt.select('table').setWidth(tcw);
        this.syncHeaderScroll();
    },

    getVisibleColumns: function () {
        var columns = [],
            cs = this.columns,
            len = cs.length,
            i;

        for (i = 0; i < len; i++) {
            if (!cs[i].hidden) {
                columns.push(cs[i]);
            }
        }
        return columns;
    },

    getTotalColumnWidth: function () {
        var total = 0;
        for (var i = 0, cs = this.getVisibleColumns(), len = cs.length; i < len; i++) {
            total += cs[i].width;
        }
        return total;
    },

    setScrollOffset: function (scrollOffset) {
        this.scrollOffset = scrollOffset;
        this.updateColumnWidths();
    },

    handleHdDown: function (e, t) {
        var hd = e.getTarget('.x-treegrid-hd');

        if (hd && Ext.fly(t).hasClass('x-grid3-hd-btn')) {
            var ms = this.hmenu.items,
                cs = this.columns,
                index = this.findHeaderIndex(hd),
                c = cs[index],
                sort = c.sortable;

            e.stopEvent();
            Ext.fly(hd).addClass('x-grid3-hd-menu-open');
            this.hdCtxIndex = index;

            this.fireEvent('headerbuttonclick', ms, c, hd, index);

            this.hmenu.on('hide', function () {
                Ext.fly(hd).removeClass('x-grid3-hd-menu-open');
            }, this, {single: true});

            this.hmenu.show(t, 'tl-bl?');
        }
        else if (hd) {
            var index = this.findHeaderIndex(hd);
            this.fireEvent('headerclick', this.columns[index], hd, index);
        }
    },

    handleHdOver: function (e, t) {
        var hd = e.getTarget('.x-treegrid-hd');
        if (hd && !this.headersDisabled) {
            index = this.findHeaderIndex(hd);
            this.activeHdRef = t;
            this.activeHdIndex = index;
            var el = Ext.get(hd);
            this.activeHdRegion = el.getRegion();
            el.addClass('x-grid3-hd-over');
            this.activeHdBtn = el.child('.x-grid3-hd-btn');
            if (this.activeHdBtn) {
                this.activeHdBtn.dom.style.height = (hd.firstChild.offsetHeight - 1) + 'px';
            }
        }
    },

    handleHdOut: function (e, t) {
        var hd = e.getTarget('.x-treegrid-hd');
        if (hd && (!Ext.isIE || !e.within(hd, true))) {
            this.activeHdRef = null;
            Ext.fly(hd).removeClass('x-grid3-hd-over');
            hd.style.cursor = '';
        }
    },

    findHeaderIndex: function (hd) {
        hd = hd.dom || hd;
        var cs = hd.parentNode.childNodes;
        for (var i = 0, c; c = cs[i]; i++) {
            if (c == hd) {
                return i;
            }
        }
        return -1;
    },

    beforeColMenuShow: function () {
        var cols = this.columns,
            colCount = cols.length,
            i, c;
        this.colMenu.removeAll();
        for (i = 1; i < colCount; i++) {
            c = cols[i];
            if (c.hideable !== false) {
                this.colMenu.add(new Ext.menu.CheckItem({
                    itemId: 'col-' + i,
                    text: c.header,
                    checked: !c.hidden,
                    hideOnClick: false,
                    disabled: c.hideable === false
                }));
            }
        }
    },

    handleHdMenuClick: function (item) {
        var index = this.hdCtxIndex,
            id = item.getItemId();

        if (this.fireEvent('headermenuclick', this.columns[index], id, index) !== false) {
            index = id.substr(4);
            if (index > 0 && this.columns[index]) {
                this.setColumnVisible(index, !item.checked);
            }
        }

        return true;
    },

    setColumnVisible: function (index, visible) {
        this.columns[index].hidden = !visible;
        this.updateColumnWidths();
    },

    scrollToTop: function () {
        this.innerBody.dom.scrollTop = 0;
        this.innerBody.dom.scrollLeft = 0;
    },

    syncScroll: function () {
        this.syncHeaderScroll();
        var mb = this.innerBody.dom;
        this.fireEvent('bodyscroll', mb.scrollLeft, mb.scrollTop);
    },

    syncHeaderScroll: function () {
        var mb = this.innerBody.dom;
        this.innerHd.dom.scrollLeft = mb.scrollLeft;
        this.innerHd.dom.scrollLeft = mb.scrollLeft; // second time for IE (1/2 time first fails, other browsers ignore)
    },

    registerNode: function (n) {
        Ext.ux.tree.TreeGrid.superclass.registerNode.call(this, n);
        if (!n.uiProvider && !n.isRoot && !n.ui.isTreeGridNodeUI) {
            n.ui = new Ext.ux.tree.TreeGridNodeUI(n);
        }
    }
});

Ext.reg('treegrid', Ext.ux.tree.TreeGrid);