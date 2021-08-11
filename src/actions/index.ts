import db, { auth, provider, storage } from "../firebase"
import firebase from "firebase"
import { SET_USER } from "./actionTypes"

export const setUser = (payload: firebase.User | null) => ({
    type: SET_USER,
    payload: payload
})

export const signInAPI = () => {
    console.log("tried to signin")
    return (dispatch: any) => {
        console.log("Create popup")
        auth.signInWithPopup(provider)
            .then((payload: firebase.auth.UserCredential) => {
                dispatch(setUser(payload.user))
            })
            .catch(error => alert(error.message))
    }
}

export const getUserAuth = () => {
    return (dispatch: any) => {
        auth.onAuthStateChanged(async (user: any) => {
            if (user) {
                dispatch(setUser(user))
            }
        })
    }
}

export const signOutAPI = () => {
    console.log("Start sign out")
    return (dispatch: any) => {
        auth.signOut()
            .then(() => dispatch(setUser(null)))
            .catch((err) => alert(err))
    }
}

export const postArticleAPI = (payload: any) => {
    return (dispatch: any) => {
        console.log(payload)
        if (payload.image !== '' || payload.image !== undefined) {
            const upload = storage
                .ref(`images/${payload.image.name}`)
                .put(payload.image)
            upload.on('state_changed', (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                console.log(`progress: ${progress}%`)
                if (snapshot.state === 'RUNNING')
                    console.log(`progress: ${progress}%`)
            }, err => console.log(err.code),
            async () => {
                const downloadURL = await upload.snapshot.ref.getDownloadURL()
                db.collection('articles').add({
                    actor: {
                        description: payload.user.email,
                        title: payload.user.displayName,
                        date: payload.timestamp,
                        image: payload.user.photoURL
                    },
                    video: payload.video,
                    sharedImg: downloadURL,
                    comments: 0,
                    description: payload.description
                })
            })
        }
    }
}