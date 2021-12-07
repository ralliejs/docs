# 基础
## 创建App
正如[介绍](/guide/introduction.html#介绍)中所述，Rallie中的每个应用对外提供响应式状态，事件和方法作为服务。而声明这些服务的就是`App`对象，在创建`App`时，你需要指定一个全局唯一的名字，后续也是通过App名来连接其他App并使用其提供的服务。
```ts
export const producer = new App('producer')
```

### 状态
#### 初始化状态
如果你的应用要对外提供响应式状态，那么你必须在创建App时给出状态的初始值。状态是一个[reactive](https://v3.vuejs.org/api/basic-reactivity.html#reactive)对象，因此也不能初始化为[原始数据类型](https://developer.mozilla.org/zh-CN/docs/Glossary/Primitive)
```ts
interface State {
  count: number,
  user: {
    name: string
  }
}
interface Events {}
interface Methods {}


export const producer = new App<State, Events, Methods>('producer', {
  state: {
    count: 0,
    user: {
      name: null
    }
  }
})
```
#### 读取状态
状态值可以直接通过`app.state`属性读取
```ts
console.log(producer.state.count) // 0
```
#### 修改状态
要修改状态，必须通过`app.setState`方法，在回掉函数中修改
```ts
producer.setState((state) => {
  state.count++ // count变为1
})

producer.state.count++ // 抛出错误
```
#### 监听状态变更
我们使用`app.watchState`监听状态变更，它的使用方式比较灵活。 你可以在`watchState`方法中返回要监听的状态，紧接着链式调用`do`方法，指定监听回调
```ts {6-10,18}
producer.setState((state) => {
  state.count = 1
  state.user.name = 'john'
})

const unwatch = producer
  .watchState(state => [state.count, state.user.name])
  .do(([newCount, newName], [oldCount, oldName]) => {
    console.log(newCount, newName, oldCount, oldName)
  })

producer.setState((state) => {
  state.count = 2
  state.user.name = 'mike'
})
// 打印 2, mike, 1, john

unwatch() // 取消监听
```
也可以直接在`watchState`方法中指定监听回调，响应式系统会自动记录依赖并在状态变更时执行回调函数，效果类似Vue的[watchEffect](https://v3.vuejs.org/guide/reactivity-computed-watchers.html#watcheffect)方法
```ts {6-10,18}
producer.setState((state) => {
  state.count = 1
  state.user.name = 'john'
})

const watcher = producer.watchState((state, isWatchingEffect) => {
  if (isWatchingEffect) {
    console.log(state.count, state.user.name)
  }
})

producer.setState((state) => {
  state.count = 2
  state.user.name = 'mike'
})
// 分别打印 1, john; 2, mike

watcher.stopEffect() // 取消监听
```
### 事件
在创建App时，可以提供事件泛型参数，为后续API提供良好的typescript提示。
```ts {7-9}
interface State {
  count: number,
  user: {
    name: string
  }
}
interface Events {
  print: (text: string) => void
}
interface Methods {}


export const producer = new App<State, Events, Methods>('producer', {
  state: {
    count: 0,
    user: {
      name: null
    }
  }
})
```
我们用`app.listenEvents`监听事件, 而触发事件，则直接使用`app.events[eventName]`即可
```ts
// 监听事件
const cancelEvents = producer.listenEvents({
  print(text) {
    console.log(text)
  }
})
// 触发事件
producer.events.print('hello')
// 取消监听
cancelEvents()
```

### 方法
方法的API和事件类似
```ts {11-14,17-24,26-27,29}
interface State {
  count: number,
  user: {
    name: string
  }
}
interface Events {
  print: (text: string) => void
}
// 声明类型
interface Methods {
  syncMethod: () => string
  asyncMethod: () => Promise<string>
}
const producer = new App<State, Events, Methods>('producer')
// 添加方法
const cancelMethods = producer.addMethods({
  syncMethod() {
    return 'sync'
  },
  async asyncMethod() {
    return 'async'
  }
})
// 调用方法
console.log(producer.methods.syncMethod()) // sync
producer.methods.asyncMethod().then(text => consle.log(text)) // async
// 取消方法
cancelMethods()
```

:::tip
事件和方法的区别在于：
1. 同一个事件可以被监听多次，当事件触发时，每一个事件回调都会被执行；同一个方法只能被添加一次，重复添加重名方法会抛出异常
2. 事件回调没有返回值，方法则可以有返回值
:::

### 注册
创建好App并声明了状态，事件和方法服务后，我们还需要通过`registerApp`注册App，这样才能让其他App使用我们提供的服务
```ts
import { registerApp } from 'rallie'
import { producer } from './app'

registerApp(producer)
```
调用`registerApp`后，我们还可以紧接着声明App的生命周期和与其他App的关联依赖关系，你将会在[进阶](/guide/advance.html)章节中了解更多。

## 加载App
假设我们已经将`producer`打包部署到`https://localhost:8000/producer.js`。现在我们要开发一个新的应用，并且该应用能加载并使用`producer`提供的服务。

首先，我们创建一个名为`consumer`的app
```ts
const consumer = new App('consumer')
```
要让`consumer`知道`producer`被部署在哪里，我们可以通过下面这段代码进行声明
```ts
consumer.runInHostMode((bus) => {
  bus.config({
    assets: {
      producer: [
        js: ['https://localhost:8000/producer.js']
      ]
    }
  })
})
```
Rallie的应用是去中心化的，也就是说并没有一个固定的基座应用，但是不同的应用要互相加载和通信，需要一个实质的中心来连接，这个中心就是所谓的`Bus`。每个应用都有`Host`和`Remote`两种运行模式，当我们在开发`consumer`的时候，`consumer`是入口应用，`producer`是被加载者，因此`consumer`将以`Host`模式运行，它将有权配置应用的管理中心——`Bus`。所以我们调用了`consumer.runInHostMode`方法，使得`consumer`在`Host`模式下，可以通过`bus`配置`producer`的静态资源路径。
<div align="center">
![producer](../images/producer-consumer.drawio.svg)
</div>
关于[Bus](/api/#bus)和运行模式，你可以在[运行模式](/guide/advance.html#运行模式)和[中间件](/guide/advance.html#中间件)章节中了解更多。

配置好资源路径后，我们就可以直接加载`producer`
```ts
consumer.load('producer').then(() => {
  // do something
})
```
执行上面的代码将会往`document`中插入`<script src="https://localhost:8000/producer.js" />`, 声明和注册`producer`的逻辑也就在`consumer`提供的宿主环境中执行了

## 连接App
最后，我们要使用`producer`提供的服务，还需要与它进行连接
```ts {14}
interface State {
  count: number,
  user: {
    name: string
  }
}
interface Events {
  print: (text: string) => void
}
interface Methods {
  syncMethod: () => string
  asyncMethod: () => Promise<string>
}
export const producer = consumer.connect<State, Events, Methods>('producer')
```
`connect`方法将返回一个`Connector`对象，这个对象的API是`App`的API的子集，具体可查看[Connector API](/api/#connector)

然后我们就可以用这个`Connector`调用`producer`提供的服务了
```ts
import { producer } from './connect-apps'
import { consumer } from './consumer'

consumer.load('producer').then(() => {
  // 状态
  console.log(producer.state.user)
  producer.watchState(state => state.count).do(count => {
    console.log(count)
  })
  producer.setState(state => state.count++)
  // 事件
  producer.listenEvents({
    print(text) {
      console.log('print in consumer', text)
    }
  })
  producer.events.print('hello rallie')
  // 方法
  producer.methods.asyncMethod().then(text => {
    console.log(text)
  })
})
```
