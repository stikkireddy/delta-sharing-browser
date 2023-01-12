import create from 'zustand'
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import {AsyncDuckDBConnection} from "@duckdb/duckdb-wasm/dist/types/src/parallel/async_connection";
import {getDirHandle} from "../../cache/FileSystemCache";
import {FileSystemDirectoryHandle} from "native-file-system-adapter/types/src/showDirectoryPicker";

interface DuckDBState {
    db: duckdb.AsyncDuckDB | null
    conn: AsyncDuckDBConnection | null
    setDB: (db: duckdb.AsyncDuckDB | null) => void
    setConn: (conn: duckdb.AsyncDuckDBConnection | null) => void
}


export const useDuckDB = create<DuckDBState>((set) => ({
    db: null,
    conn: null,
    setDB: (db: duckdb.AsyncDuckDB | null) => set(() => ({
        db: db,
    })),
    setConn: (conn: duckdb.AsyncDuckDBConnection | null) => set(() => ({
        conn: conn,
    })),
}))

// TODO: determine if duckdb can write locally
// export const loadOpenDuckDb = async (dirHandle: FileSystemDirectoryHandle) => {
//     console.log("Loading duckdb...")
//     const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
//         mvp: {
//             mainModule: duckdb_wasm,
//             mainWorker: mvp_worker,
//         },
//         eh: {
//             mainModule: duckdb_wasm_eh,
//             mainWorker: eh_worker,
//         },
//     };
//     // Select a bundle based on browser checks
//     const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
//     // Instantiate the asynchronus version of DuckDB-wasm
//     const worker = new Worker(bundle.mainWorker!);
//     const logger = new duckdb.ConsoleLogger();
//     const duckDb = new duckdb.AsyncDuckDB(logger, worker);
//     await duckDb.instantiate(bundle.mainModule, bundle.pthreadWorker);
//     const dbFile = await dirHandle.getFileHandle("_cache.db", {create: true})
//     await duckDb.registerFileHandle(`_cache.db`, await (await dbFile).getFile(), DuckDBDataProtocol.BROWSER_FSACCESS, true)
//     await duckDb.open({
//         path: "_cache.db"
//     })
//     const customConn = await duckDb.connect()
//     await customConn.query(`
//     CREATE TABLE direct AS SELECT * FROM generate_series(1, 100) t(v)
// `);
//     console.log((await customConn.query("SELECT * FROM direct")).toString())
// //     await db.flushFiles()
//     await customConn.close()
// }

export const startDuckDB = async (
    setDB: (db: duckdb.AsyncDuckDB | null) => void,
    setConn: (conn: duckdb.AsyncDuckDBConnection | null) => void,
    cacheDirHandle: FileSystemDirectoryHandle | null,
    setCacheDirHandle: (handle: FileSystemDirectoryHandle) => void

) => {
      if (cacheDirHandle === null) {
          getDirHandle().then((r) => {
              setCacheDirHandle(r)
              console.log("Configured Cache Dir Handle")
          })
      }
    console.log("Loading duckdb...")
    const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
        mvp: {
            mainModule: duckdb_wasm,
            mainWorker: mvp_worker,
        },
        eh: {
            mainModule: duckdb_wasm_eh,
            mainWorker: eh_worker,
        },
    };
    // Select a bundle based on browser checks
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
    // Instantiate the asynchronus version of DuckDB-wasm
    const worker = new Worker(bundle.mainWorker!);
    const logger = new duckdb.ConsoleLogger();
    const duckDb = new duckdb.AsyncDuckDB(logger, worker);
    await duckDb.instantiate(bundle.mainModule, bundle.pthreadWorker);
    console.log("Created DuckDB Connection.")
    setDB(duckDb)
    setConn(await duckDb.connect())
}