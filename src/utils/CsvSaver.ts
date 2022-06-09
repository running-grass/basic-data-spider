import fs from "fs";
import { resolve } from "path"

type FileDescriptor = number

export class CsvSaver<T extends Object> {
  public filepath: string;

  public fileDescriptor: FileDescriptor;

  private hasWriteHead = false;

  private headKeys: string[] = null;

  constructor(filepath) {
    this.filepath = filepath;
    this.fileDescriptor = fs.openSync(resolve(filepath), 'w');
  }

  public saveRow(data: T) {
    this.writeHead(data);

    const str = this.getRowString(data);
    fs.writeFile(this.fileDescriptor, str, { flag: 'a' }, () => { });
  }

  public saveRowSync(data: T) {
    this.writeHead(data);

    const str = this.getRowString(data);
    fs.writeFileSync(this.fileDescriptor, str, { flag: 'a' });
  }

  public close() {
    fs.closeSync(this.fileDescriptor);
  }

  private getRowString(data: T) {
    const ks = this.getKeys(data);

    const arr = [];

    ks.forEach(k => {
      arr.push(data[k] ?? '');
    });

    return arr.join(',') + '\n';
  }

  private getKeys(data?: T) {
    if (this.headKeys) {
      return this.headKeys;
    }

    if (data) {
      const ks = Object.keys(data);
      this.headKeys = ks;
      return ks;
    } else {
      throw "错误";
    }

  }

  private writeHead(data: T) {
    if (this.hasWriteHead) {
      return;
    }

    this.hasWriteHead = true;
    const ks = this.getKeys(data);

    let str = ks.join(',') + "\n";
    fs.writeFileSync(this.fileDescriptor, str, { flag: 'a' });
  }
}
