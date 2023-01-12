import create from "zustand";

interface GeneralState {
    openInfoModal: boolean
    setOpenInfoModal: (doOpen: boolean) => void
}


export const useGeneralState = create<GeneralState>((set) => ({
    openInfoModal: false,
    setOpenInfoModal: (doOpen: boolean) => set(() => {
        return ({
            openInfoModal: doOpen,
        })
    }),
}))