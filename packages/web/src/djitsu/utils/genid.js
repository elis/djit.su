import bs58 from 'bs58'
export const generateId = () => {
  const k = () =>
    bs58.encode(
      [...Array(10)].map(() => Math.floor(Math.random() * 20000) % 256)
    )
  return [...Array(30)].map(k)[Math.floor(Math.random() * 200) % 29]
}
export default generateId
