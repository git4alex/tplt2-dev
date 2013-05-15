Ext.ns("xds.flow");
Ext.ns("xds.types.flow");

xds.types.flow.Process = Ext.extend(xds.types.BaseType, {
    cid: 'process',
    iconCls: 'icon-flow-process',
    defaultName: "&lt;Process&gt;",
    dtype: "xdprocess",
    xtype: 'process',
    naming: "Process",
    isContainer: true,
    bindable: false,
    hiddenInToolbox: true,
    initConfig: function () {
        this.config.layout = 'flow';
    },
    getDefaultInternals: function () {
        return {cid: 'process',
            userConfig: {
                layout: 'flow'
            }
        };
    },
    isValidParent: function () {
        return true;
    },
    getSnapToGrid: function () {
        return !this.snapToGrid ? "(none)" : this.snapToGrid;
    },
    setSnapToGrid: function (b, a) {
        var o = parseInt(this.snapToGrid, 0);
        if (o > 0) {
            xds.canvas.body.removeClass("xds-grid-" + o);
        }

        this.snapToGrid = a == "(none)" ? 0 : parseInt(a, 10);
        if (this.snapToGrid > 0) {
            xds.canvas.body.addClass("xds-grid-" + this.snapToGrid);
        }
    },
    getReferenceForConfig: function (b, a) {
        var c = xds.types.flow.Process.superclass.getReferenceForConfig.call(this, b, a);
        if (b.isListener) {
            c.type = "array";
            c.ref = "flowListeners";
        }
        return c;
    },
    xdConfigs: [
        {
            name: 'id',
            group: 'Process',
            ctype: 'string'
        },
        {
            name: 'name',
            group: 'Process',
            ctype: 'string'
        },
        {
            name: 'nameSpace',
            group: 'Process',
            ctype: 'string'
        },
        {
            name: 'candidateUsers',
            group: 'Process',
            ctype: 'string'
        },
        {
            name: 'candidateGroups',
            group: 'Process',
            ctype: 'string'
        }
    ]
});

xds.flow.Process = Ext.extend(od.flow.Process, {
    constructor: function (cfg) {
        xds.flow.Process.superclass.constructor.call(this, cfg);
        xds.flow.process = this;
    },
    createFilm: function () {

    }
});

Ext.reg('xdprocess', xds.flow.Process);

xds.types.flow.SubProcess = Ext.extend(xds.types.BaseType, {
    cid: 'flowsubprocess',
    iconCls: 'icon-flow-subprocess',
    category: "容器(Container)",
    defaultName: "&lt;SubProcess&gt;",
    text: "子流程",
    dtype: "xdflowsubprocess",
    xtype: 'flowsubprocess',
    naming: "SubProcess",
    isContainer: true,
    bindable: false,
    connectable: true,
    minWidth: 160,
    minHeight: 100,
    initConfig: function () {
        this.config.layout = 'flow';
        this.config.width = 400;
        this.config.height = 250;
        this.userConfig = this.userConfig || {};
        if (this.userConfig.id) {
        } else {
            this.userConfig.id = this.nextId();
            this.userConfig.name = this.userConfig.id;
        }
    },
    isValidParent: function (c) {
        return c.cid != 'flowsubprocess';
    },
    isResizable: function () {
        return true;
    },
    setX: function (n, x) {
        var ox = this.getConfigValue('x');
        this.node.eachChild(function (c) {
            var cc = c.component;
            if (!cc.isConnection) {
                var cox = cc.getConfigValue('x');
                cc.setConfig('x', cox + x - ox);
            }
        });
        this.setConfig('x', x);
    },
    setY: function (n, y) {
        var oy = this.getConfigValue('y');
        this.node.eachChild(function (c) {
            var cc = c.component;
            if (!cc.isConnection) {
                var coy = cc.getConfigValue('y');
                cc.setConfig('y', coy + y - oy);
            }
        });
        this.setConfig('y', y);
    },
    xdConfigs: [
        {
            name: 'id',
            group: 'SubProcess',
            ctype: 'string'
        },
        {
            name: 'name',
            group: 'SubProcess',
            ctype: 'string'
        },
        {
            name: 'width',
            group: 'SubProcess',
            ctype: 'number'
        },
        {
            name: 'height',
            group: 'SubProcess',
            ctype: 'number'
        },
        {
            name: 'x',
            group: 'Layout',
            ctype: 'number',
            setFn: 'setX'
        },
        {
            name: 'y',
            group: 'Layout',
            ctype: 'number',
            setFn: 'setY'
        }
    ]
});

xds.flow.SubProcess = Ext.extend(od.flow.SubProcess, {
    isContainer: true,
    createFilm: function () {

    },
    afterRender: function () {
        xds.flow.SubProcess.superclass.afterRender.call(this);
        var v = this.viewerNode;
        if (v && this.shape) {
            this.shape.forEach(function (i) {
                i.vn = v;
            });
        }
    }
});

Ext.reg('xdflowsubprocess', xds.flow.SubProcess);

xds.types.flow.EventSubProcess = Ext.extend(xds.types.flow.SubProcess, {
    cid: 'flowevtsubprocess',
    iconCls: 'icon-flow-evtsubprocess',
    defaultName: "&lt;EventSubProcess&gt;",
    text: "事件子流程",
    dtype: "xdflowevtsubprocess",
    xtype: 'flowevtsubprocess',
    naming: "EventSubProcess"
});
xds.flow.EventSubProcess = Ext.extend(od.flow.EventSubProcess, {
    isContainer: true,
    createFilm: function () {

    },
    afterRender: function () {
        xds.flow.EventSubProcess.superclass.afterRender.call(this);
        var v = this.viewerNode;
        if (v && this.shape) {
            this.shape.forEach(function (i) {
                i.vn = v;
            });
        }
    }
});

Ext.reg('xdflowevtsubprocess', xds.flow.EventSubProcess);

xds.types.flow.ShapeBase = Ext.extend(xds.types.BaseType, {
    transformGroup: "state",
    connectable: true,
    isResizable: function () {
        return false;
    },
    initConfig: function (o) {
        this.userConfig = this.userConfig || {};
        if (this.userConfig.id) {
        } else {
            this.userConfig.id = this.nextId();
            this.userConfig.name = this.userConfig.id;
        }
    },
    onSelectChange: function (b) {
        var cmp = this.getExtComponent();
        if (cmp) {
            cmp.toggleHilight(b);
        }
    },
    setId: function (n, v) {
        var oldId = this.getConfigValue('id') || this.id;
        this.setConfig('id', v);
        var fcn = this.owner.getNode();
        if (fcn.hasChildNodes()) {
            for (var b = 0, e; e = fcn.childNodes[b]; b++) {
                if (e.component.isConnection) {
                    var sid = e.component.getConfigValue('startId');
                    var eid = e.component.getConfigValue('endId');
                    if (sid == oldId) {
                        e.component.setConfig('startId', v);
                    } else if (eid == oldId) {
                        e.component.setConfig('endId', v);
                    }
                }
            }
        }
    },
    xdConfigs: [
        {
            name: 'id',
            group: 'Basic',
            ctype: 'string',
            setFn: 'setId'
        },
        {
            name: 'name',
            group: 'Basic',
            ctype: 'string'
        }
    ]
});

Ext.ns('xds.flow.start');
Ext.ns('xds.types.flow.start');

xds.types.flow.start.None = Ext.extend(xds.types.flow.ShapeBase, {
    cid: 'startnone',
    iconCls: 'icon-flow-start-none',
    category: "启动事件(StartEvents)",
    defaultName: "&lt;NoneStart&gt;",
    text: "空启动",
    dtype: "xdstartnone",
    xtype: 'startnone',
    naming: "NoneStart",
    transformGroup: "state",
    connectable: true,
    xdConfigs: [
        {
            name: 'formKey',
            group: 'Start',
            ctype: 'string'
        },
        {
            name: 'initiator',
            group: 'Start',
            ctype: 'string'
        }
    ]
});

xds.flow.start.None = Ext.extend(od.flow.start.None, {});
Ext.reg('xdstartnone', xds.flow.start.None);

xds.types.flow.start.Message = Ext.extend(xds.types.flow.start.None, {
    cid: 'startmsg',
    iconCls: 'icon-flow-start-msg',
    defaultName: "&lt;MessageStart&gt;",
    text: "消息启动",
    dtype: "xdstartmsg",
    xtype: 'startmsg',
    naming: "MessageStart",
    xdConfigs: [
        {
            name: 'messageRef',
            group: 'MsgEvent',
            ctype: 'string'
        }
    ]
});

xds.flow.start.Message = Ext.extend(od.flow.start.Message, {});
Ext.reg('xdstartmsg', xds.flow.start.Message);

xds.types.flow.start.Error = Ext.extend(xds.types.flow.start.None, {
    cid: 'starterror',
    iconCls: 'icon-flow-start-error',
    defaultName: "&lt;ErrorStart&gt;",
    text: "异常启动",
    dtype: "xdstarterror",
    xtype: 'starterror',
    naming: "ErrorStart",
    xdConfigs: [
        {
            name: 'errorRef',
            group: 'Exception',
            ctype: 'string'
        }
    ]
});

xds.flow.start.Error = Ext.extend(od.flow.start.Error, {});
Ext.reg('xdstarterror', xds.flow.start.Error);

xds.types.flow.start.Timer = Ext.extend(xds.types.flow.start.None, {
    cid: 'starttimer',
    iconCls: 'icon-flow-start-timer',
    defaultName: "&lt;TimerStart&gt;",
    text: "定时器启动",
    dtype: "xdstarttimer",
    xtype: 'starttimer',
    naming: "TimerStart",
    xdConfigs: [
        {
            name: 'type',
            group: 'Timer',
            ctype: 'string',
            editor: 'options',
            options: ['timeDate', 'timeDuration', 'timeCycle']
        },
        {
            name: 'expression',
            group: 'Timer',
            ctype: 'string'
        }
    ]
});

xds.flow.start.Timer = Ext.extend(od.flow.start.Timer, {});
Ext.reg('xdstarttimer', xds.flow.start.Timer);

Ext.ns('xds.flow.end');
Ext.ns('xds.types.flow.end');

xds.types.flow.end.None = Ext.extend(xds.types.flow.start.None, {
    cid: 'noneend',
    iconCls: 'icon-flow-end-none',
    category: "结束事件(EndEvents)",
    defaultName: "&lt;NoneEnd&gt;",
    text: "空结束",
    dtype: "xdnoneend",
    xtype: 'noneend',
    naming: "NoneEnd"
});

xds.flow.end.None = Ext.extend(od.flow.end.None, {});
Ext.reg('xdnoneend', xds.flow.end.None);

xds.types.flow.end.Error = Ext.extend(xds.types.flow.end.None, {
    cid: 'errorend',
    iconCls: 'icon-flow-end-error',
    defaultName: "&lt;ErrorEnd&gt;",
    text: "异常结束",
    dtype: "xderrorend",
    xtype: 'errorend',
    naming: "ErrorEnd"
});

xds.flow.end.Error = Ext.extend(od.flow.end.Error, {});
Ext.reg('xderrorend', xds.flow.end.Error);

xds.types.flow.end.Cancel = Ext.extend(xds.types.flow.end.None, {
    cid: 'cancelend',
    iconCls: 'icon-flow-end-cancel',
    defaultName: "&lt;CancelEnd&gt;",
    text: "取消结束",
    dtype: "xdcancelend",
    xtype: 'cancelend',
    naming: "CancelEnd"
});

xds.flow.end.Cancel = Ext.extend(od.flow.end.Cancel, {});
Ext.reg('xdcancelend', xds.flow.end.Cancel);

xds.types.flow.TaskBase = Ext.extend(xds.types.flow.ShapeBase, {
    isTask: true,
    category: "任务(Task)",
    minWidth: 100,
    minHeight: 60,
    isContainer: true,
    isResizable: function () {
        return true;
    },
    isValidParent: function () {
        return false;
    },
    initConfig: function (o) {
        xds.types.flow.TaskBase.superclass.initConfig.call(this, o);
        this.config.width = 100;
        this.config.height = 60;
    },
    getReferenceForConfig: function (b, a) {
        var c = xds.types.flow.Container.superclass.getReferenceForConfig.call(this, b, a);
        if (b.isListener) {
            c.type = "array";
            c.ref = "flowListeners";
        }
        return c;
    },
    xdConfigs: [
        {
            name: 'width',
            group: 'Layout',
            ctype: 'number'
        },
        {
            name: 'height',
            group: 'Layout',
            ctype: 'number'
        },
        {
            name: 'asynchronous',
            group: 'Basic',
            ctype: 'boolean'
        },
        {
            name: 'exclusive',
            group: 'Basic',
            ctype: 'boolean'
        },
        {
            name: 'sequential',
            group: 'MultiInstance',
            ctype: 'boolean'
        },
        {
            name: 'loopCardinality',
            group: 'MultiInstance',
            ctype: 'string'
        },
        {
            name: 'collection',
            group: 'MultiInstance',
            ctype: 'string'
        },
        {
            name: 'elementVariable',
            group: 'MultiInstance',
            ctype: 'string'
        },
        {
            name: 'complateCondition',
            group: 'MultiInstance',
            ctype: 'string'
        }
    ]
});

xds.types.flow.UserTask = Ext.extend(xds.types.flow.TaskBase, {
    cid: 'flowusertask',
    iconCls: 'icon-flow-task-user',
    defaultName: "&lt;UserTask&gt;",
    text: "用户任务",
    dtype: "xdflowusertask",
    xtype: 'flowusertask',
    naming: "UserTask",
    xdConfigs: [
        {
            name: 'assignee',
            group: 'General',
            ctype: 'string'
        },
        {
            name: 'candidateUsers',
            group: 'General',
            ctype: 'string'
        },
        {
            name: 'candidateGroups',
            group: 'General',
            ctype: 'string'
        },
        {
            name: 'formKey',
            group: 'General',
            ctype: 'string'
        },
        {
            name: 'dueDate',
            group: 'General',
            ctype: 'string'
        },
        {
            name: 'priority',
            group: 'General',
            ctype: 'string'
        }
    ]
});

xds.flow.UserTask = Ext.extend(od.flow.UserTask, {

});
Ext.reg('xdflowusertask', xds.flow.UserTask);

xds.types.flow.ServiceTask = Ext.extend(xds.types.flow.TaskBase, {
    cid: 'flowservicetask',
    iconCls: 'icon-flow-task-service',
    defaultName: "&lt;ServiceTask&gt;",
    text: "服务任务",
    dtype: "xdflowservicetask",
    xtype: 'flowservicetask',
    naming: "ServiceTask",
    xdConfigs: [
        {
            name: 'type',
            group: 'General',
            ctype: 'string',
            editor: 'options',
            options: ['javaClass', 'expression', 'delegateExpression']
        },
        {
            name: 'service',
            group: 'General',
            ctype: 'string'
        },
        {
            name: 'resultVariable',
            group: 'General',
            ctype: 'string'
        }
    ]
});

xds.flow.ServiceTask = Ext.extend(od.flow.ServiceTask, {

});
Ext.reg('xdflowservicetask', xds.flow.ServiceTask);

xds.types.flow.ScriptTask = Ext.extend(xds.types.flow.TaskBase, {
    cid: 'flowscripttask',
    iconCls: 'icon-flow-task-script',
    defaultName: "&lt;ScriptTask&gt;",
    text: "脚本任务",
    dtype: "xdflowscripttask",
    xtype: 'flowscripttask',
    naming: "ScriptTask",
    xdConfigs: [
        {
            name: 'scriptLanguage',
            group: 'General',
            ctype: 'string',
            editor: 'options',
            options: ['javascript', 'groovy']
        },
        {
            name: 'script',
            group: 'General',
            ctype: 'text'
        }
    ]
});

xds.flow.ScriptTask = Ext.extend(od.flow.ScriptTask, {

});
Ext.reg('xdflowscripttask', xds.flow.ScriptTask);

xds.types.flow.MailTask = Ext.extend(xds.types.flow.TaskBase, {
    cid: 'flowmailtask',
    iconCls: 'icon-flow-task-email',
    defaultName: "&lt;MailTask&gt;",
    text: "邮件任务",
    dtype: "xdflowmailtask",
    xtype: 'flowmailtask',
    naming: "MailTask",
    xdConfigs: [
        {
            name: 'to',
            group: 'General',
            ctype: 'string'
        },
        {
            name: 'from',
            group: 'General',
            ctype: 'string'
        },
        {
            name: 'subject',
            group: 'General',
            ctype: 'string'
        },
        {
            name: 'cc',
            group: 'General',
            ctype: 'string'
        },
        {
            name: 'bcc',
            group: 'General',
            ctype: 'string'
        },
        {
            name: 'charset',
            group: 'General',
            ctype: 'string'
        },
        {
            name: 'htmlText',
            group: 'General',
            ctype: 'text'
        },
        {
            name: 'non-htmlText',
            group: 'General',
            ctype: 'text'
        }
    ]
});

xds.flow.MailTask = Ext.extend(od.flow.MailTask, {

});
Ext.reg('xdflowmailtask', xds.flow.MailTask);

xds.types.flow.ManualTask = Ext.extend(xds.types.flow.TaskBase, {
    cid: 'flowmanualtask',
    iconCls: 'icon-flow-task-manual',
    defaultName: "&lt;ManualTask&gt;",
    text: "人工任务",
    dtype: "xdflowmanualtask",
    xtype: 'flowmanualtask',
    naming: "ManualTask"
});

xds.flow.ManualTask = Ext.extend(od.flow.ManualTask, {

});
Ext.reg('xdflowmanualtask', xds.flow.ManualTask);

xds.types.flow.Gateway = Ext.extend(xds.types.flow.ShapeBase, {
    cid: 'flowgateway',
    iconCls: 'icon-flow-gateway',
    category: "分支(Gateway)",
    defaultName: "&lt;Gateway&gt;",
    text: "分支",
    dtype: "xdflowgateway",
    xtype: 'flowgateway',
    naming: "Gateway"
});

xds.flow.Gateway = Ext.extend(od.flow.Gateway, {});

Ext.reg('xdflowgateway', xds.flow.Gateway);

xds.types.flow.GatewayAnd = Ext.extend(xds.types.flow.Gateway, {
    cid: 'flowgatewayand',
    iconCls: 'icon-flow-gatewayand',
    defaultName: "&lt;GatewayAnd&gt;",
    text: "分支(并行)",
    dtype: "xdflowgatewayand",
    xtype: 'flowgatewayand',
    naming: "GatewayAnd"
});

xds.flow.GatewayAnd = Ext.extend(od.flow.GatewayAnd, {});

Ext.reg('xdflowgatewayand', xds.flow.GatewayAnd);

xds.types.flow.GatewayOr = Ext.extend(xds.types.flow.Gateway, {
    cid: 'flowgatewayor',
    iconCls: 'icon-flow-gatewayor',
    defaultName: "&lt;GatewayOr&gt;",
    text: "分支(包容)",
    dtype: "xdflowgatewayor",
    xtype: 'flowgatewayor',
    naming: "GatewayOr"
});

xds.flow.GatewayOr = Ext.extend(od.flow.GatewayOr, {});

Ext.reg('xdflowgatewayor', xds.flow.GatewayOr);

xds.types.flow.GatewayXor = Ext.extend(xds.types.flow.Gateway, {
    cid: 'flowgatewayxor',
    iconCls: 'icon-flow-gatewayxor',
    defaultName: "&lt;GatewayXor&gt;",
    text: "分支(排他)",
    dtype: "xdflowgatewayxor",
    xtype: 'flowgatewayxor',
    naming: "GatewayXor"
});

xds.flow.GatewayXor = Ext.extend(od.flow.GatewayXor, {});

Ext.reg('xdflowgatewayxor', xds.flow.GatewayXor);

xds.types.flow.ListenerBase = Ext.extend(xds.types.BaseType, {
    defaultName: "&lt;Listener&gt;",
    dtype: 'flowlistener',
    naming: "Listener",
    isVisual: false,
    isListener: true,
    hiddenInToolbox: true,
    initConfig: function (o) {
        this.userConfig = this.userConfig || {};
        if (!this.userConfig.id) {
            this.userConfig.id = this.nextId();
        }
    },
    xdConfigs: [
        {
            name: 'type',
            group: 'Listener',
            ctype: 'string',
            editor: 'options',
            options: ['Java class', 'Expression', 'Delegate expression']
        },
        {
            name: 'listener',
            group: 'Listener',
            ctype: 'string'
        },
        {
            name: 'fields',
            group: 'Listener',
            ctype: 'text'
        }
    ]
});

xds.types.flow.ExecListener = Ext.extend(xds.types.flow.ListenerBase, {
    iconCls: 'icon-flow-exec-listener',
    cid: 'flowexeclistener',
    xtype: 'flowexeclistener',
    xdConfigs: [
        {
            name: 'event',
            group: 'Listener',
            ctype: 'string',
            editor: 'options',
            options: ['start', 'end']
        }
    ]
});

xds.types.flow.TaskListener = Ext.extend(xds.types.flow.ListenerBase, {
    iconCls: 'icon-flow-task-listener',
    cid: 'flowtasklistener',
    xtype: 'flowtasklistener',
    xdConfigs: [
        {
            name: 'event',
            group: 'Listener',
            ctype: 'string',
            editor: 'options',
            options: ['create', 'assignment', 'complete', 'all']
        }
    ]

});

xds.types.flow.Connection = Ext.extend(xds.types.BaseType, {
    cid: 'flowconnection',
    iconCls: 'icon-flow-connection',
    defaultName: "&lt;Connection&gt;",
    xtype: 'flowconnection',
    dtype: 'xdflowconnection',
    isContainer: false,
    naming: "Connection",
    isVisual: false,
    isConnection: true,
    hiddenInToolbox: true,
    initConfig: function (o) {
        this.userConfig = this.userConfig || {};
        if (!this.userConfig.id) {
            this.userConfig.id = this.nextId();
        }
    },
    onSelectChange: function (a) {
        var cmp = this.getExtComponent();
        if (cmp) {
            cmp.toggleHilight(a);
        }
    },
    xdConfigs: [
        {
            name: 'id',
            group: 'Connection',
            ctype: 'string'
        },
        {
            name: 'name',
            group: 'Connection',
            ctype: 'string'
        },
        {
            name: 'startId',
            group: 'Connection',
            ctype: 'string'
        },
        {
            name: 'endId',
            group: 'Connection',
            ctype: 'string'
        }
    ]
});

xds.flow.Connection = Ext.extend(od.flow.Connection, {
    createFilm: function () {

    },
    getNodeByIdProperty: function (i) {
        var node = xds.inspector.getNodeById(i);
        if (node) {
            return Ext.getCmp(node.component.cmpId);
        }
        return null;
    },
    getStartNode: function () {
        return this.getNodeByIdProperty(this.startId);
    },
    getEndNode: function () {
        return this.getNodeByIdProperty(this.endId);
    },
    toggleHilight: function (a) {
        if (a) {
            this.shape.attr({'stroke-width': 3});
            var p = this.shape.paper;
            var path = this.shape.attr('path');
            var startPoint = Raphael.getPointAtLength(path, 0);
            var endPoint = Raphael.getPointAtLength(path, Raphael.getTotalLength(path));
            this.startHandler = p.circle(startPoint.x, startPoint.y, 4).attr({fill: 'red', 'stroke-width': 2});
            this.endHandler = p.circle(endPoint.x, endPoint.y, 4).attr({fill: 'red', 'stroke-width': 2});
            this.startHandler.vn = this.endHandler.vn = this.viewerNode;
        } else {
            this.shape.attr({'stroke-width': 2});
            if (this.startHandler) {
                this.startHandler.remove();
                delete this.startHandler;
            }
            if (this.endHandler) {
                this.endHandler.remove();
                delete this.endHandler;
            }
        }
    },
    doRender: function (ct, pos) {
        xds.flow.Connection.superclass.doRender.call(this, ct, pos);
        if (this.startNode) {
            this.startNode.on('move', this.updatePath, this);
        }
        if (this.endNode) {
            this.endNode.on('move', this.updatePath, this);
        }
        if (this.viewerNode.isSelected()) {
            this.toggleHilight(true);
        }
    },
    updatePath: function () {
        if (this.shape) {
            var sb = this.startNode.positionShape.getBBox(), eb = this.endNode.positionShape.getBBox();
            var path = od.flow.getConPath(sb, eb).join(',');
            this.shape.attr({path: path});
            this.updateText();
        }
    },
    updateText: function () {
        if (this.text) {
            var p = this.ownerCt.paper;
            var tp = this.shape.attr('path');
            var pt = Raphael.getPointAtLength(tp, Raphael.getTotalLength(tp) / 2);
            var dx = pt.alpha == 90 ? 10 : 0, dy = pt.alpha == 180 ? 10 : 0;
            this.text.attr({x: pt.x - dx, y: pt.y - dy, transform: 'r' + (pt.alpha + 180)});
        }
    }
});

Ext.reg('xdflowconnection', xds.flow.Connection);