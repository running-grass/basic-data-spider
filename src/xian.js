const Crawler = require("crawler");
const fs = require("fs");


const file = fs.openSync("xian.output.csv","w");
fs.writeFileSync(file, "uid,station,population,area,area_code,postal_code,type1\n", {flag: 'a'});

const c = new Crawler({
    maxConnections: 2,
    encoding:null,
    jQuery:false,// 
    // 在每个请求处理完毕后将调用此回调函数
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {

            const data = JSON.parse(res.body);
            let content = "";
            Object.keys(data).forEach(k => {
                const info = data[k];
                const code = `${k}000000`;
                if (!info[3]) return;
                content += `${code},${info[1]},${info[2]},${info[3]},${info[4]},${info[5]},${info[6]}\n`;
            })

            fs.writeFileSync(file,content, {flag: 'a'});
        }
        done();
    }
});



// 将一段HTML代码加入请求队列，即不通过抓取，直接交由回调函数处理（可用于单元测试）
c.queue([{
    uri: 'http://xzqh.mca.gov.cn/getInfo?code=100000&type=1',
}]);
