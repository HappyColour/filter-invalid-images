/*
  ## 删除项目中未使用图片

  使用方法:
  1.将此app.js文件放进项目根目录中
  2.资源根目录: sourceSrcDir修改为图片的根目录（例：C://Users/Coder/Desktop/images）
  3.代码根目录：codeSrcDir修改为存放代码的目录（例：C://Users/Coder/Desktop）
  4.要搜索的文件类别：codeName为要遍历的文件类别（例：codeName = [".vue", ".scss"];）
  5. 进入项目终端，安装模块 yarn add line-reader
  6. 进入项目终端，启动文件： node app.js
*/

const path = require("path"); //路径
const fs = require("fs"); //文件系统
const lineReader = require('line-reader'); //从文件中读取文本行
// const nodeCmd = require('node-cmd'); //Node.js命令行/终端接口

/** 项目根目录 */
var projectSrcDir = "";
/** 资源根目录 */
var sourceSrcDir = "";
/** 资源引用前缀(资源根目录) */
var sourceSrc = "";
/** 代码根目录 */
var codeSrcDir = "";
/** 资源数组 */
var sourceArr = [];
/** 代码中未引用资源数组 */
var noSourceArr = [];
/** 文件扩展名 */
var codeName = [];

findAllSource();

/**
 * 查找所有资源文件
 */
function findAllSource() {
  console.log("查找所有资源文件");
  getFileList(sourceSrcDir, 'image').then(() => {
    setTimeout(function () {

      console.log("等待10秒资源文件读取完毕" + sourceArr.length);
      console.log(sourceArr);
      console.log("遍历js");
      getFileList(codeSrcDir, "code").then(() => {
        setTimeout(function () {
          console.log("等待30秒js文件读取完毕" + sourceArr.length);
          console.log(sourceArr);
          sourceArr.forEach(item => {
            if (!item[1]) { //如果资源未引用
              noSourceArr.push(item[0]);
              fs.unlink(item[2], (err) => {
                if (err) {
                  console.log("删除失败");
                } else {
                  console.log("删除成功: " + item[2]);
                }
              })
            }
          })
          console.log("获取未引用资源文件" + noSourceArr.length);
          console.log(noSourceArr);
        }, 20000);
      });
    }, 10000);
  })
}

/**
 * 获取文件数组
 * @param {*} filePath 文件根目录
 * @param {*} fileType 文件类型
 */
function getFileList(filePath, fileType) {
  var filePath = path.resolve(filePath); //将路径或路径片段的序列解析为绝对路径

  var p = new Promise(function (resolve, reject) {
    console.log("获取需要遍历的文件路径: " + filePath);
    console.log("获取需要遍历的文件类型: " + fileType);
    fileDisplay(filePath, fileType);
    resolve();
  });

  return p;
}

/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function fileDisplay(filePath, fileType) {

  fs.readdir(filePath, function (err, files) { //fs.readdir异步读取文件目录, 读取目录的内容。 回调有两个参数 (err, files)，其中 files 是目录中的文件名的数组（不包括 '.' 和 '..'）
    if (err) {
      console.warn(err)
    } else {

      files.forEach(function (filename) {

        var filedir = path.join(filePath, filename); //使用平台特定的分隔符作为定界符将所有给定的 path 片段连接在一起，然后规范化生成的路径

        fs.stat(filedir, function (eror, stats) { //Stats 对象提供有关文件的信息
          if (eror) {
            console.warn('获取文件stats失败');
          } else {
            var isFile = stats.isFile();
            var isDir = stats.isDirectory();

            if (fileType == "image") {
              if (isFile && (path.extname(filedir) == ".jpg" || path.extname(filedir) == ".png")) { //extname返回 path 的扩展名
                let strs1 = filedir.substring(sourceSrcDir.length, filedir.length).replace(/\\/g, '/');
                sourceArr.push([strs1, false, filedir.replace(/\\/g, '/')]);
              }
            }

            if (fileType == "code") {
              let isTrue = false; //是否符合文件类型
              if (isFile) {
                codeName.forEach(item => {
                  if (path.extname(filedir) == item) {
                    isTrue = true;
                    // break;
                  }
                })
                if (isTrue) {
                  let indexContent = ""; //文本内容，可修改
                  lineReader.eachLine(filedir, function (line, last) { //异步逐行读取文件
                    sourceArr.forEach((item, index) => {
                      if (line.indexOf(item[0]) != -1) { //如果当前行引用了资源文件
                        sourceArr[index][1] = true; //将当前资源置为已引用状态
                      }
                    })
                    indexContent += line + "\n";
                    if (last) {
                      console.log(filedir + "文件遍历方法");
                      fs.writeFileSync(filedir, indexContent); //异步写入
                      // return false;
                    }
                  });
                }
              }
            }
            if (isDir) {
              fileDisplay(filedir, fileType);
            }
          }
        })
      });
    }
  });

}
