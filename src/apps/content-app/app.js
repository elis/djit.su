import React from 'react'
import graze, { Addons } from 'graze'
import Wrapper from './wrapper'

const App = () => <Addons app={Wrapper} />

const Wrapped = graze.app(App)
export default Wrapped
