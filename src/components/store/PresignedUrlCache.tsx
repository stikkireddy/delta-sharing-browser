import create from "zustand";

interface UrlsState {
    urls: Record<string, boolean>
    addEntry: (url: string) => void
}


export const useUrlsState = create<UrlsState>((set) => ({
    urls: {},
    addEntry: (url: string) => set((state) => {
        state.urls[url] = true
        return ({
            urls: state.urls,
        })
    }),
}))