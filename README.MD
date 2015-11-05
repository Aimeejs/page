# page

Aimee框架page模块，用于创建虚拟页，所有虚拟页基于此模块创建

[app](https://github.com/Aimeejs/app)

```
// page由3个基本文件1个可选文件组成
home
├── home.jade 			// page的jade模板，构建过程中会被编译成amd模块
├── home.js 			// page功能js文件
├── home.json.js 		// page模拟数据，基于mock规则，仅用于测试
└── home.less 			// page的样式文件，可选，一般用不着
```

```javascript
// 基本使用，定义一个 page
var Page = require('page');
var page = new Page;

page.extend({
	name: 'home',
	template: require('./home.jade'),

	// 配置数据ajax请求参数
	ajaxconfig: {
		url: '/tmp/test.json',
		dataType: 'json'
	},

	/**
	 * 页面渲染前预处理
	 * @param  {object}  data     页面ajax请求到的数据
	 * @param  {object}  thisPage 当前页面的jQuery对象
	 */
	prerender: function(data, thisPage){
		// 多app调用，仅用于测试的使用方法，这种用法会调用mock的模拟数据
		this.exports('header footer teamCard')

		// 异步，用于封装一个作用域，所有该模块的逻辑写在这里，提升代码可维护性
		this.exports('nav', function(app){
			// app是aimee-app对象，详细文档请参考 Aimee-app
			app
				// app数据与模板编译
				.init(data)
				// 操作内存中的app
				.addClass('skin-white')
				// 渲染到页面
				.render();
		})

		// 异步
		this.exports('nav', function(app){
			app
				// app渲染前执行
				.on('before', function(thisApp){
					// your code
				})
				// app渲染后执行
				.on('after', function(thisApp){
					// your code
				})
				.init(data)
				.skin('white')
				.render();
		})

		// 模块同步调用
		this.exports('share').skin('image')
	},

	// 渲染后执行
	postrender: function(data, thisPage){

	}
});

module.exports = page;
```
