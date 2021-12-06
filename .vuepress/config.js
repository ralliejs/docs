module.exports = {
    title: 'Rallie.js',
    base: '/docs/',
    descriptions: '微前端; rallie; module federation; 模块联邦; 前端服务化',
    themeConfig: {
        logo: '/logo.png',
        lastUpdated: 'Last Updated',
        repo: 'ralliejs/rallie',
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
    },
}