import Crawler, { CrawlerRequestResponse, CreateCrawlerOptions } from "crawler";

type InitSeed =
  | string
  | ReadonlyArray<string>
  | Crawler.CrawlerRequestOptions
  | ReadonlyArray<Crawler.CrawlerRequestOptions>
  | (() => InitSeed)

type PageParserParams = CrawlerRequestResponse

type PageParserHandle = ((res: PageParserParams) => void)

type PageType = string

type PageParser =
  | PageParserHandle
  | Record<PageType, PageParserHandle>

export const runCrawler = (initSeed: InitSeed, pageParser: PageParser, options?: CreateCrawlerOptions): Crawler => {
  const crawler = new Crawler({
    maxConnections: 2,
    encoding: 'utf-8',
    jQuery: true,
    // 在每个请求处理完毕后将调用此回调函数
    callback: function (error, res, done) {
      if (error) {
        console.error(error.message);
        done();
        return;
      }

      const pageType = res.options.pageType;


      // 单一解析器
      if (pageParser instanceof Function) {

        if (pageType) {
          console.error('定义了页面类型，但是未区分解析器');
          throw new Error('定义了页面类型，但是未区分解析器')
        }

        pageParser(res)
        done()
        return
      }


      if (!pageParser[pageType]) {
        console.error('页面解析类型不存在');

        throw new Error("页面解析类型不存在")
      }

      pageParser[pageType](res)
      done()
      return
    },
    ...options
  });

  // 开始加入种子
  let finalSeed = initSeed instanceof Function ? initSeed() : initSeed
  crawler.queue(finalSeed)

  return crawler;
}