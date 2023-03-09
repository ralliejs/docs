# 生态

## React

Rallie 官方维护`@rallie/react`，提供了几个常用的 Hook 帮助你更好地使用应用提供的服务。你可以安装`@rallie/react`来使用它们

```shell
npm install @rallie/react
```

### useBlockState

该 hook 的第一个参数是一个`CreatedBlock`或`ConnectedBlock`实例，第二个参数是指定 Block 状态的回调，最终该 hook 会返回与指定的 Block 状态同步的 React 状态

```tsx
import { createBlock } from "@rallie/block";
import { useBlockState } from "@rallie/react";

interface Comsumer {
  state: {
    count: number
  }
}

interface Producer {
  state: {
    theme: string
  }
}

const consumer = createBlock<Consumer>("consumer").initState({
  count: 0,
});
consumer
const producer = consumer.connect<Producer>("producer");

export const Demo = () => {
  const count = useBlockState(consumer, (state) => state.count);
  const theme = useBlockState(producer, (state) => state.theme);
  const addCount = () =>
    consumer.setState("add count", (state) => state.count++);
  return (
    <div style={{ color: theme }}>
      <button onClick={addCount}>count: {count}</button>
    </div>
  );
};
```

同时你可以指定第三个参数——一个依赖数组，useBlockState 将在依赖变化时重新监听 Rallie 状态

### useBlockEvents

该 hook 将在组件挂载时监听事件，在组件卸载时取消监听

```tsx
import { createBlock } from "@rallie/block";
import { useBlockEvents } from "@rallie/react";

interface Producer {
  events: {
    print: () => void
  }
}

const producer = createBlock<Producer>("producer");

export const Demo = () => {
  useBlockEvents(producer, {
    print: () => console.log("Hello Rallie"),
  });
  const onEmitPrint = () => producer.events.print();
  return (
    <div>
      <button onClick={onEmitPrint}>print</button>
    </div>
  );
};
```

同时你可以指定第三个参数——一个依赖数组，useBlockEvents 将在依赖变化时重新监听事件

### useBlockMethods

该 hook 将在组件挂载时添加方法，在组件卸载时取消方法

```tsx
import { useRef } from "react";
import { createBlock } from "@rallie/block";
import { useBlockMethods } from "@rallie/react";

interface Producer {
  methods: {
    getInputRef: () => HTMLElement
  }
}

const producer = createBlock<Producer>('producer');

export const Demo = () => {
  const inputRef = useRef(null);
  useBlockMethods(producer, {
    getInputRef: () => inputRef.current,
  });
  const focusInputInput = () => {
    const el = producer.methods.getInputRef();
    if (el) {
      el.focus();
    }
  };
  return (
    <div>
      <input ref={inputRef} />
      <button onClick={focusInputInput}>focus</button>
    </div>
  );
};
```

同时你可以指定第三个参数——一个依赖数组，useBlockMethods 将在依赖变化时重新添加方法

## Vue3

Rallie 官方维护`@rallie/vue`，同时包含了对 Vue3 和对 Vue2 的支持，你可以安装`@rallie/vue`来使用

```sh
npm install @rallie/vue
```

针对 Vue3 应用，Rallie 提供了几个 CompositionAPI，除了不需要指定依赖数组之外，命名和使用方法都与`@rallie/react`的 api 相同

### useBlockState

```vue
<script setup lang="ts">
import { createBlock } from "@rallie/block";
import { useBlockState } from "@rallie/vue";

interface Comsumer {
  state: {
    count: number
  }
}

interface Producer {
  state: {
    theme: string
  }
}

const consumer = createBlock<Consumer>("consumer");
consumer.initState({
  count: 0,
});
const producer = consumer.connect<Producer>("producer");

const theme = useBlockState(producer, (state) => state.theme);
const count = useBlockState(consumer, (state) => state.count);
const addCount = () =>
  consumer.setState("add count", (state) => state.count++);
</script>

<template>
  <div :style="{ color: theme }">
    <button @click="addCount">count: {{ count }}</button>
  </div>
</template>
```

### useBlockEvents

```vue
<script setup lang="ts">
import { createBlock } from "@rallie/block";
import { useBlockEvents } from "@rallie/vue";

interface Producer {
  events: {
    print: () => voi
  }
}

const producer = createBlock<Producer>("producer");

useBlockEvents(producer, {
  print: () => console.log("Hello Rallie"),
});
</script>

<template>
  <div>
    <button @click="producer.events.print()">print</button>
  </div>
</template>
```

### useBlockMethods

```vue
<script setup lang="ts">
import { ref } from "vue";
import { createBlock } from "@rallie/block";
import { useBlockMethods } from "@rallie/vue";

interface Producer {
  methods: {
    getRef: () => HTMLElement
  }
}

const producer = createBlock<Producer>("producer");

const inputRef = ref(null);
useBlockMethods(producer, {
  getInputRef: () => inputRef.value,
});
const focusInput = () => {
  const el = producer.methods.getInputRef();
  if (el) {
    el.focus();
  }
};
</script>

<template>
  <div>
    <input ref="inputRef" />
    <button @click="focusInput">focus</button>
  </div>
</template>
```

## Vue2

对于 Vue2 的应用，`@rallie/vue`提供了几个 mixin 支持，你可以从`@rallie/vue/mixins`中导入它们

```ts
import {
  mixinBlockState,
  mixinBlockEvents,
  mixinBlockMethods,
} from "@rallie/vue/mixin";
```

### mixinBlockState

该方法接收两个参数，第一个参数是一个`CreatedBlock`或`ConnectedBlock`实例，第二个参数是一个将 Block 的状态映射为组件的计算属性的函数。你可以像这样使用它

```vue
<template>
  <button @click="addCount">count: {{ count }}</button>
</template>

<script>
import { mixinBlockState } from "@rallie/vue/dist/mixin";
import { createBlock } from "@rallie/block";

const producer = createBlock("producer");
producer.initState({
  count: 0,
});

export default {
  mixins: [
    mixinBlockState(app, (state) => ({
      count: state.count,
    })),
  ],
  methods: {
    addCount() {
      producer.setState("add count", (state) => state.count++);
    },
  },
};
</script>
```

### mixinBlockEvents

该方法的第一个参数是一个`CreatedBlock`或`ConnectedBlock`实例，第二个参数是要监听的事件回调集合。组件将在挂载时监听事件，在卸载时取消监听

```vue
<template>
  <button @click="print">print</button>
</template>

<script>
import { createBlock } from "@rallie/block";
import { mixinBlockEvents } from "@rallie/vue/dist/mixin";

const producer = createBlock("producer");
export default {
  mixins: [
    mixinBlockEvents(producer, {
      print() {
        console.log(this.text); // 可以在回调函数中通过this访问组件实例
      },
    }),
  ],
  data() {
    return {
      text: "Hello Rallie",
    };
  },
};
</script>
```

### mixinBlockMethods

`mixinBlockMethods`和`mixinBlockEvents`使用方法相同。组件将在挂载时添加方法，在卸载时移除方法

```vue
<template>
  <div>
    <input ref="input" @click="focuseInput"></input>
    <button @click="focusInput">focus</button>
  </div>
</template>

<script>
import { createBlock } from "@rallie/block";
import { mixinBlockMethods } from '@rallie/vue/dist/mixin'

const producer = createBlock('producer')
export default {
  mixins: [
    mixinBlockMethods(producer, {
      getInputRef () {
        return this.$refs.input
      }
    })
  ],

  methods: {
    focusInput() {
      producer.methods.getInputRef()?.focus()
    }
  }
}
</script>
```

:::warning
`mixinBlockEvents`和`mixinBlockMethods`的回调函数中的`this`是所在组件的Vue实例，无法直接通过`this.trigger`获得事件或方法调用方的block名。如果要使用这一特性，你可以在组件生命周期方法中手动监听事件或添加方法
:::

## load-html 中间件

Rallie 官方维护`@rallie/load-html`，这是一个中间件，你可以安装`@rallie/load-html`来使用它

```sh
npm install @rallie/load-html
```

它的作用是让你可以直接给应用配置 html 路径，中间件将通过`fetch`加载并解析 html，然后将`link`、`style`和`script`标签插入到文档中

```ts
import { loadHtml } from "@rallie/load-html";

block.run((env) => {
  env.use(
    loadHtml({
      entries: {
        producer: "http://localhost:3000/producer.html",
        consumer: "http://localhost:3000/consumer.html",
      },
    })
  );
});
```

你也可以不配置`entries`，而是在后续中间件中使用`ctx.loadHtml`方法来加载和解析 html

```ts
env.use(loadHtml());
env.use(async (ctx, next) => {
  await ctx.loadHtml(`http://localhost:3000/${ctx.name}.html`);
});
```

如果在 html 路径中带上 hash，则中间件还会以该 hash 值作为 id，将 html 中对应 id 的元素插入到文档中。

```ts
env.use(
  loadHtml({
    entries: {
      producer: "http://localhost:3000/producer.html#root",
    },
  })
);
```

比如上面这个例子，如果宿主 html 中预留了 id 为`root`的元素，则激活`producer`时，中间件会将该预留元素的`innerHTML`的内容替换为`http://localhost:3000/producer.html`解析出的 id 为`root`的元素内容。如果没有提前预留好这个元素，则中间件会直接将加载的 html 中解析出的 id 为`root`的元素插入到`body`中

除了`entries`，该中间件还支持以下几个可选的配置参数

- `fetch`：这是用来加载 html 的函数，你可以传入自定义的 fetch 函数来应对需要添加特殊请求头的情况，如果不传，则默认是`window.fetch`；
- `regardHtmlPathAsRoot`：这是一个布尔值，默认是`false`，如果置为`true`，则中间件在转换 html 中的资源的路径时，会将`html`的路径视作根路径。

举个例子：

```ts
env.use(
  loadHtml({
    regardHtmlPathAsRoot: true,
    entries: {
      producer: "https://cdn.jsdelivr.net/npm/@rallie/demo/dist/index.html",
    },
  })
);
```

如果配置了`regardHtmlPathAsRoot`为`true`，则中间在解析`https://cdn.jsdelivr.net/npm/@rallie/demo/dist/index.html`时，会将文档中的

```html
<script src="/assets/chunk.js"></script>
```

替换为

```html
<script src="https://cdn.jsdelivr.net/npm/@rallie/demo/dist/assets/chunk.js"></script>
```

而如果`regardHtmlPathAsRoot`为`false`，则中间件会将文档中的

```html
<script src="/assets/chunk.js"></script>
```

替换为

```html
<script src="https://cdn.jsdelivr.net/assets/chunk.js"></script>
```

这个配置项对于将 html 上传到公共 cdn 上的场景非常有用

- `filter`：这是用来过滤html中的元素的方法。该方法接收一个`HTMLScriptElement ｜ HTMLLinkElement ｜ HTMLStyleElement`实例作为参数，返回一个布尔值，如果返回`true`，则该元素会被保留，否则会被移除。

比如你可以通过这个配置项，只保留Html中的script标签

```ts
env.use(loadHtml({
  filter: (el) => el.tagName === 'SCRIPT'
}))
```
