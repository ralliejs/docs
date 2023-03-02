#  基础

下面你将学习关于 Rallie 的一切，阅读文档可能不能解答你的所有困惑，我们推荐你结合 Rallie 源码仓库中提供的[样例](https://github.com/ralliejs/rallie/tree/master/packages/playground)进行学习，虽然这是一个没有什么实用价值的 demo，但它囊括了 Rallie 的大多数功能

## 创建 Block

正如[介绍](/guide/introduction.html#介绍)中所述，Rallie 中的每个应用对外提供响应式状态，事件，方法以作为服务。我们把这样的应用称之为一个 Block，它可以通过下面的方式创建：

```ts
import { createBlock } from "@rallie/block";

interface Producer {
  state: {
    count: number,
  },
  events: {
    printCount: () => void,
  },
  methods: {
    addCount: () => void,
    uploadCount: () => Promise<void>,
  }
}

export const producer = createBlock<Producer>("producer");
```

创建 block 时，需要提供一个全局唯一的名字作为 block 的唯一标识，后续我们也是通过 block 名来与其他应用建立连接。同时，如果你使用 typescript 开发的话，我们可以通过使用泛型参数，在创建 block 时定义好状态，事件，方法的类型，为后面要使用的 API 提供更好的ts支持。

### 状态

#### 初始化状态

如果你的应用要对外提供响应式状态，那么你需要在创建 block 后初始化状态

```ts
producer.initState({
  count: 0
});
```

状态是一个[reactive](https://v3.vuejs.org/api/basic-reactivity.html#reactive)对象，因此不能将状态初始化为[原始数据类型](https://developer.mozilla.org/zh-CN/docs/Glossary/Primitive)

状态只有在被初始化之后才能被读取，修改和监听，因此，我们一般在创建完 block 后就立即调用 initState 方法初始化状态。

#### 读取状态

状态值可以直接通过 `block.state`属性读取

```ts
console.log(producer.state.count); // 0
```

#### 修改状态

要修改状态，必须通过 `block.setState`方法，在回调函数中修改，且在修改时，需要对本次操作进行适当说明。

```ts
producer.setState("add count", (state) => {
  state.count++; // 通过setState方法可以合法地修改状态
});

producer.state.count++; // 直接修改producer.state会抛出错误
```

:::tip
要求在 setState 时描述本次操作主要是为了督促开发者更规范，谨慎地修改状态，后续还会开发 devtools，修改状态的描述将会出现在 devtools 面板中
:::

#### 监听状态变更

我们可以使用 `block.watchState`监听状态的变更。它的使用方式比较灵活。 你可以在 `watchState`方法中返回要监听的状态，紧接着链式调用 `do`方法，指定监听回调

```ts
producer.setState("reset count", (state) => {
  state.count = 0
});

const unwatch = producer
  .watchState((state) => state.count)
  .do((newCount, oldCount) => {
    console.log(newCount, oldCount);
  });

producer.setState("modify the count", (state) => {
  state.count = 1;
});
// 打印 1, 0

unwatch(); // 取消监听
```

也可以直接在 `watchState`方法中指定监听回调，响应式系统会自动记录依赖并在状态变更时执行回调函数，效果类似 Vue 的[watchEffect](https://v3.vuejs.org/guide/reactivity-computed-watchers.html#watcheffect)方法

```ts
producer.setState("reset count", (state) => {
  state.count = 0
});

const watcher = producer
  .watchState((state) => { 
    console.log(state.count)
  })

producer.setState("modify the count", (state) => {
  state.count = 1;
});
// 打印 0, 1

watcher.unwatch(); // 取消监听
```

### 事件

我们可以通过 `block.listenEvents`监听事件, 而触发事件，则直接使用 `app.events[eventName]`即可

```ts
// 监听事件
const cancelEvents = producer.listenEvents({
  printCount() {
    console.log(producer.state.count);
  },
});
// 触发事件
producer.events.printCount();
// 取消监听
cancelEvents();
```

### 方法

方法的 API 和事件类似

```ts
// 添加方法
const removeMethods = producer.addMethods({
  async uploadCount() {
    await service.uploadCount(producer.state.count)
  },
});
// 调用方法
await producer.methods.uploadCount()
// 移除方法
cancelMethods();
```

:::tip
事件和方法的区别在于：

1. 同一个事件可以被监听多次，当事件触发时，每一个事件回调都会被执行；同一个方法只能被添加一次，重复添加重名方法会抛出异常
2. 事件回调没有返回值，方法则可以有返回值
   :::

## 加载 Block

假设我们已经将 producer 打包部署到 `https://localhost:8000/producer.js`。现在我们要开发一个新的应用，并且该应用能加载并使用 producer 提供的服务。

首先，我们创建一个名为 `consumer`的 block

```ts
import { createBlock } from "@rallie/block";
export const consumer = createBlock("consumer");
```

要让 consumer 知道 producer 被部署在哪里，我们可以通过下面这段代码进行声明

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

Rallie 没有所谓的的主应用或中心应用的概念，默认情况下每个 block 都可以调用 `run`方法，在回调函数中访问到应用集群的运行环境对象 `env`，并通过 `env`来配置整个应用集群的资源路径。

你可以在[进阶](/guide/advance.html)章节了解到更多关于[运行环境](/api/#bus)的用法

配置好资源路径后，我们就可以直接加载 `producer`

```ts
consumer.load("producer").then(() => {
  // do something
});
```

执行上面的代码将会往 `document`中插入 `<script src="https://localhost:8000/producer.js" />`, 这样的话创建和注册 `producer`的逻辑也就在 `consumer`提供的宿主环境中执行了

## 连接 Block

最后，我们要使用 `producer`提供的服务，还需要与它建立连接

```ts
interface Producer {
  state: {
    count: number,
  },
  events: {
    printCount: () => void,
  },
  methods: {
    addCount: () => void,
    uploadCount: () => Promise<void>,
  }
}
const connectedProducer = consumer.connect<Producer>("producer");
```

`connect`方法将返回一个 `ConnectedBlock`对象，然后我们就可以用这个 `ConnectedBlock`调用 `producer`提供的服务了

```ts
const connectedProducer = consumer.connect<Producer>("producer");
consumer.load("producer").then(() => {
  // 状态
  console.log(connectedProducer.state.count);
  connectedProducer
    .watchState((state) => state.count)
    .do((count) => {
      console.log(count);
    });
  connectedProducer.setState("modify count", (state) =>
    state.count = 0
  );
  // 事件
  connectedProducer.listenEvents({
    printCount() {
      console.warn("print by consumer", connectedProducer.state.count);
    },
  });
  connectedProducer.events.printCount();
  // 方法
  connectedProducer.methods.uploadCount();
});
```

你会发现`ConnectedBlock`的 API 和用 `createBlock`方法创建出的 `CreatedBlock`对象的 API 一模一样，不过需要额外注意的是：

1. `ConnectedBlock`没有`addMethods`方法，你只能调用连接的 block 提供的方法，而无法为其添加方法
2. 有的时候，为了保证状态安全，你不希望你创建的 block 的状态能直接被其他`ConnectedBlock`更改，此时你可以在初始化状态时给 `initState`方法传入第二个参数, 将状态权限设为私有

```ts
const producer = createBlock<Producer>("producer").initState({
  count: 0
}, true) // 私有状态

producer.addMethods({
  addCount: () => {
    producer.state.count++
  }
});
```

这样其他 Block 就只能通过你提供的方法修改状态，而无法使用 `ConnectedBlock.setState`直接修改状态

```ts
const consumer = createBlock("consumer");
const connectedProducer = consumer.connect("producer");

// 会抛出错误，因为producer的状态是私有的
connectedProducer.setState("add count", (state) => {
  state.count++;
});
// 能合法的修改状态
connectedProducer.methods.addCount()
```
