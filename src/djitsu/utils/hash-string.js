// source: https://stackoverflow.com/a/15710692
const hashCode = (s) =>
  s.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

export const hashString = (str) => Math.abs(hashCode(str)).toString(32)
export default hashString
