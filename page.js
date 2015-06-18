// author: gavinning

var pm = require('pm');
var guid = require('guid');

function Page() {
	this.name = 'page';
	this.renderString = 'lincoapp-page-';
	this.pageId = function(){
		return '#lincowebapp-page-' + this.name;
	}
};
// 虚拟页面公共方法
Page.prototype = {
	extend: function(){
		$.extend.apply(null, [this].concat([].slice.call(arguments, 0)))
	},

	renderId: function(){
		return this.renderString + this.name;
	},

	// 页面实例初始化方法
	init: function(){
		this.render();
		this.bind();
		this.inited = true;
	},

	// 页面实例进入方法
	// 每次需要执行方法放到这里
	enter: function(){
		this.inited ? $(this.pageId()).show() : this.init();
	},

	// 页面实例离开方法
	leave: function(){
		$(this.pageId()).hide();
	},

	// 页面回退方法，默认调用系统回退
	back: function(){

	},

	// 组件事件绑定
	bind: function(){

	},

	// 渲染到页面
	render: function(id, data){
		$(id || '#' + this.renderId()).replaceWith(this.html(data));
		this.guid = guid();
	},

	append: function(id, data){
		$(id).append(this.html(data));
		this.bind();
	},

	prepend: function(id, data){
		$(id).prepend(this.html(data));
		this.bind();
	},

	// 返回html
	html: function(data){
		return this.template(this.data(data))
	},

	// 返回组合数据
	data: function(data){
		return $.extend({}, this.mock, data || {})
	},

	// 页面注册
	reg: function(id){
		this._id = id;
		pm.reg(this);
		pm.cache();
	},

	export: function(App, fn){
		var app = new App;
		this.app ? '' : this.app = {};

		if(this.app[app.guid]){
			return console.error(app.guid + ' is exist');
		};

		this.app[app.name] ? '' : this.app[app.name] = [];
		this.app[app.name].push(app);
		!fn || fn(app);
	},

	// 组件注册
	exports: function(id, fn){
		var App, app, self = this;

		// id === string
		if(typeof id === 'string'){
			return id.split(' ').length > 0 ?
				this.exports(id.split(' '), fn):
				this.export(require(id), fn)
		}

		// id === aimee.app
		else if($.type(id) === 'function' && id.aimee){
			return this.export(id, fn);
		}

		// id === array
		else if(Array.isArray(id)){
			id.forEach(function(item){
				self.export(require(item), fn)
			});
			return;
		};
	}

};

module.exports = Page;