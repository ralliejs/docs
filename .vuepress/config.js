module.exports = {
    title: 'Rallie.js',
    base: '/',
    descriptions: '微前端; rallie; module federation; 模块联邦; 前端服务化',
    themeConfig: {
        logo: '/logo.png',
        repo: 'ralliejs/rallie',
        docsRepo: 'ralliejs/docs',
        docsBranch: 'main',
        editLinks: true,
        editLinkText: '在Github上编辑此页',
        nav: [
            { text: '指南', link: '/guide/introduction' },
            { text: 'API', link: '/api/' },
        ],
        sidebar: {
            '/guide/': [
                ['introduction', '介绍'],
                ['install', '安装'],
                ['basic', '基础'],
                ['advance', '进阶'],
                ['ecosystem', '生态'],
            ],
            '/api/': [
                ['', 'API']
            ]
        },
        sidebarDepth: 3
    }
}
