# Aimee-page

----
UZ构建工具page模块，用于生成Aimee-page的类，依赖[Zepto](http://www.zeptojs.cn/) or [jQuery v2+](http://jquery.com/)，可选依赖[mock.js](http://mockjs.com/)

[Aimee-app](https://github.com/gavinning/aimee-app)

```
// Aimee-page由3个基本文件1个可选文件组成
home
├── home.jade 			// page的jade模板，构建过程中会被编译成amd模块进行调用
├── home.js 			// page功能js文件
├── home.json.js 		// page模拟数据，基于mock规则，用于测试
└── home.less 			// page的样式文件，可选，一般用不着
```

```
// 基本使用，定义一个 aimee-page
var Page = require('page');
var page = new Page;
var mock = require('mock').mock;

page.extend({
	name: 'home',
	mock: mock(require('./home.json')),
	template: require('./home.jade'),

	bind: function(){
		// 多app调用
		this.exports('header footer teamCard', function(app){
			app.render();
		})

		// 独立app调用
		this.exports('nav', function(app){
			app.attr('className', 'skin-white').render(page.mock.home);
		})

		// 独立app调用
		// app基于Aimee-app生成
		this.exports('nav', function(app){

			// app渲染前执行
			app.on('before', function(data){
				return data
			})

			// app渲染后执行
			app.on('after', function(element){
				
			})

			app.attr('className', 'skin-white').render(page.mock.home);
		})

		// require直接调用app，不会被关联到页面对象上，不利于调试，推荐上面示例调用方式
		require('nav').render()
	}
});

module.exports = page;
```
