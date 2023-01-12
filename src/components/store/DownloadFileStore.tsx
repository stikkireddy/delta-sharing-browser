import create from "zustand";
import {FileSystemDirectoryHandle} from "native-file-system-adapter/types/src/showDirectoryPicker";

type AuthData = {
    host: string
    token: string
}

interface DownloadState {
    downloadReq: Record<string, number>
    progress: Record<string, Array<string>>
    cacheDirHandle: FileSystemDirectoryHandle | null
    credentialsFileData: AuthData | null
    setCredentialsFileData: (auth: AuthData) => void
    setCacheDirHandle: (handle: FileSystemDirectoryHandle) => void
    addToProgress: (table: string, entry?: string) => void
    resetProgress: (table: string) => void
    setDownloadReq: (table: string, num: number) => void
}


export const useDownloadState = create<DownloadState>((set) => ({
    downloadReq: {},
    progress: {},
    cacheDirHandle: null,
    credentialsFileData: null,
    setCredentialsFileData: (auth: AuthData) => set(() => {
        return ({
            credentialsFileData: auth
        })
    }),
    setCacheDirHandle: (handle: FileSystemDirectoryHandle) =>  set(() => {
        return ({
            cacheDirHandle: handle,
        })
    }),
    resetProgress: (table: string) => set((state) => {
        state.downloadReq[table] = -1
        state.progress[table] = []
        return ({
            downloadReq: JSON.parse(JSON.stringify(state.downloadReq)),
            progress: JSON.parse(JSON.stringify(state.progress)),
        })
    }),
    addToProgress: (table: string, entry?: string) => set((state) => {
        const data = (state.progress[table] ?? [])
        data.push(entry ?? "something")
        state.progress[table] = data
        return ({
            downloadReq: JSON.parse(JSON.stringify(state.downloadReq)),
            progress: JSON.parse(JSON.stringify(state.progress)),
        })
    }),
    setDownloadReq: (table: string, num: number) => set((state) => {
        state.downloadReq[table] = num
        return ({
            downloadReq: JSON.parse(JSON.stringify(state.downloadReq)),
            progress: JSON.parse(JSON.stringify(state.progress)),
        })
    }),
}))