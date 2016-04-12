/**
 * Page for Aimeejs
 * Author by gavinning
 * Homepage https://github.com/Aimeejs/page
 */

var Page, page, pm, aimee, Class, zeptoArray;

pm = require('pm');
aimee = require('aimee');
Class = require('class');
Page = module.exports = Class.create();

// Method Extend From Zepto
zeptoArray = ('show hide on off delegate undelegate addClass removeClass ' +
             'append prepend').split(' ');
zeptoArray.forEach(function(name){
    Page.fn[name] = function(){
        $.fn[name].apply(this.getPage(), arguments)
        return this;
    }
})

Page.extend({
    renderId: function(){
        return page.renderString + page.name;
    },

    // Mockjs 模拟数据，仅用于测试
    mock: function(fn){
        var mock = require('mock').mock;
        var data = require(['pages', page.name, page.name+'.json.js'].join('/'));

        fn(mock(data));
        console.log('data corss mock.');
    },

    // Mock or ajax
    ajax: function(fn){
        var options = this.ajaxOptions(fn);
        !options.url || options.url === '/tmp/test.json' ?
            this.mock(fn) :
            $.ajax(Page.ajaxOptions(fn))
    },

    ajaxOptions: function(fn){
        var opt, options;

        options = {};
        options.dataType = 'json';

        // Merge
        opt = $.extend({}, options, page.ajaxconfig);

        // 数据请求成功
        opt.success = function(data, msg, xhr){
            !fn || fn(data);
            !page.ajaxconfig.success || page.ajaxconfig.success(data, msg, xhr);
        }

        // 数据请求失败
        opt.error = function(xhr, msg){
            !fn || fn({code: 1, msg: msg});
            !page.ajaxconfig.error || page.ajaxconfig.error(data, msg, xhr);
        }

        // 检查ajax url地址
        if(!opt.url){
            console.warn('Warning: Not found ajax url.')
        }

        return opt;
    },

    // 内部使用，不允许覆盖
    prerender: function(data, thisPage){
        thisPage.addClass('page-' + page.name)
    },

    // 内部使用，不允许覆盖
    postrender: function(data, thisPage){

    },

    // 执行处理app.pagerender
    pagerender: function(page){
        var map, arr;
        map = page.app;
        for(var key in map){
            arr = map[key];
            arr.forEach(function(app){
                app.pagerender(app)
            })
        }
    }
})

// Base
Page.include({
    name: 'page',
    renderString: 'lincoapp-page-',
    aimee: {
        page: true
    }
})

// Core
Page.include({
    // 页面实例初始化方法
    init: function(selector){
        page = this;
        this.app = {};
        this.render(selector);
        this.guid = aimee.guid();
        this.inited = true;
    },

    // 页面注册 => PM
    reg: function(id){
        this._id = id || '/' + this.name;
        pm.reg(this);
    },

    // 页面加载 => PM
    load: function(){
        // 更新目标页面状态
        this.display = true;
        // 加载页面
        this.inited ? this.getPage().show() : this.init();
        // 执行用户自定义enter操作
            this.enter();
    },

    // 页面离开 => PM
    unload: function(){
        // 更新目标页面状态
        this.display = false;
        // 页面隐藏
        this.getPage().hide();
        // 执行用户自定义leave操作
        this.leave();
    },

    // 页面重载
    reload: function(){
        // 重载页面
        this.init('.page-' + this.name);
        return this;
    },

    // 渲染到页面
    render: function(selector){
        var page = this;
        Page.ajax(function(data){
            // 缓存页面jQuery对象
            page._page = $(page.template(data));

            // 预处理, From System
            Page.prerender(data, page._page)

            // 用户自定义操作, From User
            page.include(data, page._page);
            
            // 预处理, From User
            page.prerender(data, page._page);

            // 事件绑定, From User
            page.bind(data, page._page);

            // 检查是否默认显示
            if(!page.display){
                page._page.hide()
            };

            // 页面渲染 page.render
            $(selector || '#' + Page.renderId()).replaceWith(page._page);

            // 后处理, From App
            Page.pagerender(page);

            // 后处理, From System
            Page.postrender(data, page._page)

            // 后处理, From User
            page.postrender(data, page._page);
        });
    }
})

// Rewrite
Page.include({
    // 页面加载执行
    enter: function(){

    },

    // 页面离开执行
    leave: function(){

    },

    // 自定义操作
    include: function(){

    },

    // 自定义操作
    // 建议用于事件绑定
    bind: function(data, thisPage){

    },

    // 页面回退执行
    back: function(){

    },

    // 预处理，页面渲染前执行
    prerender: function(data, thisPage){

    },

    // 后处理，页面渲染后执行
    postrender: function(data, thisPage){

    }
})

// Supplementary
Page.include({
    // 页面显示状态
    display: false,

    getPage: function(){
        return this._page || [];
    },

    // 底层框架的调用入口
    // 类似：$(parent).find(child)
    find: function(selector){
        return this.getPage().find(selector);
    },

    export: function(App, fn){
        var data = {};
        var app = new App;
        this.app ? '' : this.app = {};

        // 检查简单调用
        // data === fn
        if(typeof fn === 'object'){
            data = fn;
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
        fn ? fn.call(app, app, this) : app.init(data).render();

        if(!fn){
            return app;
        }
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
            // 多个组件调用，返回page对象
            if(id.split(' ').length > 1){
                this.exports(id.split(' '), fn);
            return this;
        }
            // 单个组件调用返回app对象
            else{
                return this.export(aimee.virtualMap[id] || require(id), fn);
            }
        }

        // id === aimee.app
        // 单个组件调用返回app对象
        else if($.type(id) === 'function' && id.aimee){
            return this.export(id, fn);
        }

        // id === array
        // 多个组件调用，返回page对象
        else if(Array.isArray(id)){
            id.forEach(function(item){
                self.export(aimee.virtualMap[item] || require(item), fn)
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
        if(!index || index === 0){
            index = 0;
        }

        if(typeof index === 'function'){
            fn = index;
            index = 0;
        }
        
        if(fn){
            fn.call(this.app[id][index], this.app[id][index])
        }
        else{
            return this.app[id][index];
        }
    },

    query: function(){
        return this.search.apply(this, arguments);
    },

    running: function(){
        var page = this;
        [].slice.call(arguments, 0)
        .forEach(function(item){
            item.call(page)
        })
    }
});
