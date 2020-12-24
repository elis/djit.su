import React from 'react'
import NotebookPage from 'djitsu/views/notebook-page'
import { Route } from './router'

interface NotebookRouteProps {
  path: string
}

export const NotebookRoute: React.FC<NotebookRouteProps> = (
  props: NotebookRouteProps
) => {
  return <Route path={props.path} component={NotebookRouteDisplay} />
}

interface NotebookRouteDisplayProps {
  match: {
    params: {
      notebookId?: string
      notebookName?: string
      notebookUsername?: string
    }
  }
  children?: React.ReactNode
}

export const NotebookRouteDisplay: React.FC<NotebookRouteDisplayProps> = (
  props: NotebookRouteDisplayProps
) => {
  const { notebookId, notebookName, notebookUsername } = props.match.params

  return <NotebookPage {...{ notebookId, notebookName, notebookUsername }} />
}

export default NotebookRoute
