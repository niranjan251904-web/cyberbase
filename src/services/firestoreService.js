import { db } from '../firebase'
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    writeBatch,
} from 'firebase/firestore'

// ─── Read ───────────────────────────────────────────
export async function getCollection(name, orderField = null) {
    const ref = collection(db, name)
    const q = orderField ? query(ref, orderBy(orderField)) : ref
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ _id: d.id, ...d.data() }))
}

export async function getDocument(name, id) {
    const snap = await getDoc(doc(db, name, id))
    return snap.exists() ? { _id: snap.id, ...snap.data() } : null
}

// ─── Write ──────────────────────────────────────────
export async function addDocument(name, data) {
    const ref = await addDoc(collection(db, name), data)
    return ref.id
}

export async function setDocument(name, id, data) {
    await setDoc(doc(db, name, id), data)
}

export async function updateDocument(name, id, data) {
    await updateDoc(doc(db, name, id), data)
}

export async function removeDocument(name, id) {
    await deleteDoc(doc(db, name, id))
}

// ─── Real-time listener ─────────────────────────────
export function subscribeToCollection(name, callback, orderField = null) {
    const ref = collection(db, name)
    const q = orderField ? query(ref, orderBy(orderField)) : ref
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ _id: d.id, ...d.data() })))
    })
}

// ─── Seed helper ────────────────────────────────────
export async function seedCollection(name, dataArray) {
    const batch = writeBatch(db)
    dataArray.forEach((item) => {
        const ref = doc(collection(db, name))
        batch.set(ref, item)
    })
    await batch.commit()
    return dataArray.length
}
