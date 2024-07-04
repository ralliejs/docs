(window.webpackJsonp=window.webpackJsonp||[]).push([[29],{316:function(e,t,a){"use strict";a.r(t);var n=a(14),r=Object(n.a)({},(function(){var e=this,t=e._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("h1",{attrs:{id:"introduction"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#introduction"}},[e._v("#")]),e._v(" Introduction")]),e._v(" "),t("p",[e._v("Rallie is a library that helps users achieve a decentralized front-end microservices architecture. Front-end applications developed based on Rallie can become services that expose reactive states, events, and methods externally. Different services can share dependencies and be flexibly combined and orchestrated, improving the scalability of large front-end applications.")]),e._v(" "),t("h2",{attrs:{id:"front-end-service"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#front-end-service"}},[e._v("#")]),e._v(" Front-end Service")]),e._v(" "),t("p",[e._v('Front-end service often appears in recent years\' front-end technology circles under the name "micro-frontends." It applies the microservices concept to the browser side, transforming a single monolithic web application into an aggregate of multiple small front-end applications, each capable of running independently, being developed and deployed independently. Micro-frontends are not merely a front-end framework or tool but an architectural system. This concept was first proposed at the end of 2016. More information can be found in '),t("a",{attrs:{href:"https://micro-frontends.org/",target:"_blank",rel:"noopener noreferrer"}},[e._v("this article"),t("OutboundLink")],1),e._v(".")]),e._v(" "),t("h2",{attrs:{id:"core-concepts"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#core-concepts"}},[e._v("#")]),e._v(" Core Concepts")]),e._v(" "),t("ul",[t("li",[t("strong",[e._v("Application as a Service:")]),e._v(" Applications built on Rallie can expose reactive states, events, methods, and exported objects encapsulated by methods as services. There is no emphasis on strict independence and isolation between applications; they can have dependencies and can share common libraries. When developing applications, users only need to declare dependencies, and Rallie handles the loading and orchestration of dependencies.")]),e._v(" "),t("li",[t("strong",[e._v("Decentralization:")]),e._v(" Applications built on Rallie are equal and do not distinguish between a base application and sub-applications. Each application can act as an entry point to load other applications or be loaded by other applications.")])]),e._v(" "),t("h2",{attrs:{id:"how-it-works"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#how-it-works"}},[e._v("#")]),e._v(" How It Works")]),e._v(" "),t("p",[e._v("Rallie's reactive states rely on "),t("a",{attrs:{href:"https://github.com/vuejs/vue-next/tree/master/packages/reactivity",target:"_blank",rel:"noopener noreferrer"}},[e._v("@vue/reactivity"),t("OutboundLink")],1),e._v(", while events and methods are implemented based on the publish-subscribe model and "),t("code",[e._v("Proxy")]),e._v(".")]),e._v(" "),t("h2",{attrs:{id:"comparison"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#comparison"}},[e._v("#")]),e._v(" Comparison")]),e._v(" "),t("h3",{attrs:{id:"micro-frontend-frameworks"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#micro-frontend-frameworks"}},[e._v("#")]),e._v(" Micro-frontend Frameworks")]),e._v(" "),t("p",[e._v("After the micro-frontend concept was proposed, many teams began implementing it, and several excellent micro-frontend solutions emerged in the community, such as "),t("a",{attrs:{href:"https://qiankun.umijs.org/en",target:"_blank",rel:"noopener noreferrer"}},[e._v("qiankun"),t("OutboundLink")],1),e._v(", "),t("a",{attrs:{href:"https://micro-frontends.ice.work/",target:"_blank",rel:"noopener noreferrer"}},[e._v("icestark"),t("OutboundLink")],1),e._v(", "),t("a",{attrs:{href:"https://zeroing.jd.com/",target:"_blank",rel:"noopener noreferrer"}},[e._v("microApp"),t("OutboundLink")],1),e._v(", and "),t("a",{attrs:{href:"https://garfish.top/guide/develop/from-zero",target:"_blank",rel:"noopener noreferrer"}},[e._v("garfish"),t("OutboundLink")],1),e._v(". Rallie differs from these solutions in both implementation logic and usage scenarios.")]),e._v(" "),t("p",[e._v("Firstly, these micro-frontend frameworks are centralized, relying on a base application, while content applications only need some modifications (e.g., packaging as UMD format and exporting lifecycle functions) to be loaded by the base application. Rallie, however, is decentralized and does not distinguish between base and content applications. Each application needs to integrate Rallie, packaging itself as a service that can be activated by other applications and can activate other applications.")]),e._v(" "),t("p",[e._v('Secondly, the aforementioned micro-frontend frameworks emphasize the independence and isolation of applications, mainly aggregating relatively independent applications without affecting each other. Therefore, key features of these frameworks include JS sandboxing and style isolation, with relatively simple inter-application communication mechanisms. Rallie, on the other hand, emphasizes "service orientation," where applications are built to provide services for other applications. Rallie’s role is to enable the built front-end applications to be composable and reusable.')]),e._v(" "),t("p",[e._v("To draw an imperfect analogy, the aforementioned micro-frontend frameworks help users achieve an experience akin to a more efficient and pleasant iframe, while Rallie helps users achieve a more efficient and pleasant SDK. Micro-frontend frameworks are more suitable for scenarios like integrating several existing projects into a portal, whereas Rallie is more suited for implementing a scalable micro-kernel architecture.")]),e._v(" "),t("h3",{attrs:{id:"module-federation"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#module-federation"}},[e._v("#")]),e._v(" Module Federation")]),e._v(" "),t("p",[t("a",{attrs:{href:"https://webpack.js.org/concepts/module-federation/",target:"_blank",rel:"noopener noreferrer"}},[e._v("Module Federation"),t("OutboundLink")],1),e._v(" is a new feature introduced in webpack 5. Compared to micro-frontend frameworks, Rallie addresses problems more similar to those solved by Module Federation, as both are suitable for implementing decentralized micro-frontends. The difference is that Module Federation is a compile-time solution, allowing you to import modules from other applications as if they were local ES6 modules during runtime, while Rallie is a purely runtime solution where you must configure and use other applications with Rallie's APIs at runtime.")]),e._v(" "),t("p",[e._v("The runtime nature of Rallie also allows it to incorporate the advantages of micro-frontend frameworks, extending features like HTML entry, sandbox isolation, and reactive state sharing between applications.")])])}),[],!1,null,null,null);t.default=r.exports}}]);