import graze from 'graze'

/**
 * SSR Preload Hook - provide a function and a timeout and the hook will return
 * an array containing a `cancel` function and the value produced by your function.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react'
 * import { usePreload } from 'graze-ssr-preload'
 *
 * const App = (props) => {
 *  const [cancel, value] = usePreload(() => fetch(someUrl), 500, 'Load URL for App')
 *  useEffect(() => cancel, [])
 *
 *  return <div>
 *    <h1>SSR Preloaded:</h1>
 *    <pre>{JSON.stringify(value, 1, 1)}</pre>
 *  </div>
 * }
 * ```
 *
 * @param {Function} fn a function returning a promise to execute
 * @param {Number} timeout number of milliseconds to allow waiting for execution before bailing out during SSR
 * @param {String} id identifier for the request - using the same identifier multiple will yield only one SSR request during rendering
 */
export const usePreload = (fn, timeout, id) => {
  if (!id && !fn.id)
    throw new Error(
      'Provided function must contain a static property `id` or a third argument with string id provided to usePreload'
    )

  if (id && !fn.id)
    return graze.exposed.usePreload(Object.assign(fn, { id }), timeout)

  return graze.exposed.usePreload(fn, timeout)
}

export default usePreload
