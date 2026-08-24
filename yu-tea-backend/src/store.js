import fs from "node:fs";
import path from "node:path";

export class JsonStore {
  constructor({ file, seed }) {
    this.file = file;
    this.seed = structuredClone(seed);
    this.data = structuredClone(seed);
    this.queue = Promise.resolve();
  }

  async init() {
    if (!this.file) return this;
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    if (fs.existsSync(this.file)) {
      this.data = JSON.parse(fs.readFileSync(this.file, "utf8"));
    } else {
      await this.save();
    }
    return this;
  }

  read(selector = (data) => data) {
    return selector(this.data);
  }

  update(mutator) {
    const task = this.queue.catch(() => undefined).then(async () => {
      const result = await mutator(this.data);
      await this.save();
      return result;
    });
    this.queue = task;
    return task;
  }

  async save() {
    if (!this.file) return;
    const temp = `${this.file}.tmp`;
    fs.writeFileSync(temp, `${JSON.stringify(this.data, null, 2)}\n`);
    fs.renameSync(temp, this.file);
  }

  async reset() {
    this.data = structuredClone(this.seed);
    await this.save();
  }
}
