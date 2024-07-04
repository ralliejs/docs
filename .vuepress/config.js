module.exports = {
  title: "Rallie.js",
  base: "/",
  descriptions: "微前端; rallie; module federation; 模块联邦; 前端服务化",
  locales: {
    "/": {
      lang: "English",
    },
    "/zh/": {
      lang: "简体中文",
    },
  },
  themeConfig: {
    locales: {
      "/": {
        selectText: "Languages",
        editLinkText: "Edit in Github",
        nav: [
          { text: "Guide", link: "/guide/introduction" },
          { text: "API", link: "/api/" },
        ],
        sidebar: {
          "/guide/": [
            ["introduction", "Introduction"],
            ["install", "Install"],
            ["basic", "Basic"],
            ["advance", "Advance"],
            ["ecosystem", "Ecosystem"],
          ],
          "/api/": [["", "API"]],
        },
      },
      "/zh/": {
        selectText: "语言",
        editLinkText: "在Github上编辑此页",
        nav: [
          { text: "指南", link: "/zh/guide/introduction" },
          { text: "API", link: "/zh/api/" },
        ],
        sidebar: {
          "/zh/guide/": [
            ["introduction", "介绍"],
            ["install", "安装"],
            ["basic", "基础"],
            ["advance", "进阶"],
            ["ecosystem", "生态"],
          ],
          "/zh/api/": [["", "API"]],
        },
      },
    },
    logo: "/logo.png",
    repo: "ralliejs/rallie",
    docsRepo: "ralliejs/docs",
    docsBranch: "main",
    editLinks: true,
    sidebarDepth: 3,
  },
};
