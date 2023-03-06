# API
## 基础类型
```ts
type State = Record<string, any>

type Events = Record<string, (...args: any[]) => void>

type Methods = Record<string, (...args: any[]) => any>

type BlockDeclare = Partial<{ 
  state:  State
  events: Events
  methods: Methods
}>
```

## createBlock

- 类型：`<T extends BlockDeclare>(name: string) => CreatedBlock<T['state'], T['events'], T['methods'], T['exports']>`
- 说明：创建一个 Block，接收全局唯一的 block 名作为参数，返回一个[CreatedBlock](#createBlock)实例。
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

- 类型：`(value: State, isPrivate: boolean = false) => CreatedBlock`
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
- 说明：给 Block 添加事件监听，返回值是用来取消事件监听的函数。从监听回调的`this`上下文中，可以获得事件调用方的block名
- 示例：
  - 监听事件：
    ```ts
    const cancelEvents = block.listenEvents({
      changeTheme(this: { trigger: string }, themeColor) {
        console.log(`事件调用方是${this.trigger}`)
        doChangeTheme(themeColor);
      },
      changeLanguage: (lang) => {
        doChangeLanguage(lang);
      },
    });
    ```
  - 取消监听所有事件：
    ```ts
    cancelEvents();
    ```
  - 取消监听单个事件
    ```ts
    cancelEvents("changeTheme");
    ```

### addMethods

- 类型：`(methods: Partial<Methods>) => (methodName?: string) => void`
- 说明：给 Block 添加方法，返回值是用来移除方法的函数。从方法回调的`this`上下文中，可以获得事件调用方的block名
- 示例：
  - 添加方法：
    ```ts
    const removeMethods = block.addMethods({
      async logIn(this: { trigger: string }) => {
        console.log(`事件调用方是${this.trigger}`)
        await requestLogIn();
      },
      logOut: async () => {
        await requestLogOut();
      },
    });
    ```
  - 移除所有方法：
    ```ts
    removeMethods();
    ```
  - 移除单个方法
    ```ts
    removeMethods("logIn");
    ```

### load

- 类型：`(name: string) => Promise<void>`
- 说明：加载 Block 的资源，参数是要加载的 Block 的名字

### activate

- 类型：`(name: string) => Promise<void>`
- 说明：激活 Block，参数是要激活的 Block 的名字

### connect

- 类型：`<T extends BlockDeclare>(name: string) => ConnectedBlock<T>`
- 说明：连接 Block，接收要连接的 Block 的名字作为唯一参数，返回一个可以使用被连接 Block 的状态，事件，方法的[ConnectedBlock](#connectedblock)。
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

[connect](#connect)方法将返回一个`ConnectedBlock`。其状态，事件和方法相关的API是[CreatedBlock](#createblock)的API的子集，包括[name](#name)，[state](#state)，[events](#events)，[methods](#methods)，[setState](#setstate)，[watchState](#watchstate) 和 [listenEvents](#lisenevents)

::: tip
如果连接的 Block 将状态声明为私有状态，那么通过`ConnectedBlock`调用`setState`更改 Block 的状态将报错
:::



以上属性和方法的使用方式与 CreatedBlock 的使用方式是完全一致的

::: tip
对于一个 ConnectedBlock，要使用其状态，调用其方法，导入其暴露的对象，应该保证其状态已经被初始化，方法已经被添加，对象已经被导出。而 connect 操作并不会加载和激活要连接的 Block，因此你应该将要连接的 Block 声明为当前 Block 的[关联或依赖](/guide/advance.html#关联和依赖)，或者手动加载或激活要连接的 Block
:::

### run

- 类型：`(callback: (env: Env) => void | Promise<void>) => Promise<void>`
- 说明：执行传入的回调函数。可以在回调参数中获取当前 Block 的运行环境，详见[Env](#env)

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
    [other: string]: any; // 中间件可以给context添加方法和属性
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
