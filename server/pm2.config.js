// 文件名为 pm2.config.js
module.exports = {
    apps: [{
        name: "contractNode", // 应用名称
        script: "./index.js" // 入口文件
    }]
}