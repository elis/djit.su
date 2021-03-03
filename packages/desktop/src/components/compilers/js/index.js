import WorkerApi from './WorkerApi'
import execute from './execute'
import djot from './djot'
import {walkCode} from './walker'
// import { execute, executeCode } from '../javascript/executor'

import merge from 'lodash/fp/merge'
import { babelConfig } from './settings'
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
  async compile (code, config = {}) {
    console.log('📦 COMPILING:', code)
    const conf = merge({}, babelConfig, config)
    console.log('📦 Babel Config:', conf)
    const compiled = await this._worker.compile(code, conf)
    console.log('compiled:', compiled)
    return compiled
  }
  async walk (code, options) {
    return walkCode(code, options)
  }
  async djot (code, options) {
    return djot(code, options)
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
