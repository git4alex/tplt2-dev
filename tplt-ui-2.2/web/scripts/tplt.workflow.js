Ext.ns("od.flow");
Ext.ns("xds.types.flow");
Ext.ns("xds.flow");

od.flow.getConPath = function (bb1, bb2) {
    var st = {x: bb1.x + bb1.width / 2, y: bb1.y - 1};
    var sb = {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1};
    var sl = {x: bb1.x - 1, y: bb1.y + bb1.height / 2};
    var sr = {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2};
    var sc = {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height / 2};

    var et = {x: bb2.x + bb2.width / 2, y: bb2.y - 1};
    var eb = {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1};
    var el = {x: bb2.x - 1, y: bb2.y + bb2.height / 2};
    var er = {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2};
    var ec = {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height / 2};

    var r = 0;
    var dx = ec.x - sc.x,
        dy = ec.y - sc.y;
    if (!dx && !dy) {
        r = 0;
    }
    r = (180 + Math.atan2(-dy, -dx) * 180 / Math.PI + 360) % 360;

    var ps, p1, p2, pe;
    if (r <= 45 || r > 315) { //r-l
        ps = sr;
        pe = el;
        p1 = {x: ps.x + (pe.x - ps.x) / 2, y: ps.y};
        p2 = {x: p1.x, y: pe.y};
    } else if (r > 45 && r <= 135) {//b-t
        ps = sb;
        pe = et;
        p1 = {x: ps.x, y: ps.y + (pe.y - ps.y) / 2};
        p2 = {x: pe.x, y: p1.y}
    } else if (r > 135 && r <= 225) {//l-r
        ps = sl;
        pe = er;
        p1 = {x: pe.x + (ps.x - pe.x) / 2, y: ps.y};
        p2 = {x: p1.x, y: pe.y};
    } else {//t-b
        ps = st;
        pe = eb;
        p1 = {x: ps.x, y: pe.y + (ps.y - pe.y) / 2};
        p2 = {x: pe.x, y: p1.y};
    }

    return ['M', ps.x.toFixed(0), ps.y.toFixed(0), 'L', p1.x.toFixed(0), p1.y.toFixed(0), p2.x.toFixed(0), p2.y.toFixed(0), pe.x.toFixed(0), pe.y.toFixed(0)];
};

od.flow.FlowLayout = Ext.extend(Ext.layout.ContainerLayout, {
    renderAll: function (ct, target) {
        var items = ct.items.items, i, c, len = items.length;
        var conns = [];
        for (i = 0; i < len; i++) {
            c = items[i];
            if (c.isConnection) {
                conns.push(c);
                continue;
            }
            if (c && (!c.rendered || !this.isValidParent(c, target))) {
                this.renderItem(c, i, target);
            }
        }

        Ext.each(conns, function (con) {
            if (con && (!con.rendered || !this.isValidParent(con, target))) {
                this.renderItem(con, i, target);
            }
        }, this);
    }
});

Ext.Container.LAYOUTS['flow'] = od.flow.FlowLayout;

od.flow.Container = Ext.extend(Ext.Container, {
    layout: 'flow',
    onRender: function (ct) {
        var p = this.paper = Raphael(ct.dom);
        p.vl = p.path(['M', 0, 0, 'L', 0, p.height].join(',')).attr({'stroke': '#aaa', 'stroke-dasharray': '-'});
        p.vl.hide();

        p.hl = p.path(['M', 0, 0, 'L', p.width, 0].join(',')).attr({'stroke': '#aaa', 'stroke-dasharray': '-'});
        p.hl.hide();

        this.el = Ext.get(this.paper.canvas);
        od.flow.Container.superclass.onRender.call(this, ct);
    },
    getWidth: function () {
        return this.lastSize.width;
    },

    getHeight: function () {
        return this.lastSize.height;
    },

    onResize: function (w, h) {
        this.paper.setSize(w, h);
    }
});
Ext.reg('flowcontainer', od.flow.Container);

xds.types.flow.Container = Ext.extend(xds.types.BaseType, {
    cid: 'flowcontainer',
    iconCls: 'icon-flow-container',
    category: "业务流程",
    defaultName: "&lt;Flow&gt;",
    text: "流程容器",
    dtype: "xdflowcontainer",
    xtype: 'flowcontainer',
    naming: "Process",
    isContainer: true,
    bindable: false,
    hiddenInToolbox: true,
    initConfig: function () {
        this.config.layout = 'flow';
    },
    getDefaultInternals: function (a) {
        return {cid: 'flowcontainer',
            userConfig: {
                layout: 'flow'
            }
        };
    },
    isValidParent: function () {
        return true;
    },
    getSnapToGrid: function (a) {
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
        var c = xds.types.flow.Container.superclass.getReferenceForConfig.call(this, b, a);
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

xds.flow.Container = Ext.extend(od.flow.Container, {
    constructor: function (cfg) {
        xds.flow.Container.superclass.constructor.call(this, cfg);
        xds.flow.container = this;
    },
    createFilm: function () {

    }
});

Ext.reg('xdflowcontainer', xds.flow.Container);

od.flow.Shape = Ext.extend(Ext.BoxComponent, {
    onRender: function (ct, pos) {
        if (!this.el) {
            var p = this.ownerCt.paper;
            if (p) {
                p.setStart();
                this.drawShape(p);
                this.drawText(p);
                this.shape = p.setFinish();
                this.el = Ext.get(this.shape[0].node);
                this.shape.attr({'font-size': 12, 'font-family': 'sans-serif', cursor: 'default'});
            }
        }
        od.flow.Shape.superclass.onRender.call(this, ct, pos);
    },
    drawShape: Ext.emptyFn,
    drawText: function (p) {
        if (this.name) {
            p.text(this.x, this.y + 28, this.name);
        }
    },
    onResize: function (aw, ah) {
        this.width = aw;
        this.height = ah;
    },
    getSize: function () {
        return {width: this.width, height: this.height};
    },
    getWidth: function () {
        return this.getSize().width;
    },
    getHeight: function () {
        return this.getSize().height;
    },
    createFilm: function () {

    },
    afterRender: function () {
        od.flow.Shape.superclass.afterRender.call(this);
        var v = this.viewerNode;
        if (v && this.shape) {
            this.shape.forEach(function (i) {
                i.vn = v;
            });
            if (this.viewerNode.isSelected()) {
                this.toggleHilight(true);
            }
        }
    },
    toggleHilight: function (a) {
        if (this.shape) {
            if (a) {
                this.shape[0].attr({'stroke-width': 2});
                this.shape.attr({cursor: 'move'});
                this.shape.toFront();
            } else {
                this.shape[0].attr({'stroke-width': 1});
                this.shape.attr({cursor: 'default'});
            }
        }
    },
    getInputs: function () {
        if (!this.inputs) {
            this.inputs = new Ext.util.MixedCollection();
        }
        return this.inputs;
    },
    getOutputs: function () {
        if (!this.outputs) {
            this.outputs = new Ext.util.MixedCollection();
        }
        return this.outputs;
    }
});

xds.types.flow.ShapeBase = Ext.extend(xds.types.BaseType, {
    transformGroup: "state",
    connectable: true,
    isResizable: function () {
        return false;
    },
//    getDefaultInternals:function(a){
//        var ret =  xds.types.flow.ShapeBase.superclass.getDefaultInternals.call(this,a);
//        return ret;
//    },
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
//    onFilmClick: function () {
//        var cmp = this.getExtComponent();
//        cmp.shape.toFront();
//    },
//    syncFilm: function () {
//        var a = this.getExtComponent();
//        if (a) {
//            if (a.film) {
//                var rect = a.el.dom.getBoundingClientRect();
//                var d = new Ext.lib.Region(rect.top - 2, rect.right + 2, rect.bottom + 2, rect.left - 2);
//                a.film.setRegion(d);
//                a.film.lastRegion = d;
//            }
//        }
//    },
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

od.flow.Start = Ext.extend(od.flow.Shape, {
    drawShape: function (p) {
        p.circle(this.x, this.y, 20).attr({fill: 'white'});
    },
    onPosition: function (x, y) {
        od.flow.Start.superclass.onPosition.call(this, x, y);
        var ox = this.shape[0].attr('cx'), oy = this.shape[0].attr('cy');
        this.shape.transform('t' + (this.x - ox) + ',' + (this.y - oy));
    }
});

Ext.reg('flowstart', od.flow.Start);

xds.types.flow.Start = Ext.extend(xds.types.flow.ShapeBase, {
    cid: 'flowstart',
    iconCls: 'icon-flow-start',
    category: "事件(Events)",
    defaultName: "&lt;Start&gt;",
    text: "空启动事件",
    dtype: "xdflowstart",
    xtype: 'flowstart',
    naming: "Start",
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

xds.flow.Start = Ext.extend(od.flow.Start, {

});

Ext.reg('xdflowstart', xds.flow.Start);

od.flow.TimerEvent = Ext.extend(od.flow.Start, {
    drawShape: function (p) {
        p.circle(this.x, this.y, 20).attr({fill: 'white'});
        p.path(['M', this.x - 5, this.y, 'L', this.x + 12, this.y].join(',')).attr({'stroke-width': 4});
        p.path(['M', this.x, this.y + 6, 'L', this.x, this.y - 15].join(',')).attr({'stroke-width': 2});
    }
});

Ext.reg('flowtimer', od.flow.TimerEvent);

xds.types.flow.TimerEvent = Ext.extend(xds.types.flow.ShapeBase, {
    cid: 'flowtimer',
    iconCls: 'icon-flow-timer',
    category: "事件(Events)",
    defaultName: "&lt;TimerEvent&gt;",
    text: "定时器事件",
    dtype: "xdflowtimer",
    xtype: 'flowtimer',
    naming: "TimerEvent",
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

xds.flow.TimerEvent = Ext.extend(od.flow.TimerEvent, {});
Ext.reg('xdflowtimer', xds.flow.TimerEvent);

od.flow.End = Ext.extend(od.flow.Start, {
    drawShape: function (p) {
        p.circle(this.x, this.y, 20).attr({fill: 'white'});
        p.circle(this.x, this.y, 10).attr({fill: 'black'});
    }
});

Ext.reg('flowend', od.flow.End);

xds.types.flow.End = Ext.extend(xds.types.flow.ShapeBase, {
    cid: 'flowend',
    iconCls: 'icon-flow-end',
    category: "事件(Events)",
    defaultName: "&lt;End&gt;",
    text: "结束事件",
    dtype: "xdflowend",
    xtype: 'flowend',
    naming: "End"
});

xds.flow.End = Ext.extend(od.flow.End, {

});
Ext.reg('xdflowend', xds.flow.End);

od.flow.ExEvent = Ext.extend(od.flow.Start, {
    drawShape: function (p) {
        p.circle(this.x, this.y, 20).attr({fill: 'white'});
        p.path(['M', this.x + 4, this.y - 10,
            'L', this.x - 4, this.y, this.x + 4, this.y, this.x - 4, this.y + 10]).attr({'stroke-width': 4});
    }
});

Ext.reg('flowexception', od.flow.ExEvent);

xds.types.flow.ExEvent = Ext.extend(xds.types.flow.ShapeBase, {
    cid: 'flowexception',
    iconCls: 'icon-flow-exception',
    category: "事件(Events)",
    defaultName: "&lt;ExcepitonEvent&gt;",
    text: "异常事件",
    dtype: "xdflowexception",
    xtype: 'flowexception',
    naming: "ExceptionEvent",
    xdConfigs: [
        {
            name: 'errorRef',
            group: 'Exception',
            ctype: 'string'
        }
    ]
});

xds.flow.ExEvent = Ext.extend(od.flow.ExEvent, {});
Ext.reg('xdflowexception', xds.flow.ExEvent);

od.flow.MsgEvent = Ext.extend(od.flow.Start, {
    drawShape: function (p) {
        p.circle(this.x, this.y, 20).attr({fill: 'white'});
        p.rect(this.x - 10, this.y - 7, 20, 14);
        p.path(['M', this.x, this.y, 'L', this.x - 10, this.y - 7, this.x + 10, this.y - 7, 'Z']);
    }
});

Ext.reg('flowmsg', od.flow.MsgEvent);

xds.types.flow.MsgEvent = Ext.extend(xds.types.flow.ShapeBase, {
    cid: 'flowmsg',
    iconCls: 'icon-flow-msg',
    category: "事件(Events)",
    defaultName: "&lt;MsgEvent&gt;",
    text: "消息事件",
    dtype: "xdflowmsg",
    xtype: 'flowmsg',
    naming: "MsgEvent",
    xdConfigs: [
        {
            name: 'messageRef',
            group: 'MsgEvent',
            ctype: 'string'
        }
    ]
});

xds.flow.MsgEvent = Ext.extend(od.flow.MsgEvent, {});
Ext.reg('xdflowmsg', xds.flow.MsgEvent);

od.flow.UserTask = Ext.extend(od.flow.Shape, {
    iconUrl: '/tplt/images/workflow-xds/icon-user.png',
    drawShape: function (p) {
        var x = this.x - this.width / 2, y = this.y - this.height / 2;
        p.rect(x, y, this.width, this.height, 7).attr({fill: '315-#fff-#ffffbb'});
        p.image(this.iconUrl, x, y, 16, 16).attr({transform: 't5,5'});
        this.drawSequential(p);
    },
    drawText: function (p) {
        if (this.name) {
            p.text(this.x, this.y, this.name).attr({transform: 't' + this.width / 2 + ',' + this.height / 2});
        }
    },
    drawSequential: function (p) {
        if (this.sequential) {
            p.rect(this.x, this.y, 12, .1, 0).transform('t' + (this.width / 2 - 6) + ',' + (this.height - 10));
            p.rect(this.x, this.y, 12, .1, 0).transform('t' + (this.width / 2 - 6) + ',' + (this.height - 7));
            p.rect(this.x, this.y, 12, .1, 0).transform('t' + (this.width / 2 - 6) + ',' + (this.height - 4));
        } else if (this.sequential === false) {
            p.rect(this.x, this.y, .1, 10, 0).transform('t' + (this.width / 2 - 3) + ',' + (this.height - 12));
            p.rect(this.x, this.y, .1, 10, 0).transform('t' + (this.width / 2) + ',' + (this.height - 12));
            p.rect(this.x, this.y, .1, 10, 0).transform('t' + (this.width / 2 + 3) + ',' + (this.height - 12));
        }
    },
    onPosition: function (x, y) {
        od.flow.UserTask.superclass.onPosition.call(this, x, y);
        var l = x - this.width / 2, t = y - this.height / 2;
        this.shape.attr({x: l, y: t});
    }
});

Ext.reg('flowusertask', od.flow.UserTask);

xds.types.flow.TaskBase = Ext.extend(xds.types.flow.ShapeBase, {
    isTask: true,
    category: "任务(Task)",
    minWidth: 20,
    minHeight: 20,
    isContainer:true,
    isResizable: function () {
        return true;
    },
    isValidParent:function() {
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

od.flow.ServiceTask = Ext.extend(od.flow.UserTask, {
    iconUrl: '/tplt/images/workflow-xds/icon-gear.png'
});

Ext.reg('flowservicetask', od.flow.ServiceTask);

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

od.flow.ScriptTask = Ext.extend(od.flow.UserTask, {
    iconUrl: '/tplt/images/workflow-xds/icon-script.png'
});

Ext.reg('flowscripttask', od.flow.ScriptTask);

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

od.flow.MailTask = Ext.extend(od.flow.UserTask, {
    iconUrl: '/tplt/images/workflow-xds/icon-email.png'
});

Ext.reg('flowmailtask', od.flow.MailTask);

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

od.flow.ManualTask = Ext.extend(od.flow.UserTask, {
    iconUrl: '/tplt/images/workflow-xds/icon-hand.png'
});

Ext.reg('flowmanualtask', od.flow.ManualTask);

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

od.flow.Gateway = Ext.extend(od.flow.Shape, {
    drawShape: function (p) {
        p.rect(this.x, this.y, 40, 40, 4).attr({fill: 'white'});
    },
    drawText: function () {

    },
    onPosition: function (x, y) {
        var ox = this.shape[0].attrs.x, oy = this.shape[0].attrs.y;
        this.shape.transform(['T', x - ox - 20, y - oy - 20, 'r45']);
        od.flow.Gateway.superclass.onPosition.call(this, x, y);
    }
});

Ext.reg('flowgateway', od.flow.Gateway);

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

od.flow.GatewayAnd = Ext.extend(od.flow.Gateway, {
    drawShape: function (p) {
        p.rect(this.x, this.y, 40, 40, 4).attr({fill: 'white'});
        p.path(['M', this.x + 10, this.y + 10,
            'L', this.x + 30, this.y + 30,
            'M', this.x + 30, this.y + 10,
            'L', this.x + 10, this.y + 30].join(',')).attr({'stroke-width': 4});
    }
});

Ext.reg('flowgatewayand', od.flow.GatewayAnd);

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

od.flow.GatewayOr = Ext.extend(od.flow.Gateway, {
    drawShape: function (p) {
        p.rect(this.x, this.y, 40, 40, 4).attr({fill: 'white'});
        p.circle(this.x + 20, this.y + 20, 13).attr({'stroke-width': 4});
    }
});

Ext.reg('flowgatewayor', od.flow.GatewayOr);

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

od.flow.GatewayXor = Ext.extend(od.flow.Gateway, {
    drawShape: function (p) {
        p.rect(this.x, this.y, 40, 40, 4).attr({fill: 'white'});
        p.path(['M', this.x + 6, this.y + 20,
            'L', this.x + 34, this.y + 20,
            'M', this.x + 20, this.y + 6,
            'L', this.x + 20, this.y + 34].join(',')).attr({'stroke-width': 4});
    }
});

Ext.reg('flowgatewayxor', od.flow.GatewayXor);

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

od.flow.Listener = Ext.extend(Ext.util.Observable, {

});

Ext.reg('flowlistener', od.flow.Listener);

xds.types.flow.ListenerBase = Ext.extend(xds.types.BaseType, {
    defaultName: "&lt;Listener&gt;",
    dtype: 'flowlistener',
    naming: "Listener",
    isVisual: false,
    isListener:true,
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
    xtype:'flowexeclistener',
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
    xtype:'flowtasklistener',
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

od.flow.Connection = Ext.extend(Ext.Component, {
    isConnection: true,
    onRender: function (ct, pos) {
        od.flow.Connection.superclass.onRender.call(this, ct, pos);
        this.startNode = this.getStartNode();
        if (this.startNode) {
            this.startNode.getOutputs().add(this);
        }
        this.endNode = this.getEndNode();
        if (this.endNode) {
            this.endNode.getInputs().add(this);
        }
        if (!Ext.isEmpty(this.startNode) && !Ext.isEmpty(this.endNode)) {
            var p = this.ownerCt.paper;
            var sb = this.startNode.shape[0].getBBox(), eb = this.endNode.shape[0].getBBox();
            var path = od.flow.getConPath(sb, eb);
            this.shape = p.path(path).attr(this.getDefAttr());
            if (this.viewerNode) {
                this.shape.vn = this.viewerNode;
            }
            this.el = Ext.get(this.shape.node);
            this.drawText();
        }
    },
    drawText: function () {
        if (this.name) {
            var p = this.ownerCt.paper;
            var tp = this.shape.attr('path');
            var pt = Raphael.getPointAtLength(tp, Raphael.getTotalLength(tp) / 2);
            var dx = pt.alpha == 90 ? 10 : 0, dy = pt.alpha == 180 ? 10 : 0;
            this.text = p.text(pt.x - dx, pt.y - dy, this.name).attr({cursor: 'default', 'font-size': 12, 'font-family': 'sans-serif', transform: 'r' + (pt.alpha + 180)});
            this.text.vn = this.viewerNode;
        }
    },
    getStartNode: function () {
        return Ext.get(this.startId);
    },
    getEndNode: function () {
        return Ext.get(this.endId);
    },
    getDefAttr: function () {
        return {'stroke-width': 2, 'stroke-linejoin': 'round', 'arrow-end': 'block-wide-long'};
    }
});

Ext.reg("flowconnection", od.flow.Connection);

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
        var ret;
        this.ownerCt.items.each(function (item) {
            var itemCfg = item.viewerNode.component;
            if ((itemCfg.getConfigValue('id') || itemCfg.id) == i) {
                ret = item;
                return false;
            }
        });

        return ret;
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
    onRender: function (ct, pos) {
        xds.flow.Connection.superclass.onRender.call(this, ct, pos);
        this.startNode.on('move', this.updatePath, this);
        this.endNode.on('move', this.updatePath, this);
        if (this.viewerNode.isSelected()) {
            this.toggleHilight(true);
        }
    },
    updatePath: function () {
        var sb = this.startNode.shape[0].getBBox(), eb = this.endNode.shape[0].getBBox();
        var path = od.flow.getConPath(sb, eb).join(',');
        this.shape.attr({path: path});
        this.updateText();
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

od.flow.Project = Ext.extend(xds.Project, {
    open: function (data) {
        var root = xds.inspector.root;
        root.beginUpdate();
        while (root.firstChild) {
            root.removeChild(root.firstChild);
        }
        var d = data || this.getDefaultCfg();
        var defaultNode;
        var comps = d.cn || [];
        for (var i = 0, comp; comp = comps[i]; i++) {
            var n = xds.inspector.restore(comp, root);
            if (comp.userConfig && comp.userConfig.id == data.userConfig.defaultComponent) {
                defaultNode = n;
            }
        }

        root.endUpdate();
        defaultNode = defaultNode || root.firstChild;
        if (defaultNode) {
            defaultNode.getOwnerTree().expandPath(defaultNode.getPath());
            defaultNode.select();
            xds.fireEvent("componentchanged");
        }

        xds.project.setDirty(false);
    },
    getDefaultCfg: function () {
        return {cn: [
            {cid: 'flowcontainer'}
        ]};
    },
    save:function(){
        var c = xds.inspector.root.firstChild.component;
        var data={};
        var i = c.getInternals(true,true),j=c.getJsonConfig(true,true);
        data.id = j.id;
        data.name = j.name;
        data.src = Ext.encode(i);
        data.def = Ext.encode(j);

        Ext.Ajax.request({
            url: '/workflow/defination',
            method: 'POST',
            jsonData: data,
            success: function (response, conn) {
                var result = Ext.decode(response.responseText);
                if(result.success){
                    xds.project.setDirty(false);
                }else{
                    Ext.Msg.alert('提示',result.msg);
                }
            }
        });
    }
});

od.flow.Canvas = Ext.extend(xds.Canvas, {
    initDD: function () {
        this.dropZone = new xds.Canvas.DropZone(this);
        this.dragTracker = new od.flow.Canvas.DragTracker({
            el: this.body
        });
    },
    findTarget: function (e) {
        var ret = xds.inspector.root.firstChild;
        var c = xds.flow.container;
        if (c) {
            var s = c.paper.getElementByPoint(e.xy[0], e.xy[1]);
            if (s) {
                return s.vn || ret;
            }
        }
        return ret;
    },
    getContextMenuItems: function (t, c) {
        var ret = od.flow.Canvas.superclass.getContextMenuItems.call(this, t, c);
        if (t) {
            var cmp = t.component;
            if (cmp.cid == 'flowcontainer') {
                return[new Ext.menu.Item({
                    text: '添加执行监听器',
                    iconCls: 'icon-flow-exec-listener-blue',
                    handler: function () {
                        xds.fireEvent("componentevent", {
                            type: "new",
                            parentId: cmp.id,
                            spec: {cid: 'flowexeclistener'}
                        });
                    }
                })];
            }

            if (cmp.isTask) {
                ret.push(new Ext.menu.Separator());
                ret.push(new Ext.menu.Item({
                    text: '添加执行监听器',
                    iconCls: 'icon-flow-exec-listener-blue',
                    handler: function () {
                        xds.fireEvent("componentevent", {
                            type: "new",
                            parentId: cmp.id,
                            spec: {cid: 'flowexeclistener'}
                        });
                    }
                }));
            }

            if (cmp.cid == 'flowusertask') {
                ret.push(new Ext.menu.Item({
                    text: '添加任务监听器',
                    iconCls: 'icon-flow-task-listener-blue',
                    handler: function () {
                        xds.fireEvent("componentevent", {
                            type: "new",
                            parentId: cmp.id,
                            spec: {cid: 'flowtasklistener'}
                        });
                    }
                }))
            }
        }

        return ret;
    }
});

od.flow.Canvas.DragTracker = Ext.extend(xds.Canvas.DragTracker, {
    isAbsolute: function (a) {
        return a.component.connectable == true;
    },
    onBeforeStart: function (e) {
        var ret = od.flow.Canvas.DragTracker.superclass.onBeforeStart.call(this, e);
        if (ret && e.button == 2 && this.cmp.connectable) {
            this.dragMode = "Connection";
        } else if (this.node) {
            if (this.node.component.isConnection) {
                var c = this.node.component.getExtComponent();
                var pt = c.ownerCt.el.translatePoints(e.xy[0], e.xy[1]);
                if (c.startHandler && c.startHandler.isPointInside(pt.left, pt.top)) {
                    this.dragMode = "ConStart";
                    this.waiting = true;
                    c.startHandler.remove();
                    delete c.startHandler;
                    ret = true;
                } else if (c.endHandler && c.endHandler.isPointInside(pt.left, pt.top)) {
                    this.dragMode = "ConEnd";
                    this.waiting = true;
                    c.endHandler.remove();
                    delete c.endHandler;
                    ret = true;
                }
            }
        }
        return ret;
    },
    onDragConnection: function (b, c, a) {
        var s = this.cmp.getExtComponent().shape[0];
        var cp = this.cmp.getExtComponent().ownerCt;

        var pt = cp.el.translatePoints(b.xy[0], b.xy[1]);
        var eb = {x: pt.left, y: pt.top, x2: pt.left, y2: pt.top, width: 0, height: 0};
        var tc = xds.canvas.findTarget(b);
        if (tc && tc.component.connectable) {
            this.conTarget = tc.component;
            eb = this.conTarget.getExtComponent().shape[0].getBBox();
        } else {
            delete this.conTarget;
        }
        var path = od.flow.getConPath(s.getBBox(), eb);
        if (this.conTrack) {
            this.conTrack.attr({path: path});
        } else {
            this.conTrack = s.paper.path(path).attr({'stroke-width': 2, 'arrow-end': 'block-wide-long', 'stroke-linejoin': 'miter'});
        }
    },
    onEndConnection: function (b, c, a) {
        xds.canvas.dragend = true;
        if (this.conTrack) {
            this.conTrack.remove();
            delete this.conTrack;
        }

        if (this.conTarget) {
            var df = new xds.types.flow.Connection().getSpec();
            df.userConfig = {};
            df.userConfig.startId = this.cmp.config.id || this.cmp.id;
            df.userConfig.endId = this.conTarget.config.id || this.conTarget.id;
            xds.fireEvent("componentevent", {
                type: "new",
                parentId: this.conTarget.owner.node.id,
                component: df
            });
            delete this.conTarget;
        }
    },
    onDragConStart: function (b, c, a) {
        var ec = this.cmp.getExtComponent();
        var cp = ec.ownerCt;

        var pt = cp.el.translatePoints(b.xy[0], b.xy[1]);
        var sb = {x: pt.left, y: pt.top, x2: pt.left, y2: pt.top, width: 0, height: 0};
        var tc = xds.canvas.findTarget(b);
        if (tc && tc.component.connectable) {
            this.conTarget = tc.component;
            sb = this.conTarget.getExtComponent().shape[0].getBBox();
        } else {
            delete this.conTarget;
        }
        var path = od.flow.getConPath(sb, ec.endNode.shape[0].getBBox());
        ec.shape.attr({path: path});
    },
    onEndConStart: function (b, c, a) {
        if (this.conTarget) {
            xds.canvas.beginUpdate();
            this.cmp.setConfig("startId", this.conTarget.node.id);
            xds.props.setValue("startId", this.conTarget.node.id);
            xds.canvas.endUpdate(true);
            delete this.conTarget;
        }
        xds.fireEvent("componentchanged");
    },
    onDragConEnd: function (b, c, a) {
        var ec = this.cmp.getExtComponent();
        var cp = ec.ownerCt;

        var pt = cp.el.translatePoints(b.xy[0], b.xy[1]);
        var eb = {x: pt.left, y: pt.top, x2: pt.left, y2: pt.top, width: 0, height: 0};
        var tc = xds.canvas.findTarget(b);
        if (tc && tc.component.connectable) {
            this.conTarget = tc.component;
            eb = this.conTarget.getExtComponent().shape[0].getBBox();
        } else {
            delete this.conTarget;
        }
        var path = od.flow.getConPath(ec.startNode.shape[0].getBBox(), eb);
        ec.shape.attr({path: path});
    },
    onEndConEnd: function (b, c, a) {
        if (this.conTarget) {
            xds.canvas.beginUpdate();
            this.cmp.setConfig("endId", this.conTarget.node.id);
            xds.props.setValue("endId", this.conTarget.node.id);
            xds.canvas.endUpdate(true);

            delete this.conTarget;
        }
        xds.fireEvent("componentchanged");
    },
    onDragAbsolute: function (e, c, a) {
        var ec = this.cmp.getExtComponent();
        var ct = ec.ownerCt;
        var x = this.startX - c[0], y = this.startY - c[1], dx = 0, dy = 0, vf = false, lf = false;
        if (ct) {
            var p = ct.paper;
            if (p) {
                p.hl.hide();
                p.vl.hide();
                for (var i = 0; i < ct.items.items.length; i++) {
                    var item = ct.items.items[i];
                    if (item !== ec && !item.isConnection && item.shape) {
                        var bb = item.shape[0].getBBox();
                        var cx = (bb.x + bb.width / 2);
                        var cy = (bb.y + bb.height / 2);

                        if (Math.abs(x - cx) < 20 && !lf) {
                            p.hl.attr({path: ['M', cx, 0, 'L', cx, p.height].join(',')});
                            p.hl.toBack().show();
                            dx = x - cx;
                            lf = true;
                        }
                        if (Math.abs(y - cy) < 20 && !vf) {
                            p.vl.attr({path: ['M', 0, cy, 'L', p.width, cy].join(',')});
                            p.vl.toBack().show();
                            dy = y - cy;
                            vf = true;
                        }

                        if (lf && vf) {
                            break;
                        }
                    }
                }
            }
        }
//        a.setPosition(this.snap(this.startX - c[0]), this.snap(this.startY - c[1]));
        a.setPosition(this.startX - c[0] - dx, this.startY - c[1] - dy);
    },
    onEndAbsolute: function (b, c, a) {
        od.flow.Canvas.DragTracker.superclass.onEndAbsolute.call(this, b, c, a);
        var e = this.cmp.getExtComponent();
        if (e.ownerCt) {
            if (e.ownerCt.paper) {
                e.ownerCt.paper.vl.hide();
                e.ownerCt.paper.hl.hide();
            }
        }
    }
});

od.flow.Inspector = Ext.extend(xds.Inspector, {
    removeComponent: function (c) {
        if (c.component.connectable) {
            var ec = c.component.getExtComponent();
            var fn = function (con) {
                var cn = con.viewerNode;
                cn.parentNode.removeChild(cn);
            };
            ec.getInputs().each(fn);
            ec.getOutputs().each(fn);
        }
        od.flow.Inspector.superclass.removeComponent.call(this, c);
    }
});

od.flow.Designer = Ext.extend(xds.Designer, {
    createInspector: function () {
        return new od.flow.Inspector({
            id: "structure",
            region: "north",
            split: true,
            height: 300,
            minHeight: 120,
            autoScroll: true,
            title: "组件",
            trackMouseOver: false,
            animate: false,
            enableDD: true,
            border: false,
            rootVisible: false,
            useArrows: true
        });
    },
    createCanvas: function () {
        return new od.flow.Canvas({
            id: "flow-canvas",
            region: "center",
            layout: "fit",
            border: false
        });
    }
});

od.FlowDesignerModule = Ext.extend(od.XdsModule, {
    id: 'flowdesigner',
    iconCls: 'icon-xds',
    moduleName: 'FlowDesigner',
    components: [od.flow.Designer],
    createDefaultComponent: function () {
        var designer = new od.flow.Designer();
        designer.on('afterlayout', function () {
            new od.flow.Project().open();
        }, this, {single: true});
        return designer;
    },
    init: function () {
        xds.Registry.all.clear();

        xds.Registry.register(xds.types.flow.Container);
        xds.Registry.register(xds.types.flow.Connection);
        xds.Registry.register(xds.types.flow.Start);
        xds.Registry.register(xds.types.flow.End);
        xds.Registry.register(xds.types.flow.TimerEvent);
        xds.Registry.register(xds.types.flow.ExEvent);
        xds.Registry.register(xds.types.flow.MsgEvent);
        xds.Registry.register(xds.types.flow.UserTask);
        xds.Registry.register(xds.types.flow.ServiceTask);
        xds.Registry.register(xds.types.flow.ScriptTask);
        xds.Registry.register(xds.types.flow.MailTask);
        xds.Registry.register(xds.types.flow.ManualTask);
//        xds.Registry.register(xds.types.flow.Gateway);
        xds.Registry.register(xds.types.flow.GatewayAnd);
        xds.Registry.register(xds.types.flow.GatewayOr);
        xds.Registry.register(xds.types.flow.GatewayXor);

        xds.Registry.register(xds.types.flow.ExecListener);
        xds.Registry.register(xds.types.flow.TaskListener);

        od.FlowDesignerModule.superclass.init.call(this);
    }
});
od.ModuleMgr.registerType('flowdesigner', od.FlowDesignerModule);