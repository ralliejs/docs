# 基础
下面你将学习关于Rallie的一切，阅读文档可能不能解答你的所有困惑，我们推荐你结合Rallie源码仓库中提供的[样例](https://github.com/ralliejs/rallie/tree/master/packages/playground)进行学习，虽然这是一个没有什么实用价值的demo，但它囊括了Rallie的大多数功能
## 创建App
正如[介绍](/guide/introduction.html#介绍)中所述，Rallie中的每个应用对外提供响应式状态，事件和方法作为服务。而声明这些服务的就是App对象，在创建App时，你需要指定一个全局唯一的名字，后续也是根据App名来连接其他App，并使用其提供的服务。
```ts
export const producer = new App('producer')
```

### 状态
#### 初始化状态
如果你的应用要对外提供响应式状态，那么你必须在创建App时给出状态的初始值。状态是一个[reactive](https://v3.vuejs.org/api/basic-reactivity.html#reactive)对象，因此也不能初始化为[原始数据类型](https://developer.mozilla.org/zh-CN/docs/Glossary/Primitive)
```ts
interface State {
  items: string[],
  user: string
}
interface Events {}
interface Methods {}


export const producer = new App<State, Events, Methods>('producer', {
  state: {
    items: [],
    user: null
  }
})
```
#### 读取状态
状态值可以直接通过`app.state`属性读取
```ts
console.log(producer.state.items) // []
```
#### 修改状态
要修改状态，必须通过`app.setState`方法，在回调函数中修改，且在修改时，需要对本次操作进行适当说明。
```ts
producer.setState('add apple', (state) => {
  state.items.push('apple') // 状态能正常变更
})

producer.state.items = [] // 抛出错误
```

:::tip
要求在setState时描述本次操作主要是为了督促开发者更规范，谨慎地修改状态，后续还会开发devtools，修改状态的描述将会出现在devtools面板中
:::
#### 监听状态变更
我们使用`app.watchState`监听状态变更，它的使用方式比较灵活。 你可以在`watchState`方法中返回要监听的状态，紧接着链式调用`do`方法，指定监听回调
```ts {6-10,18}
producer.setState('clear the state', (state) => {
  state.items = []
  state.user = null
})

const unwatch = producer
  .watchState(state => [state.items, state.user])
  .do(([newItems, newUser], [oldItems, oldUser]) => {
    console.log(newItems, newUser, oldItems, oldUser)
  })

producer.setState('modify the state', (state) => {
  state.items = ['apple', 'banana']
  state.user = 'mike'
})
// 打印 [], null, [apple, banana], mike

unwatch() // 取消监听
```
也可以直接在`watchState`方法中指定监听回调，响应式系统会自动记录依赖并在状态变更时执行回调函数，效果类似Vue的[watchEffect](https://v3.vuejs.org/guide/reactivity-computed-watchers.html#watcheffect)方法
```ts {6-10,18}
producer.setState('modify the state', (state) => {
  state.items = ['apple', 'banana']
  state.user = 'mike'
})

const watcher = producer.watchState((state) => {
  console.log(state.items, state.user)
})

producer.setState('modify the state again', (state) => {
  state.items.pop()
  state.user = 'john'
})
// 分别打印 [apple, banana], mike; [apple], john

watcher.unwatch() // 取消监听
```
### 事件
在创建App时，可以提供事件泛型参数，为后续API提供良好的typescript提示。
```ts {5-7}
interface State {
  items: string[],
  user: string
}
interface Events {
  print: (text: string) => void
}
interface Methods {}


export const producer = new App<State, Events, Methods>('producer', {
  state: {
    items: [],
    user: null
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
```ts {9-12,20-27,26-27,29-30,32}
interface State {
  items: string[],
  user: string
}
interface Events {
  print: (text: string) => void
}
// 声明类型
interface Methods {
  syncMethod: () => string
  asyncMethod: () => Promise<string>
}
const producer = new App<State, Events, Methods>('producer', {
  state: {
    items: [],
    user: null
  }
})
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
假设我们已经将producer打包部署到`https://localhost:8000/producer.js`。现在我们要开发一个新的应用，并且该应用能加载并使用producer提供的服务。

首先，我们创建一个名为`consumer`的app
```ts
const consumer = new App('consumer')
```
要让consumer知道producer被部署在哪里，我们可以通过下面这段代码进行声明
```ts
consumer.run((env) => {
  env.config({
    assets: {
      producer: [
        js: ['https://localhost:8000/producer.js']
      ]
    }
  })
})
```
`consumer.run`方法会立即执行我们传入的函数，这个函数的参数是当前app的运行环境。我们通过运行环境对象来配置要加载的应用的资源路径。关于app的运行环境，你将在[进阶](/guide/advance.html)章节中了解更多。

配置好资源路径后，我们就可以直接加载`producer`
```ts
consumer.load('producer').then(() => {
  // do something
})
```
执行上面的代码将会往`document`中插入`<script src="https://localhost:8000/producer.js" />`, 然后我们之前编写的创建和注册`producer`的逻辑也就在`consumer`提供的宿主环境中执行了

## 连接App
最后，我们要使用`producer`提供的服务，还需要与它进行连接
```ts {12}
interface State {
  items: string[],
  user: string
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
consumer.load('producer').then(() => {
  // 状态
  console.log(producer.state.items)
  producer.watchState(state => state.user).do(user => {
    console.log(user)
  })
  producer.setState('push strawberry', state => state.items.push('strawberry'))
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

有的时候，为了保证状态安全，你不希望你的App的状态能直接被其他Connector更改，此时你可以在创建App时将状态初始化为private
```ts {19}
interface State {
  user: {
    name: string,
    token: string
  }
}

interface Methods {
  logIn: () => Promise<void>
  logOut: () => Promise<void>
}
const producer = new App<State>('producer', {
  state: {
    user: {
      name: '',
      token: ''
    }
  },
  isPrivate: true
})

producer.addMethods({
  logIn: async () => {
    const user = await requestUserInfo()
    producer.setState('log in', state => {
      state.user = user
    })
  },
  logOut: async () => {
    producer.setState('log out', state => {
      state.user = {
        name: '',
        token: ''
      }
    })
  }
})
```
这样其他App就只能通过你提供的方法修改状态，而无法使用`Connector.setState`直接修改状态
