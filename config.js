module.exports = {
    port: 8889,//部署端口号
    git: "https://github.com/zlluGitHub/vuepress-blog.git",//http方式:git clone 地址
    rootPath: "/root/zll-blog/", //项目部署的根目录{绝对路径}
    projectName: "vuepress-blog",//git上的项目名称
    packagePath: "",//需要安装依赖的根目录{默认根目录（若二级目录/xxx}
    web: "vuepress-blog/docs/.vuepress/dist",//web容器{相对根目录路径}
    assetsPath: "vuepress-blog/docs/assets",//静态资源容器{相对根目录路径}
    scripts: { //项目的部署命令
        build: "npm run build",
        stop: "", //"pm2 stop 10"
        restart: "" // "pm2 restart 10"
    }

};