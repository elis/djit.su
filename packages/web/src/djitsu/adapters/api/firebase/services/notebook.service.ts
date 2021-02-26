import {
  Notebook,
  NotebookError,
  NotebookMetaAction,
  NotebookMetaData,
  NotebookService,
  NotebooksOrderBy
} from 'djitsu/schema/notebook'
import graze from 'graze'
import dv from 'djitsu/utils/database-version'
import {
  FirebaseCreated,
  FirebaseUpdated,
  NotebookDocument,
  NotebookRevesionDocument,
  NotebookVersionDocument,
  PublishedNotebookDocument
} from '../firebase.types'
import firebase from 'firebase'
import { Block, BlockType } from 'djitsu/schema/block'
import publishNotebook from './notebook/publish'

export const notebook: NotebookService = {
  publishNotebook,
  getUserNotebooks: async (username, query = {}) => {
    const {
      pageSize = 20,
      order = 'desc',
      orderBy = NotebooksOrderBy.Updated,
      startAfter,
      whereIn,
      whereIs,
      whereIsnt
    } = query

    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const notebooksRef = dvRef.collection('notebooks')
    const epoch = firebase.firestore.Timestamp.fromMillis(0)

    const queryRef = notebooksRef
      .where('updated', '>', epoch)
      .where('username', '==', username)
      .orderBy(orderBy, order)
      .limit(pageSize)

    const wheredQueryRef =
      whereIn || whereIs || whereIsnt
        ? ((inref) => {
            let outref = inref
            if (whereIs) {
              for (const i in whereIs) {
                outref = outref.where(
                  Object.keys(whereIs[i])[0],
                  '==',
                  Object.values(whereIs[i])[0]
                )
              }
            }
            if (whereIn) {
              for (const i in whereIn) {
                outref = outref.where(
                  Object.keys(whereIn[i])[0],
                  'in',
                  Object.values(whereIn[i])[0]
                )
              }
            }
            if (whereIsnt) {
              for (const i in whereIsnt) {
                outref = outref.where(
                  Object.keys(whereIsnt[i])[0],
                  '!=',
                  Object.values(whereIsnt[i])[0]
                )
              }
            }
            return outref
          })(queryRef)
        : queryRef

    const moddedQueryRef = startAfter
      ? wheredQueryRef.startAfter(startAfter)
      : wheredQueryRef

    const queryQuery: firebase.firestore.QuerySnapshot = await moddedQueryRef.get()
    const docs = queryQuery.docs.map(prepareNotebookDocument)

    const metas = await Promise.all(
      docs.map(async (notebook) => ({
        ...notebook,
        stats: (
          await notebooksRef.doc(`${notebook.notebookId}/meta/stats`).get()
        ).data()
      }))
    )

    return metas
  },
  saveNotebookRevision: async (notebookId, notebook, username) => {
    if (!notebookId)
      throw new Error(`Notebook ID is required - ${typeof notebookId} provided`)

    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const notebookRef = dvRef.collection('notebooks').doc(notebookId)

    const revisionsRef = notebookRef.collection('revisions')
    const latestRef = revisionsRef.orderBy('revision', 'desc').limit(1)

    const latestSnapshot = await latestRef.get()

    const blocks = JSON.stringify(notebook.blocks)
    const size = blocks.length

    const heading =
      notebook.blocks?.find(
        // (block) => block.type === BlockType.Heading
        (block) => block.type === BlockType.Heading && block.data.level === 1
      ) || notebook.blocks?.find(({ type }) => type === BlockType.Heading)
    const title =
      heading &&
      heading.type === BlockType.Heading &&
      `${heading?.data?.text}`.replace(/(<([^>]+)>)/gi, '')

    const previews = notebook.blocks?.find(
      (block) => block.type === BlockType.LiveCode && block.data?.data?.preview
    )

    const nextData = {
      revision: 1,

      created: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: username,

      blocks,
      size,
      blocksCount: notebook.blocks?.length || 0,
      ...(notebook.compiled
        ? {
            compiled: Object.entries(notebook.compiled)
              .filter(([, v]) => v)
              .reduce((a, [e, v]) => ({ ...a, [e]: v }), {})
          }
        : {}),
      ...(notebook.meta?.blocksTime
        ? { blocksTime: notebook.meta.blocksTime }
        : {}),

      ...(title ? { title } : {}),
      ...(notebook.properties?.description
        ? { description: notebook.properties?.description }
        : {}),
      ...(previews && previews.type === BlockType.LiveCode
        ? {
            previewPhotoUrl: previews.data.data.preview
          }
        : notebook.properties?.previewPhotoUrl
        ? { previewPhotoUrl: notebook.properties?.previewPhotoUrl }
        : {}),
      ...(notebook.properties?.tags ? { tags: notebook.properties?.tags } : {})
    }
    if (latestSnapshot.size) {
      const latestData: NotebookRevesionDocument = latestSnapshot.docs[0].data()
      Object.assign(nextData, {
        revision: latestData.revision + 1,
        parentRevision: notebook.meta?.revision || latestData.revision
      })
    }

    let revisionDoc
    try {
      revisionDoc = await revisionsRef.add(nextData)
    } catch (error) {
      console.log('ERROR LOADING REVISION', error)
    }

    const nextNotebookData = {
      lastRevision: nextData.revision,
      lastRevisionRef: revisionsRef.doc(revisionDoc.id),
      updated: firebase.firestore.FieldValue.serverTimestamp(),

      ...(title ? { title } : {}),
      ...(notebook.properties?.description
        ? { description: notebook.properties?.description }
        : {}),
      ...(nextData.previewPhotoUrl
        ? { previewPhotoUrl: nextData.previewPhotoUrl }
        : {})
    }

    if (
      nextNotebookData.lastRevision === 1 &&
      (notebook.meta?.forkVersion || notebook.meta?.forkRevision)
    ) {
      const updateForkOfData = {
        ...(notebook.meta?.forkRevision
          ? {
              forkRevision: notebook.meta.forkRevision,
              forkOf: notebook.meta.forkOf
            }
          : {}),
        ...(notebook.meta?.forkVersion && !notebook.meta?.forkRevision
          ? {
              forkVersion: notebook.meta.forkVersion,
              forkOf: notebook.meta.createdBy + ':' + notebook.properties?.name
            }
          : {})
      }
      Object.assign(nextNotebookData, updateForkOfData)
    }

    await notebookRef.set(nextNotebookData, { merge: true })

    return nextData.revision
  },

  saveNotebook: async (notebookId, notebook) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const notebookRef = dvRef
      .collection('notebooks')
      .doc('all')
      .collection('notebooks')
      .doc(notebookId)

    await notebookRef.set(notebook, { merge: true })

    const newRevId = Math.floor(Math.random() * 100000000)
      .toString(16)
      .toUpperCase()

    return newRevId
  },

  getNotebookId: async (notebookName, notebookUsername) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const publicId = `${notebookUsername}:${notebookName}`

    const publishedRef = dvRef.collection('published').doc(publicId)
    const publishedDoc = await publishedRef.get()
    const publishedData = publishedDoc.data() as PublishedNotebookDocument
    if (!publishedDoc.exists || !publishedData || !publishedData.notebookId)
      throw new Error(NotebookError.Unavailable)

    return publishedData.notebookId
  },

  getNotebookByName: async (
    notebookName,
    notebookUsername,
    notebookVersion
  ) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const publicId = `${notebookUsername}:${notebookName}`

    const publishedRef = dvRef.collection('published').doc(publicId)
    const publishedDoc = await publishedRef.get()
    const publishedData = publishedDoc.data() as PublishedNotebookDocument
    if (!publishedDoc.exists || !publishedData || !publishedData.notebookId)
      throw new Error(NotebookError.Unavailable)

    const version =
      !notebookVersion || notebookVersion === 'latest'
        ? publishedData.version
        : notebookVersion

    const notebookRef = dvRef
      .collection('notebooks')
      .doc(publishedData.notebookId)
    const versionRef = notebookRef.collection('versions').doc(version)

    const versionDoc = await versionRef.get()
    const versionData = versionDoc.data() as NotebookVersionDocument
    if (!versionDoc.exists || !versionData || !versionData.published)
      throw new Error(NotebookError.VersionUnavailable)

    const blocks: Block[] = versionData.blocks
      ? JSON.parse(versionData.blocks)
      : []

    const returnNotebook: Partial<Notebook> = {
      notebookId: publishedData.notebookId,
      meta: {
        version,

        created: publishedData.released.toMillis(),
        createdBy: notebookUsername,
        released: publishedData.released.toMillis(),
        published: publishedData.published.toMillis(),

        size: versionData.size,
        forkOf: publishedData.forkOf,
        forkRevision: publishedData.forkRevision,
        forkVersion: publishedData.forkVersion,

        isPublished: true
      },
      properties: {
        name: notebookName,
        title: versionData.title,
        description: versionData.description,
        previewPhotoUrl: versionData.previewPhotoUrl,
        tags: publishedData.tags
      },
      ...(versionData.compiled
        ? {
            compiled: {
              code: versionData.compiled.code,
              imports: versionData.compiled.imports,
              exports: versionData.compiled.exports,
              size: versionData.compiled.size
            }
          }
        : {}),

      blocks
    }

    const metas = {
      ...returnNotebook,
      stats: (await notebookRef.collection('meta').doc('stats').get()).data()
    }
    return metas
  },

  getNotebookByHostname: async (notebookHostname) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const hostnamesRef = dvRef.collection('hostnames')
    const publishedsRef = dvRef.collection('published')

    const hostnameRef = hostnamesRef.doc(notebookHostname)

    const hostnameDoc = await hostnameRef.get()
    const hostnameData = hostnameDoc.data()
    if (!hostnameDoc.exists || !hostnameData || !hostnameData.publicId)
      throw new Error(NotebookError.UnknownHostname)

    const publishedRef = publishedsRef.doc(hostnameData.publicId)
    const publishedDoc = await publishedRef.get()
    const publishedData = publishedDoc.data()
    // if (!publishedDocs.size) throw new Error(NotebookError.Unavailable)
    if (!publishedDoc.exists || !publishedData || !publishedData.notebookId)
      throw new Error(NotebookError.Unavailable)

    const version = publishedData.version

    const notebookRef = dvRef
      .collection('notebooks')
      .doc(publishedData.notebookId)
    const versionRef = notebookRef.collection('versions').doc(version)

    const versionDoc = await versionRef.get()
    const versionData = versionDoc.data() as NotebookVersionDocument
    if (!versionDoc.exists || !versionData || !versionData.published)
      throw new Error(NotebookError.VersionUnavailable)

    const blocks: Block[] = versionData.blocks
      ? JSON.parse(versionData.blocks)
      : []

    const returnNotebook: Partial<Notebook> = {
      notebookId: publishedData.notebookId,
      meta: {
        version,

        created: publishedData.released.toMillis(),
        createdBy: publishedData.createdBy,
        released: publishedData.released.toMillis(),
        published: publishedData.published.toMillis(),

        size: versionData.size,
        forkOf: publishedData.forkOf,
        forkRevision: publishedData.forkRevision,
        forkVersion: publishedData.forkVersion,

        isPublished: true
      },
      properties: {
        name: publishedData.name,
        hostname: publishedData.hostname,
        title: versionData.title,
        description: versionData.description,
        previewPhotoUrl: versionData.previewPhotoUrl,
        tags: publishedData.tags
      },
      compiled: {
        code: versionData.compiled.code,
        imports: versionData.compiled.imports,
        exports: versionData.compiled.exports,
        size: versionData.compiled.size
      },
      blocks
    }

    const metas = {
      ...returnNotebook,
      stats: (await notebookRef.collection('meta').doc('stats').get()).data()
    }
    return metas
  },
  getNotebook: async (notebookId, revision) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const notebookRef = dvRef.collection('notebooks').doc(notebookId)

    let notebookDoc
    try {
      notebookDoc = await notebookRef.get()
    } catch (error) {
      if (error.code === 'permission-denied') {
        throw NotebookError.Restricted
      }
      throw error
    }

    if (!notebookDoc.exists) throw NotebookError.Unavailable
    const notebookData: NotebookDocument = notebookDoc.data()

    const revisionsRef = notebookRef.collection('revisions')
    const latestRef = revision
      ? revisionsRef.where('revision', '==', revision)
      : revisionsRef.orderBy('revision', 'desc').limit(1)
    const latestDocs = await latestRef.get()

    const latestDoc: NotebookRevesionDocument =
      latestDocs.size && latestDocs.docs[0].data()
    if (!latestDocs.size) throw NotebookError.RevisionUnavailable

    try {
      const blocks = latestDoc?.blocks ? JSON.parse(latestDoc.blocks) : []

      const notebook: Partial<Notebook> = {
        notebookId: notebookId,
        blocks,
        meta: {
          revision: latestDoc.revision,
          created: notebookData.created.toMillis(),
          createdBy: notebookData.username,
          updated: notebookData.updated.toMillis(),
          revised: latestDoc.created.toMillis(),
          blocksTime: latestDoc.blocksTime,
          blocksCount: latestDoc.blocksCount,

          ...(notebookData.forkOf
            ? {
                forkOf: notebookData.forkOf,
                forkRevision: notebookData.forkRevision,
                forkVersion: notebookData.forkVersion
              }
            : {}),

          ...(notebookData.isPublished
            ? {
                version: notebookData.version,
                released: notebookData.released?.toMillis?.(),
                published: notebookData.published?.toMillis?.()
              }
            : {}),

          isShared: notebookData.isShared,
          isPublic: notebookData.isPublic,
          isPublished: notebookData.isPublished
        },
        properties: {
          ...(notebookData.isPublished
            ? {
                name: notebookData.name
              }
            : {}),
          title: notebookData.title,
          description: notebookData.description,
          previewPhotoUrl: notebookData.previewPhotoUrl,
          tags: notebookData.tags
        },
        status: {
          sessionLastSave: latestDoc.created.toMillis()
        },
        ...(latestDoc.compiled
          ? {
              compiled: {
                code: latestDoc.compiled.code,
                imports: latestDoc.compiled.imports,
                exports: latestDoc.compiled.exports,
                size: latestDoc.compiled.size
              }
            }
          : {})
      }

      const metas = {
        ...notebook,
        stats: (await notebookRef.collection('meta').doc('stats').get()).data()
      }

      return metas
    } catch (error) {
      console.log('Notebook error:', error)
      return {
        meta: { revision: latestDoc?.revision || 1 },
        blocks: []
      }
    }
  },
  newNotebook: async (username, notebookId) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const nextDoc = {
      username,
      created: firebase.firestore.FieldValue.serverTimestamp()
    }

    const notebooksRef = dvRef.collection('notebooks')

    if (notebookId) {
      const notebookRef = notebooksRef.doc(notebookId)
      const notebookDoc = await notebookRef.get()
      if (notebookDoc.exists) throw NotebookError.Exists

      await notebookRef.set(nextDoc)
      return notebookId
    } else {
      const notebookDoc = await notebooksRef.add(nextDoc)

      const newId = notebookDoc.id

      return newId
    }
  },
  enableLinkSharing: async (notebookId, enable) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const notebookRef = dvRef.collection('notebooks').doc(notebookId)

    const notebookDoc = await notebookRef.get()
    const notebookData: NotebookDocument = notebookDoc.data()

    if (!notebookDoc.exists || !notebookData)
      throw new Error(NotebookError.Unavailable)

    if (notebookData.isPublic === enable) throw new Error('No action')

    await notebookRef.set(
      {
        isPublic: enable,
        updated: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    )
    return enable
  },

  deployNotebook: async (notebookId, hostname) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const notebookRef = dvRef.collection('notebooks').doc(notebookId)

    const notebookDoc = await notebookRef.get()
    const notebookData: NotebookDocument = notebookDoc.data()

    if (!notebookDoc.exists || !notebookData)
      throw new Error(NotebookError.Unavailable)

    if (!notebookData.isPublished)
      throw new Error('Cannot deploy unpublished notebook')

    const publicId = `${notebookData.username}:${notebookData.name}`

    const hostnameRef = dvRef.collection('hostnames').doc(hostname)
    const hostnameDoc = await hostnameRef.get()
    const hostnameData = hostnameDoc.data()

    if (hostnameData && hostnameData.publicId) {
      const publicRef = dvRef.collection('published').doc(publicId)
      const publicDoc = await publicRef.get()
      const publicData = publicDoc.data()

      const demotedNotebookRef = dvRef
        .collection('notebooks')
        .doc(publicData.notebookId)
      await demotedNotebookRef.set({
        hostname: firebase.firestore.FieldValue.delete(),
        isDeployed: firebase.firestore.FieldValue.delete()
      })
    }
    await hostnameRef.set({ publicId }, { merge: true })

    await notebookRef.set({ hostname, isDeployed: true }, { merge: true })

    return true
  },

  getNotebookUserMeta: async (username, notebookId, meta) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const userRef = dvRef.collection('users').doc(username)
    const userMetaRef = userRef.collection('meta').doc('notebooks')
    const userNotebookRef = userMetaRef.collection(notebookId)
    if (meta) {
      const userNotebookMetaRef = userNotebookRef.doc(meta)
      const userNotebookMetaDoc = await userNotebookMetaRef.get()
      const data = userNotebookMetaDoc.data()
      return { [meta]: data }
    }

    const userNotebookQuery = await userNotebookRef.get()
    if (userNotebookQuery.size) {
      const metas = userNotebookQuery.docs
        .map((doc: firebase.firestore.DocumentSnapshot) => [doc.id, doc.data()])
        .map(
          ([id, data]: [
            NotebookMetaAction,
            Partial<
              NotebookMetaData & FirebaseCreated & Partial<FirebaseUpdated>
            >
          ]) => [
            id,
            {
              ...data,
              created: data?.created?.toMillis(),
              ...(data.updated
                ? {
                    updated: data.updated.toMillis()
                  }
                : {})
            }
          ]
        )
        .reduce(
          (
            acc: Record<NotebookMetaAction, Partial<NotebookMetaData>>,
            [id, data]: [NotebookMetaAction, Partial<NotebookMetaData>]
          ) => ({
            ...acc,
            [id]: data
          }),
          {}
        )
      return metas
    }
    return {}
  },
  meta: async (meta, username, notebookId, value) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const userRef = dvRef.collection('users').doc(username)
    const userMetaRef = userRef.collection('meta').doc('notebooks')
    const userMetaNotebookRef = userMetaRef.collection(notebookId).doc(meta)
    const userMetaNotebookDoc = await userMetaNotebookRef.get()
    const userMetaNotebookData = userMetaNotebookDoc.data()
    if (!userMetaNotebookDoc.exists && value) {
      await userMetaNotebookRef.set({
        created: firebase.firestore.FieldValue.serverTimestamp(),
        value
      })
    } else if (
      userMetaNotebookDoc.exists &&
      userMetaNotebookData.value !== value
    ) {
      await userMetaNotebookRef.set({
        updated: firebase.firestore.FieldValue.serverTimestamp(),
        value
      })
    }
  },
  addNotebookTag: async (notebookId, tag) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const notebookRef = dvRef.collection('notebooks').doc(notebookId)

    notebookRef.set(
      {
        tags: firebase.firestore.FieldValue.arrayUnion(tag),
        updated: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    )

    const notebookDoc = await notebookRef.get()
    const notebookData: NotebookDocument = notebookDoc.data()

    return [...(notebookData.tags || [])]
  },
  removeNotebookTag: async (notebookId, tag) => {
    const db = graze.exposed.firebase.firestore
    const dvRef = db.collection('djitsu').doc(dv)

    const notebookRef = dvRef.collection('notebooks').doc(notebookId)

    notebookRef.set(
      {
        tags: firebase.firestore.FieldValue.arrayRemove(tag),
        updated: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    )

    const notebookDoc = await notebookRef.get()
    const notebookData: NotebookDocument = notebookDoc.data()

    return [...(notebookData.tags || [])]
  }
}

const prepareNotebookDocument = (
  doc: firebase.firestore.DocumentSnapshot
): Partial<Notebook> => {
  const notebookDoc: NotebookDocument = doc.data() as NotebookDocument

  const returnNotebook: Partial<Notebook> = {
    notebookId: doc.id,
    meta: {
      created: notebookDoc.created.toMillis(),
      updated: notebookDoc.updated.toMillis(),
      createdBy: notebookDoc.username,
      ...(notebookDoc.isPublished
        ? {
            isPublished: true,
            published: notebookDoc.published.toMillis(),
            released: notebookDoc.released.toMillis(),
            version: notebookDoc.version,
            latestVersion: notebookDoc.lastVersion
          }
        : {}),
      ...(notebookDoc.lastRevision
        ? {
            latestRevision: notebookDoc.lastRevision
          }
        : {}),
      ...(notebookDoc.isPublic
        ? {
            isPublic: notebookDoc.isPublic
          }
        : {})
    },
    properties: {
      ...(notebookDoc.isPublished
        ? {
            name: notebookDoc.name
          }
        : {}),
      title: notebookDoc.title,
      description: notebookDoc.description,
      previewPhotoUrl: notebookDoc.previewPhotoUrl,
      tags: notebookDoc.tags
    }
  }

  return returnNotebook
}
