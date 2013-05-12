Ext.ns("xds.moduleWizard");
xds.moduleWizard.EntitySelector = Ext.extend(Ext.Window, {
    width: 421,
    height: 484,
    title: "选择实体",
    constrain: true,
    layout: "fit",
    modal: true,
    initComponent: function () {
        Ext.apply(this, {
            items: [new od.TreePanel({
                autoLoad: false,
                pidCode: "pid",
                indexCode: "seq",
                pathCode: "path",
                border: false,
                autoScroll: true,
                requestMethod: "GET",
                rootVisible: false,
                containerScroll: true,
                dataUrl: "entity/tree/entity",
                lines: true,
                id: "entityTree",
                animate: false,
                enableDD: true,
                pathSeparator: "|",
                trackMouseOver: true,
                ref: "entityTree",
                draggable: false,
                listeners: {
                    beforerender: function (tree) {
                        tree.getLoader().createNode = function (attrs) {
                            if (attrs.code) {
                                attrs.qtip = '编码:' + attrs.code;
                            }

                            if (attrs.tableName) {
                                attrs.qtip = attrs.qtip + '<br> 表名:' + attrs.tableName;
                            }

                            if (attrs.leaf) {
                                attrs.iconCls = 'icon-package';
                            } else {
                                attrs.iconCls = 'icon-folder-table';
                            }
                            return Ext.tree.TreeLoader.prototype.createNode.call(this, attrs);
                        }
                    },
                    dblclick: function (node, evt) {
                        node.getOwnerTree().refOwner.doSelect();
                    }
                },
                root: {
                    text: "实体管理",
                    id: "-1"
                },
                tbar: [
                    {
                        iconCls: "icon-treepanel",
                        eableToggle: true,
                        ref: "../btnExp",
                        listeners: {
                            click: function (btn, evt) {
                                if (btn.pressed) {
                                    btn.refOwner.collapseAll();
                                } else {
                                    btn.refOwner.expandAll();
                                }

                                btn.toggle(!btn.pressed, true);
                            }
                        }
                    },
                    {
                        xtype: "textfield",
                        width: 200,
                        ref: "../txtSearch",
                        enableKeyEvents: true,
                        style: "margin-left:2px;",
                        listeners: {
                            render: function (me) {
                                var tree = me.refOwner;

                                tree.filter = new Ext.tree.TreeFilter(tree, {
                                    clearBlank: true,
                                    autoClear: true
                                });

                                me.container.setStyle("width", "100%");
                                me.setWidth(me.ownerCt.getWidth() - 30);
                                me.ownerCt.on("resize", function () {
                                        this.setWidth(this.ownerCt.getWidth() - 30);
                                    },
                                    me);
                            },
                            keyup: function (me, e) {
                                var text = me.getValue();
                                var tree = me.refOwner;

                                if (!text) {
                                    tree.filter.clear();
                                    tree.matched = [];
                                    tree.expandAll();
                                    tree.btnExp.toggle(true, true);
                                    return;
                                }

                                if (e.getKey() != 13) {
                                    return;
                                }

                                tree.filter.clear();
                                tree.matched = [];
                                tree.expandAll();
                                tree.btnExp.toggle(true, true);

                                var re = new RegExp(Ext.escapeRe(text), 'i');
                                tree.root.cascade(function (n) {
                                    if (re.test(n.text)) {
                                        tree.matched.push(n);
                                    }
                                });

                                tree.root.cascade(function (n) {
                                    if (!n.isLeaf()) {
                                        n.bubble(function (nbb) {
                                            var contain = false;
                                            for (var mted = 0; mted < tree.matched.length; mted++) {
                                                if (nbb.contains(tree.matched[mted]) || nbb == tree.matched[mted]) {
                                                    contain = true;
                                                    break;
                                                }
                                            }
                                            if (!contain) {
                                                nbb.ui.hide();
                                                tree.filter.filtered[nbb.id] = nbb;
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                ]
            })],
            buttons: [
                {
                    text: "确认",
                    ref: "../btnAccept",
                    listeners: {
                        click: function (btn, evt) {
                            btn.refOwner.doSelect();
                        }
                    }
                },
                {
                    text: "取消",
                    ref: "../btnCancel",
                    listeners: {
                        click: function (btn, evt) {
                            if (btn.refOwner) {
                                btn.refOwner.close();
                            }
                        }
                    }
                }
            ]
        });
        xds.moduleWizard.EntitySelector.superclass.initComponent.call(this);
        this.addEvents('ok');
    },
    doSelect: function () {
        var win = this;
        var tree = win.entityTree;
        var node = tree.getSelectionModel().getSelectedNode();
        if (!node) {
            Ext.Msg.alert('提示', '请选择一个实体');
            return;
        }

        win.fireEvent('ok', node.attributes);
        win.close();
    }
});
xds.moduleWizard.TplView = Ext.extend(Ext.DataView, {
    categoryName: "category",
    imagePath: "imagePath",
    imageName: "imageName",
    itemName: "text",
    itemDescription: "desc",
    itemIconCls: "imgCls",
    itemSelector: "dd",
    trackOver: true,
    overClass: "x-tpl-over",
    singleSelect: true,
    autoScroll: true,
    initComponent: function () {
        Ext.apply(this, {
            tpl: new Ext.XTemplate(this.getMarkup(), {
                getCategory: this.getCategory,
                openCategory: this.openCategory,
                view: this
            }),
            store: new Ext.data.ArrayStore({
                fields: ['text', 'imgCls', 'desc', 'type', 'category'],
                data: [
                    ['空白模板', 'tpl-blank', '空白模板', 'tpl-blank', '空白'],
                    ['单实体-表格', 'tpl-single-entity-grid', '包含单实体的增删改查等操作，实体采用列表的方式表现', 'tpl-single-entity-grid', '单实体'],
                    ['单实体-视图', 'tpl-single-entity-view', '包含单实体的增删改查等操作，实体采用视图的方式表现', 'tpl-single-entity-view', '单实体'],
                    ['单实体-树形', 'tpl-single-entity-tree', '包含单实体的增删改查等操作，实体采用树形的方式表现', 'tpl-single-entity-tree', '单实体']
                ]
            })
        });

        xds.moduleWizard.TplView.superclass.initComponent.call(this);
    },
    getMarkup: function () {
        return [
            '<div class="x-tpl-ct">',
            '<tpl for=".">',
            '<tpl if="this.openCategory(values, xindex, xcount)">',
            '<tpl if="xindex != 1">',
            '<div style="clear:left"></div></dl>',
            "</tpl>",
            '<h2><div class="x-unselectable">{[this.getCategory(values)]}</div></h2>',
            "<dl>",
            '</tpl>',
            '<dd>',
            '<img title="{text:htmlEncode}" src="', Ext.BLANK_IMAGE_URL, '" class="{', this.itemIconCls, '}"/>',
            "<div><h4>{", this.itemName, "}</h4><p>{", this.itemDescription, "}</p></div>",
            "</dd>",
            '<tpl if="xindex == xcount">',
            '<div style="clear:left"></div></dl>',
            "</tpl>",
            "</tpl>",
            "</div>"].join("");
    },
    openCategory: function (b) {
        var a = this.getCategory(b);
        if (this.lastCat != a) {
            this.lastCat = a;
            return true;
        }
        return false;
    },
    getCategory: function (a) {
        return a[this.view.categoryName];
    },
    onClick: function (b) {
        var a = b.getTarget("h2", 3, true);
        if (a) {
            a.toggleClass("collapsed");
            a.next("dl").toggleClass("collapsed");
        } else {
            xds.moduleWizard.TplView.superclass.onClick.apply(this, arguments);
        }
    },
    afterRender: function (ct) {
        xds.moduleWizard.TplView.superclass.afterRender.apply(this, arguments);
        this.select(0);
    },
    onContainerClick: function () {

    }
});

xds.moduleWizard.TplPanel = Ext.extend(Ext.Panel, {
    bodyStyle: 'background-color:#fff;',
    tplType: 'tpl-blank',
    ref: 'tplPanel',
    initComponent: function () {
        this.tplView = new xds.moduleWizard.TplView({
            region: 'center',
            border: false
        });

        this.tplView.on('click', this.onTplSelected, this);
        this.moduleForm = new Ext.FormPanel({
            autoHeight: true,
            layout: 'tableform',
            region: 'south',
            border: false,
            cls: 'tplt-border-top',
            padding: 6,
            labelWidth: 40,
            layoutConfig: {
                columns: 3
            },
            labelSeparator: ':',
            items: [
                {
                    fieldLabel: '名称',
                    name: 'name',
                    allowBlank: false,
                    blankText: '模块名称不能为空',
                    xtype: 'textfield',
                    anchor: '-20',
                    value: 'test'
                },
                {
                    fieldLabel: '编码',
                    name: 'id',
                    allowBlank: false,
                    blankText: '模块编码不能为空',
                    xtype: 'textfield',
                    anchor: '-20',
                    value: 'test'
                },
                {
                    fieldLabel: '分组',
                    name: 'category',
                    xtype: 'textfield',
                    anchor: '-20',
                    value: 'test'
                }
            ]
        });
        Ext.apply(this, {
            layout: 'border',
            items: [this.tplView, this.moduleForm]
        });
        xds.moduleWizard.TplPanel.superclass.initComponent.call(this, arguments);
        this.addEvents('tplselected');
    },
    onTplSelected: function (v, i, n, e) {
        var rec = this.tplView.getStore().getAt(i);
        this.tplType = rec.data.type;
        this.fireEvent('tplselected', this.tplType);
    },
    getModuleConfig: function () {
        if (!this.moduleForm.getForm().isValid()) {
            return null;
        } else {
            return {userConfig: this.moduleForm.getForm().getFieldValues()}
        }
    }
});

xds.moduleWizard.EntityPanel = Ext.extend(Ext.Panel, {
    initComponent: function () {
        Ext.apply(this, {
            items: [
                {
                    xtype: "grid",
                    store: {
                        xtype: "jsonstore",
                        storeId: "MyStore1",
                        url: "/entity/field",
                        idProperty: "id",
                        root: "root",
                        restful: true,
                        fields: [
                            {
                                xtype: "datafield",
                                name: "code",
                                type: "string",
                                text: "属性编码"
                            },
                            {
                                xtype: "datafield",
                                name: "name",
                                type: "string",
                                text: "属性名称"
                            },
                            {
                                xtype: "datafield",
                                name: "columnName",
                                type: "string",
                                text: "字段名"
                            },
                            {
                                xtype: "datafield",
                                name: "id",
                                type: "string",
                                text: "ID"
                            },
                            {
                                xtype: "datafield",
                                name: "entityCode",
                                type: "string",
                                text: "实体编码"
                            }
                        ]
                    },
                    border: false,
                    region: "center",
                    height: 469,
                    columnLines: true,
                    markDirty: false,
                    ref: "fieldGrid",
                    columns: [
                        {
                            xtype: "gridcolumn",
                            header: "属性名称",
                            sortable: false,
                            resizable: true,
                            width: 120,
                            menuDisabled: true,
                            dataIndex: "name"
                        },
                        {
                            xtype: "gridcolumn",
                            header: "属性编码",
                            sortable: false,
                            resizable: true,
                            width: 140,
                            menuDisabled: true,
                            dataIndex: "code"
                        },
                        {
                            xtype: "gridcolumn",
                            header: "字段名",
                            sortable: false,
                            resizable: true,
                            width: 140,
                            menuDisabled: true,
                            dataIndex: "columnName"
                        },
                        {
                            xtype: "checkcolumn",
                            header: "读取",
                            sortable: false,
                            resizable: false,
                            width: 54,
                            menuDisabled: true,
                            hideable: false,
                            assm: false,
                            dataIndex: "load",
                            enableSelectAll: true
                        },
                        {
                            xtype: "checkcolumn",
                            header: "列表",
                            sortable: false,
                            resizable: false,
                            width: 54,
                            menuDisabled: true,
                            hideable: false,
                            dataIndex: "list",
                            enableSelectAll: true
                        },
                        {
                            xtype: "checkcolumn",
                            header: "新增",
                            sortable: false,
                            resizable: false,
                            width: 54,
                            menuDisabled: true,
                            hideable: false,
                            dataIndex: "create",
                            enableSelectAll: true
                        },
                        {
                            xtype: "checkcolumn",
                            header: "修改",
                            sortable: false,
                            resizable: false,
                            width: 54,
                            menuDisabled: true,
                            hideable: false,
                            dataIndex: "edit",
                            enableSelectAll: true
                        },
                        {
                            xtype: "checkcolumn",
                            header: "查询",
                            sortable: false,
                            resizable: false,
                            width: 54,
                            menuDisabled: true,
                            hideable: false,
                            dataIndex: "query",
                            enableSelectAll: true
                        }
                    ]
                },
                {
                    xtype: "form",
                    labelWidth: 60,
                    labelAlign: "left",
                    layout: "tableform",
                    padding: 6,
                    labelSeparator: ":",
                    border: false,
                    region: "north",
                    height: 34,
                    autoHide: true,
                    cls: "tplt-border-bottom",
                    ref: "entityForm",
                    layoutConfig: {
                        columns: 2
                    },
                    items: [
                        {
                            xtype: "trigger",
                            anchor: "-20",
                            fieldLabel: "选择实体",
                            triggerClass: "x-form-search-trigger",
                            ref: "../entityCode",
                            name: "entityCode",
                            colspan: 1,
                            listeners: {
                                triggerclick: function (field) {
                                    var win = new xds.moduleWizard.EntitySelector();
                                    win.on('ok', function (data) {
                                        field.setValue(data.text);
                                        var store = field.refOwner.fieldGrid.getStore();
                                        store.setBaseParam('entityCode', data.code);
                                        store.reload();
                                    });
                                    win.show();
                                }
                            }
                        },
                        {
                            xtype: "checkboxgroup",
                            fieldLabel: "选择操作",
                            anchor: "-20",
                            name: "op",
                            ref:"../op",
                            items: [
                                {
                                    xtype: "checkbox",
                                    boxLabel: "新增",
                                    checked: true,
                                    inputValue: "create"
                                },
                                {
                                    xtype: "checkbox",
                                    boxLabel: "修改",
                                    checked: true,
                                    inputValue: "edit"
                                },
                                {
                                    xtype: "checkbox",
                                    boxLabel: "删除",
                                    checked: true,
                                    inputValue: "del"
                                },
                                {
                                    xtype: "checkbox",
                                    boxLabel: "查询",
                                    checked: true,
                                    inputValue: "query"
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        xds.moduleWizard.EntityPanel.superclass.initComponent.call(this);
    },
    getEntityConfig:function(){

    },
    getComponentConfig:function(){
        var ret = [];
        var mainGridConfig = this.getMainGridConfig();
        ret.push(mainGridConfig);
        var createWinConfig = this.getCreateWinConfig();
        if(createWinConfig){
            ret.push(createWinConfig);
        }
        var editWinConfig = this.getEditWinConfig();
        if(editWinConfig){
            ret.push(editWinConfig);
        }
        var queryWinConfig = this.getQueryWinConfig();
        if(queryWinConfig){
            ret.push(queryWinConfig);
        }
        return ret;
    },
    getMainGridConfig:function(){

    },
    getCreateWinConfig:function(){

    },
    getEditWinConfig:function(){

    },
    getQueryWinConfig:function(){

    }
});

xds.moduleWizard.WizardWindow = Ext.extend(Ext.Window, {
    layout: 'card',
    initComponent: function () {
        this.tplPanel = new xds.moduleWizard.TplPanel({
            id: 'tplpanel',
            border: false
        });

        this.tplPanel.on('tplselected', this.onTplSelecte, this);

        this.gridEntityPanel = new xds.moduleWizard.EntityPanel({
            id: 'entitypanel',
            border: false,
            layout: "border"
        });
        Ext.apply(this, {
            items: [this.tplPanel, this.gridEntityPanel],
            activeItem: 'tplpanel',
            buttons: [
                {
                    text: '上一步',
                    ref: '../btnBack',
                    handler: this.back,
                    disabled: true,
                    scope: this
                },
                {
                    text: '下一步',
                    ref: '../btnNext',
                    handler: this.next,
                    disabled: true,
                    scope: this
                },
                {
                    text: '确认',
                    ref: '../btnEnter',
                    handler: this.enter,
                    scope: this
                },
                {
                    text: '取消',
                    ref: '../btnCancel',
                    handler: this.cancel,
                    scope: this
                }
            ]
        });
        xds.moduleWizard.WizardWindow.superclass.initComponent.call(this, arguments);
    },
    onTplSelecte: function (tpl) {
        this.tplType = tpl;
        if (tpl == 'tpl-blank') {
            this.btnNext.disable();
            this.btnEnter.enable();
        } else {
            this.btnNext.enable();
            this.btnEnter.disable();
        }
    },
    next: function (btn) {
        var currentId = this.getLayout().activeItem.id;
        if (currentId == 'tplpanel') {
            this.moduleConfig = this.getModuleConfig();
            if (!this.moduleConfig) {
                return;
            }
            if (this.tplType == 'tpl-single-entity-grid') {
                this.getLayout().setActiveItem('entitypanel')
            } else if (this.tplType == 'tpl-single-entity-tree') {

            } else if (this.tplType == 'tpl-single-entity-view') {

            }
        } else if (currentId == 'entitypanel') {

        }
    },
    back: function (btn) {
        var currentId = this.getLayout().activeItem.id;
        if (currentId == 'tplpanel') {

        } else if (currentId == 'entitypanel') {

        }
    },
    enter: function (btn) {
        var moduleConfig = this.getModuleConfig();
        if (moduleConfig) {
            xds.project.open(moduleConfig);
            this.close();
        }
    },
    cancel: function (btn) {
        btn.refOwner.close();
    },
    getModuleConfig:function(){
        this.moduleConfig = this.tplPanel.getModuleConfig();
        if(this.tplType == 'tpl-single-entity-grid'){

        } else if (this.tplType == 'tpl-single-entity-tree') {

        } else if (this.tplType == 'tpl-single-entity-view') {

        }

        return this.moduleConfig;
    }
});