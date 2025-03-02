# Introduction

Rallie is a library that helps users achieve a decentralized front-end microservices architecture. Front-end applications developed based on Rallie can become services that expose reactive states, events, and methods externally. Different services can share dependencies and be flexibly combined and orchestrated, improving the scalability of large front-end applications.

## Front-end Service

Front-end service often appears in recent years' front-end technology circles under the name "micro-frontends." It applies the microservices concept to the browser side, transforming a single monolithic web application into an aggregate of multiple small front-end applications, each capable of running independently, being developed and deployed independently. Micro-frontends are not merely a front-end framework or tool but an architectural system. This concept was first proposed at the end of 2016. More information can be found in [this article](https://micro-frontends.org/).

## Core Concepts

- **Application as a Service:** Applications built on Rallie can expose reactive states, events, methods as services. There is no emphasis on strict independence and isolation between applications; they can have dependencies and can share common libraries. When developing applications, users only need to declare dependencies, and Rallie handles the loading and orchestration of dependencies.
- **Decentralization:** Applications built on Rallie are equal and do not distinguish between a base application and sub-applications. Each application can act as an entry point to load other applications or be loaded by other applications.

## How It Works

Rallie's reactive states rely on [@vue/reactivity](https://github.com/vuejs/vue-next/tree/master/packages/reactivity), while events and methods are implemented based on the publish-subscribe model and `Proxy`.

## Comparison

### Micro-frontend Frameworks

After the micro-frontend concept was proposed, many teams began implementing it, and several excellent micro-frontend solutions emerged in the community, such as [qiankun](https://qiankun.umijs.org/en), [icestark](https://micro-frontends.ice.work/), [microApp](https://zeroing.jd.com/), and [garfish](https://garfish.top/guide/develop/from-zero). Rallie differs from these solutions in both implementation logic and usage scenarios.

Firstly, these micro-frontend frameworks are centralized, relying on a base application, while content applications only need some modifications (e.g., packaging as UMD format and exporting lifecycle functions) to be loaded by the base application. Rallie, however, is decentralized and does not distinguish between base and content applications. Each application needs to integrate Rallie, packaging itself as a service that can be activated by other applications and can activate other applications.

Secondly, the aforementioned micro-frontend frameworks emphasize the independence and isolation of applications, mainly aggregating relatively independent applications without affecting each other. Therefore, key features of these frameworks include JS sandboxing and style isolation, with relatively simple inter-application communication mechanisms. Rallie, on the other hand, emphasizes "service orientation," where applications are built to provide services for other applications. Rallie’s role is to enable the built front-end applications to be composable and reusable.

To draw an imperfect analogy, the aforementioned micro-frontend frameworks help users achieve an experience akin to a more efficient and pleasant iframe, while Rallie helps users achieve a more efficient and pleasant SDK. Micro-frontend frameworks are more suitable for scenarios like integrating several existing projects into a portal, whereas Rallie is more suited for implementing a scalable micro-kernel architecture.

### Module Federation

[Module Federation](https://webpack.js.org/concepts/module-federation/) is a new feature introduced in webpack 5. Compared to micro-frontend frameworks, Rallie addresses problems more similar to those solved by Module Federation, as both are suitable for implementing decentralized micro-frontends. The difference is that Module Federation is a compile-time solution, allowing you to import modules from other applications as if they were local ES6 modules during runtime, while Rallie is a purely runtime solution where you must configure and use other applications with Rallie's APIs at runtime.

The runtime nature of Rallie also allows it to incorporate the advantages of micro-frontend frameworks, extending features like HTML entry, sandbox isolation, and reactive state sharing between applications.