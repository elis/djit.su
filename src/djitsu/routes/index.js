import React from 'react'
import { Switch, Route } from 'djitsu/adapters/routes'
import NotebooksRoute from './notebooks/index.js'
import SitePages from './site-pages'
// import NotebookEditor from './notebook-editor'
import DocumentRoute from './document'
import AuthRoutes from './auth'
import DocumentRunner from './document-runner'
import PublishedDocument from './published-document'
import PublishedDocumentRunner from './published-document-runner'

export const DjitsuRoutes = () => {
  return (
    <Switch>
      <Route
        path={[
          '/d:documentId\\::revision/:exported',
          '/d:documentId/:exported'
        ]}
        component={DocumentRunner}
      />
      <Route
        path={['/d:documentId\\::revision', '/d:documentId', '/create-new']}
        component={DocumentRoute}
      />
      <Route
        path={[
          '/@:username/:notebookName\\::version/:exported',
          '/@:username/:notebookName/:exported'
        ]}
        component={PublishedDocumentRunner}
      />
      <Route
        path={[
          '/@:username/:notebookName\\::version',
          '/@:username/:notebookName'
        ]}
        component={PublishedDocument}
      />
      {/* <Route path='/d:notebookId' component={NotebookEditor} /> */}
      <Route path='/notebooks' component={NotebooksRoute} />
      <Route path={['/signup', '/login', '/signout']} component={AuthRoutes} />
      <Route path='/:section?/:page?/:exported?' component={SitePages} />
    </Switch>
  )
}

DjitsuRoutes.propTypes = {}

export default DjitsuRoutes
