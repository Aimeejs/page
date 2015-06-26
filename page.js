var pm = require('pm');
var guid = require('guid');
var page;

function Page() {
	this.name = 'page';
	this.renderString = 'lincoapp-page-';
	this.pageId = function(){
		return '#lincowebapp-page-' + this.name;
	}
};

// 私有方法
$.extend(Page, {

	renderId: function(){
		return page.renderString + page.name;
	},

	// Mockjs 模拟数据
	mock: function(fn){
		var mock = require('mock').mock;
		var data = require('pages/' + page.name + '/' + page.name + '.json.js');
		
		fn(mock(data));
		console.log('data corss mock.');
	},

	// Mock or ajax
	ajax: function(fn){
		// 线上环境
		if(config.env === 'online' || config.env === 'dev' || config.env === 'test'){
			return $.ajax(Page.ajaxOptions(fn));
		};

		// mockjs模拟数据
		if(config.env === 'mockjs' || config.env === 'mock'){
			return this.mock(fn)
		}
	},

	ajaxOptions: function(fn){
		var opt, options, success;

		options = {};
		options.dataType = 'json';
		success = function(data, msg, xhr){
			!fn || fn(data);
			!page.ajaxconfig.success || page.ajaxconfig.success(data, msg, xhr);
		};
		opt = $.extend({}, options, page.ajaxconfig);
		opt.success = success;

		// 检查ajax url地址
		if(!opt.url){
			console.warn('Warning: Not found ajax url.')
		}

		return opt;
	}

});

// 虚拟页面公共方法
Page.prototype = {
	extend: function(){
		$.extend.apply(null, [this].concat([].slice.call(arguments, 0)))
	},

	page: function(){
		return $(this.pageId());
	},

	error: function(code, msg){
		var errorHash = {};

		if(typeof code === 'string'){
			msg = code;
			code = 0;
		}

		code ? console.error(errorHash[code]) : console.error(msg);
	},

	// 页面实例初始化方法
	init: function(){
		page = this;
		this.render();
		this.guid = guid();
		this.inited = true;
	},

	// 页面实例进入方法
	// 每次需要执行方法放到这里
	enter: function(){
		this.inited ? $(this.pageId()).show() : this.init();
	},

	// 渲染到页面
	render: function(id){
		Page.ajax(function(data){
			$(id || '#' + Page.renderId()).replaceWith(page.template(data));
			page.bind(data);
		});
	},

	append: function(id){
		Page.ajax(function(data){
			$(id).append(page.template(data));
			page.bind(data);
		});
	},

	prepend: function(id){
		Page.ajax(function(data){
			$(id).prepend(page.template(data));
			page.bind(data);
		});
	},

	// 页面实例离开方法
	leave: function(){
		$(this.pageId()).hide();
	},

	// 组件事件绑定
	bind: function(){

	},

	// 页面回退方法，默认调用系统回退
	back: function(){

	},

	// 页面注册
	reg: function(id){
		this._id = id || '/' + this.name;
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
		!fn || fn.call(this, app);
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