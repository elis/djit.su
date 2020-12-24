import React from 'react'
import noop from 'lodash/noop'
import { useSSR } from './ssr.context'
import hash from 'object-hash'
import serialize from 'serialize-javascript'
import usePreload from './use-preload'

export { usePreload }
const name = 'graze-ssr-preload'
const GLOBAL_NAME = 'SSRPreload'

export const options = {
  maxTimeout: 800,
  defaults: {
    timeout: 300
  }
}

const makeStack = () => {
  const makeFnKey = (fn) => hash({ fn: fn.id || fn.toString() })
  const stack = {
    queue: new Map(),
    callers: new Map(), // { $id: $fnKey }
    results: new Map(), // { $fnKey: $fn() => Promise }
    finals: new Map(), // { $fnKey: await $fn() }
    cancels: new Map(), // { $fnKey: () => Reject }

    /**
     * Add new pre-loading request to the stack
     *
     * id: string
     * f: [
     *      fn: async ($arg1, ...$args) => await someApi.request($arg1, ...$args),
     *      fnArgs: ['POST', { body: { hello: 'world!' } }]
     *    ]
     * timeout: number (ms)
     *
     */
    add: (id, [fn, fnArgs], timeout = 300) => {
      const fnKey = makeFnKey(fn)
      const result = stack.results.get(fnKey)

      if (result) {
        stack.callers.set(id, fnKey)
        stack.queue.set(id, result)
        const cancel = stack.cancels.get(fnKey)
        return cancel
      }
      const elm = fn(...fnArgs)
      stack.callers.set(id, fnKey)

      let fulfilled = false
      let cancel = noop
      const spromise = new Promise((resolve, reject) => {
        if (!(elm instanceof Promise)) {
          resolve(elm)
          return noop
        }
        const pelm = elm
          .then((r) => {
            stack.finals.set(fnKey, r)
            return r
          })
          .then(resolve)
          .catch(reject)
          .finally(() => {
            fulfilled = true
          })

        const tid = setTimeout(() => reject('Timeout'), timeout)
        cancel = () => {
          clearTimeout(tid)
          if (!fulfilled) reject('Canceled')
        }

        return pelm
      })
      stack.queue.set(id, spromise)
      stack.results.set(fnKey, spromise)
      stack.cancels.set(fnKey, cancel)

      return cancel
    },
    remove: (id) => {
      stack.queue.delete(id)
    },
    list: () => [...stack.queue.entries()].map(([, q]) => q),
    getResult: (id) => stack.finals.get(stack.callers.get(id)),
    getFnResult: (fn) => stack.finals.get(makeFnKey(fn)),
    pack: () => {
      try {
        const result = serialize(Object.fromEntries(stack.finals.entries()), {
          space: 0,
          isJSON: true
        })
        return result
      } catch (error) {
        console.log('Unable to serialize Preload Request', {
          finals: stack.finals.entries(),
          error
        })
      }
    },
    unpack: (finals) =>
      Object.entries(finals).map(([fnKey, final]) => [
        stack.finals.set(fnKey, final),
        stack.results.set(fnKey, Promise.resolve(final))
      ])
  }

  return stack
}

export const server = {
  name,
  onRequest: (Plugin, req, res) => {
    require('ssr-window')
    const stack = makeStack()

    return {
      ssr: {
        stack,
        preload: (fn, timeout = Plugin?.defaults?.timeout || 300) => {
          const pid = Math.floor(Math.random() * Math.pow(2, 32)).toString(32)
          if (Plugin.maxTimeout && timeout > Plugin.maxTimeout) {
            timeout = Plugin.maxTimeout
          }

          const cancel = stack.add(pid, [fn, [Plugin, req, res]], timeout)
          const result = stack.getResult(pid)

          const cancelOuter = () => {
            cancel()
          }

          return [cancelOuter, result]
        }
      }
    }
  },
  Wrapper: ({ fields, children }) => {
    const SSRProvider = require('./ssr.context').default
    return <SSRProvider preload={fields.ssr.preload}>{children}</SSRProvider>
  },
  output: async ({ fields }) => {
    const pss = fields.ssr.stack.list()
    const results = await Promise.allSettled(pss)

    if (!fields.ssr.ready && results.length) {
      fields.ssr.ready = true
      // Set-off re-render trap
      return ['', '', true]
    }

    // await new Promise((r) => setTimeout(r, 3000))

    const packed = fields.ssr.stack.pack()
    const output = `<script>window.${GLOBAL_NAME}=(${packed});</script>`
    return [output]
  }
}

export const client = {
  onLoad: () => {
    const stack = makeStack()

    stack.unpack(window[GLOBAL_NAME] || {})
    const ret = {
      ssr: {
        preload: (fn) => {
          const ssrResult = stack.getFnResult(fn)
          if (typeof ssrResult === 'undefined') {
            return fn().then((fnResult) => [() => ({}), fnResult])
          }

          return [() => ({}), ssrResult]
        }
      }
    }

    return ret
  },
  Wrapper: ({ fields, children }) => {
    const SSRProvider = require('./ssr.context').default
    return <SSRProvider preload={fields.ssr.preload}>{children}</SSRProvider>
  }
}

export const app = {
  name,
  onLoad: () => ({}),
  Wrapper: ({ children }) => children,
  expose: () => ({
    usePreload: (fn, timeout, id) => {
      const [, actions] = useSSR()

      const value = actions.preload(
        id ? Object.assign(fn, { id }) : fn,
        timeout
      )
      return value
    }
  })
}
