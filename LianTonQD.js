// cron "3 0 * * *" script-path=LianTonQD.js,tag=联通签到
// let $ = new Env('联通余量v4-签到')

// 0:03签到
const path = require('path')
const fs = require('fs')
const request = require("request");
const ucd = process.cwd()
const filePath = path.resolve(ucd);
const QueryPoints = (cookie) => new Promise ((resolve, reject) => {
    let opts = {
        url: "https://act.10010.com/SigninApp/signin/getIntegral",
        method: "POST",
        headers: {
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
            'Content-Type': 'application/json',
            cookie
        }
    };
    request(opts, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let ret = JSON.parse(body)
            let status = ret.status
            if (status === '0000'){
                console.log(`[簽到積分] 当前 ${ret.data['integralTotal']} 积分`)
                resolve(ret.data['integralTotal']);
            }else {
                console.log("QueryPoints")
                reject(ret)
            }
        } else {
            reject(error)
        }
    });
})
const IFsignin = (cookie) => new Promise ((resolve, reject) => {
    let opts = {
        url: "https://act.10010.com/SigninApp/signin/getContinuous",
        method: "POST",
        headers: {
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
            'Content-Type': 'application/json',
            cookie
        }
    };
    request(opts, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let ret = JSON.parse(body)
            let status = ret.status
            if (status === '0000'){
                if (ret.data['todaySigned'] === '1'){
                    console.log("[簽到積分] 未签到")
                    resolve("[簽到積分] 未签到");
                } else {
                    reject("[簽到積分] 你已经签到了！")
                }

            }else {
                console.log("IFsignin")
                reject(ret)
            }
        } else {
            console.warn(error, "错误！")
            reject(error)
        }
    });
})
const Ksignin = (cookie) => new Promise ((resolve, reject) => {
    let opts = {
        url: "https://act.10010.com/SigninApp/signin/daySign",
        method: "POST",
        headers: {
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
            'Content-Type': 'application/json',
            cookie
        }
    };
    request(opts, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let ret = JSON.parse(body)
            let status = ret.status
            if (status === '0000'){
                console.log("[簽到積分] 签到成功!")
                resolve("[簽到積分] 签到成功!");
            }else {
                console.log("Ksignin")
                reject(ret)
            }
        } else {
            console.warn(error, "错误！")
            reject(error)
        }
    });
})
const signin = (cookie) => new Promise ((resolve, reject) => {
    console.log(`🔛 [準備簽到] 開始`)
    console.log(`[当前时间] ${new Date().toLocaleString('zh')}`)
    QueryPoints(cookie)
        .then((points) => IFsignin(cookie))
        .then((m) => Ksignin(cookie))
        .then((m) => QueryPoints(cookie))
        .then((s) => resolve(s))
        .catch((err) => reject(err))
})
const main = (filePath) => {
    try {
        fs.readdir(filePath, function (err, files) {
            if (err) {
                console.warn(err, "读取文件夹错误！")
                reject(err)
            } else {
                files.forEach(function (filename) {
                    let filedir = path.join(filePath, filename);
                    fs.stat(filedir, function (eror, stats) {
                        if (eror) {
                            console.warn('获取文件stats失败');
                            reject(eror)
                        } else {
                            let isFile = stats.isFile();
                            if (isFile) {
                                if (path.basename(filedir).indexOf('cookie') !== -1) {
                                    console.log('现在开始的cookie => ' + path.basename(filedir));
                                    let file = fs.readFileSync(filedir, { encoding: "utf-8" })
                                    signin(file)
                                        .then((m) => console.log(m))
                                        .catch(err => console.log(err))
                                }
                            }
                        }
                    })
                });
            }
        });
    } catch (err) {
        console.warn(err, "错误！")
        console.log(err)
    }
}

main(filePath)