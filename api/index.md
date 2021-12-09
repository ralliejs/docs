# API

## App
App可以直接通过`import { App } from 'rallie'`导入
### constructor
- 类型：`(name: string, options?: AppOptions) => void`
- 说明：App的构造函数, 直接通过`new`操作符创建App实例。接收两个参数，第一个参数是App的名称，必须全局唯一；第二个参数是App的初始化选项，包含两个选项`state`和`isPrivate`，分别表示状态的初始值和状态是否可以被[Connector](#connector)更改。使用typescript时，可以接收三个泛型参数，分别声明App的状态，事件和方法的类型
- 示例：
  ```ts
  import { App } from 'rallie'

  interface State {
    count: number,
    user: {
      name: string
    }
  }

  interface Events {
    incrementCount: () => void
  }

  interface Methods {
    login: () => void
    logout: () => void
  }

  const app = new App<State, Events, Methods>('my-app', {
    state: { 
      count: 0,
      user: {
        name: 'rallie'
      }
    }
  })
  ```
### name
- 类型：`string`
- 说明：App的名称

### state
- 类型：`State`
- 说明： App的状态，是只读的，要修改App的状态必须使用[setState](#setstate)方法

### methods
- 类型：`Methods`
- 说明：App的方法调用器，是只读的，要给App添加方法，必须使用[addMethods](#addmethods)方法
- 示例：
  ```ts
  // 添加方法
  app.addMethods({
    login: async () => {
      const success = await requestLogin()
      return success      
    }
  })

  // 调用方法
  app.methods.login().then((success) => {
    if (success) {
      alert('Login successfully')
    }
  })
  ```

### events
- 类型：`Events`
- 说明：App的事件调用器，是只读的，要给App添加事件监听，必须使用[listenEvents](#listenevents)方法
- 示例：
  ```ts
  // 监听事件
  app.listenEvents({
    themeChange: (themeColor) => {
      doChangeTheme(themeColor)
    }
  })

  // 触发事件
  app.events.themeChange('red')
  ```

### setState
- 类型：`((state: State) => void | Promise<void>) => Promise<void>`
- 说明：修改App的状态
- 示例：
  ```ts
    // 同步修改状态
    app.setState((state) => {
      state.count++
    })

    // 异步修改状态
    await app.setState(async (state) => {
        const userInfo = await requestLogIn()
        state.user = userInfo
    })
  ```
::: warning
后续版本中，可能会要求setState的回调方法中返回一个字符串用来描述本次操作
:::

### watchState
- 类型：`((state: State，isWatchingEffect?: boolean) => any)) => Watcher`
- 说明：监听App的状态变化，基于`@vue/reactivity`的effect实现的。具体使用方式见示例
- 示例：
  - 链式调用监听状态
    ```ts
    // 监听状态
    const unwatch = app.watchState(state => state.count).do((newCount, oldCount) => {
      console.log(newCount, oldCount)
    })

    // 取消监听
    unwatch()
    ```
  - watchEffect
    ```ts
    // 监听状态
    const watcher = app.watchState((state, isWatchingEffect) => {
      if (isWatchingEffect) {
        console.log(state.count, state.user)
      }
    })

    // 取消监听
    watcher.stopEffect()
    ```

### listenEvents
- 类型：`(events: Partial<Events>) => (eventName?: string) => void`
- 说明：给App添加事件监听，返回值是用来取消事件监听的函数
- 示例：
  - 监听事件：
    ```ts
    const cancelEvents = app.listenEvents({
      changeTheme: (themeColor) => {
        doChangeTheme(themeColor)
      },
      changeLanguage: (lang) => {
        doChangeLanguage(lang)
      }
    })
    ```
  - 批量取消监听事件：
    ```ts
    cancelEvents()
    ```
  - 取消监听单个事件
    ```ts
    cancelEvents('changeTheme')
    ```

### addMethods
- 类型：`(methods: Partial<Methods>) => (methodName?: string) => void`
- 说明：给App添加方法，返回值是用来取消方法的函数
- 示例：
  - 添加方法：
    ```ts
    const cancelMethods = app.addMethods({
      logIn: async () => {
        await requestLogIn()
      },
      logOut: async () => {
        await requestLogOut()
      }
    })
    ```
  - 批量取消方法：
    ```ts
    cancelMethods()
    ```
  - 取消单个方法
    ```ts
    cancelMethods('logIn')
    ```
### load
- 类型：`(name: string, ctx?: Context) => Promise<void>`
- 说明：加载App的资源，接收两个参数，第一个参数是要加载的App的名字，第二个参数是传递给资源加载[中间件](/guide/advance.html#中间件)的上下文

### activate
- 类型：`(name: string, data?: any, ctx?: Context) => Promise<void>`
- 说明：激活App，接收三个参数，第一个参数是要激活的App的名字，第二个参数是传递给激活的App的[生命周期](/guide/advance.html#生命周期)方法的参数，第三个参数是传递给资源加载[中间件](/guide/advance.html#中间件)的上下文

### destroy
- 类型：`(name: string, data?: any) => Promise<void>`
- 说明：销毁App，接收两个参数，第一个参数是要销毁的App的名字，第二个参数是传递给销毁的App的[生命周期](/guide/advance.html#生命周期)方法的参数


### connect
- 类型：`(name: string) => Connector`
- 说明：连接App，接收要连接的App的名字作为唯一参数，返回一个[Connector](#connector)对象用于使用被连接App的状态，事件和方法。使用connect方法时可以传入类似App构造函数的三个泛型参数，用来声明要连接的App的状态、事件和方法的类型
- 示例：
  ```ts
  interface State {
    lang: string
  }
  interface Events {
    changeLang: (lang: string) => void 
  }
  interface Methods {}
  const remoteApp = app.connect<State, Events, Methods>('remote')
  console.log(remoteApp.state.lang)
  remoteApp.events.changeLang('en')
  ```

### runInHostMode
- 类型：`(callback: (bus: Bus, setBusAccessible: (isAccessible: boolean) => void) => void | Promise<void>) => Promise<void>`
- 说明：在App的Host模式下运行逻辑。接收两个参数，一个是全局[Bus](#bus), 另一个是配置Bus可访问性的函数。当一个App是整个系统应用树中第一个被创建的App时，这个App将会以Host模式运行。Host模式下，可以通过[Bus](#bus)进行全局配置和添加中间件，并且可以通过setBusAccessible来让Remote模式下的App也能访问到Bus

### runInRemoteMode
- 类型：`(callback: (bus?: Bus) => void | Promise<void>) => Promise<void>`
- 说明：在App的Remote模式下运行逻辑。接收全局[Bus](#bus)作为唯一参数。当一个App不是整个系统应用树中第一个被创建的App时，这个App将会以Remote模式运行。Remote模式下的App默认不能访问全局Bus，即第一个参数默认是null，但是如果Host模式的App开放了全局Bus的可访问性，那么Remote模式的App也能通过runInRemoteMode获取全局Bus。关于Host模式和Remote模式的详细区别参考[运行模式](/guide/advance.html#运行模式)
- 示例：
  ```ts
  const firstApp = new App('first-app') // Host
  const secondApp = new App('second-app') // Remote
  ```
  - Host模式的App禁用Bus全局访问（默认）：
    ```ts
    firstApp.runInHostMode((bus) => {
      bus.use(someMiddleware)
      console.log('这段逻辑会被执行')
    })
    firstApp.runInRemoteMode(() => {
      console.log('这段逻辑不会被执行')
    })
    secondApp.runInHostMode(() => {
      console.log('这段逻辑不会被执行')
    })
    secondApp.runInRemoteMode((bus) => {
      console.log('这段逻辑会被执行，但是无法访问全局Bus')
      console.log(bus === null) // true
    })
    ```
    - Host模式的App开发Bus全局访问：
    ```ts
    firstApp.runInHostMode((bus, setBusAccessible) => {
      setBusAccessible(true)
      bus.use(someMiddleware)
      console.log('这段逻辑会被执行')
    })
    firstApp.runInRemoteMode(() => {
      console.log('这段逻辑不会被执行')
    })
    secondApp.runInHostMode(() => {
      console.log('这段逻辑不会被执行')
    })
    secondApp.runInRemoteMode((bus) => {
      console.log('这段逻辑会被执行，且可以访问全局Bus')
      console.log(bus === null) // false
      bus.use(someOtherMiddleware)
    })
    ```

## Connector
`Connector`是用来访问其他App的状态事件和方法的对象，可以通过[app.connect](#connect)方法获取。`Connector`的属性和方法是[App](#app)的子集，包括
- [name](#name)
- [state](#state)
- [events](#events)
- [methods](#methods)
- [setState](#setstate)
::: tip
如果连接的App声明了状态的可访问性`isPrivate`为`true`，那么通过Connector调用`setState`更改App的状态将报错
:::
- [watchState](#watchstate)
- [listenEvents](#lisenevents)

以上属性和方法的使用方式与App的使用方式是完全一致的
::: tip
connect操作并不会加载和激活要连接的App，因此，如果你要连接一个App并使用它的状态，应该保证在访问`Connector.state`之前，连接的App已经被加载并初始化了状态。你可以将要连接的App声明为当前App的[关联或依赖](/guide/advance.html#关联和依赖)，也可以手动加载或激活要连接的App
:::

## registerApp
registerApp方法可以直接通过`import { registerApp } from 'rallie'`导入
- 类型：`(app: App) => Registrant`
- 说明：注册App实例，只有注册过的App才能被其他App[加载](#load)、[激活](#activate)和[卸载](#destroy)。该方法将返回一个[Registrant](#registrant)对象
- 示例：
  ```ts
  import { registerApp, App } from 'rallie'

  const app = new App('my-app')
  registerApp(app)
    .relyOn(['lib:react'])
    .relateTo(['your-app'])
    .onBootstrap(() => {
      // do the bootstrap
    })
    .onDestroy(() => {
      // do the destroy
    })

  ```


## Registrant
通过调用`registerApp`获得，用于声明注册的App的[关联和依赖](/guide/advance.html#关联和依赖)，以及[生命周期](/guide/advance.html#生命周期)，支持链式调用
### relateTo
- 类型：`(Array<string | { name: string, ctx: Record<string, any> }>) => Registrant`
- 说明：声明当前App关联的App，接收的参数是一个数组，包含要关联的App列表，数组项可以是关联App的名称字符串，也可以是一个对象，包含`name`属性（关联App的名称）和`ctx`属性（传递给资源加载中间件的上下文）。多次调用`relateTo`方法会对原来的关联数组进行去重追加
- 示例：
  ```ts
  registerApp(app)
    .relateTo(['lib:react', { name: 'lib:react-dom', ctx: { version: '17.0.2' } }])
  ```

### relyOn
- 类型：`(Array<string | { name: string, data: any, ctx: Record<string, any> }>) => Registrant`
- 说明：声明当前App依赖的App，接收的参数是一个数组，包含依赖的App列表，数组项可以是依赖App的名称字符串，也可以是一个对象，包含`name`属性（依赖App的名称）、`data`属性（传递给依赖app的生命周期激活参数）和`ctx`属性（传递给资源加载中间件的上下文）。多次调用`relyOn`方法会对原来的依赖数组进行去重追加
- 示例：
  ```ts
  registerApp(app)
    .relyOn([
      'lib:react', 
      { 
        name: 'layout-app', 
        ctx: { 
          version: '17.0.2', 
          data: { 
            lang: 'en',
            theme: 'dark'
          } 
        } 
      }])
  ```

### onBootstrap
- 类型：`(callback: (data: any) => void | Promise<void>) => Registrant`
- 说明：声明bootstrap阶段的回调，参考[生命周期](/guide/advance.html#生命周期)

### onActivate
- 类型：`(callbak: (data: any) => void | Promise<void>) => Registrant`
- 说明：声明activate阶段的回调，参考[生命周期](/guide/advance.html#生命周期)

### onDestroy
- 类型：`(callback: (data: any) => void | Promise<void>) => Registrant`
- 说明：声明destroy阶段的回调，参考[生命周期](/guide/advance.html#生命周期)

## Bus
Bus是Rallie的核心底层对象，事实上，Rallie的一切状态，事件，方法通信，以及App的加载激活操作都是基于Bus来实现的。Bus对象只能在[runInHostMode](#runinhostmode)和[runInRemoteMode](#runinremotemode)的回调参数中获得, 支持链式调用。我们一般使用Bus的`use`方法和`config`方法

### use
- 类型：`(middleware: (ctx: Context, next: () => Promise<void>) => void) => Bus`
- 说明：应用资源加载中间件，使用方式参考[中间件](/guide/advance.html#中间件)，context的类型为：
  ```ts
  interface Context {
    name: string; // 要加载的app的名字
    conf: BusConfigOptions; // Bus全局配置，参考Bus.config
    loadScript: (script: Partial<HTMLScriptElement> | string | HTMLScriptElement) => Promise<void>; // 插入script脚本的方法
    loadLink: (link: Partial<HTMLLinkElement> | string | HTMLLinkElement) => Promise<void>; // 插入Link标签的方法
    fetchScript: (url: string) => Promise<void>; // 用fetch加载并返回script源码的方法
    excuteCode: (code: string) => void; // 用new Function执行代码的方法
  }
  ```

### config
- 类型：`(configOptions: BusConfigOptions) => Bus`
- 说明：对Bus进行配置，配置项包括
  ```ts
  interface BusConfigOptions {
    assets?: Record<string, {
      js: Array<string>,
      css: Array<string>
    }>;
    maxBootstrapTime: number;
    fetch: typeof window.fetch
  }
  ```
  - **assets**: app资源的静态配置，直接配置app的js资源路径和css资源路径。rallie的洋葱圈中间件模型的最内层中间件会根据app的名字在assets中查找应用资源并加载
  - **maxBootstrapTime**：激活app的最长等待时间，默认是10 * 1000ms。通常只有App的依赖关系中存在循环依赖时才会出现激活超时的情况，请谨慎配置
  - **fetch**：默认是null，如果配置了值，最里层中间件会通过配置的fetch函数加载assets中的js资源，而不是通过插入script标签的方式加载js资源
- 示例：
  ```ts
  app.runInHostMode((bus) => {
    bus.config({
      assets: {
        myApp: {
           js: ['https://cdn.jsdelivr.com/path/to/my-app.js'],
           css: ['https://cdn.jsdelivr.com/path/to/my-app.css']
        }
      },
      fetch: window.fetch,
      maxBootstrapTime: 1000
    })
  })
  // 查找assets声明后加载资源，通过window.fetch加载js，且如果1s内myApp没有被激活，则抛出错误
  app.activate('myApp')
  ```