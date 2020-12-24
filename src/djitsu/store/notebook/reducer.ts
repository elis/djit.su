import { Notebook, NotebookID, NotebooksQuery } from 'djitsu/schema/notebook'
import * as notebook from './types'

const initialState: notebook.NotebookState = {
  notebooks: {}
}

const queryName = (query: NotebooksQuery = {}) =>
  JSON.stringify(query || {}).replace(/(['"{}])/g, '') || 'default'

export const notebookReducer = (
  state = initialState,
  action: notebook.NotebookAction
): notebook.NotebookState => {
  switch (action.type) {
    case notebook.NOTEBOOK_LOADING_USER_NOTEBOOKS:
      return {
        ...state,
        users: {
          ...(state.users || {}),
          [action.payload.username]: {
            ...(state.users?.[action.payload.username] || {}),
            queries: {
              ...(state.users?.[action.payload.username]?.queries || {}),
              ...{
                [queryName(action.payload.query)]: {
                  ...(state.users?.[action.payload.username]?.queries?.[
                    queryName(action.payload.query)
                  ] || {}),
                  loading: true
                }
              }
            }
          }
        }
      }
    case notebook.NOTEBOOK_LOADED_USER_NOTEBOOKS:
      return {
        ...state,
        users: {
          ...(state.users || {}),
          [action.payload.username]: {
            ...(state.users?.[action.payload.username] || {}),
            queries: {
              ...(state.users?.[action.payload.username]?.queries || {}),
              [queryName(action.payload.query)]: {
                loading: false,
                result: [
                  ...action.payload.notebooks.map(
                    ({ notebookId }) => notebookId || ''
                  )
                ]
              }
            },
            notebooks: {
              ...(state.users?.[action.payload.username]?.notebooks || {}),
              ...action.payload.notebooks.reduce(
                (a, n) => ({
                  ...a,
                  ...(typeof n.notebookId === 'string'
                    ? {
                        [n.notebookId || '']: {
                          ...(state.users?.[action.payload.username]
                            ?.notebooks?.[n.notebookId || ''] || {}),
                          ...n
                        }
                      }
                    : {})
                }),
                {} as Record<NotebookID, Partial<Notebook>>
              )
            }
          }
        }
      }
    case notebook.NOTEBOOK_LOAD_FAILED_USER_NOTEBOOKS:
      return {
        ...state,
        users: {
          ...(state.users || {}),
          [action.payload.username]: {
            ...(state.users?.[action.payload.username] || {}),
            queries: {
              ...(state.users?.[action.payload.username]?.queries || {}),
              [queryName(action.payload.query)]: {
                loading: false,
                error: action.payload.error
              }
            }
          }
        }
      }
    case notebook.NOTEBOOK_LOADED_USER_META:
      return {
        ...state,
        notebooks: {
          ...(state.notebooks || {}),
          [action.payload.notebookId]: {
            ...(state.notebooks?.[action.payload.notebookId] || {}),
            meta: {
              ...(state.notebooks?.[action.payload.notebookId]?.meta || {}),
              isLiked: !!action.payload.result?.like?.value,
              isStarred: !!action.payload.result?.star?.value,
              isForked: !!action.payload.result?.fork?.value
            }
          }
        }
      }

    case notebook.NOTEBOOK_LOADING_REVISION:
      return {
        ...state,
        notebooks: {
          ...state.notebooks,
          [action.payload.notebookId]: {
            ...(state.notebooks[action.payload.notebookId] || {}),
            status: {
              ...(state.notebooks[action.payload.notebookId]?.status || {}),
              loading: true
            }
          }
        }
      }

    case notebook.NOTEBOOK_LOADED_REVISION:
      return {
        ...state,
        notebooks: {
          ...state.notebooks,
          [action.payload.notebookId]: {
            ...(state.notebooks[action.payload.notebookId] || {}),
            ...action.payload.notebook,
            status: {
              ...(state.notebooks[action.payload.notebookId]?.status || {}),
              ...(action.payload.notebook?.status || {}),
              loading: false,
              loaded: true,
              error: false
            },
            meta: {
              ...(state.notebooks[action.payload.notebookId]?.meta || {}),
              ...(action.payload.notebook.meta || {})
            }
          }
        }
      }

    case notebook.NOTEBOOK_LOAD_FAILED_REVISION:
      return {
        ...state,
        notebooks: {
          ...state.notebooks,
          [action.payload.notebookId]: {
            ...(state.notebooks[action.payload.notebookId] || {}),
            status: {
              ...(state.notebooks[action.payload.notebookId]?.status || {}),
              loading: false,
              error: action.payload.error
            }
          }
        }
      }

    case notebook.NOTEBOOK_SAVING_REVISION:
      return {
        ...state,
        notebooks: {
          ...state.notebooks,
          [action.payload.notebookId]: {
            ...(state.notebooks[action.payload.notebookId] || {}),
            ...(action.payload.notebook || {}),
            status: {
              ...(action.payload.notebook.status || {}),
              sessionSaving: true
            }
          }
        }
      }

    case notebook.NOTEBOOK_SAVED_REVISION:
      return {
        ...state,
        notebooks: {
          ...state.notebooks,
          [action.payload.notebookId]: {
            ...(state.notebooks[action.payload.notebookId] || {}),
            ...action.payload.notebook,
            status: {
              ...(state.notebooks[action.payload.notebookId]?.status || {}),
              sessionSaving: false,
              sessionLastSave: Date.now()
            },
            meta: {
              ...(state.notebooks[action.payload.notebookId]?.meta || {}),
              revision: action.payload.notebookRevision
            }
          }
        }
      }

    case notebook.NOTEBOOK_SAVE_FAILED_REVISION:
      return {
        ...state,
        notebooks: {
          ...state.notebooks,
          [action.payload.notebookId]: {
            ...(state.notebooks[action.payload.notebookId] || {}),
            status: {
              sessionSaving: false,
              error: action.payload.error
            }
          }
        }
      }

    case notebook.NOTEBOOK_ENABLING_LINK_SHARING:
      return {
        ...state,
        notebooks: {
          ...state.notebooks,
          [action.payload.notebookId]: {
            ...(state.notebooks[action.payload.notebookId] || {}),
            status: {
              ...(state.notebooks[action.payload.notebookId]?.status || {}),
              sharing: true
            }
          }
        }
      }

    case notebook.NOTEBOOK_ENABLED_LINK_SHARING:
      return {
        ...state,
        notebooks: {
          ...state.notebooks,
          [action.payload.notebookId]: {
            ...(state.notebooks[action.payload.notebookId] || {}),
            status: {
              ...(state.notebooks[action.payload.notebookId]?.status || {}),
              sharing: false
            },
            meta: {
              ...(state.notebooks[action.payload.notebookId]?.meta || {}),
              isPublic: action.payload.enabled
            }
          }
        }
      }

    case notebook.NOTEBOOK_ENABLE_FAILED_LINK_SHARING:
      return {
        ...state,
        notebooks: {
          ...state.notebooks,
          [action.payload.notebookId]: {
            ...(state.notebooks[action.payload.notebookId] || {}),
            status: {
              ...(state.notebooks[action.payload.notebookId]?.status || {}),
              sharing: false,
              error: action.payload.error
            }
          }
        }
      }
    case notebook.NOTEBOOK_TAGS_UPDATED:
      return {
        ...state,
        notebooks: {
          ...state.notebooks,
          [action.payload.notebookId]: {
            ...(state.notebooks[action.payload.notebookId] || {}),
            properties: {
              ...(state.notebooks[action.payload.notebookId].properties || {}),
              tags: action.payload.result
            }
          }
        }
      }
    default:
      return state
  }
}
