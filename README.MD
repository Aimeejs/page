# Page
[Aimeejs](https://github.com/gavinning/aimee)
可以基于此创建Virtual page

### Create
创建一个page
```sh
$ aimee c -p home
# or
$ aimee create -p home

# 创建es6模板
$ aimee c -ew home
$ aimee create -ep home
```

### Virtual Page
以``Page``为父类创建``Virtual Page``
```js
import Page from 'page';
import template from 'home.jade';

class Home extends Page {

    constructor() {
        super();
        this.name = 'home';
        this.template = template;
    }

    // 支持多接口，多接口以数组形式返回
    get ajaxconfig() {
        return {
            url: '/api/home/get',
            dataType: 'json'
        }
    }

    // 数据加载之前，执行页面初始化
    onload() {
        aimee.app.loading.show()
    }

    // 渲染预处理
    prerender(data) {
        // 加载tags.app
        this.exports('tags', data.tag);

        // 批量加载app
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

        // 为Virtual Page绑定事件，推荐在app内执行事件绑定
        this.bind({

            // 为Virtual Page根对象绑定事件
            'click': () => {
                console.log('click app')
            },

            // 为Virtual Page 下的li绑定事件
            'click@li': () => {
                console.log('click li')
            },

            // 多事件绑定
            'click, focus@input[type="text"]': () => {
                console.log('click or focus input[type="text"]')
            }
        })
    }

    // 渲染后处理
    postrender(data) {
        aimee.app.loading.hide();
    }

    // 每次进入当前虚拟页时执行
    enter() {

    }

    // 每次离开当前虚拟页时执行
    leave() {

    }
}

export default new Home;
```
