Ext.ns("od.flow");

od.flow.getConPath = function (bb1, bb2, d) {
    d = d || 'H';
    bb1.x -= bb1.width / 2;
    bb1.y -= bb1.height / 2;
    bb2.x -= bb2.width / 2;
    bb2.y -= bb2.height / 2;

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

    if (bb1.x == bb2.x && bb1.y == bb2.y && bb1.width == bb2.width && bb1.height == bb2.height) {
        return ['M', sr.x, sr.y, 'L', sr.x + 10, sl.y, sr.x + 10, st.y - 10, sl.x - 20, st.y - 10, sl.x - 20, sl.y, sl.x, sl.y];
    }

    var area;
    if (el.x > sr.x) {
        if (eb.y < st.y) {
            area = 'rt';
        } else if (et.y > sb.y) {
            area = 'rb';
        } else {
            area = 'r'
        }
    } else if (er.x < sl.x) {
        if (eb.y < st.y) {
            area = 'lt';
        } else if (et.y > sb.y) {
            area = 'lb';
        } else {
            area = 'l'
        }
    } else if (eb.y < st.y) {
        area = 't';
    } else if (et.y > sb.y) {
        area = 'b';
    } else {
        area = 'c';
    }

    var r = 0;
    var dx = ec.x - sc.x,
        dy = ec.y - sc.y;
    if (!dx && !dy) {
        r = 0;
    } else {
        r = (180 + Math.atan2(-dy, -dx) * 180 / Math.PI + 360) % 360;
    }

    var rl = { ps: sr, pe: el, p1: {x: sr.x + (el.x - sr.x) / 2, y: sr.y}, p2: {x: sr.x + (el.x - sr.x) / 2, y: el.y}},
        bt = {ps: sb, pe: et, p1: {x: sb.x, y: sb.y + (et.y - sb.y) / 2}, p2: {x: et.x, y: sb.y + (et.y - sb.y) / 2}},
        lr = {ps: sl, pe: er, p1: {x: er.x + (sl.x - er.x) / 2, y: sl.y}, p2: {x: er.x + (sl.x - er.x) / 2, y: er.y}},
        tb = {ps: st, pe: eb, p1: {x: st.x, y: eb.y + (st.y - eb.y) / 2}, p2: {x: eb.x, y: eb.y + (st.y - eb.y) / 2}};

    var ret;
    switch (area) {
        case 'r':
            ret = rl;
            break;
        case 'b':
            ret = bt;
            break;
        case 'l':
            ret = lr;
            break;
        case 't':
            ret = tb;
            break;
        case 'rt':
            if (d == 'H') {
                ret = rl;
            } else {
                ret = tb;
            }
            break;
        case 'rb':
            if (d == 'H') {
                ret = rl;
            } else {
                ret = bt;
            }
            break;
        case 'lt':
            if (d == 'H') {
                ret = lr;
            } else {
                ret = tb;
            }
            break;
        case 'lb':
            if (d == 'H') {
                ret = lr;
            } else {
                ret = bt;
            }
            break;
        default:
            ret = rl;
    }

    return ['M', ret.ps.x.toFixed(0), ret.ps.y.toFixed(0),
        'L', ret.p1.x.toFixed(0), ret.p1.y.toFixed(0),
        ret.p2.x.toFixed(0), ret.p2.y.toFixed(0),
        ret.pe.x.toFixed(0), ret.pe.y.toFixed(0)];
};

od.flow.FlowLayout = Ext.extend(Ext.layout.ContainerLayout, {
    type: 'flow'
});

Ext.Container.LAYOUTS['flow'] = od.flow.FlowLayout;

od.flow.Process = Ext.extend(Ext.Container, {
    layout: 'flow',
    onRender: function (ct) {
        var p = this.paper = Raphael(ct.dom);
        p.vl = p.path(['M', 0, 0, 'L', 0, p.height].join(','))
            .attr({'stroke-width': .5, 'stroke': '#aaa', 'stroke-dasharray': '--'}).hide();

        p.hl = p.path(['M', 0, 0, 'L', p.width, 0].join(','))
            .attr({'stroke-width': .5, 'stroke': '#aaa', 'stroke-dasharray': '--'}).hide();

        this.el = Ext.get(this.paper.canvas);
        od.flow.Process.superclass.onRender.call(this, ct);
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
Ext.reg('process', od.flow.Process);

od.flow.ShapeContainer = Ext.extend(Ext.Container, {
    layout: 'flow',
    initComponent: function () {
        od.flow.ShapeContainer.superclass.initComponent.call(this);
        if (this.boundaryEvents) {
            this.boundarys = new Ext.util.MixedCollection(false, this.getComponentId);
            Ext.each(this.boundaryEvents, function (e) {
                this.boundarys.add(Ext.create(Ext.apply(e, {ownerCt: this})));
            }, this);
            delete this.boundaryEvents;
        }
    },
    onRender: function () {
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
    afterRender: function () {
        od.flow.ShapeContainer.superclass.afterRender.call(this);
        this.drawBoundaryEvents(this.paper);
    },
    drawBoundaryEvents: function (p) {
        if (!Ext.isEmpty(this.boundarys)) {
            var i = 0, d = 12, r = this.x + this.width / 2 - d, l = this.x - this.width / 2 + d, b = this.y + this.height / 2;
            this.boundarys.each(function (item) {
                var s = i / 2;
                item.x = i % 2 == 0 ? r - item.width * (s + .5) : l + item.width * s;
                item.y = b + 4;
                item.render(this);
                i++;
            }, this);
        }
    },
    drawText: Ext.emptyFn,
    drawShape: Ext.emptyFn,
    getLayoutTarget: function () {
        return this.ownerCt.el;
    },
    onLayout: function () {
        this.positionShape.toBack();
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
    syncFilm: function () {
        this.positionShape.attr({width: this.width, height: this.height});
        var dx = this.x - this.width / 2 - this.positionShape.attr('x'), dy = this.y - this.height / 2 - this.positionShape.attr('y');
        this.shape.transform('t' + dx + ',' + dy);

        if (this.boundarys) {
            var i = 0, d = 12, r = this.x + this.width / 2 - d, l = this.x - this.width / 2 + d, b = this.y + this.height / 2;
            this.boundarys.each(function (item) {
                var s = i / 2;
                item.x = i % 2 == 0 ? r - item.width * (s + .5) : l + item.width * s;
                item.y = b + 4;
                item.syncFilm();
                item.fireEvent('move');
                i++;
            }, this);
        }
    },
    setSize: function (w, h) {
        if (w) {
            this.x += (w - this.width) / 2;
            this.width = w;
        }
        if (h) {
            this.y += (h - this.height) / 2;
            this.height = h;
        }
    },
    getSize: function () {
        return {width: this.width, height: this.height};
    },
    getWidth: function () {
        return this.width;
    },
    getHeight: function () {
        return this.height;
    },
    getPosition: function () {
        return [this.x, this.y];
    },
    createFilm: function () {

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

od.flow.SubProcess = Ext.extend(od.flow.ShapeContainer, {
    drawText: function (p) {
        if (this.name) {
            var x = this.x - this.width / 2, y = this.y - this.height / 2;
            p.text(x + 12, y + 12, this.name)
                .attr({'text-anchor': 'start', 'font-size': 12, 'font-family': 'sans-serif'});
        }
    },
    drawShape: function (p) {
        var x = this.x - this.width / 2, y = this.y - this.height / 2;
        this.positionShape = p.rect(x, y, this.width, this.height, 6).attr({fill: 'white'});
        if(this.triggeredByEvent){
            this.positionShape.attr({'stroke-dasharray':'-'});
        }
    }
});
Ext.reg('subprocess', od.flow.SubProcess);

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
    },
    drawShape: Ext.emptyFn,
    drawText: function (p) {
        if (this.name) {
            p.text(this.x, this.y + 28, this.name).attr({'font-size': 12, 'font-family': 'sans-serif'});
        }
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
    syncFilm: function () {
        var ps = this.positionShape;
        var ax = ps.type == 'rect' ? 'x' : 'cx', ay = ps.type == 'rect' ? 'y' : 'cy';
        var ox = ps.type == 'rect' ? this.width / 2 : 0, oy = ps.type == 'rect' ? this.height / 2 : 0;
        var dx = this.x - this.positionShape.attr(ax) - ox;
        var dy = this.y - this.positionShape.attr(ay) - oy;
        if (dx != 0 || dy != 0) {
            this.shape.transform('t' + dx + ',' + dy);
        }
    },
    setSize: function (w, h) {
        this.width = w || this.width;
        this.height = h || this.height;
    },
    getSize: function () {
        return {width: this.width, height: this.height};
    },
    getWidth: function () {
        return this.width;
    },
    getHeight: function () {
        return this.height;
    },
    setPosition: function (x, y) {
        this.x = x;
        this.y = y;
        this.fireEvent('move');
    },
    getPosition: function () {
        return [this.x, this.y];
    },
    createFilm: function () {

    }
});

Ext.ns('od.flow.start');

od.flow.start.None = Ext.extend(od.flow.Shape, {
    width: 32,
    height: 32,
    drawShape: function (p) {
        this.positionShape = p.circle(this.x, this.y, 16).attr({fill: 'white'});
    }
});

Ext.reg('nonestart', od.flow.start.None);

od.flow.start.Message = Ext.extend(od.flow.start.None, {
    drawShape: function (p) {
        this.positionShape = p.circle(this.x, this.y, 16).attr({fill: 'white'});
        p.rect(this.x - 10, this.y - 7, 20, 14).attr({fill: 'white'});
        p.path(['M', this.x, this.y, 'L', this.x - 10, this.y - 7, this.x + 10, this.y - 7, 'Z']);
    }
});

Ext.reg('msgstart', od.flow.start.Message);

od.flow.start.Error = Ext.extend(od.flow.start.None, {
    drawShape: function (p) {
        this.positionShape = p.circle(this.x, this.y, 16).attr({fill: 'white'});
        p.path(['M', this.x + 4, this.y - 10,
            'L', this.x - 4, this.y, this.x + 4, this.y, this.x - 4, this.y + 10]).attr({'stroke-width': 4});
    }
});

Ext.reg('errorstart', od.flow.start.Error);

od.flow.start.Timer = Ext.extend(od.flow.start.None, {
    drawShape: function (p) {
        this.positionShape = p.circle(this.x, this.y, 16).attr({fill: 'white'});
        p.path(['M', this.x - 5, this.y, 'L', this.x + 10, this.y].join(',')).attr({'stroke-width': 4});
        p.path(['M', this.x, this.y + 6, 'L', this.x, this.y - 13].join(',')).attr({'stroke-width': 2});
    }
});

Ext.reg('timerstart', od.flow.start.Timer);

Ext.ns('od.flow.end');

od.flow.end.None = Ext.extend(od.flow.Shape, {
    width: 32,
    height: 32,
    drawShape: function (p) {
        this.positionShape = p.circle(this.x, this.y, 16).attr({fill: 'white', 'stroke-width': 3});
    }
});

Ext.reg('noneend', od.flow.end.None);

od.flow.end.Error = Ext.extend(od.flow.end.None, {
    drawShape: function (p) {
        od.flow.end.Error.superclass.drawShape.call(this, p);
        p.path(['M', this.x + 4, this.y - 10,
            'L', this.x - 4, this.y, this.x + 4, this.y, this.x - 4, this.y + 10]).attr({'stroke-width': 4});

    }
});

Ext.reg('errorend', od.flow.end.Error);

od.flow.end.Cancel = Ext.extend(od.flow.end.None, {
    drawShape: function (p) {
        od.flow.end.Cancel.superclass.drawShape.call(this, p);
        p.path(['M', this.x - 7, this.y - 7,
            'L', this.x + 7, this.y + 7,
            'M', this.x + 7, this.y - 7,
            'L', this.x - 7, this.y + 7]).attr({'stroke-width': 5});
    }
});

Ext.reg('cancelend', od.flow.end.Cancel);

Ext.ns('od.flow.boundary');
od.flow.boundary.Timer = Ext.extend(od.flow.Shape, {
    width: 26,
    height: 26,
    drawShape: function (p) {
        this.positionShape = p.circle(this.x, this.y, this.width / 2).attr({fill: 'white'});
        p.circle(this.x, this.y, this.width / 2 - 3);
        p.path(['M', this.x - 3, this.y, 'L', this.x + 6, this.y].join(',')).attr({'stroke-width': 2});
        p.path(['M', this.x, this.y + 4, 'L', this.x, this.y - 8].join(','));
    },
    drawText: function () {

    }
});
Ext.reg('boundarytimer', od.flow.boundary.Timer);

od.flow.boundary.Error = Ext.extend(od.flow.boundary.Timer, {
    drawShape: function (p) {
        this.positionShape = p.circle(this.x, this.y, this.width / 2).attr({fill: 'white'});
        p.circle(this.x, this.y, this.width / 2 - 3);
        p.path(['M', this.x + 3, this.y - 7,
            'L', this.x - 3, this.y, this.x + 3, this.y, this.x - 3, this.y + 7]).attr({'stroke-width': 2});
    }
});
Ext.reg('boundaryerror', od.flow.boundary.Error);

od.flow.boundary.Signal = Ext.extend(od.flow.boundary.Timer, {
    drawShape: function (p) {
        this.positionShape = p.circle(this.x, this.y, this.width / 2).attr({fill: 'white'});
        p.circle(this.x, this.y, this.width / 2 - 3);
        p.path(['M', this.x, this.y - 6,
            'L', this.x - 5, this.y + 4, this.x + 5, this.y + 4, 'Z']);
    }
});
Ext.reg('boundarysignal', od.flow.boundary.Signal);

od.flow.boundary.Message = Ext.extend(od.flow.boundary.Timer, {
    drawShape: function (p) {
        this.positionShape = p.circle(this.x, this.y, this.width / 2).attr({fill: 'white'});
        p.circle(this.x, this.y, this.width / 2 - 3);
        p.rect(this.x - 6, this.y - 4, 12, 8).attr({fill: 'white'});
        p.path(['M', this.x, this.y, 'L', this.x - 6, this.y - 4, this.x + 6, this.y - 4, 'Z']);
    }
});
Ext.reg('boundarymsg', od.flow.boundary.Message);

od.flow.boundary.Cancel = Ext.extend(od.flow.boundary.Timer, {
    drawShape: function (p) {
        this.positionShape = p.circle(this.x, this.y, this.width / 2).attr({fill: 'white'});
        p.circle(this.x, this.y, this.width / 2 - 3);
        p.path(['M', this.x - 5, this.y - 5,
            'L', this.x + 5, this.y + 5,
            'M', this.x + 5, this.y - 5,
            'L', this.x - 5, this.y + 5]).attr({'stroke-width': 3});
    }
});
Ext.reg('boundarycancel', od.flow.boundary.Cancel);

Ext.ns('od.flow.inter');
od.flow.inter.None = Ext.extend(od.flow.Shape, {
    width: 32,
    height: 32,
    drawShape: function (p) {
        this.positionShape = p.circle(this.x, this.y, this.width / 2).attr({fill: 'white'});
        p.circle(this.x, this.y, this.width / 2 - 4);
    }
});
Ext.reg('internone', od.flow.inter.None);

od.flow.inter.Timer = Ext.extend(od.flow.inter.None, {
    drawShape: function (p) {
        od.flow.inter.Timer.superclass.drawShape.call(this, p);
        p.path(['M', this.x - 5, this.y, 'L', this.x + 9, this.y].join(',')).attr({'stroke-width': 4});
        p.path(['M', this.x, this.y + 6, 'L', this.x, this.y - 11].join(',')).attr({'stroke-width': 2});
    }
});
Ext.reg('intertimer', od.flow.inter.Timer);

od.flow.inter.SignalCatch = Ext.extend(od.flow.inter.None, {
    drawShape: function (p) {
        od.flow.inter.SignalCatch.superclass.drawShape.call(this, p);
        p.path(['M', this.x, this.y - 8,
            'L', this.x - 7, this.y + 5, this.x + 7, this.y + 5, 'Z']);
    }
});
Ext.reg('intersignalcatch', od.flow.inter.SignalCatch);

od.flow.inter.Message = Ext.extend(od.flow.inter.None, {
    drawShape: function (p) {
        od.flow.inter.Message.superclass.drawShape.call(this, p);
        p.rect(this.x - 8, this.y - 5, 16, 10).attr({fill: 'white'});
        p.path(['M', this.x, this.y,
            'L', this.x - 8, this.y - 5, this.x + 8, this.y - 5, 'Z']);
    }
});
Ext.reg('intermsg', od.flow.inter.Message);

od.flow.inter.SignalThrow = Ext.extend(od.flow.inter.None, {
    drawShape: function (p) {
        od.flow.inter.SignalThrow.superclass.drawShape.call(this, p);
        p.path(['M', this.x, this.y - 8,
            'L', this.x - 7, this.y + 5, this.x + 7, this.y + 5,
            'Z']).attr({fill: 'black'});
    }
});
Ext.reg('intersignalthrow', od.flow.inter.SignalThrow);

od.flow.TaskBase = Ext.extend(od.flow.Shape, {
    initComponent: function () {
        od.flow.TaskBase.superclass.initComponent.call(this);
        if (this.boundaryEvents) {
            this.boundarys = new Ext.util.MixedCollection(false, this.getComponentId);
            Ext.each(this.boundaryEvents, function (e) {
                this.boundarys.add(Ext.create(Ext.apply(e, {ownerCt: this})));
            }, this);
            delete this.boundaryEvents;
        }
    },
    drawShape: function (p) {
        this.paper = p;
        var x = this.x - this.width / 2, y = this.y - this.height / 2;
        this.positionShape = p.rect(x, y, this.width, this.height, 7).attr({fill: '315-#fff-#ffffbb'});
        p.image(this.iconUrl, x + 5, y + 5, 16, 16);
        this.drawSequential(p);
    },
    getColor: function () {
        return '315-#fff-#ffffbb';
    },
    afterRender: function () {
        od.flow.TaskBase.superclass.afterRender.call(this);
        this.drawBoundaryEvents(this.paper);
    },
    drawBoundaryEvents: function (p) {
        if (!Ext.isEmpty(this.boundarys)) {
            var i = 0, d = 12, r = this.x + this.width / 2 - d, l = this.x - this.width / 2 + d, b = this.y + this.height / 2;
            this.boundarys.each(function (item) {
                var s = i / 2;
                item.x = i % 2 == 0 ? r - item.width * (s + .5) : l + item.width * s;
                item.y = b + 4;
                item.render(this);
                i++;
            }, this);
        }
    },
    drawText: function (p) {
        if (this.name) {
            this.textShape = p.text(this.x, this.y, this.name).attr({'font-size': 12, 'font-family': 'sans-serif'});
        }
    },
    drawSequential: function (p) {
        var sp = this.getSequentialPath();
        if (!Ext.isEmpty(sp)) {
            this.sequentialShape = p.path(sp);
        }
    },
    getSequentialPath: function () {
        var x = this.x, h = this.y + this.height / 2;
        var ret = [];
        if (this.isSequential) {
            ret = ['M', x - 6, h - 10, 'L', x + 6, h - 10,
                'M', x - 6, h - 7, 'L', x + 6, h - 7,
                'M', x - 6, h - 4, 'L', x + 6, h - 4];
        } else if (this.isSequential === false) {
            ret = ['M', x - 3, h - 12, 'L', x - 3, h - 2,
                'M', x, h - 12, 'L', x, h - 2,
                'M', x + 3, h - 12, 'L', x + 3, h - 2];
        }
        return ret;
    },
    setSize: function (w, h) {
        if (w) {
            this.x += (w - this.width) / 2;
            this.width = w;
        }
        if (h) {
            this.y += (h - this.height) / 2;
            this.height = h;
        }
    },
    syncFilm: function () {
        od.flow.TaskBase.superclass.syncFilm.call(this);
        var bb = this.positionShape.getBBox();
        var dx = this.x - bb.x, dy = this.y - bb.y,
            dw = this.width - bb.width, dh = this.height - bb.height;
        if (dh != 0 || dw != 0) {
            this.positionShape.attr({width: this.width, height: this.height});
            if (this.textShape) {
                this.textShape.attr({x: this.x, y: this.y});
            }
            if (this.sequentialShape) {
                this.sequentialShape.attr({path: this.getSequentialPath()});
            }
        }

        if (this.boundarys) {
            var i = 0, d = 12, r = this.x + this.width / 2 - d, l = this.x - this.width / 2 + d, b = this.y + this.height / 2;
            this.boundarys.each(function (item) {
                var s = i / 2;
                item.x = i % 2 == 0 ? r - item.width * (s + .5) : l + item.width * s;
                item.y = b + 4;
                item.syncFilm();
                item.fireEvent('move');
                i++;
            }, this);
        }
    }
});

od.flow.UserTask = Ext.extend(od.flow.TaskBase, {
    iconUrl: '/tplt/images/workflow-xds/icon-user.png'
});

Ext.reg('usertask', od.flow.UserTask);

od.flow.ServiceTask = Ext.extend(od.flow.TaskBase, {
    iconUrl: '/tplt/images/workflow-xds/icon-gear.png'
});

Ext.reg('servicetask', od.flow.ServiceTask);


od.flow.ScriptTask = Ext.extend(od.flow.TaskBase, {
    iconUrl: '/tplt/images/workflow-xds/icon-script.png'
});

Ext.reg('scripttask', od.flow.ScriptTask);

od.flow.MailTask = Ext.extend(od.flow.TaskBase, {
    iconUrl: '/tplt/images/workflow-xds/icon-email.png'
});

Ext.reg('mailtask', od.flow.MailTask);

od.flow.ManualTask = Ext.extend(od.flow.TaskBase, {
    iconUrl: '/tplt/images/workflow-xds/icon-hand.png'
});

Ext.reg('manualtask', od.flow.ManualTask);

od.flow.Gateway = Ext.extend(od.flow.Shape, {
    width: 32,
    height: 32,
    drawShape: function (p) {
        this.positionShape = p.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, 5).attr({fill: 'white'});
    },
    onRender: function (ct, pos) {
        od.flow.Gateway.superclass.onRender.call(this, ct, pos);
        this.shape.transform('r45');
    },
    drawText: function () {

    },
    syncFilm: function () {
        var ps = this.positionShape;
        var dx = this.x - this.width / 2 - this.positionShape.attr('x');
        var dy = this.y - this.height / 2 - this.positionShape.attr('y');
        this.shape.transform(['t' + dx + ',' + dy + 'r45']);
    },
    getBox:function(){
        return {x:this.x,y:this.y,width:this.width+8,height:this.height+8};
    }
});

Ext.reg('flowgateway', od.flow.Gateway);

od.flow.GatewayAnd = Ext.extend(od.flow.Gateway, {
    drawShape: function (p) {
        var x = this.x - this.width / 2, y = this.y - this.height / 2;
        this.positionShape = p.rect(x, y, this.width, this.height, 5).attr({fill: 'white'});
        p.path(['M', x + 8, y + 8,
            'L', x + 24, y + 24,
            'M', x + 24, y + 8,
            'L', x + 8, y + 24].join(',')).attr({'stroke-width': 4});
    }
});

Ext.reg('flowgatewayand', od.flow.GatewayAnd);

od.flow.GatewayOr = Ext.extend(od.flow.Gateway, {
    drawShape: function (p) {
        var x = this.x - this.width / 2, y = this.y - this.height / 2;
        this.positionShape = p.rect(x, y, this.width, this.height, 5).attr({fill: 'white'});
        p.circle(this.x, this.y, 10).attr({'stroke-width': 4});
    }
});

Ext.reg('flowgatewayor', od.flow.GatewayOr);

od.flow.GatewayXor = Ext.extend(od.flow.Gateway, {
    drawShape: function (p) {
        var x = this.x - this.width / 2, y = this.y - this.height / 2;
        this.positionShape = p.rect(x, y, this.width, this.height, 5).attr({fill: 'white'});
        p.path(['M', x + 5, this.y + 16,
            'L', x + 27, y + 16,
            'M', x + 16, y + 5,
            'L', x + 16, y + 27].join(',')).attr({'stroke-width': 4});
    }
});

Ext.reg('flowgatewayxor', od.flow.GatewayXor);

od.flow.Listener = Ext.extend(Ext.util.Observable, {

});

Ext.reg('flowlistener', od.flow.Listener);

od.flow.Connection = Ext.extend(Ext.Component, {
    isConnection: true,
    routerDir: 'H',
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
    },
    doRender: function () {
        var p = this.ownerCt.paper;
        var sb = this.startNode.getBox(), eb = this.endNode.getBox();
        var path = od.flow.getConPath(sb, eb,this.routerDir);
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
        return Ext.get(this.sourceRef);
    },
    getEndNode: function () {
        return Ext.get(this.targetRef);
    },
    getDefAttr: function () {
        return {'stroke-width': 2, 'stroke-linejoin': 'round', 'arrow-end': 'block-wide-long'};
    }
});

Ext.reg("sequenceflow", od.flow.Connection);

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
            {cid: 'process'}
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
        var c = xds.flow.process;
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
            if (cmp.cid == 'process') {
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
        return a.component.cid != 'process' && !a.component.isConnection && !a.component.isBoundary;
    },
    onBeforeStart: function (e) {
        var ret = od.flow.Canvas.DragTracker.superclass.onBeforeStart.call(this, e);
        if (e.button == 2 && this.cmp.connectable) {
            this.dragMode = "Connection";
            this.waiting = true;
            return true;
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
                        var ec = this.cmp.getExtComponent();
                        if (ec.items) {
                            this.selecteds.push(this.cmp.node);
                            ec.items.each(function (c) {
                                if (!c.isConnection) {
                                    this.selecteds.push(c.viewerNode);
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
        if (xds.flow.process.items) {
            this.addSelected(sbb, xds.flow.process.items);
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
            var ec = item.component.getExtComponent();
            if (ec) {
                ec.toggleHilight(false);
            }
        });
        this.selecteds = [];
    },
    onDragConnection: function (e, c, a) {
        var s = this.cmp.getExtComponent();
        var cp = xds.flow.process;

        var pt = cp.el.translatePoints(e.xy[0], e.xy[1]);
        var eb = {x: pt.left, y: pt.top, x2: pt.left, y2: pt.top, width: 0, height: 0};
        var tc = xds.canvas.findTarget(e);
        if (tc && tc.component.connectable && tc != this.cmp.node.parentNode) {
            this.conTarget = tc.component;
            eb = this.conTarget.getExtComponent().getBox();
        } else {
            delete this.conTarget;
        }
        var path = od.flow.getConPath(s.getBox(), eb);
        if (this.conTrack) {
            this.conTrack.attr({path: path});
        } else {
            this.conTrack = s.positionShape.paper.path(path).attr({'stroke-width': 2, 'arrow-end': 'block-wide-long', 'stroke-linejoin': 'miter'});
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
            df.userConfig.sourceRef = this.cmp.config.id || this.cmp.id;
            df.userConfig.targetRef = this.conTarget.config.id || this.conTarget.id;
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
        var cp = xds.flow.process;

        var pt = cp.el.translatePoints(b.xy[0], b.xy[1]);
        var sb = {x: pt.left, y: pt.top, x2: pt.left, y2: pt.top, width: 0, height: 0};
        var tc = xds.canvas.findTarget(b);
        if (tc && tc.component.connectable && tc != this.cmp.node.parentNode) {
            this.conTarget = tc.component;
            sb = this.conTarget.getExtComponent().getBox();
        } else {
            delete this.conTarget;
        }
        var path = od.flow.getConPath(sb, ec.endNode.getBox(),ec.routerDir);
        ec.shape.attr({path: path});
    },
    onEndConStart: function (b, c, a) {
        if (this.conTarget) {
            xds.canvas.beginUpdate();
            this.cmp.setConfig("sourceRef", this.conTarget.node.id);
            xds.props.setValue("sourceRef", this.conTarget.node.id);
            xds.canvas.endUpdate(true);
            delete this.conTarget;
        }
        xds.fireEvent("componentchanged");
    },
    onDragConEnd: function (b, c, a) {
        var ec = this.cmp.getExtComponent();
        var cp = xds.flow.process;

        var pt = cp.el.translatePoints(b.xy[0], b.xy[1]);
        var eb = {x: pt.left, y: pt.top, x2: pt.left, y2: pt.top, width: 0, height: 0};
        var tc = xds.canvas.findTarget(b);
        if (tc && tc.component.connectable && tc != this.cmp.node.parentNode) {
            this.conTarget = tc.component;
            eb = this.conTarget.getExtComponent().getBox();
        } else {
            delete this.conTarget;
        }
        var path = od.flow.getConPath(ec.startNode.getBox(), eb,ec.routerDir);
        ec.shape.attr({path: path});
    },
    onEndConEnd: function (b, c, a) {
        if (this.conTarget) {
            xds.canvas.beginUpdate();
            this.cmp.setConfig("targetRef", this.conTarget.node.id);
            xds.props.setValue("targetRef", this.conTarget.node.id);
            xds.canvas.endUpdate(true);

            delete this.conTarget;
        }
        xds.fireEvent("componentchanged");
    },
    getSnapedPoint: function (e, d, a) {
        var ec = this.cmp.getExtComponent();
        var ct = ec.ownerCt;
        var x = this.startX - d[0],
            y = this.startY - d[1],
            vf = false, lf = false;
        var ret = {x: this.startX - d[0], y: this.startY - d[1]};
        if (ct) {
            var p = ct.paper;
            if (p) {
                p.hl.hide();
                p.vl.hide();
                for (var i = 0; i < ct.items.items.length; i++) {
                    var item = ct.items.items[i];
                    if (item !== ec && !item.isConnection && item.shape) {
                        var bb = item.getBox();
                        if (Math.abs(x - bb.x) < 20 && !lf) {
                            p.hl.attr({path: ['M', bb.x, 0, 'L', bb.x, p.height].join(',')});
                            p.hl.toBack().show();
                            ret.x = bb.x;
                            lf = true;
                        }
                        if (Math.abs(y - bb.y) < 20 && !vf) {
                            p.vl.attr({path: ['M', 0, bb.y, 'L', p.width, bb.y].join(',')});
                            p.vl.toBack().show();
                            ret.y = bb.y;
                            vf = true;
                        }

                        if (lf && vf) {
                            break;
                        }
                    }
                }
            }
        }

        return ret;
    },
    onDragAbsolute: function (e, d, a) {
        if (!Ext.isEmpty(this.selecteds)) {
            Ext.each(this.selecteds, function (sn) {
                var s = sn.component.getExtComponent();
                s.setPosition(s.x - d[0], s.y - d[1]);
                this.startXY = e.getXY();
                s.syncFilm();
            }, this);
        } else {
            var p = this.getSnapedPoint(e, d, a);
            a.setPosition(p.x, p.y);
            a.syncFilm();
        }
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
    onEndRight: function (c, d, b) {
        xds.canvas.beginUpdate();
        var a = b.getWidth();
        var x = b.x;
        this.cmp.setConfig("x", x);
        xds.props.setValue("x", x);
        this.cmp.setConfig("width", a);
        xds.props.setValue("width", a);
        xds.canvas.endUpdate(true);
        xds.fireEvent("componentchanged");
    },
    onEndBottom: function (c, d, b) {
        xds.canvas.beginUpdate();
        var a = b.getHeight();
        var y = b.y;
        this.cmp.setConfig("y", y);
        xds.props.setValue("y", y);
        this.cmp.setConfig("height", a);
        xds.props.setValue("height", a);
        xds.canvas.endUpdate(true);
        xds.fireEvent("componentchanged");
    },
    onEndCorner: function (d, f, c) {
        xds.canvas.beginUpdate();
        var b = c.getWidth();
        var x = c.x;
        this.cmp.setConfig("x", x);
        xds.props.setValue("x", x);
        this.cmp.setConfig("width", b);
        xds.props.setValue("width", b);
        var a = c.getHeight();
        var y = c.y;
        this.cmp.setConfig("y", y);
        xds.props.setValue("y", y);
        this.cmp.setConfig("height", a);
        xds.props.setValue("height", a);
        xds.canvas.endUpdate(true);
        xds.fireEvent("componentchanged");
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
            var p = xds.flow.process;
            var pn = p.viewerNode;
            var ec = c.getExtComponent();
            if (p.items) {
                var cb = {x: ec.x - ec.width / 2, y: ec.y - ec.height / 2, x2: ec.x + ec.width / 2, y2: ec.y + ec.height / 2}, f = false;
                p.items.each(function (i) {
                    if (i.isContainer) {
                        var pb = {x: i.x - i.width / 2, y: i.y - i.height / 2, x2: i.x + i.width / 2, y2: i.y + i.height / 2};
                        if (this.isBBInside(pb, cb)) {
                            if (i.viewerNode != c.node.parentNode) {
                                i.viewerNode.appendChild(c.node);
                                if (ec.outputs) {
                                    ec.outputs.each(function (oc) {
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
                if (ec.outputs) {
                    ec.outputs.each(function (oc) {
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

od.flow.actions = {
    open:new Ext.Action({
        iconCls: "icon-project-open",
        text: "打开",
        tooltip: "Open Project",
        handler:function(){

        }
    }),
    bpmn20:new Ext.Action({
        iconCls:'icon-page-code',
        text:"BPMN2.0",
        tooltip: "show bpmn2.0 xml",
        handler:function(){
            var c = xds.inspector.root.firstChild.component;
            var j = c.getJsonConfig(true, true);

            Ext.Ajax.request({
                url: '/workflow/bpmn20',
                method: 'POST',
                jsonData:{def:Ext.encode(j)},
                success: function (response) {
                    var result = Ext.decode(response.responseText);
                    if (result.success) {
                        var win = new Ext.Window({
                            modal: true,
                            title: "BPMN2.0 XML",
                            width: 900,
                            height: 600,
                            bodyStyle: 'background-color:#ffffff;',
                            autoScroll: true,
                            fbar: [
                                {text: 'Cancel', ref: '../btnCancel', handler: function (btn) {
                                    btn.refOwner.close();
                                }}
                            ]
                        });
                        win.show();
                        win.body.update("<pre class='brush:xml' style='font-size:12px;font-family:\"consolas\",\"courier new\";'>" + result.message + "</pre>");

                        SyntaxHighlighter.highlight({toolbar: false});
                    } else {
                        Ext.Msg.alert('提示', result.msg);
                    }
                }
            });
        }
    })
};

od.flow.Designer = Ext.extend(xds.Designer, {
    createTbar:function(){
        this.tbar = new Ext.Toolbar({
            items: ["-",
                xds.actions.newAction,
                od.flow.actions.open,
                xds.actions.saveAction,
                "-",
                xds.actions.undo,
                xds.actions.redo,
                "-",
                od.flow.actions.bpmn20,
                xds.actions.rtConfig
            ]
        });
    },
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

        xds.Registry.register(xds.types.flow.Process);
        xds.Registry.register(xds.types.flow.Connection);

        xds.Registry.register(xds.types.flow.start.None);
        xds.Registry.register(xds.types.flow.start.Message);
        xds.Registry.register(xds.types.flow.start.Timer);
        xds.Registry.register(xds.types.flow.start.Error);

        xds.Registry.register(xds.types.flow.end.None);
        xds.Registry.register(xds.types.flow.end.Error);
        xds.Registry.register(xds.types.flow.end.Cancel);

        xds.Registry.register(xds.types.flow.boundary.Timer);
        xds.Registry.register(xds.types.flow.boundary.Error);
        xds.Registry.register(xds.types.flow.boundary.Message);
        xds.Registry.register(xds.types.flow.boundary.Signal);
        xds.Registry.register(xds.types.flow.boundary.Cancel);

        xds.Registry.register(xds.types.flow.inter.None);
        xds.Registry.register(xds.types.flow.inter.Timer);
        xds.Registry.register(xds.types.flow.inter.Message);
        xds.Registry.register(xds.types.flow.inter.SignalCatch);
        xds.Registry.register(xds.types.flow.inter.SignalThrow);

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

        xds.Registry.register(xds.types.flow.ExecListener);
        xds.Registry.register(xds.types.flow.TaskListener);


        od.FlowDesignerModule.superclass.init.call(this);
    }
});
od.ModuleMgr.registerType('flowdesigner', od.FlowDesignerModule);