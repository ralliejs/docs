# 基础

下面你将学习关于 Rallie 的一切，阅读文档可能不能解答你的所有困惑，我们推荐你结合 Rallie 源码仓库中提供的[样例](https://github.com/ralliejs/rallie/tree/master/packages/playground)进行学习，虽然这是一个没有什么实用价值的 demo，但它囊括了 Rallie 的大多数功能

## 创建 Block

正如[介绍](/guide/introduction.html#介绍)中所述，Rallie 中的每个应用对外提供响应式状态，事件，方法以及基于方法封装的导出对象作为服务。我们把这样的应用称之为一个 Block，它可以通过下面的方式创建：

```ts
import { createBlock } from "rallie";

interface Producer {
  state: {
    user: string,
    items: string[],
  },
  events: {
    print: (text: string) => void,
  },
  methods: {
    syncMethod: () => string,
    asyncMethod: () => Promise<string>,
  },
  exports: {
    text: string
  }
}

export const producer = createBlock<Producer>("producer");
```

创建 block 时，需要提供一个全局唯一的名字作为 block 的唯一标识，后续我们也是通过 block 名来与其他应用建立连接。同时，我们可以提供状态，事件，方法以及导出对象的泛型参数，为后面要使用的 API 提供更好的 typescript 支持。

### 状态

#### 初始化状态

如果你的应用要对外提供响应式状态，那么你需要在创建 block 后初始化状态

```ts
producer.initState({
  user: "Tom",
  items: [],
});
```

状态是一个[reactive](https://v3.vuejs.org/api/basic-reactivity.html#reactive)对象，因此不能将状态初始化为[原始数据类型](https://developer.mozilla.org/zh-CN/docs/Glossary/Primitive)

状态只有在被初始化之后才能被读取，修改和监听，因此，我们一般在创建完 block 后就立即调用 initState 方法初始化状态。

#### 读取状态

状态值可以直接通过`block.state`属性读取

```ts
console.log(producer.state.items); // []
```

#### 修改状态

要修改状态，必须通过`block.setState`方法，在回调函数中修改，且在修改时，需要对本次操作进行适当说明。

```ts
producer.setState("add apple", (state) => {
  state.items.push("apple"); // 通过setState方法合法地修改状态
});

producer.state.items = []; // 直接修改producer.state会抛出错误
```

:::tip
要求在 setState 时描述本次操作主要是为了督促开发者更规范，谨慎地修改状态，后续还会开发 devtools，修改状态的描述将会出现在 devtools 面板中
:::

#### 监听状态变更

我们可以使用`block.watchState`监听状态的变更。它的使用方式比较灵活。 你可以在`watchState`方法中返回要监听的状态，紧接着链式调用`do`方法，指定监听回调

```ts {6-10,18}
producer.setState("clear the state", (state) => {
  state.items = [];
  state.user = null;
});

const unwatch = producer
  .watchState((state) => [state.items, state.user])
  .do(([newItems, newUser], [oldItems, oldUser]) => {
    console.log(newItems, newUser, oldItems, oldUser);
  });

producer.setState("modify the state", (state) => {
  state.items = ["apple", "banana"];
  state.user = "Mike";
});
// 打印 [], null, [apple, banana], Mike

unwatch(); // 取消监听
```

也可以直接在`watchState`方法中指定监听回调，响应式系统会自动记录依赖并在状态变更时执行回调函数，效果类似 Vue 的[watchEffect](https://v3.vuejs.org/guide/reactivity-computed-watchers.html#watcheffect)方法

```ts {6-8,16}
producer.setState("modify the state", (state) => {
  state.items = ["apple", "banana"];
  state.user = "Mike";
});

const watcher = producer.watchState((state) => {
  console.log(state.items, state.user);
});

producer.setState("modify the state again", (state) => {
  state.items.pop();
  state.user = "John";
});
// 分别打印 [apple, banana], Mike; [apple], John

watcher.unwatch(); // 取消监听
```

### 事件

我们可以通过`block.listenEvents`监听事件, 而触发事件，则直接使用`app.events[eventName]`即可

```ts
// 监听事件
const cancelEvents = producer.listenEvents({
  print(text) {
    console.log(text);
  },
});
// 触发事件
producer.events.print("hello");
// 取消监听
cancelEvents();
```

### 方法

方法的 API 和事件类似

```ts
// 添加方法
const cancelMethods = producer.addMethods({
  syncMethod() {
    return "sync";
  },
  async asyncMethod() {
    return "async";
  },
});
// 调用方法
console.log(producer.methods.syncMethod()); // 调用同步方法
producer.methods.asyncMethod().then((text) => consle.log(text)); // 调用异步方法
// 取消方法
cancelMethods();
```

:::tip
事件和方法的区别在于：

1. 同一个事件可以被监听多次，当事件触发时，每一个事件回调都会被执行；同一个方法只能被添加一次，重复添加重名方法会抛出异常
2. 事件回调没有返回值，方法则可以有返回值
:::

### 导出对象

我们也可以直接导出一个对象暴露给其他block使用

```ts
producer.export({
  text: 'hello rallie'
})
```

:::tip
export是基于addMethods封装的一个语法糖。需要注意的是，无论调用export方法多少次，最终导出的只会是第一次调用export传入的对象
:::

### 注册 Block

创建好 Block 并声明了状态，事件和方法后，我们还需要通过`registerBlock`方法进行注册，这样才能让其他 Block 使用我们提供的服务

```ts
import { registerBlock } from "rallie";
import { producer } from "./block";

registerBlock(producer);
```

调用`registerBlock`后，我们还可以紧接着声明 Block 的生命周期以及与其他 Block 的关联依赖关系，你将会在[进阶](/guide/advance.html)章节中了解更多。

## 加载 Block

假设我们已经将 producer 打包部署到`https://localhost:8000/producer.js`。现在我们要开发一个新的应用，并且该应用能加载并使用 producer 提供的服务。

首先，我们创建一个名为`consumer`的 block

```ts
import { createBlock } from "rallie";
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

Rallie 没有所谓的的主应用或中心应用的概念，默认情况下每个 block 都可以调用`run`方法，在回调函数中访问到应用集群的运行环境对象`env`，并通过`env`来配置整个应用集群的资源路径。

你可以在[进阶](/guide/advance.html)章节了解到更多关于[运行环境](/api/#bus)的用法

配置好资源路径后，我们就可以直接加载`producer`

```ts
consumer.load("producer").then(() => {
  // do something
});
```

执行上面的代码将会往`document`中插入`<script src="https://localhost:8000/producer.js" />`, 这样的话创建和注册`producer`的逻辑也就在`consumer`提供的宿主环境中执行了

## 连接 Block

最后，我们要使用`producer`提供的服务，还需要与它建立连接

```ts {17}
interface Producer {
  state: {
    user: string,
    items: string[],
  },
  events: {
    print: (text: string) => void,
  },
  methods: {
    syncMethod: () => string,
    asyncMethod: () => Promise<string>,
  },
  exports: {
    text: string
  }
}
export const producer = consumer.connect<Producer>("producer");
```

`connect`方法将返回一个`ConnectedBlock`对象，除了`ConnectedBlock.import`外，该对象的 API 是我们通过`createBlock`方法创建出的`CreatedBlock`对象的 API 的子集。具体可查看[ConnectedBlock API](/api/#connector)

然后我们就可以用这个`ConnectedBlock`调用`producer`提供的服务了

```ts
import { producer } from "./connected-block";

consumer.load("producer").then(() => {
  // 状态
  console.log(producer.state.items);
  producer
    .watchState((state) => state.user)
    .do((user) => {
      console.log(user);
    });
  producer.setState("push strawberry", (state) =>
    state.items.push("strawberry")
  );
  // 事件
  producer.listenEvents({
    print(text) {
      console.log("print in consumer", text);
    },
  });
  producer.events.print("hello rallie");
  // 方法
  producer.methods.asyncMethod().then((text) => {
    console.log(text);
  });
  // 导入对象
  const { text } = producer.import()
  console.log(text)
});
```

有的时候，为了保证状态安全，你不希望你创建的 block 的状态能直接被其他 ConnectedBlock 更改，此时你可以在初始化状态时给`initState`方法传入第二个参数, 将状态设为私有

```ts {23}
interface Producer {
  state: {
    user: {
      name: string,
      token: string,
    }
  },
  methods: {
    logIn: () => Promise<void>,
    logOut: () => Promise<void>,
  }
}

const producer = createBlock<Producer>("producer");

producer.initState(
  {
    user: {
      name: "",
      token: "",
    },
  },
  true
); // 私有状态

producer.addMethods({
  logIn: async () => {
    const user = await requestUserInfo();
    producer.setState("log in", (state) => {
      state.user = user;
    });
  },
  logOut: async () => {
    producer.setState("log out", (state) => {
      state.user = {
        name: "",
        token: "",
      };
    });
  },
});
```

这样其他 Block 就只能通过你提供的方法修改状态，而无法使用`ConnectedBlock.setState`直接修改状态

```ts
const consumer = createBlock("consumer");
const producer = consumer.connect("producer");

// 无法修改状态，因为producer的状态是私有的
producer.setState("login", (state) => {
  state.user.name = "Andy";
});

// 可以通过producer提供的方法修改状态
producer.methods.logIn();
```
