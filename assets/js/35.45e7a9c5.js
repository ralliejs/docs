(window.webpackJsonp=window.webpackJsonp||[]).push([[35],{322:function(r,e,t){"use strict";t.r(e);var a=t(14),n=Object(a.a)({},(function(){var r=this,e=r._self._c;return e("ContentSlotsDistributor",{attrs:{"slot-key":r.$parent.slotKey}},[e("h1",{attrs:{id:"介绍"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#介绍"}},[r._v("#")]),r._v(" 介绍")]),r._v(" "),e("p",[r._v("rallie 是一个可以帮助用户实现去中心化的前端微服务架构的库。基于 rallie 开发的前端应用可以成为一个对外暴露响应式状态，事件，方法的服务，不同服务之间可以共享依赖，灵活组合与编排，从而提高大型前端应用的可扩展性")]),r._v(" "),e("h2",{attrs:{id:"前端服务化"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#前端服务化"}},[r._v("#")]),r._v(" 前端服务化")]),r._v(" "),e("p",[r._v("前端服务化常常以“微前端”的名字出现在近几年的前端技术圈中，它将微服务的理念应用于浏览器端，即将 Web 应用由单一的单体应用转变为多个小型前端应用聚合为一的应用，且各个前端应用还可以独立运行、独立开发、独立部署。微前端不是单纯的前端框架或者工具，而是一套架构体系，这个概念最早在 2016 年底被提出，更多相关信息可以参考"),e("a",{attrs:{href:"https://swearer23.github.io/micro-frontends/",target:"_blank",rel:"noopener noreferrer"}},[r._v("这篇文章"),e("OutboundLink")],1)]),r._v(" "),e("h2",{attrs:{id:"核心理念"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#核心理念"}},[r._v("#")]),r._v(" 核心理念")]),r._v(" "),e("ul",[e("li",[e("strong",[r._v("应用即服务：")]),r._v(" 基于 Rallie 构建的应用，可以对外暴露响应式状态，事件，方法，作为服务，应用间并不强调严格独立与隔离，可以有依赖关系，也可以共享公共的库。而在开发应用的时候，用户只需要声明依赖即可，依赖的加载和编排问题由 Rallie 解决")]),r._v(" "),e("li",[e("strong",[r._v("去中心化：")]),r._v(" 基于 Rallie 构建的应用是平等的，并不区分所谓的基座应用和子应用。每个应用既有可能作为入口去加载其他应用，也可能被其他入口加载")])]),r._v(" "),e("h2",{attrs:{id:"它是如何工作的"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#它是如何工作的"}},[r._v("#")]),r._v(" 它是如何工作的")]),r._v(" "),e("p",[r._v("Rallie 的响应式状态依赖"),e("a",{attrs:{href:"https://github.com/vuejs/vue-next/tree/master/packages/reactivity",target:"_blank",rel:"noopener noreferrer"}},[r._v("@vue/reactivity"),e("OutboundLink")],1),r._v("，事件和方法则是基于发布订阅模式和"),e("code",[r._v("Proxy")]),r._v("实现的。")]),r._v(" "),e("h2",{attrs:{id:"比较"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#比较"}},[r._v("#")]),r._v(" 比较")]),r._v(" "),e("h3",{attrs:{id:"微前端框架"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#微前端框架"}},[r._v("#")]),r._v(" 微前端框架")]),r._v(" "),e("p",[r._v("微前端概念被提出后，许多团队进行了实践，社区里也出现了一批优秀的微前端解决方案，比如"),e("a",{attrs:{href:"https://qiankun.umijs.org/zh",target:"_blank",rel:"noopener noreferrer"}},[r._v("qiankun"),e("OutboundLink")],1),r._v("，"),e("a",{attrs:{href:"https://micro-frontends.ice.work/",target:"_blank",rel:"noopener noreferrer"}},[r._v("icestark"),e("OutboundLink")],1),r._v("，"),e("a",{attrs:{href:"https://zeroing.jd.com/",target:"_blank",rel:"noopener noreferrer"}},[r._v("microApp"),e("OutboundLink")],1),r._v("，"),e("a",{attrs:{href:"https://garfish.top/guide/develop/from-zero",target:"_blank",rel:"noopener noreferrer"}},[r._v("garfish"),e("OutboundLink")],1),r._v("等，Rallie 和这些方案不管是实现思路还是使用场景都略有不同。")]),r._v(" "),e("p",[r._v("首先，这些微前端框架是中心化的，实质依赖微前端框架的是一个基座应用，其他内容应用只是需要做一些改造（比如打包为 umd 格式并导出生命周期函数），然后在基座应用中加载内容应用。而 Rallie 是去中心化的，实质上并不区分基座应用和内容应用，每个应用都需要引入 Rallie，把自己包装成一个可以被其他应用激活，也可以激活其他应用的服务")]),r._v(" "),e("p",[r._v("其次，上述的微前端框架更强调应用独立与隔离，它们的主要作用是将一个个相对独立的应用聚合到一起而"),e("strong",[r._v("互不影响")]),r._v("。因此上述框架的重要卖点是 js 沙箱，样式隔离等技术，它们提供的应用间通信机制也都比较简单。而 Rallie 更强调“服务化”，即应用构建出来是为了给其他应用提供服务的，Rallie 的作用是让构建出的前端应用可组合，可复用")]),r._v(" "),e("p",[r._v("打一个不太恰当的比方，上述微前端框架帮助用户实现的是一个体验更好的 iframe，而 Rallie 帮助用户实现的是一个体验更好的 sdk。微前端框架更适合类似于将几个现有的项目接入到一个门户中这样的场景，而 Rallie 则比较适合实现一个可伸缩的微内核架构应用的场景")]),r._v(" "),e("h3",{attrs:{id:"模块联邦"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#模块联邦"}},[r._v("#")]),r._v(" 模块联邦")]),r._v(" "),e("p",[e("a",{attrs:{href:"https://webpack.js.org/concepts/module-federation/",target:"_blank",rel:"noopener noreferrer"}},[r._v("模块联邦"),e("OutboundLink")],1),r._v("是 webpack5 提供的一个新特性，比起微前端框架，Rallie 要解决的问题和模块联邦要解决的问题更相似一些，他们都适合实现去中心化的微前端架构。二者的区别在于，模块联邦是一个编译时方案，你的运行时代码可以像动态导入本地的 ES6 模块一样导入其他应用的模块，而 Rallie 则是一个纯运行时方案，你必须用 Rallie 提供的API在运行时配置和使用其他应用。")]),r._v(" "),e("p",[r._v("基于运行时的特点也让 Rallie 可以吸收微前端框架的优点，拓展出html entry，沙箱隔离，应用间响应式状态共享等功能。")])])}),[],!1,null,null,null);e.default=n.exports}}]);