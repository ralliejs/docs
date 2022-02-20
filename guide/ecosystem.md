# 生态
## React
Rallie官方维护`@rallie/react`，提供了几个常用的Hook帮助你更好地使用应用提供的服务。你可以安装`@rallie/react`来使用它们
```shell
npm install @rallie/react
```
也可以直接引用script，所有API都将挂载在全局变量`window.RallieReact`上
```html
<script src="https://cdn.jsdelivr.net/npm/@rallie/react"></script>
```
### useRallieState
该hook的第一个参数是一个`App`或`Connector`实例，第二个参数是指定Rallie状态的回调，最终该hook会返回与指定的Rallie状态同步的React状态
```tsx {12-13}
import { App } from 'rallie'
import { useRallieState } from '@rallie/react'

const consumer = new App('consumer', {
  state: {
    count: 0
  }
})
const producer = consumer.connect<{ theme: string }>('producer')

export const Demo = () => {
  const count = useRallieState(consumer, state => state.count)
  const theme = useRallieState(producer, state => state.theme)
  const addCount = () => consumer.setState('add count', state => state.count++)
  return (
    <div style={{ color: theme }}>
      <button onClick={addCount}>count: {count}</button>
    </div>
  )
}
```
同时你可以指定第三个参数——一个依赖数组，useRallieState将在依赖变化时重新监听Rallie状态

### useRallieEvents
该hook将在组件挂载时监听Rallie事件，在组件卸载时取消监听
```tsx {7-9}
import { App } from 'rallie'
import { useRallieEvents } from '@rallie/react'

const producer = new App<{}, { print: () => void }, {}>('producer')

export const Demo = () => {
  useRallieEvents(producer, {
    print: () => console.log('Hello Rallie')
  })
  const onEmitPrint = () => producer.events.print()
  return (
    <div>
      <button onClick={onEmitPrint}>print</button>
    </div>
  )
}
```
同时你可以指定第三个参数——一个依赖数组，useRallieEvents将在依赖变化时重新监听事件

### useRallieMethods
该hook将在组件挂载时添加方法，在组件卸载时取消方法
```tsx {9-11}
import { useRef } from 'react'
import { App } from 'rallie'
import { useRallieMethods } from '@rallie/react'

const producer = new App<{}, {}, { getInputRef: () => HTMLElement }>('producer')

export const Demo = () => {
  const inputRef = useRef(null)
  useRallieMethods(producer, {
    getInputRef: () => inputRef.current
  })
  const focusInputInput = () => {
    const el = producer.methods.getInputRef()
    if (el) {
      el.focus()
    }
  }
  return (
    <div>
      <input ref={inputRef} />
      <button onClick={focusInputInput}>focus</button>
    </div>
  )
}
```
同时你可以指定第三个参数——一个依赖数组，useRallieMethods将在依赖变化时重新添加方法

## Vue3
Rallie官方维护`@rallie/vue`，同时包含了对Vue3和对Vue2的支持，你可以安装`@rallie/vue`来使用
```sh
npm install @rallie/vue
```
也可以直接引用script，所有API都将挂载在全局变量`window.RallieVue`上
```html
<script src="https://cdn.jsdelivr.net/npm/@rallie/vue"></script>
```
针对Vue3应用，Rallie提供了几个CompositionAPI，除了不需要指定依赖数组之外，命名和使用方法都与`@rallie/react`的api相同
### useRallieState
```vue {12-13}
<script setup lang="ts">
import { App } from 'rallie'
import { useRallieState } from '@rallie/vue'

const consumer = new App('consumer', {
  state: {
    count: 0
  }
})
const producer = consumer.connect<{ theme: string }>('producer')

const theme = useRallieState(producer, state => state.theme)
const count = useRallieState(consumer, state => state.count)
const addCount = () => consumer.setState('add count', state => state.count++)
</script>

<template>
  <div :style="{ color: theme }">
    <button @click="addCount">count: {{count}}</button>
  </div>
</template>
```

### useRallieEvents
```vue {7-9}
<script setup lang="ts">
import { App } from 'rallie'
import { useRallieEvents } from '@rallie/vue'

const producer = new App<{}, { print: () => void }, {}>('producer')

useRallieEvents(producer, {
  print: () => console.log('Hello Rallie')
})
</script>

<template>
  <div>
    <button @click="producer.events.print()">print</button>
  </div>
</template>
```

### useRallieMethods
```vue {9-11}
<script setup lang="ts">
import { ref } from 'vue'
import { App } from 'rallie'
import { useRallieMethods } from '@rallie/vue'

const producer = new App<{}, {}, { getRef: () => HTMLElement }>('producer')

const inputRef = ref(null)
useRallieMethods(producer, {
  getInputRef: () => inputRef.value
})
const focusInput = () => {
  const el = producer.methods.getInputRef()
  if (el) {
    el.focus()
  }
}
</script>

<template>
  <div>
    <input ref="inputRef" />
    <button @click="focusInput">focus</button>
  </div>
</template>
```
## Vue2
对于Vue2的应用，`@rallie/vue`提供了几个mixin支持，你可以从`@rallie/vue/dist/mixin`中导入它们
```ts
import { mixinRallieState, mixinRallieEvents, mixinRallieMethods } from '@rallie/vue/dist/mixin'
```

### mixinRallieState
该方法接收两个参数，第一个参数是一个`App`或`Connector`实例，第二个参数是一个将App的状态映射为组件的计算属性的函数。你可以像这样使用它
```vue
<template>
    <button @click="addCount">count: {{ count }}</button>
</template>

<script>
import { mixinRallieState } from '@rallie/vue/dist/mixin'
const producer = new App('producer', {
  state: {
    count: 0
  }
})

export default {
  mixins: [
    mixinRallieState(app, (state) => ({
      count: state.count
    }))
  ],
  methods: {
    addCount() {
      app.setState('add count', state => state.count++)
    }
  }
}
</script>
```
### mixinRallieEvents
该方法的第一个参数是一个`App`或`Connector`实例，第二个参数是要监听的事件回调集合。组件将在挂载时监听事件，在卸载时取消监听
```vue
<template>
  <button @click="print">print</button>
</template>

<script>
import { mixinRallieEvents } from '@rallie/vue/dist/mixin'

const producer = new App('producer')
export default {
  mixins: [
    mixinRallieEvents(producer, {
      print() {
        console.log(this.text) // 可以在回调函数中通过this访问组件实例
      }
    })
  ],
  data() {
    return {
      text: 'Hello Rallie'
    }
  }
}
</script>
```
### mixinRallieMethods
`mixinRallieMethods`和`mixinRallieEvents`使用方法相同。组件将在挂载时添加方法，在卸载时取消方法
```vue
<template>
  <div>
    <input ref="input" @click="focuseInput"></input>
    <button @click="focusInput">focus</button>
  </div>
</template>

<script>
import { mixinRallieMethods } from '@rallie/vue/dist/mixin'

const producer = new App('producer')
export default {
  mixins: [
    mixinRallieMethods(producer, {
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

## load-html中间件
Rallie官方维护`@rallie/load-html`，这是一个中间件，你可以安装`@rallie/load-html`来使用它
```sh
npm install @rallie/load-html
```
它的作用是让你可以直接给应用配置html路径，中间件将通过`fetch`加载并解析html，然后将`link`、`style`和`script`标签插入到文档中
```ts
import { loadHtml } from '@rallie/load-html'

app.run((env) => {
  env.use(loadHtml({
    entries: {
      producer: 'http://localhost:3000/producer.html',
      consumer: 'http://localhost:3000/consumer.html'
    }
  }))
})
```
你也可以不配置`entries`，而是在后续中间件中使用`ctx.loadHtml`方法来加载和解析html
```ts
env.use(loadHtml())
env.use(async (ctx, next) => {
  await ctx.loadHtml(`http://localhost:3000/${ctx.name}.html`)
})
```
如果在html路径中带上hash，则中间件还会以该hash值作为id，将html中对应id的元素插入到文档中。
```ts
env.use(loadHtml({
  entries: {
    producer: 'http://localhost:3000/producer.html#root'
  }
}))
```
比如上面这个例子，如果宿主html中预留了id为`root`的元素，则激活`producer`时，中间件会将该预留元素的`innerHTML`的内容替换为`http://localhost:3000/producer.html`解析出的id为`root`的元素内容。如果没有提前预留好这个元素，则中间件会直接将加载的html中解析出的id为`root`的元素插入到`body`中

除了`entries`，该中间件还接收两个配置参数，一个是`fetch`，这是用来加载html的函数，你可以传入自定义的fetch函数来应对需要添加特殊请求头的情况，如果不传，则默认是`window.fetch`；另一个配置项是`regardHtmlPathAsRoot`，这是一个布尔值，默认是`false`，如果置为`true`，则中间件在转换html中的资源的路径时，会将`html`的路径视作根路径。

举个例子：
```ts
env.use(loadHtml({
  regardHtmlPathAsRoot: true,
  entries: {
    producer: 'https://cdn.jsdelivr.net/npm/@rallie/demo/dist/index.html'
  }
}))
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
这个配置项对于将html上传到公共cdn上的场景非常有用