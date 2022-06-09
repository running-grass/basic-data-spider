import { CsvSaver } from "./utils/CsvSaver";

import Crawler from "crawler";

interface Row {
    uid: string
    station: string
    population: string
    area: string
    area_code: string
    postal_code: string
    type1: string
}


const cvsSaver = new CsvSaver<Row>("./output/xian.csv")

const c = new Crawler({
    maxConnections: 2,
    encoding: null,
    jQuery: false,// 
    // 在每个请求处理完毕后将调用此回调函数
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {

            const data = JSON.parse(res.body.toString());
            Object.keys(data).forEach(k => {
                const info = data[k];
                const code = `${k}000000`;
                if (!info[3]) return;

                cvsSaver.saveRow({
                    uid: code,
                    station: info[1],
                    population: info[2],
                    area: info[3],
                    area_code: info[4],
                    postal_code: info[5],
                    type1: info[6],
                })
            })
        }
        done();
    }
});


// 将一段HTML代码加入请求队列，即不通过抓取，直接交由回调函数处理（可用于单元测试）
c.queue([{
    uri: 'http://xzqh.mca.gov.cn/getInfo?code=100000&type=1',
}]);
