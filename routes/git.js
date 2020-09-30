const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const exec = require('child_process').exec;
let sd = require('silly-datetime');
let config = require('../config');
router.post('/', (req, res, next) => {
    // let resBody = req.body; //Gitea
    // let message = resBody.commits ? resBody.commits[0].message : ''
    logger.log('*********************项目部署日志（' + sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '）**********************');
    // 判断项目是否存在
    if (fs.existsSync(config.rootPath + config.projectName)) {
        // 拉取项目
        console.log("正在拉取项目...");
        logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "正在拉取项目...");
        exec(`cd ${config.rootPath + config.projectName} && git pull`, { encoding: 'utf8' }, (error, stdout, stderr) => {
            if (error) {
                console.log('项目拉取失败：', error);
                logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '项目拉取失败!');
            } else {
                console.log("项目拉取成功！");
                logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "项目拉取成功！");
                if (config.scripts.stop) {
                    stopPm2()
                }
                // if (fs.existsSync(config.rootPath + config.projectName + config.packagePath + '/package.json')) {
                // 判断文件内容是否相等
                let fileIn = readFileIn().toString();
                let fileOut = readFileOut().toString();
                if (fileOut && fileIn && (fileIn == fileOut)) {
                    console.log("读取的package.json文件一致，无变化！");
                    logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "读取的package.json文件一致，无变化！");
                    buildProject();
                } else {
                    console.log("读取的package.json文件发生改变！");
                    logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "读取的package.json文件发生改变！");
                    deleteNode_modules();
                }
                // } else {
                //     deleteNode_modules();
                // }
            }
        });
    } else {
        // stopPm2()
        cloneProject()
    }
    res.json({ result: true, code: 200, mes: "请求成功！" });
});

//项目部署
function startProject() {
    console.log("项目部署中...");
    logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "项目部署中...");
    exec(`cd ${config.rootPath + config.projectName + config.packagePath} && ${config.scripts.restart}`, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
            console.log('项目部署失败：', error);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '项目部署失败！');
        } else {
            console.log("项目部署成功！");
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "项目部署成功！");
        }
    });
}

// 项目打包
function buildProject() {
    console.log('项目正在打包中...');
    logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '项目正在打包中...');
    exec(`cd ${config.rootPath + config.projectName + config.packagePath} && ${config.scripts.build}`, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
            console.log('项目打包失败：', error);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '项目打包失败！');
        } else {
            console.log("项目打包成功！");
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "项目打包成功！");
            // startProject();
            let fileIn = readFileIn().toString();
            let fileOut = readFileOut().toString();
            if (fileOut && fileIn && (fileIn == fileOut)) {
                if (config.scripts.restart) {
                    startProject()
                } else {
                    console.log("项目部署成功！");
                    logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "项目部署成功！");
                }

            } else {
                deletePackage()
            }

        }
    });
}

// 安装依赖
function initProject() {
    console.log('项目正在安装依赖中...');
    logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '项目正在安装依赖中...');
    exec(`cd ${config.rootPath + config.projectName + config.packagePath} && ${config.scripts.init ? config.scripts.init : "npm i"}`, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
            console.log('依赖安装失败：', error);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '依赖安装失败！');
        } else {
            console.log("依赖安装成功！");
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "依赖安装成功！");
            buildProject()
        }
    });
}

// clone 项目
function cloneProject() {
    console.log('项目正在克隆中...');
    logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '项目正在克隆中...');
    exec(`cd ${config.rootPath} && git clone ${config.git}`, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
            console.log('项目克隆失败：', error);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '项目克隆失败！');
        } else {
            console.log("项目克隆成功！");
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "项目克隆成功！");
            initProject()
        }
    });
}


// 复制package.json文件
function copyPackage() {
    console.log('复制package.json文件中...');
    logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '复制package.json文件中...');
    exec(`cp -n ${config.rootPath + config.projectName + config.packagePath}/package.json ${path.join(__dirname, '../log')}`, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
            console.log('package.json文件复制失败：', error);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + 'package.json文件复制失败！');
        } else {
            console.log('package.json文件复制成功！');
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + 'package.json文件复制成功！');
            if (config.scripts.restart) {
                startProject()
            } else {
                console.log("项目部署成功！");
                logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "项目部署成功！");
            }
        }
    });
}
// 删除package.json文件
function deletePackage() {
    console.log('删除package.json文件中...');
    logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '删除package.json文件中...');
    exec(`rm -rf ${path.join(__dirname, '../log/package.json')}`, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
            console.log('package.json文件删除失败：', error);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + 'package.json文件删除失败！');
        } else {
            console.log('package.json文件删除成功！');
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + 'package.json文件删除成功！');
            copyPackage()
        }
    });
}

// 暂停 pm2
function stopPm2() {
    exec(`cd ${config.rootPath + config.projectName + config.packagePath} && ${config.scripts.stop}`, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
            console.log('暂停 pm2 失败：', error);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '暂停 pm2 失败！');
        } else {
            console.log(`暂停 pm2 ${config.projectName} 服务暂停成功！`);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '系统服务暂停成功！');
        }
    });
}
// 删除项目依赖
function deleteNode_modules() {
    console.log('正在删除node_modules中...');
    logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '正在删除node_modules中...');
    exec(`cd ${config.rootPath + config.projectName + config.packagePath} && rm -rf node_modules`, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
            console.log('项目依赖删除失败：', error);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '项目依赖删除失败！');
        } else {
            console.log("项目依赖删除成功！");
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "项目依赖删除成功！");
            initProject()
        }
    });
}
// 读取备份package.json
function readFileOut() {
    // console.log('正在读取备份package.json中...');
    // logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '正在读取备份package.json中...');
    return fs.readFileSync(`${path.join(__dirname, '../log/package.json')}`, function (err, data) {
        if (err) {
            console.log("文件读取失败 out：" + err);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "文件读取失败 out！");
            return false;
        } else {
            // console.log("文件读取成功！out");
            // console.log("文件读取成功！out");
            return data.toString()
        }
    });
}
// 读取package.json
function readFileIn() {
    // console.log('正在读取原package.json中...');
    // logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '正在读取原package.json中...');
    return fs.readFileSync(config.rootPath + config.projectName + config.packagePath + "/package.json", function (err, data) {
        if (err) {
            console.log("文件读取失败 in：" + err);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "文件读取失败 in！");
            return false;
        } else {
            // console.log("文件读取成功！in");
            // logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "文件读取成功！in");
            return data.toString()
        }
    });
}


let options = {
    flags: 'a', // 
    encoding: 'utf8', // utf8编码
}
let stderr = fs.createWriteStream(path.join(__dirname, '../log/index.log'), options);
// 创建logger
let logger = new console.Console(stderr);
module.exports = router;