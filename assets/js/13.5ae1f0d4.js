(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{403:function(e,r,t){"use strict";t.r(r);var a=t(54),n=Object(a.a)({},(function(){var e=this,r=e.$createElement,t=e._self._c||r;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("h1",{attrs:{id:"介绍"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#介绍"}},[e._v("#")]),e._v(" 介绍")]),e._v(" "),t("p",[e._v("rallie 是一个可以帮助用户实现去中心化的前端微服务架构的库。基于 rallie 开发的前端应用可以成为一个对外暴露响应式状态，事件和方法的服务，不同服务之间可以共享依赖，灵活组合与编排，从而提高大型前端应用的可扩展性")]),e._v(" "),t("h2",{attrs:{id:"前端服务化"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#前端服务化"}},[e._v("#")]),e._v(" 前端服务化")]),e._v(" "),t("p",[e._v("前端服务化常常以“微前端”的名字出现在近几年的前端技术圈中，它将微服务的理念应用于浏览器端，即将 Web 应用由单一的单体应用转变为多个小型前端应用聚合为一的应用，且各个前端应用还可以独立运行、独立开发、独立部署。微前端不是单纯的前端框架或者工具，而是一套架构体系，这个概念最早在 2016 年底被提出，更多相关信息可以参考"),t("a",{attrs:{href:"https://swearer23.github.io/micro-frontends/",target:"_blank",rel:"noopener noreferrer"}},[e._v("这篇文章"),t("OutboundLink")],1)]),e._v(" "),t("h2",{attrs:{id:"核心理念"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#核心理念"}},[e._v("#")]),e._v(" 核心理念")]),e._v(" "),t("ul",[t("li",[t("strong",[e._v("应用即服务：")]),e._v(" 基于 Rallie 构建的应用，可以对外暴露响应式状态，事件和方法作为服务，应用间并不强调严格独立与隔离，可以有依赖关系，也可以共享公共的库。而在开发应用的时候，用户只需要声明依赖即可，依赖的加载和编排问题由 Rallie 解决")]),e._v(" "),t("li",[t("strong",[e._v("去中心化：")]),e._v(" 基于 Rallie 构建的应用是平等的，并不区分所谓的基座应用和子应用。每个应用既有可能作为入口去加载其他应用，也可能被其他入口加载")])]),e._v(" "),t("h2",{attrs:{id:"它是如何工作的"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#它是如何工作的"}},[e._v("#")]),e._v(" 它是如何工作的")]),e._v(" "),t("p",[e._v("Rallie 的响应式状态依赖"),t("a",{attrs:{href:"https://github.com/vuejs/vue-next/tree/master/packages/reactivity",target:"_blank",rel:"noopener noreferrer"}},[e._v("@vue/reactivity"),t("OutboundLink")],1),e._v("，事件和方法则是基于发布订阅模式和"),t("code",[e._v("Proxy")]),e._v("实现的。")]),e._v(" "),t("h2",{attrs:{id:"比较"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#比较"}},[e._v("#")]),e._v(" 比较")]),e._v(" "),t("h3",{attrs:{id:"微前端框架"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#微前端框架"}},[e._v("#")]),e._v(" 微前端框架")]),e._v(" "),t("p",[e._v("微前端概念被提出后，许多团队进行了实践，社区里也出现了一批优秀的微前端解决方案，比如"),t("a",{attrs:{href:"https://qiankun.umijs.org/zh",target:"_blank",rel:"noopener noreferrer"}},[e._v("qiankun"),t("OutboundLink")],1),e._v("，"),t("a",{attrs:{href:"https://micro-frontends.ice.work/",target:"_blank",rel:"noopener noreferrer"}},[e._v("icestark"),t("OutboundLink")],1),e._v("，"),t("a",{attrs:{href:"https://zeroing.jd.com/",target:"_blank",rel:"noopener noreferrer"}},[e._v("microApp"),t("OutboundLink")],1),e._v("，"),t("a",{attrs:{href:"https://garfish.top/guide/develop/from-zero",target:"_blank",rel:"noopener noreferrer"}},[e._v("garfish"),t("OutboundLink")],1),e._v("等，Rallie 和这些方案不管是实现思路还是使用场景都略有不同。")]),e._v(" "),t("p",[e._v("首先，这些微前端框架是中心化的，实质依赖微前端框架的是一个基座应用，其他内容应用只是需要做一些改造（比如打包为 umd 格式并导出生命周期函数），然后在基座应用中加载内容应用。而 Rallie 是去中心化的，实质上并不区分基座应用和内容应用，每个应用都需要引入 Rallie，把自己包装成一个可以被其他应用激活，也可以激活其他应用的服务")]),e._v(" "),t("p",[e._v("其次，上述的微前端框架更强调应用独立与隔离，它们的主要作用是将一个个相对独立的应用聚合到一起而"),t("strong",[e._v("互不影响")]),e._v("。因此上述框架的重要卖点是 js 沙箱，样式隔离等技术，它们提供的应用间通信机制也都比较简单。而 Rallie 更强调“服务化”，即应用构建出来是为了给其他应用提供服务的，Rallie 的作用是让构建出的前端应用可组合，可复用")]),e._v(" "),t("p",[e._v("打一个不太恰当的比方，上述微前端框架帮助用户实现的是一个体验更好的 iframe，而 Rallie 帮助用户实现的是一个体验更好的 sdk。微前端框架更适合类似于将几个现有的老项目接入到一个门户中这样的场景，而 Rallie 则比较适合实现一个可伸缩的，方便后期接入不同技术栈的前端微服务架构的场景")]),e._v(" "),t("h3",{attrs:{id:"模块联邦"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#模块联邦"}},[e._v("#")]),e._v(" 模块联邦")]),e._v(" "),t("p",[t("a",{attrs:{href:"https://webpack.js.org/concepts/module-federation/",target:"_blank",rel:"noopener noreferrer"}},[e._v("模块联邦"),t("OutboundLink")],1),e._v("是 webpack5 提供的一个新特性，事实上，比起微前端框架，Rallie 要解决的问题和模块联邦要解决的问题更相似一些。二者的区别在于，模块联邦是一个编译时的方案，与构建工具 webpack 是强绑定的，其他构建工具（比如"),t("a",{attrs:{href:"https://vitejs.dev/",target:"_blank",rel:"noopener noreferrer"}},[e._v("vite"),t("OutboundLink")],1),e._v("）还没有跟进该特性，这也就意味着使用模块联邦的每个应用也必须使用 webpack5。而 Rallie 是一个纯运行时方案，两个互相通信或依赖的应用可以是基于不同构建工具构建的。当然了，也正是因为这个区别，使用模块联邦时，引用其他应用的模块代码看起来可以像引入本地的 ES6 模块一样。而在 Rallie 中，则必须以状态，事件和方法的形式使用其他应用提供的服务。")])])}),[],!1,null,null,null);r.default=n.exports}}]);