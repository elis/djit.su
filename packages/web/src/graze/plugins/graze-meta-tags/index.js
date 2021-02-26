import React from 'react'

const name = 'graze-meta-tags'

export const app = {
  name,
  onRender: () => {
    return {}
  },
  Addon: () => {
    const { MetaStyles } = require('./meta-styles')
    const { useSite } = require('@graze').default
    if (useSite) {
      const { state: site } = useSite()

      return (
        <MetaStyles
          title={site.title}
          description={site.description}
          favicon={site.favicon}
          preview={site.previewImage}
        />
      )
    }
    return <></>
  }
}
