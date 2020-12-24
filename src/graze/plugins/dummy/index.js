import React from 'react'

export const app = {
  onRender: () => ({}),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Addon: ({ ...props }) => {
    return (
      <React.Fragment>
        <h1>Hello World!</h1>
      </React.Fragment>
    )
  }
}
