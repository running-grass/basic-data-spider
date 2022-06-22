# 自用的爬虫脚本

## 安装依赖
```bash
pnpm i

```

## 项目结构
```
/src
- pachong.ts // 对crawler的二次封装，简化样板代码
- utils/ // 工具函数目录
--  CsvSaver.ts // 爬虫结果写入到csv文件的工具类

- xian.ts 爬取县级数据的爬虫
- xiaoxue.ts 爬取所有中小学数据的爬虫
- xingzheng.ts 爬取五级行政区划数据的爬虫

```

## 运行爬虫

### vscode（可以debugger）

1. 依次点击 【终端】 => 【运行生成任务】 => 【tsc:watch】。 编译ts文件
2. 编辑.vscode/launtch.json文件，
```json
  "program": "${workspaceFolder}/src/xiaoxue.ts", // 这一行修改为要调试的ts文件
```
3. 启动调试


### 命令行

1. 编译ts
```bash
tsc --watch

```

2. 运行命令
```
node --experimental-modules --es-module-specifier-resolution=node dist/xiaoxut.js
```