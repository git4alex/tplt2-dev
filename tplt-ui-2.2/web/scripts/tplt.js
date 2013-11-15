Ext.Ajax.on("requestexception", function (conn, resp, opts) {
    var title = '错误';
    var msg = '服务器内部错误';
    if (resp.status == 5001) {
        var ex = Ext.decode(resp.responseText);
        if (ex.exception) {
            msg = ex.exception.message || msg;
        }
    }else if(resp.status == 403) {
        msg = '访问被拒绝，请确认是否有访问该资源的权限';
    }
    Ext.Msg.show({
        title: title,
        msg: msg,
        buttons: Ext.Msg.OK,
        fn: Ext.emptyFn,
        icon: Ext.Msg.ERROR
    });
});

Ext.util.JSON.encodeDate = function (d) {
    return d.format('"Y-m-d H:i:s"');
};

Ext.override(Ext.form.TriggerField, {
    initComponent: function () {
        Ext.form.TriggerField.superclass.initComponent.call(this);
        this.addEvents('triggerclick');
    },

    onTriggerClick: function () {
        this.fireEvent('triggerclick', this);
    }
});

Ext.ns('org.delta');
var od = org.delta;
od.DEBUG_ENABLE = false;
Ext.QuickTips.init();
Ext.History.init();

od.App = function (cfg) {
    od.App.superclass.constructor.call(this, cfg);

    Ext.apply(this, cfg);

    var moduleRegistory = {};
    this.getModuleRegistory = function () {
        return moduleRegistory;
    };

    od.appInstance = this;

    Ext.History.on('change', function (token) {
        if (token != this.active.moduleId) {
            this.activeModule(token);
        }
    }, this);
};

Ext.extend(od.App, Ext.util.Observable, {
    init: function () {
        this.startUserCheckTask();
    },

    start: function (cfg) {
        Ext.Ajax.request({
            url: 'getAppConfig',
            success: function (response) {
                var cfg = Ext.decode(response.responseText);
                this.onCfgLoaded(cfg.data);
            },
            scope: this
        });
    },

    onCfgLoaded: function (cfg) {
        this.appConfig = cfg;
        Ext.util.Cookies.set("currentUserId", cfg.user.id);
        this.init();
        this.showView();
        this.fireEvent('configupdated', cfg);
    },

    startUserCheckTask: function () {
        this.userCheckTask = {
            run: function () {
                var currentUserId = Ext.util.Cookies.get("currentUserId");
                if (currentUserId != od.appInstance.appConfig.user.id) {
                    Ext.Msg.show({
                        title: '提示',
                        msg: '当前用户已退出，请重新登录。',
                        buttons: Ext.Msg.OK,
                        fn: function (btn) {
                            window.location = '/login.html';
                        },
                        icon: Ext.MessageBox.WARNING
                    });

                    Ext.TaskMgr.stop(od.appInstance.userCheckTask);
                }
            },
            interval: 1000
        };

        Ext.TaskMgr.start(this.userCheckTask);
    },

    showView: function () {
        this.view = this.getView();

        var mid = window.location.hash;
        if (!Ext.isEmpty(mid)) {
            if (mid.length > 0) {
                mid = mid.substring(1, mid.length);
            }

            if (!Ext.isEmpty(mid)) {
                this.activeModule(mid);
            }
        } else if (!Ext.isEmpty(this.defaultModule)) {
            this.activeModule(this.defaultModule);
        }
    },

    activeModule: function (mtype) {
        if (od.ModuleMgr.isRegistered(mtype)) {
            this.showModule(mtype);
        } else {
            od.ModuleMgr.loadModuleDef(mtype, this.showModule, this);
        }
    },

    getView: function () {
        return this.view = this.view || new od.DefaultAppView();
    },

    showModule: function (mtype) {
        var module = od.ModuleMgr.create(mtype);
        if (module.fireEvent('beforeload', module)) {
            this.active = this.view.showModule(module);
            if (this.active) {
                window.location.hash = this.active.id;
                Ext.History.add(this.active.id);

                if (this.active.name) {
                    Ext.getDoc().dom.title = this.active.name;
                }

                this.active.fireEvent('active', this.active);
            }
        }
    }
});

od.DefaultMainMenu = Ext.extend(Ext.Toolbar, {
    add: function (item) {
        this.addDefaultHandler(item);
        od.DefaultMainMenu.superclass.add.call(this, item);
    },

    addDefaultHandler: function (item) {
        item.menu = item.children;
        if (!Ext.isEmpty(item.menu)) {
            item.hideOnClick = false;
            Ext.each(item.menu, this.addDefaultHandler, this);
        } else {
            if (!Ext.isEmpty(item.moduleId)) {
                Ext.apply(item, {
                    href: 'index#' + item.moduleId,
                    handler: function () {
                        od.appInstance.activeModule(this.moduleId);
                    }
                });
            }
        }
    }
});

od.AppView = function (app, cfg) {
    this.app = app;
    od.AppView.superclass.constructor.call(this, cfg);
};

Ext.extend(od.AppView, Ext.Viewport, {
    showModule: function (module) {
        var defComp = module.createDefaultComponent();
        if (!Ext.isEmpty(defComp)) {
            if (defComp.xtype == 'window') {
//                this.clientArea.add({region: 'center', xtype: 'panel', style: 'padding:4px;'});
//                this.clientArea.doLayout();
                defComp.show();
                return null;
            } else {
                this.clientArea.removeAll(true);
                Ext.apply(defComp, this.getModuleStyle());
                this.clientArea.add(defComp);
                this.clientArea.doLayout();
            }
        }

        return module;
    },
    getModuleStyle: function () {
        return {};
    }
});

od.DefaultAppView = Ext.extend(od.AppView, {
    layout: 'border',
    initComponent: function () {
        this.mainMenu = new od.DefaultMainMenu();
        Ext.each(this.app.appConfig.menuList, function (item) {
            this.mainMenu.addItem(item);
        }, this);
        this.header = new Ext.Panel({
            height: 48,
            border: false,
            cls: 'tplt-bottom-border',
            region: 'north',
            layout: 'hbox',
            layoutConfig: {align: 'stretch'},
            items: [
                {
                    xtype: 'container',
                    border: false,
                    id: 'logo',
                    width: 210
                },
                {
                    xtype: 'container',
                    flex: 1,
                    border: false,
                    id: 'head'
                },
                {
                    width: 320,
                    border: false,
                    bodyCssClass: 'user-info-bg',
                    id: 'userInfoPanel'
                }
            ]
        });

        this.foot = new Ext.Panel({
            height: 32,
            border: false,
            region: 'south',
            cls: 'tplt-top-border'
        });

        this.clientArea = new Ext.Panel({
            region: 'center',
            border: false,
            tbar: this.mainMenu,
            layout: 'fit'
        });

        Ext.apply(this, {
            items: [this.header, this.foot, this.clientArea]
        });

        od.DefaultAppView.superclass.initComponent.call(this);
    },
//    updateMainMenu:function(){
//	    if(menu && menu.length>0){
//	        this.mainMenu.removeAll(true);
//	        for(var i=0;i<menu.length;i++){
//	        	this.mainMenu.addItem(menu[i]);
//	        }
//
//	        this.mainMenu.doLayout();
//	    }
//    },
    getModuleStyle: function () {
        return {style: 'padding:4px;'};
    }
});

od.DefaultAppView2 = Ext.extend(od.AppView, {
    layout: 'border',
    initComponent: function () {
        this.header = new Ext.Panel({
            height: 48,
            border: false,
            cls: 'tplt-bottom-border',
            region: 'north',
            layout: 'hbox',
            layoutConfig: {align: 'stretch'},
            items: [
                {
                    xtype: 'container',
                    border: false,
                    id: 'logo',
                    width: 210
                },
                {
                    xtype: 'container',
                    flex: 1,
                    border: false,
                    id: 'head'
                },
                {
                    width: 320,
                    border: false,
                    bodyCssClass: 'user-info-bg',
                    id: 'userInfoPanel'
                }
            ]
        });

        this.foot = new Ext.Panel({
            height: 32,
            border: false,
            region: 'south',
            cls: 'tplt-top-border'
        });

        this.clientArea = new Ext.Panel({
            region: 'center',
            border: false,
            layout: 'fit',
            cls: 'tplt-left-border'
        });

        var MenuItem = Ext.extend(Ext.tree.TreeNode, {
            nodeType: 'menu',
            appendChild: function (attr) {
                if (attr.xtype) {
                    return null;
                }

                if (this.isRoot) {
                    if (!Ext.isArray(attr)) {
                        if (attr.children) {
                            attr.cls = "nav-ct";
                        }
                    }
                }
                return MenuItem.superclass.appendChild.call(this, attr);
            }
        });

        Ext.tree.TreePanel.nodeTypes.menu = MenuItem;

        this.nav = new Ext.tree.TreePanel({
            id: 'nav',
            title: '主菜单',
            region: 'west',
            width: 240,
            border: false,
            style: 'border-right:1px solid #8daccb;',
            split: true,
            useArrows: true,
            root: new MenuItem(),
            rootVisible: false,
            collapsible: true,
            animCollapse: false,
            animFloat: false,
            animate: false,
            cmargins: '2',
            singleExpand: true,
            autoScroll: true
        });

        this.nav.on('dblclick', function (node, evt) {
            od.appInstance.activeModule(node.attributes.moduleId);
        });

        this.nav.getSelectionModel().on("beforeselect", function (sm, newSelection, oldSelection) {
            if (newSelection && !newSelection.isLeaf()) {
                if (!newSelection.expanded) {
                    newSelection.expand(true);
                } else {
                    newSelection.collapse();
                }
                return false;
            }
        });
        this.nav.getRootNode().appendChild(this.app.appConfig.menuList);
        Ext.apply(this, {
            items: [this.header, this.foot, this.clientArea, this.nav]
        });

        od.DefaultAppView2.superclass.initComponent.call(this);
    },
    getModuleStyle: function () {
        return {border: false};
    }
});

od.ModuleMgr = function () {
    var types = {};

    return{
        create: function (mtype) {
            return new types[mtype]();
        },
        isRegistered: function (mtype) {
            return types[mtype] !== undefined;
        },
        registerType: function (mtype, cls) {
            types[mtype] = cls;
            cls.mtype = mtype;
        },
        loadModuleDef: function (mtype, cb, scope) {
            var me = this;
            Ext.Ajax.request({
                url: 'module/' + mtype,
                method: 'GET',
                success: function (response) {
                    var ret = Ext.decode(response.responseText);
                    if (ret.success) {
                        me.registerType(mtype, Ext.extend(od.XdsModule, ret.data));
                        cb.call(scope, mtype);
                    }
                }
            });
        },
        getTypes: function () {
            return types;
        }
    };
}();

od.Clipboard = function () {
    var data = null;
    var inited = false;
    return {
        putData: function (v) {
            data = v;
            Ext.Ajax.request({
                url: '/clipboard',
                method: 'PUT',
                jsonData: {data: v},
                success: function (response) {

                }
            });
        },
        getData: function (cb, scope) {
            Ext.Ajax.request({
                url: '/clipboard',
                method: 'GET',
                success: function (response) {
                    inited = true;
                    try {
                        var tmp = Ext.decode(response.responseText);
                        data = tmp.data;
                        cb.call(scope, data);
                    } catch (e) {
                        cb.call(scope, null);
                    }
                }
            });
        }
    }
}();

od.Module = Ext.extend(Ext.util.Observable, {
    constructor: function (cfg) {
        this.addEvents('beforeload', 'active', 'init');
        od.Module.superclass.constructor.call(this, cfg);
        this.init();
    },
    init: function () {
        if (this.components && this.components.length > 0) {
            var tmp = this.components;
            this.comRegistry = new Ext.util.MixedCollection();
            for (var i = 0; i < tmp.length; i++) {
                if (tmp[i].id) {
                    this.comRegistry.add(tmp[i].id, tmp[i]);
                }
            }
        }

        this.fireEvent('init', this);
    },
    createDefaultComponent: Ext.emptyFn,
    createComponent: function (comId, cfg) {
        var defaultCfg = this.copy(this.comRegistry.get(comId));
        Ext.apply(defaultCfg, cfg);
        return Ext.create(defaultCfg);
    },
    copy: function (obj) {//e
        if (typeof(obj) != 'object') {
            return obj;
        }
        var ret = {};
        if (!obj) {
            return ret;
        }
        var item, value;//c:item;b:value
        for (var i in obj) {
            item = typeof obj[i];
            value = obj[i];
            if (item === "object") {
                if (Ext.isArray(value)) {
                    ret[i] = [];
                    for (var c = 0; c < value.length; c++) {
                        ret[i].push(this.copy(value[c]));
                    }
                } else {
                    ret[i] = this.copy(value);
                }
            } else {
                ret[i] = value;
            }
        }
        return ret;
    }
});

od.XdsModule = Ext.extend(od.Module, {
    createDefaultComponent: function () {
        if (this.components && this.components.length > 0) {
            if (this.defaultComponent) {
                return this.createComponent(this.defaultComponent);
            } else {
                return this.createComponent(this.components[0].id);
            }
        }
    }
});

od.create = function (comId, cfg) {
    return od.appInstance.active.createComponent(comId, cfg);
};

od.showWindow = function (winId, cfg) {
    var win = Ext.getCmp(winId);

    if (Ext.isEmpty(win)) {
        win = od.appInstance.active.createComponent(winId, cfg);
    }

    if (win) {
        win.show();
    }

    return win;
};

od.closeWindow = function (winId) {
    var win = Ext.getCmp(winId);
    if (win) {
        win.close();
    }
};

od.hasPermission = function (permissionId) {
    if (Ext.isArray(od.appInstance.appConfig.user.perms)) {
        if (od.appInstance.appConfig.user.perms.indexOf(permissionId) < 0) {
            return false;
        }
    }
    return true;
};
od.common = function () {
    var saveEntity = function (options) {
        if (!options.entityCode) {
            throw '实体编码不能为空';
        }

        if (!options.data) {
            throw '实体内容不能为空';
        }

        var defaultSuccessFn = function (resp) {
            var result = Ext.decode(resp.responseText);
            if (result.success) {
                if (options.successCb) {
                    options.successCb(result);
                }
            } else {
                Ext.Msg.alert('错误', result.message);
            }
        };
        Ext.Ajax.request({
            url: 'entity/' + options.entityCode + (options.data.id ? '/' + options.data.id : ''),
            method: options.method,
            jsonData: options.data,
            success: defaultSuccessFn
        });
    };

    return {
        createEntity: function (entityCode, data, successCb) {
            saveEntity({
                entityCode: entityCode,
                data: data,
                successCb: successCb,
                method: 'POST'
            });
        },
        batchCreateEntity: function (entityCode, vs, successCb) {
            if (Ext.isEmpty(entityCode)) {
                throw '实体编码不能为空';
            }

            if (Ext.isEmpty(vs)) {
                throw '实体内容不能为空';
            }

            Ext.Ajax.request({
                url: 'entity/batch/' + entityCode,
                method: 'POST',
                jsonData: vs,
                success: function (resp) {
                    var result = Ext.decode(resp.responseText);
                    if (result.success) {
                        if (successCb) {
                            successCb(result);
                        }
                    } else {
                        Ext.Msg.alert('错误', result.message);
                    }
                }
            });
        },
        updateEntityById: function (entityCode, id, data, successCb) {
            if (!id) {
                throw '必须指定要更新的实体ID';
            }
            data.id = id;
            saveEntity({
                entityCode: entityCode,
                data: data,
                successCb: successCb,
                method: 'PUT'
            });
        },
        deleteEntityById: function (entityCode, id, successCb, noConfirm) {
            if (!entityCode) {
                throw '实体编码不能为空';
            }
            if (Ext.isEmpty(id)) {
                throw '实体ID不能为空';
            }

            var defaultSuccessFn = function (resp) {
                var result = Ext.decode(resp.responseText);
                if (result.success) {
                    if (successCb) {
                        successCb();
                    }
                } else {
                    Ext.Msg.alert('错误', result.msg);
                }
            };
            var req = function () {
                if (!Ext.isArray(id)) {
                    Ext.Ajax.request({
                        url: 'entity/' + entityCode + '/' + id,
                        method: 'DELETE',
                        success: defaultSuccessFn
                    });
                } else {
                    Ext.Ajax.request({
                        url: 'entity/' + entityCode,
                        method: 'DELETE',
                        jsonData: {
                            ids: id.join(',')
                        },
                        success: defaultSuccessFn
                    });
                }
            };

            if (noConfirm) {
                req();
            } else {
                Ext.Msg.confirm('提示', '是否确认删除选择的记录？', function (btn) {
                    if (btn == 'yes') {
                        req();
                    }
                });
            }
        },
        getFormValues: function (form) {
            if (Ext.isString(form)) {
                form = Ext.getCmp(form);
            }
            if (form) {
                form = form.getForm();
                if (form.isValid()) {
                    return form.getFieldValues();
                }
            }

            return false;
        },
        getSelected: function (grid) {
            if (Ext.isString(grid)) {
                grid = Ext.getCmp(grid);
            }
            if (grid) {
                var rec = grid.getSelectionModel().getSelected();
                if (!rec) {
                    Ext.Msg.alert('提示', '请选择要操作的记录。');
                    return false;
                }
                return rec.data;
            }
        },
        getQueryParams: function (form) {
            if (Ext.isString(form)) {
                form = Ext.getCmp(form);
            }
            if (form) {
                form = form.getForm();
                if (form.isValid()) {
                    var values = form.getFieldValues();
                    var ret = [];
                    for (var prop in values) {
                        if (values.hasOwnProperty(prop)) {
                            if (Ext.isFunction(values[prop])) {
                                continue;
                            }

                            if (Ext.isEmpty(values[prop])) {
                                continue;
                            }

                            var tmp = prop.split('|');
                            var field = tmp[0];
                            var operator = tmp[1];

                            var condition = {};
                            condition.field = field;
                            condition.operator = operator;
                            condition.value = values[prop];

                            ret.push(condition);
                        }
                    }

                    return ret;
                }
            }
        },
        filterGrid: function (grid, params) {
            var store = grid.getStore();
            if (Ext.isEmpty(params)) {
                delete store.baseParams['queryParams'];
            } else {
                store.setBaseParam('queryParams', Ext.encode(params));
            }

            store.load();
        }
    };
}();

var odc = od.common;
od.DebugModule = Ext.extend(od.XdsModule, {
    id: 'debug',
    iconCls: 'icon-bug',
    name: '调试',
    listeners: {
        beforeload: function (m) {
            var mainMenu = od.appInstance.getView().mainMenu;
            var debugItem = mainMenu.find("moduleId", "debug");
            Ext.each(debugItem, function (item) {
                od.DEBUG_ENABLE = !od.DEBUG_ENABLE;
                item.toggle(od.DEBUG_ENABLE);
            });
            return false;
        }
    }
});
od.ModuleMgr.registerType('debug', od.DebugModule);
Ext.onReady(function () {
    Ext.getDoc().addKeyListener(8, function (key, evt) {
        var tgt = evt.target;
        if (tgt.tagName.toLowerCase() != 'input' && tgt.tagName.toLowerCase() != 'textarea') {
            evt.stopEvent();
        }
    });
});



