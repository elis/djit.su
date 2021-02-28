import WorkerApi from './WorkerApi'

export default class JavascriptCompiler {
  options = {
    useWorker: true
  }
  constructor ({ staticPath, ...options }) {
    console.log('📦 staticPath:', staticPath)
    this.staticPath = staticPath
    this.options = options

    this._worker =
      new WorkerApi({
        useWorker: this.options.useWorker,
        staticPath: this.staticPath
      })
  }
  async compile (code, config) {
    console.log('📦 COMPILING:', code)
    const compiled = await this._worker.compile(code, config)
    console.log('compiled:', compiled)
    return compiled
  }
  async init () {
    console.log('📦 INITING:')
    const inited = await this._worker.init()
    console.log('INITED:', inited)
    return 'INITED!'
  }
}
