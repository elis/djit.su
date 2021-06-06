import WorkerApi from './WorkerApi'
import execute from './execute'
import djot from './djot'

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
    const conf = merge({}, babelConfig, config)
    const compiled = await this._worker.compile(code, conf)
    return compiled
  }
  async djot (code, options) {
    return djot(code, options)
  }
  async execute (code, config) {
    return execute(code, config)
  }
}
