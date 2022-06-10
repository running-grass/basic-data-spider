import Crawler, { CrawlerRequestResponse } from "crawler"
import { CsvSaver } from "./utils/CsvSaver"
import { runCrawler } from './pachong'
interface School {
  code: string
  name: string
  tel: string
  leader: string
  addr: string
}

const cvsSaver = new CsvSaver<School>("./output/xiaoxue2.csv")

const c = runCrawler((crawler) => {
  const arr : any[] = []
  for (let page = 1; page <= 147; page++) {
    arr.push({
      pageType: 'list',
      uri: `https://xuexiao.pinwaiyi.com/hy/list.php?fid=1&page=${page}`
    });
  }
  return arr
}, {
  list: ({ request: { uri }, $ }: CrawlerRequestResponse) => {
    const baseURL = `${uri.protocol}//${uri.hostname}`

    // 解析详情页地址
    $('.title a').each(function (idx, el) {
      const nextHref = $(el).attr('href');
      c.queue({
        pageType: "detail",
        uri: baseURL + nextHref,
      });

    });

  },
  detail: ({ request: { uri }, $ }: CrawlerRequestResponse) => {

    // 解析数据
    const name = $('.leftinfo tr:last-child td center:nth-child(2)').text().trim()
    const code = $('.leftinfo tr:last-child td center:nth-child(5)').text().match(/学校代码：(.*)/)?.[1].trim() ?? ''

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
})


export { }