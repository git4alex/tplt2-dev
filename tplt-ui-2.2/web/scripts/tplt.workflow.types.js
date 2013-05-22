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
    hiddenInToolbox: true,
    initConfig: function () {
        this.config.layout = 'flow';
        this.userConfig = this.userConfig || {};
        if (this.userConfig.id) {
        } else {
            this.userConfig.id = this.nextId();
            this.userConfig.name = this.userConfig.id;
            this.userConfig.isExecutable = true;
        }
    },
//    getDefaultInternals: function () {
//        var id = this.nextId();
//        return {cid: 'process',
//            userConfig: {
//                layout: 'flow',
//                id:this.nextId(),
//                name:this.id
//            }
//        };
//    },
    isValidParent: function (c) {
        return !c.isBoundary;
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
            name: 'isExecutable',
            group: 'Process',
            ctype: 'boolean'
        },
        {
            name: 'nameSpace',
            group: 'Process',
            ctype: 'string'
        },
        {
            name: 'candidateUsers',
            group: 'Activiti Extend',
            ctype: 'string'
        },
        {
            name: 'candidateGroups',
            group: 'Activiti Extend',
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
    cid: 'subprocess',
    iconCls: 'icon-flow-subprocess',
    category: "容器(Container)",
    defaultName: "&lt;SubProcess&gt;",
    text: "子流程",
    dtype: "xdsubprocess",
    xtype: 'subprocess',
    naming: "SubProcess",
    isContainer: true,
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
    getReferenceForConfig: function (b, a) {
        var c = xds.types.flow.SubProcess.superclass.getReferenceForConfig.call(this, b, a);
        if (b.isListener) {
            c.type = "array";
            c.ref = "flowListeners";
        } else if (b.isBoundary) {
            c.type = 'array';
            c.ref = "boundaryEvents";
        }
        return c;
    },
    isValidParent: function (c) {
        return c.cid != 'subprocess';
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
        },
        {
            name: 'triggeredByEvent',
            group: 'SubProcess',
            ctype: 'boolean'
        },
        {
            name: 'async',
            group: 'Activiti Extend',
            ctype: 'boolean'
        },
        {
            name: 'exclusive',
            group: 'Activiti Extend',
            ctype: 'boolean'
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

Ext.reg('xdsubprocess', xds.flow.SubProcess);

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
                    var sid = e.component.getConfigValue('sourceRef');
                    var eid = e.component.getConfigValue('targetRef');
                    if (sid == oldId) {
                        e.component.setConfig('sourceRef', v);
                    } else if (eid == oldId) {
                        e.component.setConfig('targetRef', v);
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
    cid: 'nonestart',
    iconCls: 'icon-flow-start-none',
    category: "启动事件(StartEvents)",
    defaultName: "&lt;NoneStart&gt;",
    text: "空事件",
    dtype: "nonestart",
    xtype: 'nonestart',
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

xds.types.flow.start.Message = Ext.extend(xds.types.flow.start.None, {
    cid: 'msgstart',
    iconCls: 'icon-flow-start-msg',
    defaultName: "&lt;MessageStart&gt;",
    text: "消息事件",
    dtype: "msgstart",
    xtype: 'msgstart',
    naming: "MessageStart",
    xdConfigs: [
        {
            name: 'messageRef',
            group: 'MsgEvent',
            ctype: 'string'
        }
    ]
});

xds.types.flow.start.Error = Ext.extend(xds.types.flow.start.None, {
    cid: 'errorstart',
    iconCls: 'icon-flow-start-error',
    defaultName: "&lt;ErrorStart&gt;",
    text: "异常事件",
    dtype: "errorstart",
    xtype: 'errorstart',
    naming: "ErrorStart",
    xdConfigs: [
        {
            name: 'errorRef',
            group: 'Exception',
            ctype: 'string'
        }
    ]
});

xds.types.flow.start.Timer = Ext.extend(xds.types.flow.start.None, {
    cid: 'timerstart',
    iconCls: 'icon-flow-start-timer',
    defaultName: "&lt;TimerStart&gt;",
    text: "定时器事件",
    dtype: "timerstart",
    xtype: 'timerstart',
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

Ext.ns('xds.flow.end');
Ext.ns('xds.types.flow.end');

xds.types.flow.end.None = Ext.extend(xds.types.flow.ShapeBase, {
    cid: 'noneend',
    iconCls: 'icon-flow-end-none',
    category: "结束事件(EndEvents)",
    defaultName: "&lt;NoneEnd&gt;",
    text: "空事件",
    dtype: "xdnoneend",
    xtype: 'noneend',
    naming: "NoneEnd",
    transformGroup: "state",
    connectable: true
});

xds.flow.end.None = Ext.extend(od.flow.end.None, {});
Ext.reg('xdnoneend', xds.flow.end.None);

xds.types.flow.end.Error = Ext.extend(xds.types.flow.end.None, {
    cid: 'errorend',
    iconCls: 'icon-flow-end-error',
    defaultName: "&lt;ErrorEnd&gt;",
    text: "异常事件",
    dtype: "errorend",
    xtype: 'errorend',
    naming: "ErrorEnd"
});

xds.types.flow.end.Cancel = Ext.extend(xds.types.flow.end.None, {
    cid: 'cancelend',
    iconCls: 'icon-flow-end-cancel',
    defaultName: "&lt;CancelEnd&gt;",
    text: "取消事件",
    dtype: "cancelend",
    xtype: 'cancelend',
    naming: "CancelEnd"
});

Ext.ns('xds.flow.boundary');
Ext.ns('xds.types.flow.boundary');
xds.types.flow.boundary.BoundaryBase = Ext.extend(xds.types.flow.ShapeBase, {
    category: "边界事件(BoundaryEvents)",
    isBoundary: true,
    isValidChild: function (ct) {
        return ct.isTask || ct.isContainer;
    },
    xdConfigs: [
        {
            name: 'cancelActivity',
            group: 'BoundaryEvents',
            ctype: 'boolean'
        },
        {
            name: 'attachedToRef',
            group: 'BoundaryEvents',
            ctype: 'string'
        }
    ]
});

xds.types.flow.boundary.Timer = Ext.extend(xds.types.flow.boundary.BoundaryBase, {
    cid: 'boundarytimer',
    iconCls: 'icon-flow-boundary-timer',
    defaultName: "&lt;Timer&gt;",
    text: "定时器事件",
    dtype: "boundarytimer",
    xtype: 'boundarytimer',
    naming: "Timer"
});

xds.types.flow.boundary.Error = Ext.extend(xds.types.flow.boundary.BoundaryBase, {
    cid: 'boundaryerror',
    iconCls: 'icon-flow-boundary-error',
    defaultName: "&lt;Error&gt;",
    text: "异常事件",
    dtype: "boundaryerror",
    xtype: 'boundaryerror',
    naming: "Error"
});

xds.types.flow.boundary.Signal = Ext.extend(xds.types.flow.boundary.BoundaryBase, {
    cid: 'boundarysignal',
    iconCls: 'icon-flow-boundary-signal',
    defaultName: "&lt;Signal&gt;",
    text: "信号事件",
    dtype: "boundarysignal",
    xtype: 'boundarysignal',
    naming: "Signal"
});

xds.types.flow.boundary.Message = Ext.extend(xds.types.flow.boundary.BoundaryBase, {
    cid: 'boundarymsg',
    iconCls: 'icon-flow-boundary-msg',
    defaultName: "&lt;Message&gt;",
    text: "消息事件",
    dtype: "boundarymsg",
    xtype: 'boundarymsg',
    naming: "Message"
});

xds.types.flow.boundary.Cancel = Ext.extend(xds.types.flow.boundary.BoundaryBase, {
    cid: 'boundarycancel',
    iconCls: 'icon-flow-boundary-cancel',
    defaultName: "&lt;Cancel&gt;",
    text: "取消事件",
    dtype: "boundarycancel",
    xtype: 'boundarycancel',
    naming: "Cancel"
});

Ext.ns('xds.types.flow.inter');
xds.types.flow.inter.None = Ext.extend(xds.types.flow.ShapeBase, {
    cid: 'internone',
    iconCls: 'icon-flow-inter-none',
    category: "中间事件(IntermediateEvents)",
    defaultName: "&lt;None&gt;",
    text: "空抛出事件",
    dtype: "internone",
    xtype: 'internone',
    naming: "None",
    transformGroup: 'state',
    connectable: true
});

xds.types.flow.inter.Timer = Ext.extend(xds.types.flow.inter.None, {
    cid: 'intertimer',
    iconCls: 'icon-flow-inter-timer',
    defaultName: "&lt;Timer&gt;",
    text: "定时器事件",
    dtype: "intertimer",
    xtype: 'intertimer',
    naming: "Timer"
});
xds.types.flow.inter.Message = Ext.extend(xds.types.flow.inter.None, {
    cid: 'intermsg',
    iconCls: 'icon-flow-inter-msg',
    defaultName: "&lt;Message&gt;",
    text: "消息事件",
    dtype: "intermsg",
    xtype: 'intermsg',
    naming: "Message"
});
xds.types.flow.inter.SignalCatch = Ext.extend(xds.types.flow.inter.None, {
    cid: 'intersignalcatch',
    iconCls: 'icon-flow-inter-signal',
    defaultName: "&lt;Signal&gt;",
    text: "信号(捕获)事件",
    dtype: "intersignalcatch",
    xtype: 'intersignalcatch',
    naming: "Signal"
});
xds.types.flow.inter.SignalThrow = Ext.extend(xds.types.flow.inter.None, {
    cid: 'intersignalthrow',
    iconCls: 'icon-flow-inter-signal-black',
    defaultName: "&lt;Signal&gt;",
    text: "信号(抛出)事件",
    dtype: "intersignalthrow",
    xtype: 'intersignalthrow',
    naming: "Signal"
});

xds.types.flow.TaskBase = Ext.extend(xds.types.flow.ShapeBase, {
    isTask: true,
    category: "任务(Task)",
    minWidth: 100,
    minHeight: 60,
    isResizable: function () {
        return true;
    },
    isValidParent: function (c) {
        return c.isBoundary;
    },
    initConfig: function (o) {
        xds.types.flow.TaskBase.superclass.initConfig.call(this, o);
        this.config.width = 100;
        this.config.height = 60;
    },
    getNode: function () {
        if (!this.node) {
            this.node = new Ext.tree.TreeNode({
                id: this.id,
                text: this.getNodeText(),
                iconCls: this.iconCls
            });
            this.node.component = this;
        }
        return this.node;
    },
    getReferenceForConfig: function (b, a) {
        var c = xds.types.flow.TaskBase.superclass.getReferenceForConfig.call(this, b, a);
        if (b.isListener) {
            c.type = "array";
            c.ref = "flowListeners";
        } else if (b.isBoundary) {
            c.type = 'array';
            c.ref = "boundaryEvents";
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
            name: 'isSequential',
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
        },
        {
            name: 'inputDataItem',
            group: 'MultiInstance',
            ctype: 'string'
        }
    ]
});

xds.types.flow.UserTask = Ext.extend(xds.types.flow.TaskBase, {
    cid: 'usertask',
    iconCls: 'icon-flow-task-user',
    defaultName: "&lt;UserTask&gt;",
    text: "用户任务",
    dtype: "usertask",
    xtype: 'usertask',
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

xds.types.flow.ServiceTask = Ext.extend(xds.types.flow.TaskBase, {
    cid: 'servicetask',
    iconCls: 'icon-flow-task-service',
    defaultName: "&lt;ServiceTask&gt;",
    text: "服务任务",
    dtype: "servicetask",
    xtype: 'servicetask',
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

xds.types.flow.ScriptTask = Ext.extend(xds.types.flow.TaskBase, {
    cid: 'scripttask',
    iconCls: 'icon-flow-task-script',
    defaultName: "&lt;ScriptTask&gt;",
    text: "脚本任务",
    dtype: "scripttask",
    xtype: 'scripttask',
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
        },
        {
            name: 'resultVariable',
            group: 'General',
            ctype: 'string'
        },
        {
            name: 'autoStoreVariables',
            group: 'General',
            ctype: 'boolean'
        }
    ]
});

xds.types.flow.MailTask = Ext.extend(xds.types.flow.TaskBase, {
    cid: 'mailtask',
    iconCls: 'icon-flow-task-email',
    defaultName: "&lt;MailTask&gt;",
    text: "邮件任务",
    dtype: "mailtask",
    xtype: 'mailtask',
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

xds.types.flow.ManualTask = Ext.extend(xds.types.flow.TaskBase, {
    cid: 'manualtask',
    iconCls: 'icon-flow-task-manual',
    defaultName: "&lt;ManualTask&gt;",
    text: "人工任务",
    dtype: "manualtask",
    xtype: 'manualtask',
    naming: "ManualTask"
});

xds.types.flow.Gateway = Ext.extend(xds.types.flow.ShapeBase, {
    cid: 'gateway',
    iconCls: 'icon-flow-gateway',
    category: "分支(Gateway)",
    defaultName: "&lt;Gateway&gt;",
    text: "分支",
    dtype: "gateway",
    xtype: 'gateway',
    naming: "Gateway"
});

xds.types.flow.GatewayAnd = Ext.extend(xds.types.flow.Gateway, {
    cid: 'gatewayand',
    iconCls: 'icon-flow-gatewayand',
    defaultName: "&lt;GatewayAnd&gt;",
    text: "分支(并行)",
    dtype: "gatewayand",
    xtype: 'gatewayand',
    naming: "GatewayAnd"
});

xds.types.flow.GatewayOr = Ext.extend(xds.types.flow.Gateway, {
    cid: 'gatewayor',
    iconCls: 'icon-flow-gatewayor',
    defaultName: "&lt;GatewayOr&gt;",
    text: "分支(包容)",
    dtype: "gatewayor",
    xtype: 'gatewayor',
    naming: "GatewayOr"
});

xds.types.flow.GatewayXor = Ext.extend(xds.types.flow.Gateway, {
    cid: 'gatewayxor',
    iconCls: 'icon-flow-gatewayxor',
    defaultName: "&lt;GatewayXor&gt;",
    text: "分支(排他)",
    dtype: "gatewayxor",
    xtype: 'gatewayxor',
    naming: "GatewayXor"
});

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
            options: ['class', 'expression', 'delegateExpression']
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
    cid: 'sequenceflow',
    iconCls: 'icon-flow-connection',
    defaultName: "&lt;Connection&gt;",
    xtype: 'sequenceflow',
    dtype: 'xdsequenceflow',
    naming: "Connection",
    isVisual: false,
    isConnection: true,
    hiddenInToolbox: true,
    initConfig: function (o) {
        this.userConfig = this.userConfig || {};
        this.userConfig.id = this.userConfig.id || this.nextId();
        this.userConfig.routerDir = this.userConfig.routerDir || 'H';
    },
    onSelectChange: function (a) {
        var cmp = this.getExtComponent();
        if (cmp) {
            cmp.toggleHilight(a);
        }
    },
    onFilmDblClick: function () {
        var d = this.getConfigValue('routerDir', 'H') == 'H' ? 'V' : 'H';
        this.setConfig('routerDir', d);
        xds.props.setValue('routerDir', d);
        xds.fireEvent("componentchanged");
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
            name: 'sourceRef',
            group: 'Connection',
            ctype: 'string'
        },
        {
            name: 'targetRef',
            group: 'Connection',
            ctype: 'string'
        },
        {
            name: 'conditionExpression',
            group: 'Connection',
            ctype: 'string'
        },
        {
            name: 'routerDir',
            group: 'Layout',
            ctype: 'string',
            editor: 'options',
            options: ['H', 'V']
        },
        {
            name: 'routerType',
            group: 'Layout',
            ctype: 'string',
            editor: 'options',
            options: ['Z', 'L']
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
        return this.getNodeByIdProperty(this.sourceRef);
    },
    getEndNode: function () {
        return this.getNodeByIdProperty(this.targetRef);
    },
    toggleHilight: function (a) {
        if (a) {
            var p = this.shape.paper;
            var path = this.shape.attr('path');
            var startPoint = Raphael.getPointAtLength(path, 0);
            var endPoint = Raphael.getPointAtLength(path, Raphael.getTotalLength(path));
            this.startHandler = p.circle(startPoint.x, startPoint.y, 4).attr({fill: 'red', 'stroke-width': 2, cursor: 'move'});
            this.endHandler = p.circle(endPoint.x, endPoint.y, 4).attr({fill: 'red', 'stroke-width': 2, cursor: 'move'});
            this.startHandler.vn = this.endHandler.vn = this.viewerNode;
        } else {
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
        var p = this.ownerCt.paper;
        var sb = this.startNode.getBox(), eb = this.endNode.getBox();
        var path = od.flow.getConPath(sb, eb, this.routerDir,this.routerType);
        this.shape = p.path(path).attr(this.getDefAttr());
        this.el = Ext.get(this.shape.node);
        this.drawText();

        this.rendered = true;

        if (this.viewerNode) {
            this.shape.vn = this.viewerNode;
            if (this.text) {
                this.text.vn = this.viewerNode;
            }
        }
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
    updatePath: function (sb, eb) {
        sb = sb || this.startNode.getBox();
        eb = eb || this.endNode.getBox();
        if (this.shape) {
            var path = od.flow.getConPath(sb, eb, this.routerDir,this.routerType).join(',');
            this.shape.attr({path: path});
            this.updateText();
            this.updateHandlers();
        }
    },
    updateText: function () {
        if (this.text) {
            var tp = this.shape.attr('path');
            var pt = Raphael.getPointAtLength(tp, Raphael.getTotalLength(tp) / 2);
            var dx = pt.alpha == 90 ? 10 : 0, dy = pt.alpha == 180 ? 10 : 0;
            this.text.attr({x: pt.x - dx, y: pt.y - dy, transform: 'r' + (pt.alpha + 180)});
        }
    },
    updateHandlers: function () {
        var tp = this.shape.attr('path'), pt;
        if (this.startHandler) {
            pt = Raphael.getPointAtLength(tp, 0);
            this.startHandler.attr({cx: pt.x, cy: pt.y});
        }
        if (this.endHandler) {
            pt = Raphael.getPointAtLength(tp, Raphael.getTotalLength(tp));
            this.endHandler.attr({cx: pt.x, cy: pt.y});
        }
    }
});

Ext.reg('xdsequenceflow', xds.flow.Connection);