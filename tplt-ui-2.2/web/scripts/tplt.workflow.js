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

    if (bb1 == bb2) {
        return ['M', sr.x, sr.y, 'L', sr.x + 10, sl.y, sr.x + 10, st.y - 10, sl.x - 20, st.y - 10, sl.x - 20, sl.y, sl.x, sl.y];
    }

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

    return ['M', ps.x.toFixed(0), ps.y.toFixed(0),
        'L', p1.x.toFixed(0), p1.y.toFixed(0),
        p2.x.toFixed(0), p2.y.toFixed(0),
        pe.x.toFixed(0), pe.y.toFixed(0)];
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
        p.vl = p.path(['M', 0, 0, 'L', 0, p.height].join(','))
            .attr({'stroke-width': .5, 'stroke': '#aaa', 'stroke-dasharray': '--'}).hide();

        p.hl = p.path(['M', 0, 0, 'L', p.width, 0].join(','))
            .attr({'stroke-width': .5, 'stroke': '#aaa', 'stroke-dasharray': '--'}).hide();

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

od.flow.SubProcess = Ext.extend(Ext.Container, {
    layout: 'flow',
    onRender: function (ct) {
        if (!this.el) {
            var p = this.ownerCt.paper;
            if (p) {
                p.setStart();
                this.drawShape(p);
                this.drawText(p);
                this.shape = p.setFinish().attr({cursor: 'default'});
                this.el = Ext.get(this.positionShape.node);
                this.paper = p;
            }
        }
    },
    drawText: function (p) {
        if (this.name) {
            p.text(this.x + 12, this.y + 12, this.name)
                .attr({'text-anchor': 'start', 'font-size': 12, 'font-family': 'sans-serif'});
        }
    },
    drawShape: function (p) {
        this.positionShape = p.rect(this.x, this.y, this.width, this.height, 6).attr({fill: 'white'});
    },
    onLayout: function () {
        od.flow.SubProcess.superclass.onLayout.call(this);
        this.positionShape.toBack();
    },
    getLayoutTarget: function () {
        return this.ownerCt.el;
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
    },
    getCenterOffset: function () {
        return {x: this.width / 2, y: this.height / 2};
    },
    getSize: function () {
        return {width: this.width, height: this.height};
    },
    setPosition: function (x, y, ic) {
        var dx = x - this.positionShape.attr('x'), dy = y - this.positionShape.attr('y');
        this.shape.transform('t' + dx + ',' + dy);
        if (this.items && ic != false) {
            this.items.each(function (c) {
                if (!c.isConnection) {
                    if (c.boxReady) {
                        c.setPosition(x + c.x - this.x, y + c.y - this.y);
                    } else {
                        c.x += (x - this.x);
                        c.y += (y - this.y);
                    }

                }
            }, this);
        }
        od.flow.SubProcess.superclass.setPosition.call(this, x, y);
    },
    setSize: function (w, h) {
        if (w) {
            this.width = w;
        }
        if (h) {
            this.height = h;
        }
        this.positionShape.attr({width: this.width, height: this.height});
    },
    getWidth: function () {
        return this.width;
    },
    getHeight: function () {
        return this.height;
    },
    toggleHilight: function (a) {
        if (this.positionShape) {
            if (a) {
                this.positionShape.attr({fill: 'eee'});
            } else {
                this.positionShape.attr({fill: 'fff'});
            }
        }
    }
});
Ext.reg('flowsubprocess', od.flow.SubProcess);

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

od.flow.EventSubProcess = Ext.extend(od.flow.SubProcess, {
    drawShape: function (p) {
        this.positionShape = p.rect(this.x, this.y, this.width, this.height, 6).attr({fill: 'white', 'stroke-dasharray': '-'});
    }
});
Ext.reg('flowevtsubprocess', od.flow.EventSubProcess);
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

od.flow.Shape = Ext.extend(Ext.BoxComponent, {
    onRender: function (ct, pos) {
        if (!this.el) {
            var p = this.ownerCt.paper;
            if (p) {
                p.setStart();
                this.drawShape(p);
                this.drawText(p);
                this.shape = p.setFinish().attr({cursor: 'default'});
                this.el = Ext.get(this.positionShape.node);
            }
        }
        od.flow.Shape.superclass.onRender.call(this, ct, pos);
    },
    drawShape: Ext.emptyFn,
    drawText: function (p) {
        if (this.name) {
            p.text(this.x, this.y + 28, this.name).attr({'font-size': 12, 'font-family': 'sans-serif'});
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
                this.positionShape.attr({fill: 'eee'});
                this.shape.toFront();
            } else {
                this.positionShape.attr({fill: this.getColor()});
            }
        }
    },
    getColor: function () {
        return 'white';
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
    },
    getCenterOffset: function () {
        var ps = this.positionShape;
        var rx = ps.type == 'rect' ? this.width / 2 : 0, ry = ps.type == 'rect' ? this.height / 2 : 0;
        return {x: rx, y: ry};
    },
    setPosition: function (x, y) {
        var ps = this.positionShape;
        var ax = ps.type == 'rect' ? 'x' : 'cx', ay = ps.type == 'rect' ? 'y' : 'cy';
        var dx = x - this.positionShape.attr(ax);
        var dy = y - this.positionShape.attr(ay);
        this.offsetShape(dx, dy);
        od.flow.Shape.superclass.setPosition.call(this, x, y);
    },
    offsetShape: function (dx, dy) {
        this.shape.transform('t' + dx + ',' + dy);
    }
//    getShapePosition:function(){
//        var sp =this.positionShape;
//        if(sp){
//            if(sp.type=='rect'){
//                return {x:sp.attr('x'),y:sp.attr('y')};
//            }else if(sp.type == 'circle'){
//                return {x:sp.attr('cx'),y:sp.attr('cy')};
//            }
//        }
//        var b=this.getBox();
//        return {x: b.x,y: b.y};
//    }
});

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

od.flow.Start = Ext.extend(od.flow.Shape, {
    width: 32, height: 32,
    drawShape: function (p) {
        this.positionShape = p.circle(this.x, this.y, 16).attr({fill: 'white'});
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
        this.positionShape = p.circle(this.x, this.y, 16).attr({fill: 'white'});
        p.path(['M', this.x - 5, this.y, 'L', this.x + 10, this.y].join(',')).attr({'stroke-width': 4});
        p.path(['M', this.x, this.y + 6, 'L', this.x, this.y - 13].join(',')).attr({'stroke-width': 2});
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
        this.positionShape = p.circle(this.x, this.y, 16).attr({fill: 'white'});
        p.circle(this.x, this.y, 8).attr({fill: 'black'});
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
        this.positionShape = p.circle(this.x, this.y, 16).attr({fill: 'white'});
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
        this.positionShape = p.circle(this.x, this.y, 16).attr({fill: 'white'});
        p.rect(this.x - 10, this.y - 7, 20, 14).attr({fill: 'white'});
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
        this.positionShape = p.rect(this.x, this.y, this.width, this.height, 7).attr({fill: '315-#fff-#ffffbb'});
        p.image(this.iconUrl, this.x + 5, this.y + 5, 16, 16);
        this.drawSequential(p);
    },
    getColor: function () {
        return '315-#fff-#ffffbb';
    },
    drawText: function (p) {
        if (this.name) {
            var x = this.x + this.width / 2, y = this.y + this.height / 2;
            p.text(x, y, this.name).attr({'font-size': 12, 'font-family': 'sans-serif'});
        }
    },
    drawSequential: function (p) {
        var x = this.x + this.width / 2, y = this.y + this.height / 2;
        if (this.sequential) {
            p.rect(x - 6, y + this.height / 2 - 10, 12, .1, 0);
            p.rect(x - 6, y + this.height / 2 - 7, 12, .1, 0);
            p.rect(x - 6, y + this.height / 2 - 4, 12, .1, 0);
        } else if (this.sequential === false) {
            p.rect(x - 3, y + this.height / 2 - 12, .1, 10, 0);
            p.rect(x, y + this.height / 2 - 12, .1, 10, 0);
            p.rect(x + 3, y + this.height / 2 - 12, .1, 10, 0);
        }
    },
    getSize: function () {
        return {width: this.width, height: this.height};
    },
    setSize: function (w, h) {
        if (w) {
            this.width = w;
        }
        if (h) {
            this.height = h;
        }
        this.positionShape.attr({width: this.width, height: this.height});
    },
    getWidth: function () {
        return this.width;
    },
    getHeight: function () {
        return this.height;
    }
});

Ext.reg('flowusertask', od.flow.UserTask);

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
    width: 32,
    height: 32,
    drawShape: function (p) {
        this.positionShape = p.rect(this.x, this.y, this.width, this.height, 5).attr({fill: 'white'});
    },
    drawText: function () {

    },
    offsetShape: function (dx, dy) {
        this.shape.transform(['t' + dx + ',' + dy + 'r45']);
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
        this.positionShape = p.rect(this.x, this.y, this.width, this.height, 5).attr({fill: 'white'});
        p.path(['M', this.x + 8, this.y + 8,
            'L', this.x + 24, this.y + 24,
            'M', this.x + 24, this.y + 8,
            'L', this.x + 8, this.y + 24].join(',')).attr({'stroke-width': 4});
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
        this.positionShape = p.rect(this.x, this.y, this.width, this.height, 5).attr({fill: 'white'});
        p.circle(this.x + 16, this.y + 16, 10).attr({'stroke-width': 4});
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
        this.positionShape = p.rect(this.x, this.y, this.width, this.height, 5).attr({fill: 'white'});
        p.path(['M', this.x + 5, this.y + 16,
            'L', this.x + 27, this.y + 16,
            'M', this.x + 16, this.y + 5,
            'L', this.x + 16, this.y + 27].join(',')).attr({'stroke-width': 4});
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

od.flow.Connection = Ext.extend(Ext.Component, {
    isConnection: true,
    onRender: function (ct, pos) {
        this.startNode = this.getStartNode();
        if (this.startNode) {
            this.startNode.getOutputs().add(this);
        }
        this.endNode = this.getEndNode();
        if (this.endNode) {
            this.endNode.getInputs().add(this);
        }
        if (!Ext.isEmpty(this.startNode) && !Ext.isEmpty(this.endNode)) {
            if (!this.startNode.rendered) {
                this.startNode.on('render', this.doRender, this);
            } else if (!this.endNode.rendered) {
                this.endNode.on('render', this.doRender, this);
            } else {
                this.doRender();
            }
        }
        //od.flow.Connection.superclass.onRender.call(this, ct, pos);
    },
    doRender: function () {
        var p = this.ownerCt.paper;
        var sb = this.startNode.positionShape.getBBox(), eb = this.endNode.positionShape.getBBox();
        var path = od.flow.getConPath(sb, eb);
        this.shape = p.path(path).attr(this.getDefAttr());
        if (this.viewerNode) {
            this.shape.vn = this.viewerNode;
        }
        this.el = Ext.get(this.shape.node);
        this.drawText();
    },
    drawText: function () {
        if (this.name) {
            var p = this.ownerCt.paper;
            var tp = this.shape.attr('path');
            var pt = Raphael.getPointAtLength(tp, Raphael.getTotalLength(tp) / 2);
            var dx = pt.alpha == 90 ? 10 : 0, dy = pt.alpha == 180 ? 10 : 0;
            this.text = p.text(pt.x - dx, pt.y - dy, this.name);
            this.text.attr({'font-size': 12, 'font-family': 'sans-serif', transform: 'r' + (pt.alpha + 180)});
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
    save: function () {
        var c = xds.inspector.root.firstChild.component;
        var data = {};
        var i = c.getInternals(true, true), j = c.getJsonConfig(true, true);
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
                if (result.success) {
                    xds.project.setDirty(false);
                } else {
                    Ext.Msg.alert('提示', result.msg);
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
    getTgtRegion: function (ec) {
        if (ec && ec.positionShape) {
            var bb = ec.positionShape.getBBox();
            return {top: bb.y, bottom: bb.y2, left: bb.x, right: bb.x2};
        }
        return null;
    },
    onBodyMove: function (e, k) {
        var tgtNode = this.findTarget(e);
        if (tgtNode && tgtNode.component && (!tgtNode.component.isRef)) {
            var cmp = tgtNode.component;
            var ec = cmp.getExtComponent();
            var lr = this.getTgtRegion(ec), d = 7;
            if (lr) {
                if (cmp.isResizable("Corner", e) && (Math.abs(e.browserEvent.offsetY - lr.bottom) < d) && (Math.abs(e.browserEvent.offsetX - lr.right) < d)) {
                    this.dragTracker.setDragMode("Corner");
                    ec.positionShape.attr({cursor: 'se-resize'});
                    return;
                }
                if ((Math.abs(e.browserEvent.offsetY - lr.bottom) < d) && cmp.isResizable("Bottom", e)) {
                    this.dragTracker.setDragMode("Bottom");
                    ec.positionShape.attr({cursor: 's-resize'});
                    return;
                }

                if ((Math.abs(e.browserEvent.offsetX - lr.right) < d) && cmp.isResizable("Right", e)) {
                    this.dragTracker.setDragMode("Right");
                    ec.positionShape.attr({cursor: 'e-resize'});
                    return;
                }
                ec.positionShape.attr({cursor: 'default'});
            }
        }
        this.dragTracker.setDragMode("Absolute");
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
    selecteds: [],
    isAbsolute: function (a) {
        return a.component.cid != 'flowcontainer' && !a.component.isConnection;
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
            } else if (this.node == xds.inspector.root.firstChild) {
                this.dragMode = 'Select';
                this.waiting = true;
                ret = true;
            }
        }
        if (this.dragMode != 'Absolute') {
            this.clearSelections();
        }
        return ret;
    },
    onStart: function (e) {
        if (this.dragMode == 'Select') {
            if (!this.selectProxy) {
                this.selectProxy = this.el.createChild({cls: 'x-view-selector'});
            } else {
                this.el.appendChild(this.selectProxy);
            }
            this.selectProxy.setDisplayed('block');
            this.selectConstrain = this.el.getRegion();
            this.dragRegion = new Ext.lib.Region(0, 0, 0, 0);
        } else {
            if (this.dragMode == 'Absolute') {
                if (this.cmp.isContainer) {
                    if (Ext.isEmpty(this.selecteds)) {
                        var n = this.cmp.node;
                        if (n.hasChildNodes()) {
                            this.selecteds.push(n);
                            n.eachChild(function (cn) {
                                if (!cn.component.isConnection) {
                                    this.selecteds.push(cn);
                                }
                            }, this);
                        }
                    }
                }
            }
            od.flow.Canvas.DragTracker.superclass.onStart.call(this, e);
        }
    },
    onDragSelect: function (e, c, a) {
        var startXY = this.startXY;
        var xy = this.getXY();

        var x = Math.min(startXY[0], xy[0]);
        var y = Math.min(startXY[1], xy[1]);
        var w = Math.abs(startXY[0] - xy[0]);
        var h = Math.abs(startXY[1] - xy[1]);

        this.dragRegion.left = x;
        this.dragRegion.top = y;
        this.dragRegion.right = x + w;
        this.dragRegion.bottom = y + h;

        this.dragRegion.constrainTo(this.selectConstrain);
        this.selectProxy.setRegion(this.dragRegion);
    },
    onEndSelect: function () {
        var r = this.selectProxy.getRegion();
        if (this.selectProxy) {
            this.selectProxy.setDisplayed(false);
        }
        var lt = this.el.translatePoints(r.left, r.top), rb = this.el.translatePoints(r.right, r.bottom);
        var sbb = {x: lt.left, y: lt.top, x2: rb.left, y2: rb.top, width: rb.left - lt.left, height: rb.top - lt.top};
        if (xds.flow.container.items) {
            this.addSelected(sbb, xds.flow.container.items);
        }
    },
    isBBInside: function (c, t) {
        return c.x <= t.x && c.y <= t.y && c.x2 >= t.x2 && c.y2 >= t.y2;
    },
    addSelected: function (sbb, items) {
        items.each(function (item) {
            if (item.positionShape) {
                var ibb = item.positionShape.getBBox();
                if (this.isBBInside(sbb, ibb)) {
                    this.selecteds.push(item.viewerNode);
                    item.toggleHilight(true);
                }
                if (item.items) {
                    this.addSelected(sbb, item.items);
                }
            }
        }, this);
    },
    clearSelections: function () {
        Ext.each(this.selecteds, function (item) {
            item.component.getExtComponent().toggleHilight(false);
        });
        this.selecteds = [];
    },
    onDragConnection: function (e, c, a) {
        var s = this.cmp.getExtComponent().positionShape;
        var cp = this.cmp.getExtComponent().ownerCt;

        var pt = cp.el.translatePoints(e.xy[0], e.xy[1]);
        var eb = {x: pt.left, y: pt.top, x2: pt.left, y2: pt.top, width: 0, height: 0};
        var tc = xds.canvas.findTarget(e);
        if (tc && tc.component.connectable && tc != this.cmp.node.parentNode) {
            this.conTarget = tc.component;
            eb = this.conTarget.getExtComponent().positionShape.getBBox();
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
        if (tc && tc.component.connectable && tc != this.cmp.node.parentNode) {
            this.conTarget = tc.component;
            sb = this.conTarget.getExtComponent().positionShape.getBBox();
        } else {
            delete this.conTarget;
        }
        var path = od.flow.getConPath(sb, ec.endNode.positionShape.getBBox());
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
        if (tc && tc.component.connectable && tc != this.cmp.node.parentNode) {
            this.conTarget = tc.component;
            eb = this.conTarget.getExtComponent().positionShape.getBBox();
        } else {
            delete this.conTarget;
        }
        var path = od.flow.getConPath(ec.startNode.positionShape.getBBox(), eb);
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
        var x = this.startX - c[0] + ec.getCenterOffset().x,
            y = this.startY - c[1] + ec.getCenterOffset().y,
            dx = 0, dy = 0,
            vf = false, lf = false;
//        if (ct) {
//            var p = ct.paper;
//            if (p) {
//                p.hl.hide();
//                p.vl.hide();
//                for (var i = 0; i < ct.items.items.length; i++) {
//                    var item = ct.items.items[i];
//                    if (item !== ec && !item.isConnection && item.shape) {
//                        var bb = item.positionShape.getBBox();
//                        var cx = (bb.x + bb.width / 2);
//                        var cy = (bb.y + bb.height / 2);
//
//                        if (Math.abs(x - cx) < 20 && !lf) {
//                            p.hl.attr({path: ['M', cx, 0, 'L', cx, p.height].join(',')});
//                            p.hl.toBack().show();
//                            dx = x - cx;
//                            lf = true;
//                        }
//                        if (Math.abs(y - cy) < 20 && !vf) {
//                            p.vl.attr({path: ['M', 0, cy, 'L', p.width, cy].join(',')});
//                            p.vl.toBack().show();
//                            dy = y - cy;
//                            vf = true;
//                        }
//
//                        if (lf && vf) {
//                            break;
//                        }
//                    }
//                }
//            }
//        }
//        a.setPosition(this.snap(this.startX - c[0]), this.snap(this.startY - c[1]));
//        console.log(c[0],c[1],dx,dy,this.startX,this.startY);
        if (!Ext.isEmpty(this.selecteds)) {
            Ext.each(this.selecteds, function (sn) {
                var s = sn.component.getExtComponent();
                s.setPosition(s.x - c[0] - dx, s.y - c[1] - dy, false);
            }, this);
        } else {
            a.setPosition(a.x - c[0] - dx, a.y - c[1] - dy, false);
        }

        this.startXY = e.getXY();
    },
    onEndAbsolute: function (e, c, a) {
        xds.canvas.beginUpdate();
        if (!Ext.isEmpty(this.selecteds)) {
            Ext.each(this.selecteds, function (item) {
                var sc = item.component;
                this.updatePosConfig(sc, e, sc == this.cmp);
            }, this);
        } else {
            this.updatePosConfig(this.cmp, e, true);
        }

        xds.canvas.endUpdate(true);
        xds.fireEvent("componentchanged");

        var ec = this.cmp.getExtComponent();
        if (ec.ownerCt) {
            if (ec.ownerCt.paper) {
                ec.ownerCt.paper.vl.hide();
                ec.ownerCt.paper.hl.hide();
            }
        }
        this.clearSelections();
    },
    updatePosConfig: function (c, e, up) {
        var ec = c.getExtComponent();
        c.setConfig("x", ec.x);
        c.setConfig("y", ec.y);
        if (up) {
            xds.props.setValue("x", ec.x);
            xds.props.setValue("y", ec.y);
        }
        this.updateParent(e, c);
    },
    updateParent: function (e, c) {
        if (!c.isContainer) {
            var p = xds.flow.container;
            var pn = p.viewerNode;
            var ec = c.getExtComponent();
            if (p.items) {
                var cb = {x: ec.x, y: ec.y, x2: ec.x + ec.width, y2: ec.y + ec.height}, f = false;
                p.items.each(function (i) {
                    if (i.isContainer) {
                        var pb = {x: i.x, y: i.y, x2: i.x + i.width, y2: i.y + i.height};
                        if (this.isBBInside(pb, cb)) {
                            if (i.viewerNode != c.node.parentNode) {
                                i.viewerNode.appendChild(c.node);
                                if(ec.outputs){
                                    ec.outputs.each(function(oc){
                                        i.viewerNode.appendChild(oc.viewerNode);
                                    });
                                }
                                c.node.select();
                            }
                            f = true;
                            return false;
                        }
                    }
                    return true;
                }, this);
            }

            if (c.node.parentNode != pn && !f) {
                pn.appendChild(c.node);
                if(ec.outputs){
                    ec.outputs.each(function(oc){
                        pn.appendChild(oc.viewerNode);
                    });
                }
                c.node.select();
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
        xds.Registry.register(xds.types.flow.SubProcess);
        xds.Registry.register(xds.types.flow.EventSubProcess);
        xds.Registry.register(xds.types.flow.ExecListener);
        xds.Registry.register(xds.types.flow.TaskListener);


        od.FlowDesignerModule.superclass.init.call(this);
    }
});
od.ModuleMgr.registerType('flowdesigner', od.FlowDesignerModule);