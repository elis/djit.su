import React from 'react'
import graze, { Addons } from 'graze'
import UserAppProvider from './user-app.provider'
import Wrapper from './wrapper'

const UserApp = (props) => {
  return (
    <UserAppProvider
      username={props.username}
      notebookName={props.notebookName}
      exportName={props.exportName}
    >
      <Addons app={Wrapper} />
    </UserAppProvider>
  )
}

const Wrapped = graze.app(UserApp)
export default Wrapped
