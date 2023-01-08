import create from "zustand";

interface DownloadState {
    downloadReq: Record<string, number>
    progress: Record<string, Array<string>>
    addToProgress: (table: string, entry?: string) => void
    resetProgress: (table: string) => void
    setDownloadReq: (table: string, num: number) => void
}


export const useDownloadState = create<DownloadState>((set) => ({
    downloadReq: {},
    progress: {},
    resetProgress: (table: string) => set((state) => {
        state.downloadReq[table] = -1
        state.progress[table] = []
        return ({
            downloadReq: JSON.parse(JSON.stringify(state.downloadReq)),
            progress: JSON.parse(JSON.stringify(state.progress)),
        })
    }),
    addToProgress: (table: string, entry?: string) => set((state) => {
        let data = (state.progress[table] ?? [])
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