// @ts-ignore
import {getOriginPrivateDirectory, showDirectoryPicker, showOpenFilePicker} from "native-file-system-adapter";
import {FileSystemDirectoryHandle} from "native-file-system-adapter/types/src/showDirectoryPicker";
import axios from "axios";
// import nodeAdapter from 'native-file-system-adapter/lib/adapters/node.js'
import {AsyncDuckDB, DuckDBDataProtocol} from "@duckdb/duckdb-wasm";

export const getDirHandle = async (dirHandle?: FileSystemDirectoryHandle, dirPath?: string):
    Promise<FileSystemDirectoryHandle> => {
    await navigator.serviceWorker.register('sw.js')
    // return await getOriginPrivateDirectory(import('native-file-system-adapter/src/adapters/indexeddb.js'), )
    let resHandle: FileSystemDirectoryHandle = await dirHandle ??
        // @ts-ignore
        await getOriginPrivateDirectory(import('native-file-system-adapter/src/adapters/indexeddb.js'), )
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
    ): Promise<any> => {
    // const cacheHandle = await getDirHandle()
    // const cacheDir = cacheDirHandle
    const shareHandle = await getDirHandle(cacheDirHandle, shareName)
    const schemaHandle = await getDirHandle(shareHandle, schemaName)
    const tableHandle = await getDirHandle(schemaHandle, tableName)

    try{

        let fileHandle = await tableHandle.getFileHandle(fileName)
        let file = await fileHandle.getFile()
        if (file.size == 0) {
            // console.log("Failed to download file, treating as cache miss...")
            throw new Error("Failed to download file, treating as cache miss...")
        }
        // let arrayBuffer =  await (await fileHandle.getFile()).arrayBuffer()
        console.log(`IndexedDB Cache hit! ${shareName}/${schemaName}/${tableName}/${fileName}`)
        return fileHandle
    } catch (error) {
        console.log(`IndexedDB Cache miss! ${shareName}/${schemaName}/${tableName}/${fileName}`)
        let blob = getData(url)
        let fileHandle = await tableHandle.getFileHandle(fileName, {create: true})
        // @ts-ignore
        await (await blob).stream().pipeTo(await fileHandle.createWritable())
        return fileHandle
        // return (await fileHandle.getFile()).arrayBuffer()
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

