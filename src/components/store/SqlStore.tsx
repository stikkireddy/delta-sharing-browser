import create from "zustand";

export type Column = {
    name: string;
}

export type Row = Record<string, string>

interface SqlStore {
    selectedSql: boolean,
    sql: string
    loading: boolean
    queryStatus: string | null,
    tables: string[]
    columns: Column[]
    rows: Row[]
    setSqlString: (sql: string) => void
    setData: (cols: Column[], rows: Row[]) => void
    addTable: (table: string) => void
    setLoading: (loading: boolean) => void
    setSelectedSql: (selectedSql: boolean) => void
    setQueryStatus: (queryStatus: string) => void
}

export const useSQLStore = create<SqlStore>((set) => ({
    selectedSql: false,
    sql: "",
    loading: false,
    columns: [],
    queryStatus: null,
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
    setSelectedSql: (selectedSql: boolean) => set((state) => ({
        selectedSql: selectedSql
    })),
    setQueryStatus: (queryStatus: string) => set((state) => ({
        queryStatus: queryStatus
    })),
}))


