// Ajax请求前事件
Ext.Ajax.on("beforerequest", function(conn, opts) {
	if (opts.maskBody) {
		this.loadMask = new Ext.LoadMask(opts.maskBody, {
			removeMask : true,
			msg : "信息请求中......"
		});
		this.loadMask.show();
	}
}, this);
// Ajax请求完成事件
Ext.Ajax.on("requestcomplete", function(conn, resp, opts) {
	if (opts.maskBody) {
		if (this.loadMask) {
			this.loadMask.hide();
			delete this.loadMask;
		}
	}
}, this);
// Ajax请求出现异常事件
Ext.Ajax.on("requestexception", function(conn, resp, opts) {
	if (opts.maskBody) {
		if (this.loadMask) {
			this.loadMask.hide();
			delete this.loadMask;
		}
	}
}, this);