# Ecosystem

## React

Rallie officially maintains `@rallie/react`, offering several commonly used Hooks to help you better utilize the services provided by applications. You can install `@rallie/react` to use them.

```shell
npm install @rallie/react
```

### useBlockState

The first argument of this hook is a `CreatedBlock` or `ConnectedBlock` instance, and the second argument is a callback specifying the Block state. Ultimately, the hook returns the React state synchronized with the specified Block state.

```tsx
import { createBlock } from "@rallie/block";
import { useBlockState } from "@rallie/react";

interface Consumer {
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

You can also specify a third parameter — a dependency array. `useBlockState` will re-listen to Rallie state when the dependencies change.

### useBlockEvents

This hook listens to events when the component mounts and cancels the event listening when the component unmounts.

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

You can also specify a third parameter — a dependency array. `useBlockEvents` will re-listen to events when the dependencies change.

### useBlockMethods

This hook adds methods when the component mounts and removes methods when the component unmounts.

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
  const focusInput = () => {
    const el = producer.methods.getInputRef();
    if (el) {
      el.focus();
    }
  };
  return (
    <div>
      <input ref={inputRef} />
      <button onClick={focusInput}>focus</button>
    </div>
  );
};
```

You can also specify a third parameter — a dependency array. `useBlockMethods` will re-add methods when the dependencies change.


## Vue 3

Rallie officially maintains the `@rallie/vue` package, which supports both Vue 3 and Vue 2. You can install `@rallie/vue` to take advantage of its features.

```sh
npm install @rallie/vue
```

For Vue 3 applications, Rallie provides several Composition API functions. Except for not needing to specify a dependency array, the naming and usage methods are the same as the APIs in `@rallie/react`.

### useBlockState

The `useBlockState` hook in Vue 3 is used to synchronize a piece of state from a `CreatedBlock` or `ConnectedBlock` instance with the component's reactive state.

```vue
<script setup lang="ts">
import { createBlock } from "@rallie/block";
import { useBlockState } from "@rallie/vue";

interface Consumer {
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

The `useBlockEvents` hook in Vue 3 is used to listen to events from a block. It sets up the event listeners when the component is mounted and cleans them up when the component is unmounted.

```vue
<script setup lang="ts">
import { createBlock } from "@rallie/block";
import { useBlockEvents } from "@rallie/vue";

interface Producer {
  events: {
    print: () => void
  }
}

const producer = createBlock<Producer>("producer");

useBlockEvents(producer, {
  print: () => console.log("Hello Rallie"),
});
</script>

<template>
  <div>
    <button @click="() => producer.events.print()">print</button>
  </div>
</template>
```

### useBlockMethods

The `useBlockMethods` hook in Vue 3 is used to add methods to a block. It attaches the methods when the component is mounted and removes them when the component is unmounted.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { createBlock } from "@rallie/block";
import { useBlockMethods } from "@rallie/vue";

interface Producer {
  methods: {
    getInputRef: () => HTMLElement
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

In Vue 3, the `<script setup>` syntax is used for a more concise and performant way to author Composition API functions. The examples above demonstrate how to integrate Rallie's functionality within the Vue 3 Composition API, allowing for reactive state synchronization, event handling, and method binding within the context of a Vue component.


## Vue 2

For Vue 2 applications, `@rallie/vue` offers several mixins for support, which you can import from `@rallie/vue/mixins`.

```ts
import { mixinBlockState, mixinBlockEvents, mixinBlockMethods } from "@rallie/vue/mixin";
```

### mixinBlockState

This method takes two parameters. The first is an instance of `CreatedBlock` or `ConnectedBlock`, and the second is a function that maps the Block's state to the component's computed properties. Here's how to use it:

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
    mixinBlockState(producer, (state) => ({
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

The first parameter of this method is an instance of `CreatedBlock` or `ConnectedBlock`, and the second is a collection of event callback functions to listen to. The component will listen to the events when mounted and cancel them when unmounted.

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
        console.log(this.text); // You can access the component instance via `this` in the callback function
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

`mixinBlockMethods` is used in the same way as `mixinBlockEvents`. The component will add methods when mounted and remove them when unmounted.

```vue
<template>
  <div>
    <input ref="input" @click="focuseInput"/>
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
The `this` inside the callback functions of `mixinBlockEvents` and `mixinBlockMethods` refers to the Vue instance of the component, not the block instance. You cannot directly access the block name that triggered the event or method using `this.trigger`. If you need this functionality, you can manually listen to events or add methods in the component's lifecycle methods.
:::

## load-html Middleware

Rallie officially maintains `@rallie/load-html`, a middleware you can install and use with:

```sh
npm install @rallie/load-html
```

This middleware allows you to configure the HTML path for an application directly. It loads and parses the HTML via `fetch` and then inserts `link`, `style`, and `script` tags into the document.

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

You can also skip the `entries` configuration and use the `ctx.loadHtml` method in subsequent middleware to load and parse HTML.

```ts
env.use(loadHtml());
env.use(async (ctx, next) => {
  await ctx.loadHtml(`http://localhost:3000/${ctx.name}.html`);
});
```

If a hash is included in the HTML path, the middleware will also use that hash value as an id to insert the corresponding element from the HTML into the document.

```ts
env.use(
  loadHtml({
    entries: {
      producer: "http://localhost:3000/producer.html#root",
    },
  })
);
```

For example, if the host HTML reserves an element with the id `root`, when activating `producer`, the middleware will replace the `innerHTML` of the reserved element with the content of the element with id `root` parsed from `http://localhost:3000/producer.html`. If no element is reserved in advance, the middleware will directly insert the element with id `root` parsed from the loaded HTML into the `body`.

In addition to `entries`, this middleware also supports the following optional configuration parameters:

- `fetch`: This is the function used to load the HTML. You can provide a custom fetch function to handle situations where special request headers are needed. If not provided, the default is `window.fetch`.
- `regardHtmlPathAsRoot`: This is a boolean value, defaulting to `false`. If set to `true`, the middleware will consider the `html` path as the root path when converting the paths of resources in the HTML.

For example:

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

If `regardHtmlPathAsRoot` is set to `true`, when parsing `https://cdn.jsdelivr.net/npm/@rallie/demo/dist/index.html`, the middleware will replace the script tag in the document with:

```html
<script src="https://cdn.jsdelivr.net/npm/@rallie/demo/dist/assets/chunk.js"></script>
```

If `regardHtmlPathAsRoot` is `false`, the middleware will replace the script tag with:

```html
<script src="https://cdn.jsdelivr.net/assets/chunk.js"></script>
```

This configuration is particularly useful when uploading HTML to a public CDN.

- `filter`: This is a method for filtering elements in the HTML. The method takes an `HTMLScriptElement | HTMLLinkElement | HTMLStyleElement` instance as an argument and returns a boolean value. If it returns `true`, the element will be retained; otherwise, it will be removed.

For example, you can use this configuration to only keep script tags in the HTML:

```ts
env.use(loadHtml({
  filter: (el) => el.tagName === 'SCRIPT'
}));
```
