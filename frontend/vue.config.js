
module.exports = {
    devServer: {
        // host: "127.0.0.1",
        port: 8080, // 端口号
        https: false, // https:{type:Boolean}
        open: true, //配置自动启动浏览器
        // proxy: 'http://localhost:4000' // 配置跨域处理,只有一个代理
    
        // 配置多个代理
        proxy: {
            "/api": {
                target: "http://127.0.0.1:5000/", // 要访问的接口域名
                changeOrigin: true, 
                pathRewrite: {
                    "^/api": "" 
                }
            }
        }
    }
}
