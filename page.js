/**
 * Page for Aimeejs
 * Author by gavinning
 * Homepage https://github.com/Aimeejs/page
 */

let page, zeptoArray;

import pm from 'pm';
import guid from 'guid';
import Base from 'class';

class Privates {

    renderId() {
        return page.renderString + page.name;
    }

    // Mockjs 模拟数据，仅用于测试
    mock(fn) {
        var mock = require('mock').mock;
        var data = require(['pages', page.name, page.name+'.json.js'].join('/'));

        fn(mock(data));
        console.log('data corss mock.');
    }

    // Mock or ajax
    ajax(fn) {
        var p, options;
        // 获取ajax配置
        options = this.ajaxOptions();
        // 配置不为空时
        if(options.length){
            p = options.map(function(conf){
                return new Promise(function(res, rej){
                    conf.success = res;
                    conf.error = rej;
                    $.ajax(conf)
                })
            })
            Promise.all(p).then(function(arr){
                arr.length === 1 ?
                    fn(arr[0]) : fn(arr);
            })
        }
        // 配置为空时返回自定义数据
        else{
            this.mock(fn)
        }
    }

    ajaxOptions() {
        var configs = [], arr, def;

        if(!page.ajaxconfig){
            return configs;
        }

        Array.isArray(page.ajaxconfig) ?
            arr = page.ajaxconfig:
            arr = [page.ajaxconfig];

        // 检查是否是有效的ajax配置
        arr.forEach(function(conf){
        // 检查ajax url地址
            if(conf.url && conf.url !== '/tmp/test.json'){
                configs.push(conf)
        }
        })

        return configs;
    }

    // 内部使用，不允许覆盖
    prerender(data, page) {
        page.addClass('page-' + page.name)
    }

    // 内部使用，不允许覆盖
    postrender(data, page) {

    }

    // 执行处理app.pagerender
    pagerender(page) {
        var map, arr;
        map = page.app;
        for(var key in map){
            arr = map[key];
            arr.forEach(function(app){
                app.pagerender(app)
            })
        }
    }
}

let privates = new Privates;

class Page extends Base {

    constructor() {
        super();
        this.app = {};
        this.guid = guid();
        this.aimee = { page: true };
        this.renderString = 'lincoapp-page-';
        // 页面显示状态
        this.display = false;
    }

    // 页面实例初始化方法
    init(selector) {
        page = this;
        this.onload();
        this.render(selector);
        this.inited = true;
        return this;
    }

    // 页面注册 => PM
    reg(id) {
        this._id = id || '/' + this.name;
        pm.reg(this);
        return this;
    }

    // 页面加载 => PM
    load() {
        // 更新目标页面状态
        this.display = true;
        // 加载页面
        this.inited ? this.getPage().show() : this.init();
        // 执行用户自定义enter操作
            this.enter();
        return this;
    }

    // 页面离开 => PM
    unload() {
        // 更新目标页面状态
        this.display = false;
        // 页面隐藏
        this.getPage().hide();
        // 执行用户自定义leave操作
        this.leave();
        return this;
    }

    // 页面重载
    reload() {
        // 重载页面
        this.init('.page-' + this.name);
        return this;
    }

    /**
     * 批量绑定事件
     * @param   {Object}  events 事件对象模型
     * @example
     * this.bind({
     * 		'click@.lincoapp-footer': () => {
     * 			// do something
     * 		}
     * 		'click, focus@.lincoapp-comment': () => {
     * 			// do something
     * 		}
     * })
     */
    bind(events) {
        events = events || {};
        $.each(events, (key, fn) => {
            let pair = key.split('@');
            let evts = pair[0].split(/,\s*/g);
            evts.forEach((type) => {
                this.on(type, pair[1], fn)
            })
        })
    }

    // 渲染到页面
    render(selector) {
        var page = this;
        privates.ajax(function(data){
            // 缓存页面jQuery对象
            page._page = $(page.template(data));

            // 预处理, From System
            privates.prerender(data, page)

            // 用户自定义操作, From User
            page.include(data, page);

            // 预处理, From User
            page.prerender(data, page);

            // 检查是否默认显示
            if(!page.display){
                page._page.hide()
            };

            // 页面渲染 page.render
            $(selector || '#' + privates.renderId()).replaceWith(page._page);

            // 后处理, From App
            privates.pagerender(page);

            // 后处理, From System
            privates.postrender(data, page)

            // 后处理, From User
            page.postrender(data, page);
        });
    }

    getPage() {
        return this._page || [];
    }

    // 底层框架的调用入口
    // 类似：$(parent).find(child)
    find(selector) {
        return this.getPage().find(selector);
    }

    export(App, fn) {
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
    }

    /**
     * 页面调用模块的推荐方法，使用该方法调用的模块会被缓存到page.app对象中，方面后续直接引用或调试
     * @param  {String [|| Array || Function]}   id 推荐参数，为模块id，字符串
     * @param  {Function} 						 fn 回调，参数返回当前模块app对象
     */
    exports(id, fn) {
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
    }

    /**
     * 查找页面中已被渲染的模块
     * @param  {String}   id    模块id
     * @param  {Number}   index 模块索引，同一页面对模块的调用会缓存在page.app[app.name]数组中
     * @param  {Function} fn    回调
     * @return {[type]}         当前页面对象
     */
    search(id, index, fn) {
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
    }

    query() {
        return this.search.apply(this, arguments);
    }

    running() {
        var page = this;
        [].slice.call(arguments, 0)
        .forEach(function(item){
            item.call(page)
        })
    }

    // Rewrite

    // 初始化后执行
    onload() {

    }

    // 页面加载执行
    enter() {

    }

    // 页面离开执行
    leave() {

    }

    // 自定义操作
    include(data, page) {

    }

    // 页面回退执行
    back() {

    }

    // 预处理，页面渲染前执行
    prerender(data, page) {

    }

    // 后处理，页面渲染后执行
    postrender(data, page) {

    }
}

Page.aimee = { page: true }

// Method Extend From Zepto
zeptoArray = ('show hide on off delegate undelegate addClass removeClass before after append prepend appendTo prependTo').split(' ');
zeptoArray.forEach(function(name){
    Page.prototype[name] = function(){
        $.fn[name].apply(this.getPage(), arguments)
        return this;
    }
})

export default Page;
