# Advanced

## Runtime Environment

In the [Loading Block](/guide/basic.html#加载-block) section, we called the `block.run` method and configured the resource path of the application cluster through the runtime environment object `env` in the callback parameter. In Rallie, applications (Blocks) are decentralized, but each application actually runs in the same environment, which can be considered the de facto center of the application cluster.

<div align="center" style="padding: 20px">
  <img src="../images/matrix.drawio.svg">
</div>

For a Block, there are two types of runtime environments: **entry environment** and **non-entry environment**. When a Block is the first Block created in the entire cluster, it can be said to run in the entry environment; otherwise, the Block runs in a non-entry environment. We can use `env.isEntry` to determine whether the Block's runtime environment is an entry environment.

Taking the above example of an 8-Block cluster, when you first load `/app1.js`, block1 is the first application created and will run in the entry environment, while subsequent Blocks loaded will run in a non-entry environment. If you load `/app8.js` first, block8 will run in the entry environment.

By default, all Blocks can configure the resource loading paths of other Blocks in the cluster through the runtime environment object, and the Block cluster is completely decentralized. However, the Block running in the entry environment has a privilege - freezing the runtime environment. Once the runtime environment is frozen, other Blocks' configurations for the runtime environment will not take effect.

```ts {10}
block1.run((env) => {
  env.config({
    assets: {
      block2: {
        js: "/apo2.js",
      },
    },
  });
  if (env.isEntry) {
    env.freeze();
  }
});
```

```ts
block2.run((env) => {
  if (!env.isEntry) {
    env.config({
      assets: {
        block3: {
          js: "/app3.js",
        },
      },
    });
  }
});
```

```ts
block3.run((env) => {
  console.log(env.conf.assets);
  /*
   block1's configuration takes effect, block2's configuration will not take effect,
   printing result
   {
     block2: {
       js: [/app2.js]
     }
   }
  */
});
```

This feature allows you to centralize the resource configuration of your application cluster to a configuration Block. When other Blocks run in the entry environment, first start this configuration Block, and after the resources are uniformly configured, freeze the runtime environment.

:::tip
It needs to be clear that although we can centralize the registration of resources to a certain configuration center, Blocks are still decentralized. You can start the application cluster from any entry, which is very useful for local development and debugging of applications.
:::

## Middleware

In the previous example, we configured the resource path of the application cluster through `env.config` method for static configuration. When the number of applications is large and often needs to be expanded, this configuration method is obviously very inflexible. To solve this problem, Rallie refers to the middleware design of [koa](https://github.com/koajs/koa) and provides a mechanism for developers to control the process of finding and loading application resources through middleware.

For example, suppose all Blocks in a cluster are deployed according to the path specification of `/${blockName}/index.js` on [jsdelivr](https://www.jsdelivr.com/), then you can apply such a middleware.

```ts
block.run((env) => {
  env.use(async (ctx, next) => {
    await ctx.loadScript(`https://cdn.jsdelivr.net/npm/${ctx.name}/index.js`);
  });
});
```

In this way, you don't have to manually configure the resource path of the application using `env.config`.

Rallie's middleware is an onion model.

<div align="center" style="padding: 20px">
  <img src="../images/middleware.drawio.svg">
</div>

The innermost Core middleware will look for resources from the resource table manually configured by `env.config` and load them. Before that, you can insert custom middleware to completely take over the entire process of finding, loading, and executing application resources. Based on middleware, you can connect common features provided by micro front-end frameworks, such as JS sandbox, style isolation, HTML entry, etc., and even directly use [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) to load applications.

:::tip
If the runtime environment is frozen, the middleware registered by the Block running in the non-entry environment will not take effect.
:::

## Application Governance

### Dependency
In the [Basics](/guide/basic.html#基础) section, the consumer must wait for the producer to initialize the state before performing subsequent operations, so we can say that the consumer depends on the producer.

Rallie supports declaring dependency relationships between Blocks in the following form:

```ts
const consumer = createBlock('consumer')
  .relyOn(['producer'])
  .onActivate(() => {
    // do something
  })
```

The `relyOn` method is used to specify dependencies, and the `onActivate` method is used to specify the callback after the dependencies are ready.

When we need to use the services provided by the consumer, instead of calling the `block.load` method, we call `block.activate('consumer')`. Rallie will first activate the producer that the consumer depends on, and then execute the onActivate callback specified by the consumer after the producer is ready.

:::tip
The `load` method only loads the Block's resources, while the `activate` method also activates dependencies and executes the `onActivate` callback.
:::

### Association
In addition to specifying dependencies, you can also specify the association relationships between Blocks through the `relateTo` method.

```ts
const consumer = createBlock('consumer')
  .relateTo(['producer'])
  .onActivate(() => {
    // do something
  })
```

**The difference between association and dependency:**

1. Association only loads the Block's resources, while dependency activates the Block.
2. Association does not propagate recursively, but dependency does. That is to say, if block1 is associated with block2, and block2 is associated with block3, when activating block1, only block2 will be loaded, and block3 will not be loaded until block2 is activated. However, if block1 depends on block2, and block2 depends on block3, then when activating block1, both block2 and block3 will be activated.
3. Mutual association is allowed, but mutual dependency is not. It is precisely because dependencies are recursively transmitted that if there is a circular dependency in the application tree, it will lead to a [deadlock](https://zh.wikipedia.org/wiki/%E6%AD%BB%E9%94%81). Rallie will throw an exception if a circular dependency is detected.
<div align="center">
  <img src="../images/circle.drawio.svg">
</div>

### Sharing Common Libraries

Rallie divides Blocks into two categories. One category is App, whose JS resources must contain the logic of calling `registerBlock` to register Blocks, and then provide services through Block instances, such as consumer and producer in the [Basics](/guide/basic.html#基础) section. The other category is Library, whose JS resources do not need to contain the logic of registering Blocks. After being loaded, they are used as the runtime of the entire environment, such as `React`, `Vue`, `jQuery`, and other third-party libraries. Rallie determines whether an application is a Library or an App based on whether the application name starts with `lib:`.

```ts
block.run((env) => {
  env.config({
    assets: {
      vue: {
        js: ["https://cdn.jsdelivr.net/npm/vue@3.2.24/dist/vue.global.prod.js"],  // vue source code
      },
      "lib:vue": {
        js: ["https://cdn.jsdelivr.net/npm/vue@3.2.24/dist/vue.global.prod.js"], // vue source code
      },
    },
  });
})
```

You may have noticed that we used dynamic imports in the `onActivate` callback. This is because the resources for a block are loaded before the Vue source code. Using dynamic imports allows the block's source code to be split into chunks during the build process, and the logic that uses Vue is loaded only after the `window.Vue` global variable is attached.

Here is how you can configure the `externals` feature of your build tool:

- For **webpack**, you can set up an externals configuration in your `webpack.config.js` like this:
  ```js
  module.exports = {
    externals: {
      vue: "Vue",
    },
  };
  ```
  This configuration tells webpack to treat `vue` as an external dependency, which means it won't be bundled into your final bundle. Instead, it will be resolved at runtime from the global `Vue` variable.

- For **vite**, you can use the `vite-plugin-externals` plugin to achieve the same result. Add the plugin to your `vite.config.js`:
  ```js
  import { viteExternalsPlugin } from "vite-plugin-externals";
  export default defineConfig({
    plugins: [
      viteExternalsPlugin({
        vue: "Vue",
      }),
    ],
  });
  ```
  This plugin will ensure that `vue` is not included in your Vite bundle and will be expected to be available globally as `Vue`.

By setting up externals, you inform your module bundler not to include Vue in your bundle, and you expect it to be provided by the global scope. This is particularly useful when you are using a common library like Vue in multiple projects, and you want to avoid bundling it in every project to reduce the overall size of your application.

