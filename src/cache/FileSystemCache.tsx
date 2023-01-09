// @ts-ignore
import {showDirectoryPicker, showOpenFilePicker} from "native-file-system-adapter";
import {FileSystemDirectoryHandle} from "native-file-system-adapter/types/src/showDirectoryPicker";
import axios from "axios";

export const getDirHandle = async (dirHandle?: FileSystemDirectoryHandle, dirPath?: string):
    Promise<FileSystemDirectoryHandle> => {
    await navigator.serviceWorker.register('sw.js')
    let resHandle: FileSystemDirectoryHandle = await dirHandle ?? await showDirectoryPicker({
        _preferPolyfill: false,
    })
        .then((r: FileSystemDirectoryHandle) => {
            console.log(r)
            return r
        })
        .catch((error: Error) => {
            console.log(error)
        })
    return (dirPath) ? resHandle.getDirectoryHandle(dirPath, {create: true}) : resHandle
}

const getData = (url: string) => {
    const data: Promise<Blob> = axios({
        responseType: "blob",
        method: "get",
        url: url,
    }).then((r) => r.data)
    return data
}

export const getOrPutArrayBuffer = async (
    cacheDirHandle: FileSystemDirectoryHandle,
    shareName: string,
    schemaName: string,
    tableName: string,
    fileName: string,
    url: string,
    ): Promise<ArrayBuffer> => {
    // const cacheHandle = await getDirHandle()
    // const cacheDir = cacheDirHandle
    const shareHandle = await getDirHandle(cacheDirHandle, shareName)
    const schemaHandle = await getDirHandle(shareHandle, schemaName)
    const tableHandle = await getDirHandle(schemaHandle, tableName)

    try{

        let fileHandle = await tableHandle.getFileHandle(fileName)
        let arrayBuffer =  await (await fileHandle.getFile()).arrayBuffer()
        console.log("Cache hit!")
        return arrayBuffer
    } catch (error) {
        console.log("Cache miss")
        let blob = getData(url)
        let fileHandle = await tableHandle.getFileHandle(fileName, {create: true})
        // @ts-ignore
        await (await blob).stream().pipeTo(await fileHandle.createWritable())
        return (await fileHandle.getFile()).arrayBuffer()
    }
}

export const getShareTokenAuth = async () => {
    const fileData: Promise<File> = showOpenFilePicker({
        multiple: false
    }).then((f: FileSystemFileHandle[]) => {
        return f[0].getFile()
    })
    const data = await fileData
    const json = await data.text()
    return {
        token: JSON.parse(json)["bearerToken"],
        host: JSON.parse(json)["endpoint"]
    }
}

