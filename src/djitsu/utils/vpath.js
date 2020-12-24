// import pkg from '../packge.json'

const pkg = {
  version: process.env.REACT_APP_APP_VERSION
}

const vstring = (v, path) => `versions/${v}/${path.replace(/^\//, '')}`
export const vpath = (arg, ...inputs) => {
  const built = []
  if (Array.isArray(arg) && arg.raw) {
    arg.forEach((a, i) => built.push(a) && inputs[i] && built.push(inputs[i]))
    const str = built.join('')
    return vstring(pkg.version, str)
  } else if (typeof arg === 'string') {
    return vstring(pkg.version, arg)
  }
}
