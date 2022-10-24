# API
## 基础类型
```ts
type State = Record<string, any>

type Events = Record<string, (...args: any[]) => void>

type Methods = Record<string, (...args: any[]) => any>

type Exports = Record<string, any>

type BlockDeclare = Partial<{ 
  state:  State, 
  events: Events, 
  methods: Methods, 
  exports: Exports 
}>
```

## createBlock

- 类型：`<T extends BlockDeclare>(name: string) => CreatedBlock<T['state'], T['events'], T['methods'], T['exports']>`
- 说明：创建一个 Block，接收全局唯一的 block 名作为参数，返回一个[CreatedBlock](#createdblock)实例。
- 示例：

  ```ts
  import { createBlock } from "@rallie/block";

  interface MyBlock {
    state: {
      count: number,
      user: {
        name: string
      }
    },
    events: {
      incrementCount: () => void
    },
    methods: {
      login: () => void,
      logout: () => void
    },
    exports: {
      text: string
    }
  }

  const myBlock = createBlock<MyBlock>("my-block");
  ```

## CreatedBlock

### name

- 类型：`string`
- 说明： Block 的名称

### state

- 类型：`State`
- 说明： Block 的状态，是只读的，要修改 Block 的状态必须使用[setState](#setstate)方法

### methods

- 类型：`Methods`
- 说明：Block 的方法调用器，是只读的，要给 Block 添加方法，必须使用[addMethods](#addmethods)方法
- 示例：

  ```ts
  // 添加方法
  block.addMethods({
    login: async () => {
      const success = await requestLogin();
      return success;
    },
  });

  // 调用方法
  block.methods.login().then((success) => {
    if (success) {
      alert("Login successfully");
    }
  });
  ```

### events

- 类型：`Events`
- 说明：Block 的事件调用器，是只读的，要给 Block 添加事件监听，必须使用[listenEvents](#listenevents)方法
- 示例：

  ```ts
  // 监听事件
  block.listenEvents({
    themeChange: (themeColor) => {
      doChangeTheme(themeColor);
    },
  });

  // 触发事件
  block.events.themeChange("red");
  ```

### initState

- 类型：`(value: State, isPrivate: boolean = false) => void`
- 说明：初始化 Block 的状态。一个 Block 只能初始化一次状态，多次调用`initState`会抛出错误。如果希望状态不能被其他 Block 直接修改，第二个参数可以传入`true`，表示将状态初始化为私有状态。

### setState

- 类型：`((action: string, state: State) => void | Promise<void>) => Promise<void>`
- 说明：修改 Block 的状态，第一个参数是对本次操作的描述
- 示例：

  ```ts
  // 同步修改状态
  block.setState("add the count synchronously", (state) => {
    state.count++;
  });

  // 异步修改状态
  await block.setState("add the count asynchronously", async (state) => {
    const userInfo = await requestLogIn();
    state.user = userInfo;
  });
  ```

### watchState

- 类型：`((state: State) => any)) => Watcher`
- 说明：监听 Block 的状态变化，基于`@vue/reactivity`的`effect`方法实现的。具体使用方式见示例
- 示例：

  - 链式调用监听状态

    ```ts
    // 监听状态
    const unwatch = block
      .watchState((state) => state.count)
      .do((newCount, oldCount) => {
        console.log(newCount, oldCount);
      });

    // 取消监听
    unwatch();
    ```

  - watchEffect

    ```ts
    // 监听状态
    const watcher = block.watchState((state) => {
      console.log(state.count, state.user);
    });

    // 取消监听
    watcher.unwatch();
    ```

### listenEvents

- 类型：`(events: Partial<Events>) => (eventName?: string) => void`
- 说明：给 Block 添加事件监听，返回值是用来取消事件监听的函数
- 示例：
  - 监听事件：
    ```ts
    const cancelEvents = block.listenEvents({
      changeTheme: (themeColor) => {
        doChangeTheme(themeColor);
      },
      changeLanguage: (lang) => {
        doChangeLanguage(lang);
      },
    });
    ```
  - 批量取消监听事件：
    ```ts
    cancelEvents();
    ```
  - 取消监听单个事件
    ```ts
    cancelEvents("changeTheme");
    ```

### addMethods

- 类型：`(methods: Partial<Methods>) => (methodName?: string) => void`
- 说明：给 Block 添加方法，返回值是用来取消方法的函数
- 示例：
  - 添加方法：
    ```ts
    const cancelMethods = block.addMethods({
      logIn: async () => {
        await requestLogIn();
      },
      logOut: async () => {
        await requestLogOut();
      },
    });
    ```
  - 批量取消方法：
    ```ts
    cancelMethods();
    ```
  - 取消单个方法
    ```ts
    cancelMethods("logIn");
    ```

### export

- 类型：`(exports: Exports) => void`
- 说明：导出一个对象供其他Block使用
- 示例：
  ```ts
  block.export({
    text: 'hello rallie'
  })
  ```

### load

- 类型：`(name: string, ctx?: Context) => Promise<void>`
- 说明：加载 Block 的资源，接收两个参数，第一个参数是要加载的 Block 的名字，第二个参数是传递给资源加载[中间件](/guide/advance.html#中间件)的上下文

### activate

- 类型：`(name: string, data?: any, ctx?: Context) => Promise<void>`
- 说明：激活 Block，接收三个参数，第一个参数是要激活的 Block 的名字，第二个参数是传递给激活的 Block 的[生命周期](/guide/advance.html#生命周期)方法的参数，第三个参数是传递给资源加载[中间件](/guide/advance.html#中间件)的上下文

### destroy

- 类型：`(name: string, data?: any) => Promise<void>`
- 说明：销毁 Block，接收两个参数，第一个参数是要销毁的 Block 的名字，第二个参数是传递给销毁的 Block 的[生命周期](/guide/advance.html#生命周期)方法的参数

### run

- 类型：`(callback: (env: Env) => void | Promise<void>) => Promise<void>`
- 说明：执行传入的回调函数。可以在回调参数中获取当前 Block 的运行环境，详见[Env](#env)

### connect

- 类型：`<T extends BlockDeclare>(name: string) => ConnectedBlock<T['state'], T['events'], T['methods'], T['exports']>`
- 说明：连接 Block，接收要连接的 Block 的名字作为唯一参数，返回一个可以使用被连接 Block 的状态，事件，方法和导出对象的[ConnectedBlock](#connectedblock)。
- 示例：
  ```ts
  interface RemoteBlock {
    state: {
      count: number,
      user: {
        name: string
      }
    },
    events: {
      incrementCount: () => void
    },
    methods: {
      login: () => void,
      logout: () => void
    },
    exports: {
      text: string
    }
  }
  const connectedBlock = block.connect<RemoteBlock>("remote");
  ```

## ConnectedBlock

### state / events / methods

[connect](#connect)方法将返回一个`ConnectedBlock`。其状态，事件和方法相关的API是[CreatedBlock](#createdblock)的API的子集，包括

- [name](#name)
- [state](#state)
- [events](#events)
- [methods](#methods)
- [setState](#setstate)
  ::: tip
  如果连接的 Block 将状态声明为私有状态，那么通过`ConnectedBlock`调用`setState`更改 Block 的状态将报错
  :::
- [watchState](#watchstate)
- [listenEvents](#lisenevents)

以上属性和方法的使用方式与 CreatedBlock 的使用方式是完全一致的

### import

- 类型：`() => Exports`
- 说明：将连接的Block导出的对象进行导入
- 示例：

  导出对象
  ```ts
  const producer = createBlock('producer')
  producer.export({
    text: 'hello rallie'
  })
  ```
  导入对象
  ```ts
  const consumer = createBlock('consumer')
  const producer = consumer.connect('producer')
  const { text } = producer.import()
  console.log(text) // hello rallie
  ```

::: tip
对于一个 ConnectedBlock，要使用其状态，调用其方法，导入其暴露的对象，应该保证其状态已经被初始化，方法已经被添加，对象已经被导出。而 connect 操作并不会加载和激活要连接的 Block，因此你应该将要连接的 Block 声明为当前 Block 的[关联或依赖](/guide/advance.html#关联和依赖)，或者手动加载或激活要连接的 Block
:::

## registerBlock

- 类型：`(block: CreatedBlock) => RegisteredBlock`
- 说明：注册 Block 实例，只有注册过的 Block 才能被其他 Block[加载](#load)、[激活](#activate)和[卸载](#destroy)。该方法将返回一个[RegisteredBlock](#registerdblock)对象
- 示例：

  ```ts
  import { registerBlock, createBlock } from "@rallie/block";

  const app = createBlock("my-app");
  registerBlock(app)
    .relyOn(["lib:react"])
    .relateTo(["your-app"])
    .onBootstrap(() => {
      // do the bootstrap
    })
    .onDestroy(() => {
      // do the destroy
    });
  ```

## RegisteredBlock

通过调用`registerBlock`获得，用于声明注册的 Block 的[关联和依赖](/guide/advance.html#关联和依赖)，以及[生命周期](/guide/advance.html#生命周期)，支持链式调用

### relateTo

- 类型：`(Array<string | { name: string, ctx: Record<string, any> }>) => RegisteredBlock`
- 说明：声明当前 Block 关联的 Block，接收的参数是一个数组，包含要关联的 Block 列表，数组项可以是关联 Block 的名称字符串，也可以是一个对象，包含`name`属性（关联 Block 的名称）和`ctx`属性（传递给资源加载中间件的上下文）。多次调用`relateTo`方法会对原来的关联数组进行去重追加
- 示例：
  ```ts
  registerBlock(myBlock).relateTo([
    "lib:react",
    { name: "lib:react-dom", ctx: { version: "17.0.2" } },
  ]);
  ```

### relyOn

- 类型：`(Array<string | { name: string, data: any, ctx: Record<string, any> }>) => RegisteredBlock`
- 说明：声明当前 Block 依赖的 Block，接收的参数是一个数组，包含依赖的 Block 列表，数组项可以是依赖 Block 的名称字符串，也可以是一个对象，包含`name`属性（依赖 Block 的名称）、`data`属性（传递给依赖 Block 的生命周期激活参数）和`ctx`属性（传递给资源加载中间件的上下文）。多次调用`relyOn`方法会对原来的依赖数组进行去重追加
- 示例：
  ```ts
  registerBlock(myBlock).relyOn([
    "lib:react",
    {
      name: "layout-block",
      ctx: {
        version: "17.0.2",
        data: {
          lang: "en",
          theme: "dark",
        },
      },
    },
  ]);
  ```

### onBootstrap

- 类型：`(callback: (data: any) => void | Promise<void>) => RegisteredBlock`
- 说明：声明 bootstrap 阶段的回调，参考[生命周期](/guide/advance.html#生命周期)

### onActivate

- 类型：`(callbak: (data: any) => void | Promise<void>) => RegisteredBlock`
- 说明：声明 activate 阶段的回调，参考[生命周期](/guide/advance.html#生命周期)

### onDestroy

- 类型：`(callback: (data: any) => void | Promise<void>) => RegisteredBlock`
- 说明：声明 destroy 阶段的回调，参考[生命周期](/guide/advance.html#生命周期)

## Env

Block 的运行环境对象，可以在[run](#run)方法的回调中获得

### isEntry

- 类型：`boolean`
- 说明：是否是入口环境。如果一个 Block 是应用集群中第一个被创建的应用，则在执行 Block 的`run`方法时，其回调参数`env.isEntry`为`true`，否则为`false`

### freeze

- 类型：`() => void`
- 说明：冻结当前运行环境，只有当`env.isEntry`为`true`时，该方法才有效。当运行环境被冻结后，非入口环境的 Block 应用的中间件和配置将不生效

### unfreeze

- 类型：`() => void`
- 说明：解冻当前运行环境，只有当`env.isEntry`为`true`时，该方法才有效。

### use

- 类型：`(middleware: (ctx: Context, next: () => Promise<void>) => void) => void`
- 说明：应用资源加载中间件，使用方式参考[中间件](/guide/advance.html#中间件)，context 的类型为：
  ```ts
  interface Context {
    name: string; // 要加载的Block的名字
    conf: ConfType; // 运行环境的配置，参考env.conf
    loadScript: (
      script: Partial<HTMLScriptElement> | string | HTMLScriptElement
    ) => Promise<void>; // 插入script脚本的方法
    loadLink: (
      link: Partial<HTMLLinkElement> | string | HTMLLinkElement
    ) => Promise<void>; // 插入Link标签的方法
    [other: string]: any;
  }
  ```

### conf

- 类型：
  ```ts
  interface ConfType {
    assets?: Record<
      string,
      {
        js: Array<string>;
        css: Array<string>;
      }
    >;
    [other: string]: any;
  }
  ```
- 说明：运行环境的全局配置，可以通过`env.config`进行配置。其中`assets`属性是应用集群的资源路径信息，rallie 的洋葱圈中间件模型的最内层中间件会根据 Block 的名字在`assets`中查找应用资源并加载

### config

- 类型：`(conf: ConfType) => void`
- 说明：对运行环境进行配置。在配置`assets`时，配置的信息将会追加，而不会覆盖。
  ```ts
  env.config({
    assets: {
      bar: {
        js: ["bar.js"],
      },
    },
  });
  env.config({
    assets: {
      foo: {
        js: ["foo.js"],
      },
    },
  });
  console.log(env.conf.assets);
  /* 打印结果为：
    {
      bar: {
        js: ['bar.js']
      },
      foo: {
        js: ['foo.js']
      }
    }
  */
  ```
