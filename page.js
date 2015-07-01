/**
 * Aimee-page
 * Author by gavinning
 * Homepage https://github.com/gavinning/aimee-page
 */

var pm, guid, Class, Page, page;

pm = require('pm');
guid = require('guid');
Class = require('class');
Page = Class.create();
Page.version = '1.0.0';
Page.aimee = {
	page: true
};

Page.fn.extend({
	name: 'page',
	renderString: 'lincoapp-page-',
	pageId: function(){
		return '#lincowebapp-page-' + this.name;
	}
});

Page.extend({
	renderId: function(){
		return page.renderString + page.name;
	},

	// Mockjs 模拟数据，仅用于测试
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
Page.fn.extend({
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
	// 页面实例可重写此方法，但不建议，基本所有功能都可以通过重写 page.prerender, page.postrender, page.bind 来实现
	enter: function(){
		this.inited ? this.getPage().show() : this.init();
	},

	// 渲染到页面
	render: function(id){
		var page = this;
		Page.ajax(function(data){
			var thisPage;

			// 缓存页面jQuery对象
			thisPage = $(page.template(data));

			// 页面渲染预处理
			page.prerender(data, thisPage);

			// 执行页面渲染
			$(id || '#' + Page.renderId()).replaceWith(thisPage);

			// 页面渲染后处理
			page.postrender(data, thisPage);

			// 执行事件绑定
			page.bind(data, thisPage);

			page._page = thisPage;
		});
	},

	getPage: function(){
		return this._page;
	},

	// 页面实例离开方法
	leave: function(){
		this.getPage().hide();
	},

	// 页面渲染之前预处理，可以用来预加载页面模块
	// 页面实例重写此方法
	prerender: function(data, thisPage){

	},

	// 页面渲染之后处理，绑定方法之前执行
	// 页面实例重写此方法
	postrender: function(data, thisPage){

	},

	// 页面级事件绑定
	// 页面实例重写此方法
	bind: function(data, thisPage){

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
		var thisPage;
		var app = new App;
		this.app ? '' : this.app = {};

		// 用于简单调用模块，仅用于开发测试环境
		if(typeof fn === 'object'){
			thisPage = fn;
			fn = null;
		};

		// 检查重复加载
		if(this.app[app.guid]){
			return console.error(app.guid + ' is exist');
		};

		// 缓存app对象到页面
		this.app[app.name] ? '' : this.app[app.name] = [];
		this.app[app.name].push(app);

		// 没有回调时自动渲染，仅用于开发测试环境
		fn ? fn.call(this, app) : app.compile().setPage(thisPage).render();
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

});

module.exports = Page;
