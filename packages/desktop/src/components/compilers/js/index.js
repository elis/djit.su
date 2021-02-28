import WorkerApi from './WorkerApi'
import execute from './execute'
import {walkCode} from './walker'
// import { execute, executeCode } from '../javascript/executor'

export default class JavascriptCompiler {
  options = {
    useWorker: true
  }
  constructor (options = {}) {
    this.options = options

    this._worker =
      new WorkerApi({
        useWorker: this.options.useWorker
      })
  }
  async compile (code, config) {
    console.log('📦 COMPILING:', code)
    const compiled = await this._worker.compile(code, config)
    console.log('compiled:', compiled)
    return compiled
  }
  async walk (code, options) {
    return walkCode(code, options)
  }
  async execute (code, config) {
    console.log('📦🐝 EXECUTING:', {code})
    return execute(code, config)
    // return execute(code, {
    //   context: {
    //     test: 'works',
    //     imports: ['react'],
    //     loader: (module, test) => {
    //       console.log('Loading:', module, {test})
    //     }
    //   }
    // })
  }
  async init () {
    console.log('📦 INITING:')
    const inited = await this._worker.init()
    console.log('INITED:', inited)
    return 'INITED!'
  }
}
