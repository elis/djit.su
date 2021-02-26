const { BUILD_TARGET } = process.env

export const ssr = BUILD_TARGET === 'server'
