# Basics

Below, you will learn everything about Rallie. Reading the documentation may not answer all your questions, so we recommend studying in conjunction with the [examples](https://github.com/ralliejs/rallie/tree/master/packages/playground) provided in the Rallie source code repository. Although this is a demo with no practical value, it covers most of Rallie's features.

## Creating a Block

As stated in the [Introduction](/guide/introduction.html#introduction), each application in Rallie provides reactive state, events, and methods as services externally. Such an application is called a Block, and it can be created in the following way:

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

When creating a block, you need to provide a globally unique name as the unique identifier for the block. Subsequently, we also connect with other applications through the block name. At the same time, if you are developing with TypeScript, you can define the types of state, events, and methods through generic parameters when creating a block, providing better TypeScript support for the subsequent APIs to be used.

### State

#### Initialize State

If your application needs to provide reactive state externally, you need to initialize the state after creating the block.

```ts
producer.initState({
  count: 0
});
```

The state is a [reactive](https://v3.vuejs.org/api/basic-reactivity.html#reactive) object, so you cannot initialize the state with [primitive data types](https://developer.mozilla.org/zh-CN/docs/Glossary/Primitive).

The state can only be read, modified, and monitored after it is initialized, so we usually call the initState method to initialize the state immediately after creating the block.

#### Read State

State values can be directly read through the `block.state` property.

```ts
console.log(producer.state.count); // 0
```

#### Modify State

To modify the state, you must use the `block.setState` method, modify it in the callback function, and provide an appropriate description of this operation when modifying.

```ts
producer.setState("add count", (state) => {
  state.count++; // You can legally modify the state through the setState method
});

producer.state.count++; // Directly modifying producer.state will throw an error
```

:::tip
The requirement to describe the operation when setting the state is mainly to encourage developers to modify the state more standardized and cautiously. Subsequently, we will also develop devtools, and the description of modifying the state will appear in the devtools panel.
:::

#### Monitor State Changes

We can use `block.watchState` to monitor changes in state. Its usage is quite flexible. You can return the state to be monitored in the `watchState` method, and then call the `do` method in a chained manner to specify the monitoring callback.

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
// Prints 1, 0

unwatch(); // Stop monitoring
```

You can also directly specify the monitoring callback in the `watchState` method, and the reactive system will automatically record the dependencies and execute the callback function when the state changes, similar to Vue's [watchEffect](https://v3.vuejs.org/guide/reactivity-computed-watchers.html#watcheffect) method.

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
// Prints 0, 1

watcher.unwatch(); // Stop monitoring
```

### Events

We can monitor events through `block.listenEvents`, and to trigger events, simply use `app.events[eventName]`.

```ts
// Monitor events
const cancelEvents = producer.listenEvents({
  printCount() {
    console.log(producer.state.count);
  },
});
// Trigger event
producer.events.printCount();
// Stop monitoring
cancelEvents();
```

### Methods

The API for methods is similar to events.

```ts
// Add method
const removeMethods = producer.addMethods({
  async uploadCount() {
    await service.uploadCount(producer.state.count)
  },
});
// Call method
await producer.methods.uploadCount()
// Remove method
cancelMethods();
```

:::tip
The difference between events and methods is:

1. The same event can be monitored multiple times, and when the event is triggered, each event callback will be executed; the same method can only be added once, and adding a method with the same name again will throw an exception.
2. Event callbacks have no return value, but methods can have a return value.
:::

## Loading Block

Suppose we have packaged and deployed `producer` to `https://localhost:8000/producer.js`. Now we want to develop a new application that can load and use the services provided by `producer`.

First, we create a block called `consumer`.

```ts
import { createBlock } from "@rallie/block";
export const consumer = createBlock("consumer");
```

To let `consumer` know where `producer` is deployed, we can declare it with the following code:

```ts
consumer.run((env) => {
  env.config({
    assets: {
      producer: [
        { js: 'https://localhost:8000/producer.js' }
      ]
    }
  })
})
```

Rallie does not have the concept of a master or central application. By default, each block can call the `run` method, access the application cluster's running environment object `env` in the callback function, and configure the entire application cluster's resource path through `env`.

You can learn more about the usage of the [runtime environment](/api/#bus) in the [Advanced](/guide/advance.html) section.

After configuring the resource path, we can directly load `producer`.

```ts
consumer.load("producer").then(() => {
  // do something
});
```

Executing the above code will insert `<script src="https://localhost:8000/producer.js" />` into the `document`, so the logic for creating and registering `producer` is also executed in the host environment provided by `consumer`.

## Connecting Block

Finally, to use the services provided by `producer`, we also need to establish a connection with it.

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

The `connect` method will return a `ConnectedBlock` object, and then we can use this `ConnectedBlock` to call the services provided by `producer`.

```ts
const connectedProducer = consumer.connect<Producer>("producer");
consumer.load("producer").then(() => {
  // State
  console.log(connectedProducer.state.count);
  connectedProducer
    .watchState((state) => state.count)
    .do((count) => {
      console.log(count);
    });
  connectedProducer.setState("modify count", (state) =>
    state.count = 0
  );
  // Events
  connectedProducer.listenEvents({
    printCount() {
      console.warn("print by consumer", connectedProducer.state.count);
    },
  });
  connectedProducer.events.printCount();
  // Methods
  connectedProducer.methods.uploadCount();
});
```

You will find that the API of `ConnectedBlock` is exactly the same as the API of the `CreatedBlock` object created by the `createBlock` method. However, it should be noted that:

1. `ConnectedBlock` does not have the `addMethods` method. You can only call the methods provided by the connected block and cannot add methods for it.
2. Sometimes, to ensure state security, you may not want the state of the block you created to be directly modified by other `ConnectedBlock`. At this time, you can pass a second parameter to the `initState` method when initializing the state to set the state permissions to private.

```ts
const producer = createBlock<Producer>("producer").initState({
  count: 0
}, true) // Private state

producer.addMethods({
  addCount: () => {
    producer.state.count++
  }
});
```

In this way, other blocks can only modify the state through the methods you provide and cannot directly modify the state using `ConnectedBlock.setState`.

```ts
const consumer = createBlock("consumer");
const connectedProducer = consumer.connect("producer");

// Will throw an error because the state of producer is private

connectedProducer.setState("add count", (state) => {
  state.count++;
});
// Can legally modify the state
connectedProducer.methods.addCount()
```

In addition, in the method and event listening functions, you can obtain the name of the block that called the event or method through the `this` context.

```ts
producer.addMethods({
  addCount: (this: { trigger: string }) => {
    console.log(this.trigger)
    producer.state.count++
  }
})

connectedProducer.methods.addCount()
// Prints result 'consumer'
```

In many business scenarios, this feature is very useful.
