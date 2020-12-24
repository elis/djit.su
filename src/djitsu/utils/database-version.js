import { ssr } from './ssr'

const dv = (ssr ? process : window).env.RAZZLE_DV
export default dv
