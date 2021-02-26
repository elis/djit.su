import React from 'react'
import noop from 'lodash/noop'
import { useSSR } from './ssr.context'
import hash from 'object-hash'
import useOutput from './use-output'

export { useOutput }
const name = 'graze-ssr-output'

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
          stack.finals.set(fnKey, elm)

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
    pack: () => [...stack.finals.values()],
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
  onRequest: (Plugin, req, res, voidResponse) => {
    require('ssr-window')
    const stack = makeStack()

    return {
      ssr: {
        req,
        res,
        voidResponse,
        stack,
        output: (fn, timeout) => {
          const pid = Math.floor(Math.random() * Math.pow(2, 32)).toString(32)
          const cancel = stack.add(
            pid,
            [fn, [Plugin, req, res, voidResponse]],
            timeout
          )
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
    return (
      <SSRProvider output={fields.ssr.output} fields={fields}>
        {children}
      </SSRProvider>
    )
  },
  output: async ({ fields }) => {
    const pss = fields.ssr.stack.list()
    const results = await Promise.allSettled(pss)

    if (!fields.ssr.ready && results.length) {
      fields.ssr.ready = true
      // Set-off re-render trap
      return ['', '', true]
    }

    const packed = fields.ssr.stack.pack()

    if (packed) {
      const [first] = packed
      if (typeof first === 'string') {
        fields.ssr.res.send(packed.join(''))
        fields.ssr.voidResponse()
        return false
      } else if (typeof first === 'object' && Object.keys(first).length) {
        fields.ssr.res.json(packed.length > 1 ? packed : first)
        fields.ssr.voidResponse()
        return false
      }
    } else return []
  }
}

export const client = {
  onLoad: () => ({}),
  Wrapper: ({ children }) => {
    const SSRProvider = require('./ssr.context').default
    return (
      <SSRProvider
        output={() => {
          /* no-op */
        }}
      >
        {children}
      </SSRProvider>
    )
  }
}

export const app = {
  name,
  onLoad: () => ({}),
  Wrapper: ({ children }) => children,
  expose: () => ({
    useOutput: (fn, timeout) => {
      const [, actions] = useSSR()
      const value = actions.output(fn, timeout)
      return value
    }
  })
}
