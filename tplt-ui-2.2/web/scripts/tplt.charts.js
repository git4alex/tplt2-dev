Ext.ns('od.chart');

od.chart.getColor = function(){
    return  '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).slice(-6);
};

od.chart.ChartBase = Ext.extend(Ext.BoxComponent, {
    initComponent: function () {
        od.chart.ChartBase.superclass.initComponent.call(this);
        this.addEvents('dataload');
    },
    onResize: function (aw, ah, rw, rh) {
        od.chart.ChartBase.superclass.onResize.call(this, aw, ah, rw, rh);
        if (aw > 0 && ah > 0) {
            this.drawChart();
        }
    },
    drawChart: function () {
        if (this.data) {
            var chart = this.getChart();
            if (chart) {
                chart.draw();
                chart = null;
            }
        } else if (this.dataUrl) {
            this.getLoadMask().show();
            Ext.Ajax.request({
                url: this.dataUrl,
                method: 'GET',
                success: function (resp) {
                    this.getLoadMask().hide();
                    var ret = Ext.decode(resp.responseText);
                    if (ret.success) {
                        this.data = ret.data;
                        this.onDataLoad();
                        this.drawChart();
                    } else {
                        this.showMsg(ret.msg);
                    }
                },
                scope: this
            });
        } else {
            this.showMsg('数据为空');
        }

    },
    getLoadMask: function () {
        if (!this.mask) {
            this.mask = new Ext.LoadMask(this.getEl(), {msg: '数据加载中...'})
        }
        return this.mask;
    },
    getChart: function () {
        if (this.iChartType) {
            var cfg = this.getChartCfg();
            if (cfg) {
                return new this.iChartType(cfg);
            }
        }
        return null;
    },
    getChartCfg: function () {
        var ret = {};
        var initCfg = this.initialConfig;
        for (var prop in initCfg) {
            var v = initCfg[prop];
            if (v == null) {
            } else if (v.constructor == String || v.constructor == Number || v.constructor == Boolean) {
                ret[prop] = v;
            }
        }
        delete ret.id;
        ret.width = this.getWidth();
        ret.height = this.getHeight();
        ret.render = this.getEl().id;

        if (ret.border) {
            ret.border = {enable: true};
        }
        if (ret.backgroundColor) {
            ret.background_color = '#' + ret.backgroundColor;
        }
        if (ret.color) {
            ret.color = '#' + ret.color;
        }
        if (ret.tip) {
            ret.tip = {enable: true};
        }
        if (ret.legend) {
            ret.legend = {enable: true};
            switch (ret.legendAlign) {
                case 'top' :
                    ret.legend.align = 'center';
                    ret.legend.valign = 'top';
                    break;
                case 'bottom' :
                    ret.legend.align = 'center';
                    ret.legend.valign = 'bottom';
                    break;
                case 'left' :
                    ret.legend.align = 'left';
                    ret.legend.valign = 'middle';
                    break;
                default :
                    ret.legend.align = 'right';
                    ret.legend.valign = 'middle';
            }
        }

        ret.data = this.data;
        return ret;
    },
    onDataLoad: function () {
        this.fireEvent('dataload', this.data);
    },
    showMsg: function (msg) {
        this.getEl().mask(msg, 'tplt-chart-msg');
    },
    refresh: function (rl) {
        if (rl) {
            delete this.data;
        }
        this.drawChart();
    }
});

od.chart.Line = Ext.extend(od.chart.ChartBase, {
    iChartType : iChart.LineBasic2D,
    getChartCfg: function () {
        var ret = od.chart.Line.superclass.getChartCfg.call(this);
        ret.sub_option = ret.sub_option || {};

        if (!ret.label) {
            ret.sub_option.label = false;
        }

        delete ret.label;

        if (ret.smooth) {
            ret.sub_option.smooth = true;
            delete ret.smooth;
        }
        if (ret.pointSize) {
            ret.sub_option.point_size = ret.pointSize;
            delete ret.pointSize;
        }
        if (ret.crosshair) {
            ret.crosshair = {enable: true};
        }

        ret.labels = this.labels;
        return ret;
    },
    onDataLoad:function(){
        this.labels = this.data.labels;
        this.data = this.data.lines;
        od.chart.Line.superclass.onDataLoad.call(this);
    }
});

od.chart.Column = Ext.extend(od.chart.ChartBase, {
    iChartType : iChart.Column2D,
    onDataLoad:function(){
        Ext.each(this.data,function(item){
            if(!item.color){
                item.color = od.chart.getColor();
            }
        });
        od.chart.Column.superclass.onDataLoad.call(this);
    }
});

od.chart.Bar = Ext.extend(od.chart.Column, {
    iChartType : iChart.Bar2D
});

od.chart.Area = Ext.extend(od.chart.Line, {
    iChartType : iChart.Area2D
});

od.chart.Pie = Ext.extend(od.chart.ChartBase, {
    iChartType: iChart.Pie2D,
    onDataLoad: function () {
        od.chart.Pie.superclass.onDataLoad.call(this);
        Ext.each(this.data, function (item) {
            item.color = item.color || od.chart.getColor();
        });
    }
});

Ext.ns('xds.chart');
Ext.ns('xds.types.chart');

xds.types.chart.Base = Ext.extend(xds.types.BoxComponent, {
    category: "图表",
    isContainer: false,
    transformGroup: "chart",
    layoutable: false,
    enableFlyout: false,
    defaultConfig: {

    },
    initConfig: function (o) {
        if (!o) {
            this.config.width = 500;
            this.config.height = 400;
        }
        this.config.border = false;
        this.config.shadow = true;
    },
    xdConfigs: [
        {
            name: "align",
            group: "Chart",
            ctype: "string",
            editor: "options",
            options: ['left', 'center', 'right']
        },
        {
            name: "animation",
            group: "Chart",
            ctype: "boolean"
        },
        {
            name: "animationType",
            group: "Chart",
            ctype: "string",
            editor: "options",
            options: ['easeIn', 'easeOut', 'easeInOut', 'linear']
        },
        {
            name: "backgroundColor",
            group: "Chart",
            ctype: "color"
        },
        {
            name: "border",
            group: "Chart",
            ctype: "boolean"
        },
        {
            name: "color",
            group: "Chart",
            ctype: "color"
        },
        {
            name: "dataUrl",
            group: "Chart",
            ctype: "string"
        },
        {
            name: "fontColor",
            group: "Chart",
            ctype: "color"
        },
        {
            name: "footnote",
            group: "Chart",
            ctype: "string"
        },
        {
            name: "gradient",
            group: "Chart",
            ctype: "boolean"
        },
        {
            name: "gradientMode",
            group: "Chart",
            ctype: "string",
            editor: "options",
            options: ['LinearGradientUpDown',
                'LinearGradientDownUp',
                'LinearGradientLeftRight',
                'LinearGradientRightLeft',
                'RadialGradientOutIn',
                'RadialGradientInOut']
        },
        {
            name: "height",
            group: "Chart",
            ctype: "number"
        },
        {
            name: "legend",
            group: "Chart",
            ctype: "boolean"
        },
        {
            name: "legendAlign",
            group: "Chart",
            ctype: "string",
            editor: "options",
            options: ['top', 'right', 'bottom', 'left']
        },
        {
            name: "padding",
            group: "Chart",
            ctype: "string"
        },
        {
            name: "shadow",
            group: "Chart",
            ctype: "boolean"
        },
        {
            name: "tip",
            group: "Chart",
            ctype: "boolean"
        },
        {
            name: "tipTpl",
            group: "Chart",
            ctype: "string"
        }
    ]
});

xds.types.chart.Line = Ext.extend(xds.types.chart.Base, {
    cid: 'linechart',
    iconCls: 'icon-line-chart',
    defaultName: "&lt;LineChart&gt;",
    text: "曲线图",
    dtype: "xdlinechart",
    xtype: 'linechart',
    xcls: "org.delta.chart.Line",
    naming: "LineChart",
    defaultConfig: {

    },
    xdConfigs: [
        {
            name: "crosshair",
            group: "LineChart",
            ctype: "boolean"
        },
        {
            name: "label",
            group: "LineChart",
            ctype: "boolean"
        },
        {
            name: "pointSize",
            group: "LineChart",
            ctype: "number"
        },
        {
            name: "smooth",
            group: "LineChart",
            ctype: "boolean"
        }
    ]
});

xds.chart.Line = Ext.extend(od.chart.Line, {
    getChartCfg: function () {
        var ret = xds.chart.Line.superclass.getChartCfg.call(this);
        ret.animation = false;
        return ret;
    },
    drawChart: function () {
        this.data = this.getDemoData();
        this.labels = this.getDemoLabels();
        xds.chart.Line.superclass.drawChart.call(this);
    },
    getDemoData: function () {
        if (!od.chart.Line.demoData) {
            var vs = [];
            for (var i = 0; i < 13; i++) {
                vs.push(Math.floor(Math.random() * (10 + ((i % 16) * 5))) + 10);
            }
            od.chart.Line.demoData = [
                {
                    name: 'S01',
                    value: vs,
                    color: '#ec4646',
                    line_width: 2
                }
            ];
        }

        return od.chart.Line.demoData;
    },
    getDemoLabels: function () {
        var ret = [];
        for (var i = 0; i < 13; i++) {
            ret.push('D' + i);
        }
        return ret;
    }
});

Ext.reg('xdlinechart', xds.chart.Line);
Ext.reg('linechart', od.chart.Line);

xds.types.chart.Area = Ext.extend(xds.types.chart.Base, {
    cid: 'areachart',
    iconCls: 'icon-area-chart',
    defaultName: "&lt;AreaChart&gt;",
    text: "面积图",
    dtype: "xdareachart",
    xtype: 'areachart',
    xcls: "org.delta.chart.Area",
    naming: "AreaChart",
    defaultConfig: {

    },
    xdConfigs: [
        {
            name: "label",
            group: "AreaChart",
            ctype: "boolean"
        },
        {
            name: "pointSize",
            group: "AreaChart",
            ctype: "number"
        },
        {
            name: "smooth",
            group: "AreaChart",
            ctype: "boolean"
        }
    ]
});

xds.chart.Area = Ext.extend(od.chart.Area, {
    getChartCfg: function () {
        var ret = xds.chart.Area.superclass.getChartCfg.call(this);
        ret.animation = false;
        return ret;
    },
    drawChart: function () {
        this.data = this.getDemoData();
        this.labels = this.getDemoLabels();
        xds.chart.Area.superclass.drawChart.call(this);
    },
    getDemoData: function () {
        if (!od.chart.Area.demoData) {
            var vs = [];
            for (var i = 0; i < 13; i++) {
                vs.push(Math.floor(Math.random() * (10 + ((i % 16) * 5))) + 10);
            }
            od.chart.Area.demoData = [
                {
                    name: 'S01',
                    value: vs,
                    color: '#ec4646',
                    line_width: 2
                }
            ];
        }

        return od.chart.Area.demoData;
    },
    getDemoLabels: function () {
        var ret = [];
        for (var i = 0; i < 13; i++) {
            ret.push('D' + i);
        }
        return ret;
    }
});

Ext.reg('xdareachart', xds.chart.Area);
Ext.reg('areachart', od.chart.Area);

xds.types.chart.Column = Ext.extend(xds.types.chart.Base, {
    cid: 'columnchart',
    iconCls: 'icon-column-chart',
    defaultName: "&lt;ColumnChart&gt;",
    text: "柱状图",
    dtype: "xdcolumnchart",
    xtype: 'columnchart',
    xcls: "org.delta.chart.Column",
    naming: "ColumnChart",
    defaultConfig: {

    },
    xdConfigs: [
    ]
});

xds.chart.Column = Ext.extend(od.chart.Column, {
    getChartCfg: function () {
        var ret = xds.chart.Column.superclass.getChartCfg.call(this);
        ret.animation = false;
        return ret;
    },
    drawChart: function () {
        this.data = this.getDemoData();
        xds.chart.Column.superclass.drawChart.call(this);
    },
    getDemoData: function () {
        if (!od.chart.Column.demoData) {
            od.chart.Column.demoData = [];
            for (var i = 0; i < 20; i++) {
                od.chart.Column.demoData.push({name: 'S' + i, value: Math.floor(Math.random() * (10 + ((i % 16) * 5))) + 10, color: od.chart.getColor()});
            }
        }

        return od.chart.Column.demoData;
    }
});

Ext.reg('xdcolumnchart', xds.chart.Column);
Ext.reg('columnchart', od.chart.Column);

xds.types.chart.Bar = Ext.extend(xds.types.chart.Base, {
    cid: 'barchart',
    iconCls: 'icon-bar-chart',
    defaultName: "&lt;BarChart&gt;",
    text: "条状图",
    dtype: "xdbarchart",
    xtype: 'barchart',
    xcls: "org.delta.chart.Bar",
    naming: "BarChart",
    defaultConfig: {

    },
    xdConfigs: [
    ]
});

xds.chart.Bar = Ext.extend(od.chart.Bar, {
    getChartCfg: function () {
        var ret = xds.chart.Bar.superclass.getChartCfg.call(this);
        ret.animation = false;
        return ret;
    },
    drawChart: function () {
        this.data = this.getDemoData();
        xds.chart.Bar.superclass.drawChart.call(this);
    },
    getDemoData: function () {
        if (!od.chart.Bar.demoData) {
            var flow = [];
            for (var i = 0; i < 9; i++) {
                flow.push({name: 'S' + i, value: Math.floor(Math.random() * (10 + ((i % 16) * 5))) + 10, color: od.chart.getColor()});
            }
            od.chart.Bar.demoData = flow;
        }

        return od.chart.Bar.demoData;
    }
});

Ext.reg('xdbarchart', xds.chart.Bar);
Ext.reg('barchart', od.chart.Bar);

xds.types.chart.Pie = Ext.extend(xds.types.chart.Base, {
    cid: 'pidchart',
    iconCls: 'icon-pie-chart',
    defaultName: "&lt;PieChart&gt;",
    text: "饼状图",
    dtype: "xdpiechart",
    xtype: 'piechart',
    xcls: "org.delta.chart.Pie",
    naming: "PieChart",
    defaultConfig: {

    },
    xdConfigs: [
        {
            name: "mutex",
            group: "PieChart",
            ctype: "boolean"
        }
    ]
});

xds.chart.Pie = Ext.extend(od.chart.Pie, {
    getChartCfg: function () {
        var ret = xds.chart.Pie.superclass.getChartCfg.call(this);
        ret.animation = false;
        return ret;
    },
    drawChart: function () {
        this.data = this.getDemoData();
        xds.chart.Pie.superclass.drawChart.call(this);
    },
    getDemoData: function () {
        if (!od.chart.Pie.demoData) {
            var flow = [];
            for (var i = 0; i < 6; i++) {
                flow.push({name: 'S' + i, value: Math.floor(Math.random() * (10 + ((i % 16) * 5))) + 10, color: od.chart.getColor()});
            }
            od.chart.Pie.demoData = flow;
        }

        return od.chart.Pie.demoData;
    }
});

Ext.reg('xdpiechart', xds.chart.Pie);
Ext.reg('piechart', od.chart.Pie);