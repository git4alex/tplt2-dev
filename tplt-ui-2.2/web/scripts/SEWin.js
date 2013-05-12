od.SeSearch = Ext.extend(Ext.form.TextField, {
    enableKeyEvents: true,
    width: 100,
    emptyText: "快速查找...",
    hiddenPkgs: [],
    initComponent: function () {
        od.SeSearch.superclass.initComponent.call(this);
        this.on("keyup", this.onPropertySearch, this);
    },
    onRender: function () {
        od.SeSearch.superclass.onRender.apply(this, arguments);
        this.container.setStyle("width", "100%");
        this.setWidth(this.ownerCt.getWidth() - 30);
        this.ownerCt.on("resize", function () {
            this.setWidth(this.ownerCt.getWidth() - 30);
        }, this);
    },
    onPropertySearch: function (me, evt) {
//        var a = this.getValue();
//        if (a && a.trim() != "") {
//            this.store.filter("name", this.getValue());
//        } else {
//            if (this.store.isFiltered()) {
//                this.store.clearFilter();
//            }
//        }
//

        if (!this.fileter) {
            this.filter = new Ext.tree.TreeFilter(this.refOwner);
        }

        var tree = this.refOwner;
        tree.expandAll();
        var re = new RegExp(Ext.escapeRe(me.getValue()), 'i');
        Ext.each(this.hiddenPkgs, function (n) {
            n.ui.show();
        });
        this.hiddenPkgs = [];
        this.filter.filterBy(function (n) {
            return !n.isLeaf() || re.test(n.text);
        });

        var judge = function (n, re) {
            var str = false;
            n.cascade(function (n1) {
                if (n1.isLeaf()) {
                    if (re.test(n1.text)) {
                        str = true;
                        return;
                    }
                } else {
                    if (re.test(n1.text)) {
                        str = true;
                        return;
                    }
                }
            }, this);
            return str;
        };

        tree.root.cascade(function (n) {
            if (!n.isLeaf() && judge(n, re) == false && !re.test(n.text)) {
                this.hiddenPkgs.push(n);
                n.ui.hide();
            }
        }, this);


    },
    onTriggerClick: function () {
        this.reset();
        Ext.each(this.hiddenPkgs, function (n) {
            n.ui.show();
        });
        this.focus();
    }
});

od.SEWindow = Ext.extend(Ext.Window, {
    xtype: "window",
    title: "选择实体",
    width: 712,
    height: 430,
    layout: "border",
    modal: true,
    initComponent: function () {
        this.fbar = [
            {
                text: "确定",
                handler: function () {
                    var pGrid = Ext.getCmp('pGrid');
                    var ps = pGrid.getSelectionModel().getSelections();
                    if (ps.length > 0) {
                        this.fireEvent('selected', this.entityId, ps);
                    }
                    this.close();
                },
                scope: this
            },
            {
                text: "取消",
                handler: function () {
                    this.close();
                },
                scope: this
            }
        ];

        var psm = new Ext.grid.CheckboxSelectionModel();
        var me = this;
        this.items = [
            {
                id: 'pGrid',
                xtype: "grid",
                store: {
                    xtype: "jsonstore",
                    storeId: "MyStore",
                    root: 'root',
                    idProperty: 'id',
                    url: "fieldMetadata",
                    restful: true,
                    requestMethod: 'GET',
                    fields: ['code', 'name', 'dataType', 'id', 'bizTypeCode','mandatory']
                },
                region: "center",
                border: false,
                style: "border-left:1px solid #8daccb",
                sm: psm,
                columns: [psm, {
                    header: "Code",
                    sortable: true,
                    resizable: true,
                    width: 160,
                    dataIndex: "code",
                    menuDisabled: true
                }, {
                    id: 'colName',
                    header: "Name",
                    sortable: true,
                    resizable: true,
                    width: 140,
                    dataIndex: "name",
                    menuDisabled: true
                }, {
                    header: "Type",
                    sortable: true,
                    resizable: true,
                    width: 100,
                    dataIndex: "dataType",
                    menuDisabled: true
                }]
            },
            {
                "xtype": "treepanel",
                "region": "west",
                "width": 240,
                "autoScroll": true,
                "split": true,
                "requestMethod": "GET",
                "rootVisible": false,
                "containerScroll": true,
                "dataUrl": "entity/tree/entity",
                "lines": true,
                "border": false,
                "minWidth": 160,
                "id": "entityTree",
                "animate": false,
                "enableDD": true,
                "pathSeparator": "|",
                "trackMouseOver": true,
                "ref": "entityTree",
                "cls": "tplt-border-right",
                tbar: {
                    xtype: 'toolbar',
                    items: [
                        {
                            iconCls: "icon-treepanel",
                            ref: "../btnExp",
                            enableToggle: true,
                            pressed: true,
                            toggleHandler: function (c, d) {
                                if (d) {
                                    c.refOwner.expandAll();
                                } else {
                                    c.refOwner.collapseAll();
                                }
                            }
                        },
                        " ",
                        new od.SeSearch({
                            ref: '../search'
                        })
                    ]
                },
                "listeners": {
                    "click": function (node, evt) {
                        if (node) {
                            var pGrid = Ext.getCmp('pGrid');
                            me.entityId = node.attributes.code;
                            pGrid.getStore().load({params: {entityId: node.id}, marsk: true});
                        }
                    },
                    "beforerender": function (tree) {
                        tree.getLoader().baseParams = {
                            pidCode: 'pid',
                            indexCode: 'seq'
                        };

                        tree.getLoader().createNode = function (attrs) {
                            attrs.allowChildren = true;

                            if (attrs.leaf) {
                                attrs.iconCls = 'icon-package';
                                attrs.leaf = false;
                                attrs.loaded = true;
                            } else {
                                attrs.expanded = true;
                                attrs.iconCls = 'icon-folder-table';
                            }
                            return Ext.tree.TreeLoader.prototype.createNode.call(this, attrs);
                        }
                    }
                },
                "root": {
                    "xtype": "treenode",
                    "text": "实体管理",
                    "id": "-1"
                }
            }

//            {
//            xtype: "grid",
//            store: {
//                xtype: "jsonstore",
//				url:'entityMetadata',
//                storeId: "entityStore",
//				root:'root',
//				idProperty:'id',
//				fields:['name','id','code'],
//				autoLoad:true
//            },
//            region: "west",
//            width: 240,
//            border: false,
//            split: true,
//            style: "border-right:1px solid #8daccb",
//            autoExpandColumn: "col1",
//            columns: [{
//				id:'col1',
//                header: "Entity",
//                sortable: true,
//                resizable: false,
//                width: 100,
//                dataIndex: "name",
//                menuDisabled: true
//            }],
//			listeners:{
//				'rowclick':{
//					fn:function(grid,idx,evt){
//						var pGrid=Ext.getCmp('pGrid');
//						var item=grid.getSelectionModel().getSelected();
//						if(item){
//							this.entityId=item.data.code;
//							pGrid.getStore().load({params:{entityId:item.data.id}});
//						}
//					},
//					scope:this
//				}
//			}
//        }


        ];
        od.SEWindow.superclass.initComponent.call(this);
        this.addEvents('selected');
    }
});