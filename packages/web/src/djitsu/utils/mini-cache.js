export const createMiniCache = () => {
  const base = {}
  const handler = {
    get: (target, prop) => {
      return target[prop].value
    },
    set: (target, prop, value) => {
      target[prop] = {
        value,
        updated: Date.now()
      }

      return true
    }
  }

  return new Proxy(base, handler)
}

export default createMiniCache
