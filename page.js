/**
 * Aimee-page
 * Author by gavinning
 * Homepage https://github.com/gavinning/aimee-page
 */

var pm, aimee, config, Class, Page, page;

pm = require('pm');
aimee = require('aimee');
config = aimee.getConfig();
Class = aimee.Class;

Page = Class.create();
Page.version = '1.0.0';
Page.aimee = {
    page: true
};

Page.fn.extend({
    name: 'page',
    renderString: 'lincoapp-page-'
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
    // 注册pm引用
    pm: pm,

    display: false,

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
        this.app = {};
        this.render();
        this.guid = aimee.guid();
        this.inited = true;
    },

    // 页面实例进入方法
    // 每次需要执行方法放到这里
    // 页面实例可重写此方法，但不建议，基本所有功能都可以通过重写 page.prerender, page.postrender, page.bind 来实现
    enter: function(){
        
    },

    __enter: function(){
        this.inited ? this.getPage().show() : this.init();
        this.enter();
    },

    // 渲染到页面
    render: function(id){
        var page = this;
        Page.ajax(function(data){
            var thisPage;

            // 缓存页面jQuery对象
            thisPage = $(page.template(data));

            page.include(data, page);
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

    include: function(){

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
        // 定义get方法用于获取app实例
        this.app[app.name].get = function(index, fn){
            if(typeof index === 'function'){
                fn = index;
                index = 0;
            }

            if(typeof fn === 'function'){
                fn.call(this[index], this[index])
            }
            else{
                return this[typeof index === 'number' ? index : 0];
            }
        };

        // 存储需要添加的属性
        // 标记当前app在同类app数组中的位置
        app.__attr ? '' : app.__attr = {};
        app.__attr['data-code'] = this.app[app.name].length - 1;

        // 缓存引用页面对象
        app.page = this;

        // 缓存pm对象
        app.pm = this.pm;

        // 没有回调时自动渲染，仅用于开发测试环境
        fn ? fn.call(app, app) : app.compile().setPage(thisPage).render();
    },

    /**
     * 页面调用模块的推荐方法，使用该方法调用的模块会被缓存到page.app对象中，方面后续直接引用或调试
     * @param  {String [|| Array || Function]}   id 推荐参数，为模块id，字符串
     * @param  {Function} 						 fn 回调，参数返回当前模块app对象
     */
    exports: function(id, fn){
        var App, app, self = this;

        // id === string
        if(typeof id === 'string'){
            id.split(' ').length > 0 ?
                this.exports(id.split(' '), fn):
                this.export(require(id), fn)
            return this;
        }

        // id === aimee.app
        else if($.type(id) === 'function' && id.aimee){
            this.export(id, fn);
            return this;
        }

        // id === array
        else if(Array.isArray(id)){
            id.forEach(function(item){
                self.export(require(item), fn)
            });
            return this;
        };

        return this;
    },

    /**
     * 查找页面中已被渲染的模块
     * @param  {String}   id    模块id
     * @param  {Number}   index 模块索引，同一页面对模块的调用会缓存在page.app[app.name]数组中
     * @param  {Function} fn    回调
     * @return {[type]}         当前页面对象
     */
    search: function(id, index, fn){
        !fn || fn.call(this.app[id][index], this.app[id][index]);
        return this;
    },

    query: function(){
        this.search.apply(arguments);
        return this;
    }

});

module.exports = Page;
