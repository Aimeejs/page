v2.1.3
---
* ``app``新增``parent``属性，指向其调用发起者

v2.1.2
---
* 新增``use``方法，用于批量加载``app``
```js
this.use({
	'nav': app => app.init().render(),

	'list': app => {
		app.init().render();
		app.find(selector).remove();
	},

	// 同页面加载app多个实例时，使用^符号分割标识符，标识符没有特殊意义，只表示key的唯一性
	'list^2': app => {
		app.init().render();
		app.find(selector).remove();
	}
})
```

v2.1.1
---
* 删除page自身对page.bind的调用
* Fixbug 删除原有的page.bind方法，修正与覆盖新的page.bind的问题

v2.1.0
---
* 新增框架级事件绑定方法``bind``用于批量绑定事件
* 新增流程控制方法``onload``用于对数据进行包装，``onload``将在init之后自动执行，无需开发者调用

v2.0.1
---
* Fixbug 修正``virtual page``在没有配置ajaxconfig时报错的问题

v2.0.0
---
* ES6重构
* 从Zepto复制before,after等方法到page
* page.ajaxconfig增加支持多个ajax配置功能，多个配置为数组，单个配置保持和之前一样配置为对象
* 修改page.prerender, page.postrender, page.include, page.bind的thisPage参数为page
* Zepto实例 => App实例，获取原有thisPage可以执行page.getPage()
* 兼容修正fis3处理'pages/'会丢失'/'的问题

v1.0.6
---
* 优化Page.ajax方法，在非mock模式下，验证是否存在有效ajax.url，非mock模式下兼容调用mock数据

v1.0.5
---
* Page原型链新增Page.fn.aimee.page属性，默认为true，用于检查是否为页面实例

v1.0.4
---
* 修改page.exports回调的this指向，修改后指向调用的app

v1.0.3
---
* 优化page.exports方法，允许传入数据快捷调用
```javascript
page.exports('list', data);
```


v1.0.2
---
* 优化page.render前后方法注册顺序，优化app.pagerender触发时机  
```
page.include > page.prerender > page.bind > page.render > app.pagerender > page.postrender
```   
* 优化page.search方法，设定索引默认值为0，允许参数为空，默认调用第一个实例
```javascript
page.search('app')
```


v1.0.1
---
* 新增对app.pagerender的支持
* 更新说明文档


v1.0.0
---
* 优化page.render方法，支持app废弃app.setPage方法
* 优化page.getPage方法
* 新增page._preredner、page._postrender方法，用于框架对页面的预处理
* 优化page.exports方法，不传递callback的情况下直接返回app实例对象
* 优化page.search,  page.query方法，不传递callback的情况下直接返回app实例对象
* 新增page.app.app.get方法用于获取已调用的模块
* 新增page.query方法，功能同page.search
* 优化page类继承自aimee-class
* 新增页面对象api，优化export
* 更新mock调用方式
* 创建Aimee框架的page模块，用于生成Aimee-page的类
