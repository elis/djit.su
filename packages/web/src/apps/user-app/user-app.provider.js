import React, { createContext, useContext } from 'react'

const UserAppContext = createContext([{}, {}])

export const UserAppProvider = (props) => {
  const actions = {}
  const state = {
    username: props.username,
    notebookName: props.notebookName
  }
  const value = [state, actions]
  return (
    <UserAppContext.Provider value={value}>
      {props.children}
    </UserAppContext.Provider>
  )
}

export const useUserApp = () => useContext(UserAppContext)

export default UserAppProvider
