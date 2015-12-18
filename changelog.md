v1.0.6
---
优化Page.ajax方法，在非mock模式下，验证是否存在有效ajax.url，非mock模式下兼容调用mock数据

v1.0.5
---
Page原型链新增Page.fn.aimee.page属性，默认为true，用于检查是否为页面实例

v1.0.4
---
修改page.exports回调的this指向，修改后指向调用的app

v1.0.3
---
优化page.exports方法，允许传入数据快捷调用
```javascript
page.exports('list', data);
```


v1.0.2
---
优化page.render前后方法注册顺序，优化app.pagerender触发时机  
```
page.include > page.prerender > page.bind > page.render > app.pagerender > page.postrender 
```   
优化page.search方法，设定索引默认值为0，允许参数为空，默认调用第一个实例
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