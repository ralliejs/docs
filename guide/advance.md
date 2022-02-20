# 进阶

## 运行环境
在[加载App](/guide/basic.html#加载)章节中，我们通过`app.run`方法，通过回调参数中的运行环境对象来配置应用集群的资源路径。虽然Rallie的App是去中心化的，但是每个应用其实都运行在一个相同的环境下，这个运行环境可以被认为是应用集群的实质中心
<div align="center" style="padding: 20px">
![matrix](../images/matrix.drawio.svg)
</div>

对一个App来说，运行环境分为两种：**入口环境**和**非入口环境**。当一个应用是整个集群中第一个被创建的应用时，可以说该应用运行于入口环境，否则，应用就运行在非入口环境。我们可以通过`env.isEntry`来判断应用的运行环境是否是入口环境。

以上图这个8个应用的集群为例，当你先加载`/app1.js`时，App1是第一个被创建的应用，它将运行在入口环境，而后续加载的应用都将运行在非入口环境。如果你是先加载`/app8.js`，则App8将运行在入口环境。

默认情况下，所有的App都可以通过运行环境对象配置集群中其他App的资源加载路径，App集群是完全去中心化的。但是，运行在入口环境的App拥有一个特权——冻结运行环境。当运行环境被冻结后，其他App对运行环境的配置将不生效。
```ts {10}
app1.run((env) => {
  env.config({
    assets: {
      app2: {
        js: '/app2.js'
      }
    }
  })
  if (env.isEntry) {
    env.freeze()
  }
})
```
```ts
app2.run((env) => {
  if (!env.isEntry) {
    env.config({
      assets: {
        app3: {
          js: '/app3.js'
        }
      }
    })
  }
})
```
```ts
app3.run((env) => {
  console.log(env.conf.assets)
  /* app1的配置生效，app2的配置不会生效， 打印结果
   {
     app2: {
       js: [/app2.js]
     }
   }
  */
})
```
这个特性可以让你的应用集群的资源配置收归到一个配置App，当其他App运行在入口环境时，先启动这个配置App，待资源被统一配置后，再冻结运行环境即可。

:::tip
需要明确的是，虽然我们可以将资源注册收归到某个配置中心，但是Rallie的App依然是去中心化的，你可以从任意一个入口启动应用集群，这对应用的本地开发和调试非常有用
:::

## 中间件
在前面的例子中，我们配置应用集群的资源路径，都是通过`env.config`方法进行静态配置，当应用数量大且经常需要扩展时，这种配置方法显然非常不灵活。为了解决这个问题，Rallie参考了[koa](https://github.com/koajs/koa)的中间件设计，提供了让开发者通过中间件控制应用资源查找和加载过程的机制。

举个例子，假如一个集群中的所有应用都按照`/${appName}/index.js`的路径规范被部署到了[jsdelivr](https://www.jsdelivr.com/)上，那么你就可以应用这样一个中间件
```ts
app.run((env) => {
  env.use(async (ctx, next) => {
    await ctx.loadScript(`https://cdn.jsdelivr.net/npm/${ctx.name}/index.js`)
  })
})
```
这样你就不必使用`env.config`手动配置应用的资源路径了。

中间件的上下文`ctx`包含了一些属性和方法，你可以在[中间件 API](/api/#use)中查看全部。你也可以在调用`app.load`时传入一些自定义的上下文。举个例子，假设你不希望所有的应用都从jsdelivr加载，那么你可以改造一下刚才的中间件
```ts
app.run((env) => {
  env.use(async (ctx, next) => {
    if (ctx.jsdelivr === true) {
      await ctx.loadScript(`https://cdn.jsdelivr.net/npm/${ctx.name}/index.js`)
    } else {
      await next()
    }
  })
})
```
这样的话，只有在上下文中明确标识了jsdelivr的应用才会从jsdelivr加载资源
```ts
app.load('producer', { jsdelivr: true }) // 从jsdelivr加载资源
app.load('consumer') // 不从jsdelivr加载资源
```
Rallie的中间件是一个洋葱圈模型
<div align="center" style="padding: 20px">
![middleware](../images/middleware.drawio.svg)
</div>

最里层的Core中间件会从`env.config`手动配置的资源表中查找资源并加载，在那之前你可以插入自定义的中间件，从而完全接管应用资源的查找、加载和执行全过程。基于中间件，你可以接入常见的微前端框架提供的js沙箱，样式隔离，html entry等特性，甚至可以直接用[动态导入](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports)来加载应用，从而实现[monorepo](https://en.wikipedia.org/wiki/Monorepo)形式的微前端架构

:::tip
如果运行环境被冻结，那么运行在非入口环境的App注册的中间件将不会生效
:::

## 生命周期
在[注册](/guide/introduction.html#注册)章节中，我们使用`registerApp`方法注册了App，事实上，这个方法将会返回一个注册实例，你可以接着用这个注册实例直接链式调用指定生命周期回调。

App有Bootstrap、Activate、Destroy三个生命周期
```ts
registerApp(producer)
  .onBootstrap((data) => {
    // do something
  })
  .onActivate((data) => {
    // do something
  })
  .onDestroy((data) => {
    // do something
  })
```
我们可以调用`app.acticvate`和`app.destroy`方法对目标App进行激活和销毁，同时给其注册的生命周期回调传递参数
```ts
consumer.activate('producer', document.getElementById('producer-root'))
consumer.destroy('producer', document.getElementById('producer-root'))
```
你不必为每个生命周期都指定回调函数，事实上，对生命周期的取舍能让你的应用有不同的响应效果。

- 如果只指定了onBootstrap生命周期，应用将只在第一次被激活执行onBootstrap回调，而不会理会后续的激活
- 如果只指定了onActivate生命周期，应用将在每次被激活时都执行onActivate回调
- 如果同时指定了onBootstrap和onActivate生命周期，应用将在第一次被激活时执行onBootstrap回调，在后续被激活时执行onActivate回调

下面展示了App的生命周期图谱，或许你还不能完全明白所有东西，但是随着你的不断学习和深入，它的参考价值会越来越高
<div align="center" style="padding: 20px">
![App Lifecycle](../images/lifecycle.drawio.svg)
</div>

## 关联和依赖
除了指定生命周期，你还可以在App注册后指定其关联和依赖，这样当你的App启动时，其关联和依赖的App也会被加载或激活
### 关联
还是以[运行环境](#运行环境)章节中的8个App的集群为例，假如App2需要使用App1提供的状态，那么它必须等App1的资源被加载，初始化状态的逻辑被执行后才能对App1的状态进行读，写和监听。此时，我们可以在注册App2时，将App1声明为App2的关联App
```ts
registerApp(app2)
  .relateTo(['app1'])
```
经过这个声明，当你在激活App2时，Rallie会先检查App1是否已经注册，如果没有，则会先加载App1的资源，等App1注册后，才进入App2指定的生命周期回调。你可以指定多个关联App，Rallie会**按顺序**检查并加载关联的App。
### 依赖
假如App2必须等待App1激活后才能正常工作，那么我们可以在注册App2时，将App1声明为App2的依赖
```ts
registerApp(app2)
  .relyOn(['app1'])
```
经过这个声明，当你在**首次激活**App2时，Rallie会先激活App1，然后才进入App2的生命周期

**关联和依赖的区别：**
1. 关联只会加载App，而依赖会激活App。
2. 关联不会递归传递，依赖会递归传递。也就是说，如果App1关联了App2，App2又关联了App3，那么在激活App1时，只会加载App2，而不会加载App3，只有当激活App2时才会加载App3，但是，如果App1依赖了App2，App2又依赖了App3，那么在激活App1时，App2和App3都会被激活
3. 允许互相关联，不允许互相依赖。正是因为依赖会递归传递，因此如果应用树中出现了循环依赖，就将导致[死锁](https://zh.wikipedia.org/wiki/%E6%AD%BB%E9%94%81)，会抛出异常
<div align="center">
![circle](../images/circle.drawio.svg)
</div>

### 共享公共库
Rallie把应用分为两类，一类是App，其js资源中必须包含调用`registerApp`注册App的逻辑，然后通过App实例对外提供服务，比如[基础](/guide/basic.html#基础)章节中的consumer和producer；另一类是Library，其js资源中不必包含注册App的逻辑，被加载之后作为整个环境的运行时使用，比如`React`、`Vue`、`jQuery`等第三方库。Rallie通过应用名是否以`lib:`开头判断应用是Library还是App
```ts
app.run(({ bus }) => {
  bus.config({
    assets: {
      vue: {
        js: ['https://cdn.jsdelivr.net/npm/vue@3.2.24/dist/vue.global.prod.js']
      },
      'lib:vue': {
        js: ['https://cdn.jsdelivr.net/npm/vue@3.2.24/dist/vue.global.prod.js']
      }
    }
  })

  app.activate('lib:vue') // 正常运行
  app.activate('vue') // 抛出异常，因为Vue源码中不包含注册App的逻辑
})
```
多个App往往会使用一些相同的公共库，你可以将他们声明为关联或依赖来确保资源不被重复加载
```ts
app.run(({ bus }) => {
  bus.config({
    assets: {
      'lib:vue': {
        js: ['https://cdn.jsdelivr.net/npm/vue@3.2.24/dist/vue.global.prod.js']
      }
    }
  })

  registerApp(app)
    .relyOn(['lib:vue']) // 也可以是.relateTo(['lib:vue'])
    .onBootstrap(async () => {
      (await import('./lifecycle')).onBootstrap()
    })
})
```
你或许已经注意到我们在生命周期方法中使用了[动态导入](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports)，这是因为App的资源会先于Vue被加载，使用动态导入可以让App的源码在构建时被分包，在`window.Vue`全局变量被挂载后才加载使用了Vue的逻辑。

最后，我们配置一下构建工具的`external`特性即可
- webpack:
  ```ts
  module.exports = {
    externals: {
      vue: 'Vue'
    }
  }
  ```
- vite:
  ```ts
  import { viteExternalsPlugin } from 'vite-plugin-externals'
  export default defineConfig({
    plugins: [
      viteExternalsPlugin({
        vue: 'Vue',
      })
    ]
  })
  ```

