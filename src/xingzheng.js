const Crawler = require("crawler");
const fs = require("fs");

function getBaseUrl(urlStr = "") {
    const url = new URL(urlStr);
    const basePath = url.pathname.replace(/\/[^/]*$/, '/');
    return url.origin + basePath;
}


let total = 1;
let handled = 0;

const c = new Crawler({
    maxConnections: 2,
    // 在每个请求处理完毕后将调用此回调函数
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            handled += 1;

            switch (res.options.level) {
                case "top":
                    handleTop(res);
                    break;
                case 'province':
                    handleProvince(res);
                    break;
                case 'city':
                    handleCity(res);
                    break;
                case 'county':
                    handleCounty(res);
                    break;
                case 'town':
                    handleTown(res);
                    break;
                case 'village':
                    handleVillage(res);
                    break;
                default:
                    console.warn("未知type");
            }
        }
        done();
    }
});


const file = fs.openSync("quhua.csv","w");
fs.writeFileSync(file, "uid,name,parent_uid,level,urban_rural_classify\n", {flag: 'a'});

// 将一段HTML代码加入请求队列，即不通过抓取，直接交由回调函数处理（可用于单元测试）
c.queue([{
    uri: 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2021/index.html',
    level: "top"
}]);

// c.queue("http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2021/index.html");
// c.queue("http://www.baidu.com");

function handleTop({ request, $ }) {
    const baseURL = getBaseUrl(request.href);
    $('tr.provincetr td > a').each(function (idx, el) {
        const a = $(el);
        const nextHref = a.attr('href');
        const name = a.text().trim();
        const code = nextHref.match(/^(\d+)\./)[1] + "0000000000";

        const data = {
            name: name,
            level: "province",
            uid: code,
            parent_uid: "000000000000"
        };

        saveData(data);

        c.queue({
            level: "province",
            uri: baseURL + nextHref,
            parent_uid: code,
        });
        total += 1;
    });
}


function handleProvince({ request, $, options }) {
    const baseURL = getBaseUrl(request.href);
    $('tr.citytr').each(function (idx, el) {

        const as = $(el).find('a');
        if (as.length !== 2) {
            console.warn('解析省份数据不是两个');
            return;
        }

        const nextHref = $(as[0]).attr('href');

        const code = $(as[0]).text().trim();
        const name = $(as[1]).text().trim();


        const data = {
            name: name,
            level: "city",
            uid: code,
            parent_uid: options.parent_uid,
        };

        saveData(data);

        c.queue({
            level: "city",
            uri: baseURL + nextHref,
            parent_uid: code,
        });
        total += 1;
    });
}


function handleCity({ request, $, options }) {
    const baseURL = getBaseUrl(request.href);
    $('tr.countytr').each(function (idx, el) {

        const as = $(el).find('td');
        if (as.length !== 2) {
            console.warn('数据地级市不是两个');
            // debugger
            console.log($(el).html());
            console.log(options.uri);
            throw new Error();
            return;
        }


        const code = $(as[0]).text().trim();
        const name = $(as[1]).text().trim();

        const nextHref = $(as[0]).find("a").attr('href');


        const data = {
            name: name,
            level: "county",
            uid: code,
            parent_uid: options.parent_uid,
        };

        saveData(data);

        if (nextHref) {

            c.queue({
                level: "county",
                uri: baseURL + nextHref,
                parent_uid: code,
            });
            total += 1;
        }

    });
}

function handleCounty({ request, $, options }) {
    const baseURL = getBaseUrl(request.href);
    $('tr.towntr').each(function (idx, el) {

        const as = $(el).find('td');
        if (as.length !== 2) {
            console.warn('县级数据不是两个');
            return;
        }


        const code = $(as[0]).text().trim();
        const name = $(as[1]).text().trim();

        const nextHref = $(as[0]).find("a").attr('href');


        const data = {
            name: name,
            level: "town",
            uid: code,
            parent_uid: options.parent_uid,
        };

        saveData(data);
        if (nextHref) {
            c.queue({
                level: "town",
                uri: baseURL + nextHref,
                parent_uid: code,
            });
            total += 1;
        }
    });
}

function handleTown({ request, $, options }) {
    const baseURL = getBaseUrl(request.href);
    $('tr.villagetr').each(function (idx, el) {

        const as = $(el).find('td');
        if (as.length !== 3) {
            console.warn('乡镇数据不是三个');
            return;
        }

        const code = $(as[0]).text().trim();
        const classify = $(as[1]).text().trim();
        const name = $(as[2]).text().trim();

        const data = {
            name: name,
            level: "village",
            uid: code,
            parent_uid: options.parent_uid,
            urban_rural_classify: classify,
        };

        saveData(data);
    });
}


function saveData(data) {
    console.log(`${handled}/${total}`);

    fs.writeFileSync(file, `${data.uid},${data.name},${data.parent_uid},${data.level},${data.urban_rural_classify || ''}\n`, {flag: 'a'});
}