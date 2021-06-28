export const name = 'session'

export const renderer = {
  init: () => {
    const { search } = window.location
    const windowId = search
      .split('?')[1]
      .split('&')
      .map(el => el.split('='))
      .find(([field]) => field === 'id')?.[1]

    return {
      windowId
    }
  }
}
