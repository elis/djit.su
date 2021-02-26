import WorkerApi from './WorkerApi'

export default class JavascriptCompiler {
  options = {
    useWorker: true
  }
  _worker = new WorkerApi({
    useWorker: this.options.useWorker,
    staticPath: this.staticPath
  })
  constructor ({ static: staticPath, ...options }) {
    this.staticPath = staticPath
    this.options = options
  }
  async compile (code, config) {
    console.log('📦 COMPILING:', code)
    const compiled = await this._worker.compile(code, config)
    console.log('compiled:', compiled)
    return 'COMPILED!'
  }
}
