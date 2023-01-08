import create from "zustand";
import {AsyncDuckDB} from "@duckdb/duckdb-wasm";

export type Column = {
    name: string;
}

export type Row = Record<string, string>

interface SqlStore {
    sql: string
    loading: boolean
    tables: string[]
    columns: Column[]
    rows: Row[]
    setSqlString: (sql: string) => void
    setData: (cols: Column[], rows: Row[]) => void
    addTable: (table: string) => void
    setLoading: (loading: boolean) => void
}

export const useSQLStore = create<SqlStore>((set) => ({
    sql: "",
    loading: false,
    columns: [],
    tables: [],
    rows: [],
    setSqlString: (sql: string) => set((state) => ({
        sql: sql,
    })),
    setData: (cols: Column[], rows: Row[]) => set((state) => ({
        columns: cols,
        rows: rows
    })),
    addTable: (table: string) => set((state) => ({
        tables: state.tables.concat([table])
    })),
    setLoading: (loading: boolean) => set((state) => ({
        loading: loading
    })),
}))


