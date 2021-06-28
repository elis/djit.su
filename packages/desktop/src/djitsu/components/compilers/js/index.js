import merge from 'lodash/fp/merge'
import WorkerApi from './WorkerApi'
import Execute from './execute'
import Djot from './djot'

import { babelConfig } from './settings'

export default class JavascriptCompiler {
  options = {
    useWorker: true
  }

  constructor(options = {}) {
    this.options = options

    // eslint-disable-next-line no-underscore-dangle
    this.worker = new WorkerApi({
      useWorker: this.options.useWorker
    })
  }

  async compile(code, config = {}) {
    const conf = merge({}, babelConfig, config)
    const compiled = await this.worker.compile(code, conf)
    return compiled
  }

  // eslint-disable-next-line class-methods-use-this
  async djot(code, options) {
    return Djot(code, options)
  }

  async execute(code, config) {
    return Execute(code, config)
  }
}
