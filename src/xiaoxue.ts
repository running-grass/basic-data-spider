import Crawler, { CrawlerRequestResponse } from "crawler"
import { CsvSaver } from "./utils/CsvSaver"

interface School {
  code: string
  name: string
  tel: string
  leader: string
  addr: string
}


const cvsSaver = new CsvSaver<School>("./output/xiaoxue1.csv")


const c = new Crawler({
  maxConnections: 2,
  encoding: 'utf-8',
  jQuery: true,// 
  // 在每个请求处理完毕后将调用此回调函数
  callback: function (error, res, done) {
    switch (res.options.type) {
      case 'list':
        parseList(res);
        break;
      case 'detail':
        parseDetail(res);
        break
    }
    done();
  }
})


function parseList({ request: { uri }, $ }: CrawlerRequestResponse) {
  const baseURL = `${uri.protocol}//${uri.hostname}`

  // 解析详情页地址
  $('.title a').each(function (idx, el) {
    const nextHref = $(el).attr('href');
    c.queue({
      type: "detail",
      uri: baseURL + nextHref,
    });
    
  });

}



function parseDetail({ request: { uri }, $ }: CrawlerRequestResponse) {

  // 解析数据
  const name = $('.leftinfo tr:last-child td center:nth-child(2)').text().trim()
  const code = $('.leftinfo tr:last-child td center:nth-child(5)').text().match(/学校代码：(.*)/)[1].trim()
 
  const tel = $('.homepage_right td.content tr:nth-child(2) tr:nth-child(2) td:last-child').text().trim()

  const leader = $('.homepage_right td.content tr:nth-child(2) tr:nth-child(5) td:last-child').text().trim()

  const addr = $('.homepage_right td.content tr:nth-child(2) tr:nth-child(9) td:last-child').text().trim()

  cvsSaver.saveRow({
    code,
    name,
    tel,
    leader,
    addr
  })

}

// for (let page = 1; page <= 147; page++) {
for (let page = 1; page <= 1; page++) {
  c.queue([{
    type: 'list',
    uri: `https://xuexiao.pinwaiyi.com/hy/list.php?fid=1&page=${page}`
  }]);
}

export { }