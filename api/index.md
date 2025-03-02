# API
## Basic Types

```ts
type State = Record<string, any>;

type Events = Record<string, (...args: any[]) => void>;

type Methods = Record<string, (...args: any[]) => any>;

type BlockDeclare = Partial<{
  state: State;
  events: Events;
  methods: Methods;
}>;
```

## createBlock

- Type: 
  ```ts
  <T extends BlockDeclare>(name: string) => Block<T['state'], T['events'], T['methods'], T['exports']>
  ```
- Description: Creates a Block, accepting a globally unique block name as a parameter, and returns a `Block` instance.
- Example:

  ```ts
  import { createBlock } from "@rallie/block";

  interface MyBlock {
    state: {
      count: number;
      user: {
        name: string;
      };
    },
    events: {
      incrementCount: () => void;
    },
    methods: {
      login: () => void;
      logout: () => void;
    };
  }

  const myBlock = createBlock<MyBlock>("my-block");
  ```

## Block

### name

- Type: `string`
- Description: The name of the Block.

### state

- Type: `State`
- Description: The state of the Block, which is read-only. To modify the state of a Block, the [setState](#setState) method must be used.

### methods

- Type: `Methods`
- Description: The method invoker of the Block, which is read-only. To add methods to a Block, the [addMethods](#addMethods) method must be used.
- Example:

  ```ts
  // Add methods
  block.addMethods({
    login: async () => {
      const success = await requestLogin();
      return success;
    },
  });

  // Invoke method
  block.methods.login().then((success) => {
    if (success) {
      alert("Login successfully");
    }
  });
  ```

### events

- Type: `Events`
- Description: The event invoker of the Block, which is read-only. To add event listeners to a Block, the [listenEvents](#listenEvents) method must be used.
- Example:

  ```ts
  // Listen to events
  block.listenEvents({
    themeChange: (themeColor) => {
      doChangeTheme(themeColor);
    },
  });

  // Trigger event
  block.events.themeChange("red");
  ```

### initState

- Type: `(value: State, isPrivate: boolean = false) => CreatedBlock`
- Description: Initializes the state of the Block. A Block can only be initialized once. Calling `initState` multiple times will throw an error. If you want the state to be unmodifiable by other Blocks, pass `true` as the second parameter to indicate that the state is set as private.

### setState

- Type: `((action: string, state: State) => void | Promise<void>) => Promise<void>`
- Description: Modifies the state of the Block. The first parameter is a description of this operation.
- Example:

  ```ts
  // Synchronously modify state
  block.setState("add the count synchronously", (state) => {
    state.count++;
  });

  // Asynchronously modify state
  await block.setState("add the count asynchronously", async (state) => {
    const userInfo = await requestLogIn();
    state.user = userInfo;
  });
  ```

### watchState

- Type: `((state: State) => any) => Watcher`
- Description: Listens to changes in the Block's state, implemented based on the `effect` method of `@vue/reactivity`. See examples for specific usage.
- Example:

  - Chained calling to watch state

    ```ts
    // Watch state
    const unwatch = block
      .watchState((state) => state.count)
      .do((newCount, oldCount) => {
        console.log(newCount, oldCount);
      });

    // Unwatch
    unwatch();
    ```

  - watchEffect

    ```ts
    // Watch state
    const watcher = block.watchState((state) => {
      console.log(state.count, state.user);
    });

    // Unwatch
    watcher.unwatch();
    ```

### listenEvents

- Type: `(events: Partial<Events>) => (eventName?: string) => void`
- Description: Adds event listeners to the Block, and the return value is a function to cancel the event listening. The block name of the event caller can be obtained from the `this` context of the listening callback.
- Example:
  - Listen to events:
    ```ts
    const cancelEvents = block.listenEvents({
      changeTheme(this: { trigger: string }, themeColor) {
        console.log(`Event caller is ${this.trigger}`)
        doChangeTheme(themeColor);
      },
      changeLanguage: (lang) => {
        doChangeLanguage(lang);
      },
    });
    ```
  - Cancel listening to all events:
    ```ts
    cancelEvents();
    ```
  - Cancel listening to a single event
    ```ts
    cancelEvents("changeTheme");
    ```

### addMethods

- Type: `(methods: Partial<Methods>) => (methodName?: string) => void`
- Description: Adds methods to the Block, and the return value is a function to remove the methods. The block name of the event caller can be obtained from the `this` context of the method callback.
- Example:
  - Add methods:
    ```ts
    const removeMethods = block.addMethods({
      async logIn(this: { trigger: string }) => {
        console.log(`Event caller is ${this.trigger}`)
        await requestLogIn();
      },
      logOut: async () => {
        await requestLogOut();
      },
    });
    ```
  - Remove all methods:
    ```ts
    removeMethods();
    ```
  - Remove a single method
    ```ts
    removeMethods("logIn");
    ```

### load

- Type: `(name: string) => Promise<void>`
- Description: Loads the resources of a Block, with the argument being the name of the Block to be loaded.

### activate

- Type: `(name: string) => Promise<void>`
- Description: Activates a Block, with the argument being the name of the Block to be activated.

### connect

- Type: 
  ```ts
  <T extends BlockDeclare>(name: string) => ConnectedBlock<T>
  ```
- Description: Connects to a Block, receiving the name of the Block to be connected as the only parameter, and returns a `ConnectedBlock` that allows the use of the connected Block's state, events, and methods.
- Example:
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

The [connect](#connect) method will return a `ConnectedBlock`. Its state, event, and method-related APIs are a subset of the normal [Block](#block) APIs, including [name](#name), [state](#state), [events](#events), [methods](#methods), [setState](#setstate), [watchState](#watchstate), and [listenEvents](#listenevents).

::: tip
If the connected Block declares its state as private, calling `setState` to change the Block's state via `ConnectedBlock` will result in an error.
:::

The usage of the above properties and methods is completely consistent with the usage of Block.

::: tip
For a ConnectedBlock, to use its state, call its methods, or import its exposed objects, you should ensure that its state has been initialized, methods have been added, and objects have been exported. The connect operation does not load or activate the Block to be connected, so you should declare the Block to be connected as the current Block's [association or dependency](/guide/advance.html#association-and-dependency), or manually load or activate the Block to be connected.
:::

### run

- Type: `(callback: (env: Env) => void | Promise<void>) => Promise<void>`
- Description: Executes the passed callback function. The current Block's runtime environment can be obtained in the callback parameter, see [Env](#env).

## Env

The runtime environment object of a Block, which can be obtained in the callback of the [run](#run) method.

### isEntry

- Type: `boolean`
- Description: Whether it is the entry environment. If a Block is the first application created in the application cluster, then when executing the Block's `run` method, its callback parameter `env.isEntry` is `true`, otherwise it is `false`.

### freeze

- Type: `() => void`
- Description: Freezes the current runtime environment, which is only effective when `env.isEntry` is `true`. After the runtime environment is frozen, the middleware and configurations applied by non-entry environment Blocks will not take effect.

### unfreeze

- Type: `() => void`
- Description: Unfreezes the current runtime environment, which is only effective when `env.isEntry` is `true`.

### use

- Type: `(middleware: (ctx: Context, next: () => Promise<void>) => void) => void`
- Description: Applies resource loading middleware, usage refers to [middleware](/guide/advance.html#middleware), the type of context is:
  ```ts
  interface Context {
    name: string; // The name of the Block to be loaded
    conf: ConfType; // The configuration of the runtime environment, refer to env.conf
    loadScript: (
      script: Partial<HTMLScriptElement> | string | HTMLScriptElement
    ) => Promise<void>; // Method to insert script tags
    loadLink: (
      link: Partial<HTMLLinkElement> | string | HTMLLinkElement
    ) => Promise<void>; // Method to insert link tags
    [other: string]: any; // Middleware can add methods and properties to context
  }
  ```

### conf

- Type:
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
- Description: The global configuration of the runtime environment, which can be configured through `env.config`. The `assets` property is the resource path information of the application cluster. The innermost middleware of rallie's onion middleware model will look for and load application resources in `assets` based on the Block's name.

### config

- Type: `(conf: ConfType) => void`
- Description: Configures the runtime environment. When configuring `assets`, the information will be appended and not overwritten.
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
  /* The result will be printed as:
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
