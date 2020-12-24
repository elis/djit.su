import { NotebookError, NotebookService } from 'djitsu/schema/notebook'
import graze from 'graze'
import {
  NotebookDocument,
  NotebookRevesionDocument
} from '../../firebase.types'
import firebase from 'firebase'
import dv from 'djitsu/utils/database-version'

const DEBUG = false

export const publishNotebook: NotebookService['publishNotebook'] = async (
  notebookId,
  version,
  title,
  name,
  notebookRevision
) => {
  const db = graze.exposed.firebase.firestore
  const dvRef = db.collection('djitsu').doc(dv)

  const notebookRef = dvRef.collection('notebooks').doc(notebookId)

  const notebookDoc = await notebookRef.get()
  const notebookData: NotebookDocument = notebookDoc.data()

  if (!notebookDoc.exists || !notebookData)
    throw new Error(NotebookError.Unavailable)

  let revisionDoc
  if (notebookRevision) {
    const revisionQuery = notebookRef
      .collection('revisions')
      .where('revision', '==', notebookRevision)
      .limit(1)
    const revisionResult = await revisionQuery.get()
    if (revisionResult.size) revisionDoc = revisionResult.docs[0]
  } else {
    if (!notebookData.lastRevision)
      throw new Error(NotebookError.RevisionUnavailable)
    const revisionRef = notebookData.lastRevisionRef
    revisionDoc = await revisionRef.get()
  }

  const revisionData: NotebookRevesionDocument = revisionDoc.data()

  if (!notebookDoc.exists || !notebookData)
    throw new Error(NotebookError.RevisionUnavailable)

  const versionRef = notebookRef.collection('versions').doc(version)
  const versionDoc = await versionRef.get()

  if (versionDoc.exists) throw new Error(NotebookError.VersionExists)

  const published = firebase.firestore.FieldValue.serverTimestamp()
  const notebookTitle =
    title || (notebookData.isPublished && notebookData.title)
  const notebookName = notebookData.isPublished ? notebookData.name : name

  const saveVersionData = {
    released: notebookData.isPublished ? notebookData.released : published,
    published,
    title: notebookTitle,
    blocks: revisionData.blocks,
    ...(revisionData.compiled
      ? {
          compiled: revisionData.compiled
        }
      : {}),

    revision: revisionData.revision
  }
  DEBUG &&
    console.log(
      '🔥⚾️ Saving version notebook data:',
      versionRef.path,
      saveVersionData
    )

  await versionRef.set(saveVersionData)

  if (notebookData.isPublished) {
    // Update version
    const saveNotebookData = {
      version,
      lastVersion: version,
      updated: published,
      published,

      ...(title ? { title } : {})
    }
    DEBUG &&
      console.log(
        '🔥⚾️ Saving updated publish notebook data:',
        notebookRef.path,
        saveNotebookData
      )
    await notebookRef.set(saveNotebookData, { merge: true })
  } else {
    // New publish
    if (!name) throw new Error(NotebookError.NameRequired)
    if (!title) throw new Error(NotebookError.TitleRequired)

    const saveNotebookData = {
      name,
      version,
      lastVersion: version,
      updated: published,
      released: published,
      published,

      title,
      isPublished: true
    }

    DEBUG &&
      console.log(
        '🔥⚾️ Saving new publish notebook data:',
        notebookRef.path,
        saveNotebookData
      )
    await notebookRef.set(saveNotebookData, { merge: true })
  }

  const publicId = notebookData.username + ':' + notebookName
  const publishedRef = dvRef.collection('published').doc(publicId)

  if (!notebookData.isPublished) {
    const savePublishedData = {
      notebookId,
      version,
      createdBy: notebookData.username,

      released: published,
      published,

      name,
      title: title,
      tags: [...(notebookData.tags || [])],
      ...(notebookData.forkOf && notebookData.forkVersion
        ? {
            forkOf: notebookData.forkOf,
            forkVersion: notebookData.forkVersion
          }
        : {})
    }
    DEBUG &&
      console.log(
        '🔥⚾️ Saving new publish:',
        publishedRef.path,
        savePublishedData
      )
    await publishedRef.set(savePublishedData)
  } else {
    // Update
    const savePublishedData = {
      version,
      published,
      ...(title ? { title } : {}),

      tags: [...(notebookData.tags || [])]
    }
    DEBUG &&
      console.log(
        '🔥⚾️ Saving update publish:',
        publishedRef.path,
        savePublishedData
      )
    await publishedRef.set(savePublishedData, { merge: true })
  }

  return version
}

export default publishNotebook
