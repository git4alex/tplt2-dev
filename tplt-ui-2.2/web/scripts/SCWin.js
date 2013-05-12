od.ComTreeLoader = Ext.extend(Ext.tree.TreeLoader,{
   createNode:function(attr){
        if(attr.type == 'category'){
            attr.iconCls = attr.iconCls || 'icon-category';
        }else if(attr.type == 'module'){
            attr.iconCls = attr.iconCls || 'icon-project';
        }else if(attr.type == 'component'){
            attr.iconCls = attr.iconCls || 'icon-cmp';
            if(attr.isDefault){
                attr.cls = 'node-default-component';
            }
        }

       return od.ComTreeLoader.superclass.createNode.call(this,attr);
   }
});

od.ComTree = Ext.extend(Ext.tree.TreePanel, {
    autoScroll: true,
    animate: false,
    containerScroll: true,
    border: false,
    rootVisible: false,
    lines:true,
    initComponent: function () {
        Ext.apply(this, {
            loader: new od.ComTreeLoader({
                url: 'comtree',
                requestMethod: 'GET',
                nodeParameter: 'moduleId'
            }),
            root: new Ext.tree.AsyncTreeNode({
                id: -1,
                expanded: true
            })
        });
        od.ComTree.superclass.initComponent.call(this, arguments);
    }
});

od.SCWin = Ext.extend(Ext.Window, {
    layout: 'fit',
    modal: true,
    initComponent: function () {
        this.comTree = new od.ComTree();
        this.comTree.on('dblclick',this.onAccept,this);
        Ext.apply(this, {
            items: [this.comTree],
            buttons: [
                {
                    text: '确认',
                    ref: '../btnAccept',
                    handler: this.onAccept,
                    scope: this
                },
                {
                    text: '取消',
                    ref: '../btnCancel',
                    handler: this.onCancel,
                    scope: this
                }
            ]
        });
        od.SCWin.superclass.initComponent.call(this, arguments);
        this.addEvents('selected');
    },
    onAccept: function () {
        var selected = this.comTree.getSelectionModel().getSelectedNode();
        if(selected.attributes.type != 'component'){
            Ext.Msg.alert('提示','当前选择的不是组件节点');
            return;
        }
        this.fireEvent('selected',selected.attributes);
        this.close();
    },
    onCancel: function () {
        this.close();
    }
});