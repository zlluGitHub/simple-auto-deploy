module.exports = {
    port: 8889,//部署端口号
    projectName: "Food-Traceability.cn",//git上的项目名称
    git: "http://10.0.90.79/DataPid/Food-Traceability.cn.git",//http方式:git clone 地址
    packagePath: "/Food-Traceability",//需要安装依赖的根目录
    rootPath: "/data/", //项目部署的根目录
    scripts: { //项目的部署命令
        // init: "npm i",
        build: "npm run build",
        stop: "pm2 stop nuxt",
        restart: "pm2 restart nuxt",
    }
};