import create from 'zustand'
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import {AsyncDuckDBConnection} from "@duckdb/duckdb-wasm/dist/types/src/parallel/async_connection";

//
interface DuckDBState {
    db: duckdb.AsyncDuckDB | null
    setDB: (db: duckdb.AsyncDuckDB | null) => void
}


export const useDuckDB = create<DuckDBState>((set) => ({
    db: null,
    setDB: (db: duckdb.AsyncDuckDB | null) => set((state) => ({
        db: db,
    })),
}))

export const startDuckDB = async (setDB: (db: duckdb.AsyncDuckDB | null) => void) => {
    // const {setDB, setConn} = useDuckDB()
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
    console.log(duckDb)
    console.log("Created DuckDB Connection.")
    setDB(duckDb)
}