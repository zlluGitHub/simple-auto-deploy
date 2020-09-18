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
        exec(`cd ${config.rootPath + config.projectName} && git pull`, { encoding: 'utf8' }, (error, stdout, stderr) => {
            if (error) {
                console.log('项目pull失败：', error);
                logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '项目pull失败!');
            } else {
                console.log("项目pull成功！");
                logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "项目pull成功！");
                stopPm2()
                if (fs.existsSync(config.rootPath + config.projectName + config.packagePath + '/package.json')) {
                    // 判断文件内容是否相等
                    let fileIn = readFileIn().toString();
                    let fileOut = readFileOut().toString();
                    if (fileOut && fileIn && (fileIn == fileOut)) {
                        buildProject();
                    } else {
                        deleteProject();
                    }
                } else {
                    deleteProject();
                }
            }
        });
    } else {
        stopPm2()
        cloneProject()
    }
    res.json({ result: true, code: 200, mes: "请求成功！" });
});

// 项目部署
function startProject() {
    exec(`cd ${config.rootPath + config.projectName + config.packagePath} && ${config.scripts.restart}`, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
            console.log('项目部署失败：', error);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '项目部署失败！');
        } else {
            console.log("项目部署成功！");
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "项目部署成功！");
            deletePackage()
        }
    });
}

// 项目打包
function buildProject() {
    exec(`cd ${config.rootPath + config.projectName + config.packagePath} && ${config.scripts.build}`, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
            console.log('项目打包失败：', error);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '项目打包失败！');
        } else {
            console.log("项目打包成功！");
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "项目打包成功！");
            startProject();
        }
    });
}

// 安装依赖
function initProject() {
    exec(`cd ${config.rootPath + config.projectName + config.packagePath} && ${config.scripts.init?config.scripts.init:"npm i"}`, { encoding: 'utf8' }, (error, stdout, stderr) => {
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
    exec(`cp -n ${config.rootPath + config.projectName + config.packagePath}/package.json ${path.join(__dirname, '../log')}`, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
            console.log('package.json文件复制失败：', error);
            // logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + 'package.json文件复制失败！');
        } else {
            console.log('package.json文件复制成功！');
            // logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + 'package.json文件复制成功！');
        }
    });
}
// 删除package.json文件
function deletePackage() {
    exec(`rm -rf ${path.join(__dirname, '../log/package.json')}`, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
            console.log('package.json文件删除失败：', error);
            // logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + 'package.json文件删除失败！');
        } else {
            console.log('package.json文件删除成功！');
            copyPackage()
            // logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + 'package.json文件删除成功！');
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
            console.log('暂停 pm2 nuxt(21) 成功！');
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '系统服务暂停成功！');
        }
    });
}
// 删除项目
function deleteProject() {
    exec(`cd ${config.rootPath} && rm -rf ${config.projectName}`, { encoding: 'utf8' }, (error, stdout, stderr) => {
        if (error) {
            console.log('项目删除失败：', error);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + '项目删除失败！');
        } else {
            console.log("项目删除成功！");
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "项目删除成功！");
            cloneProject()
        }
    });
}
// 读取备份package.json
function readFileOut() {
    return fs.readFileSync(`${path.join(__dirname, '../log/package.json')}`, function (err, data) {
        if (err) {
            console.log("文件读取失败 out：" + err);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "文件读取失败 out！");
            return false;
        } else {
            console.log("文件读取成功！out");
            console.log("文件读取成功！out");
            return data.toString()
        }
    });
}
// 读取package.json
function readFileIn() {
    return fs.readFileSync(config.rootPath + config.projectName + config.packagePath + "/package.json", function (err, data) {
        if (err) {
            console.log("文件读取失败 in：" + err);
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "文件读取失败 in！");
            return false;
        } else {
            console.log("文件读取成功！in");
            logger.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss') + '：' + "文件读取成功！in");
            return data.toString()
        }
    });
}


let options = {
    flags: 'a', // 
    encoding: 'utf8', // utf8编码
}
let stderr = fs.createWriteStream(path.join(__dirname, '../log/out.log'), options);
// 创建logger
let logger = new console.Console(stderr);
module.exports = router;