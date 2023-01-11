import create from "zustand";
import {useDuckDB} from "./DuckDB";
import {AsyncDuckDBConnection} from "@duckdb/duckdb-wasm/dist/types/src/parallel/async_connection";
import {Struct} from "apache-arrow";

export type Column = {
    name: string;
}

export type Row = Record<string, string>

export type ShareTable = {
    shareName: string
    schemaName: string
    tableName: string
}

export type DuckDbColumn = {
    columnName: string
    dataType: string
}

export type DuckDbView = {
    schemaName: string
    viewName: string
    columns: DuckDbColumn[]
}

export type ShareTreeView = Record<string, Record<string, Record<string, ShareTable>>>

export type DuckDbTreeView = Record<string, Record<string, DuckDbView>>

export class ShareHelper {
    static makeShareTreeView(shareTables: ShareTable[]): ShareTreeView {
        var tree: ShareTreeView = {}
        shareTables.forEach((table) => {
            if (!tree[table.shareName]) {
                tree[table.shareName] = {}
            }
            if (!tree[table.shareName][table.schemaName]) {
                tree[table.shareName][table.schemaName] = {}
            }
            tree[table.shareName][table.schemaName][table.tableName] = table
        })
        return tree
    }
    static makeDuckDbTreeView(duckDbViews: DuckDbView[]): DuckDbTreeView {
        var tree: DuckDbTreeView = {}
        duckDbViews.forEach((view) => {
            if (!tree[view.schemaName]) {
                tree[view.schemaName] = {}
            }
            tree[view.schemaName][view.viewName] = view
        })
        return tree
    }

    static makeDuckDbViewFullName(shareTable: ShareTable) {
        return `${this.makeDuckDbViewSchema(shareTable)}.${shareTable.tableName}`
    }
    static makeDuckDbViewSchema(shareTable: ShareTable) {
        return `${shareTable.shareName}_${shareTable.schemaName}`
    }
    static makeDuckDbParquetBasePath(shareTable: ShareTable) {
        return `${shareTable.shareName}/${shareTable.schemaName}/${shareTable.tableName}`
    }
    static makeDuckDbViewSchemaSql(shareTable: ShareTable) {
        return `CREATE SCHEMA IF NOT EXISTS ${this.makeDuckDbViewSchema(shareTable)};`
    }
    static makeDuckDbViewSql(shareTable: ShareTable) {
        return `CREATE OR REPLACE VIEW
                  ${this.makeDuckDbViewFullName(shareTable)} AS
                SELECT
                  *
                FROM
                  parquet_scan (
                    '${this.makeDuckDbParquetBasePath(shareTable)}/*.parquet',
                    filename = TRUE
                  );`
    }
}

// export const getSchema = async(conn: AsyncDuckDBConnection | null) => {
//     if (conn == null) return
//     const results = await (conn?.query(`SELECT current_schema() as currentSchema;`))
//     console.log(JSON.parse(results.toString()))
//     console.log(results.toString())
// }

export const getAllTablesInDuckDb = async(
    conn: AsyncDuckDBConnection | null,
    addDuckDbView: (duckDbView: DuckDbView) => void
) => {
    if (conn == null) return
    const results = await (conn?.query(`SELECT
      table_schema as schemaName,
      table_name as tableName,
      LIST (
      {'columnName': column_name, 'dataType': data_type}
      ) AS columns
    FROM
      information_schema.columns
    GROUP BY
      1,
      2;`))
    const tables: Array<{schemaName: string, tableName: string, columns: DuckDbColumn[]}> = JSON.parse(results.toString())
    tables.forEach((tbl: {schemaName: string, tableName: string, columns: DuckDbColumn[]}) => {
        addDuckDbView({
            schemaName: tbl.schemaName,
            viewName: tbl.tableName,
            columns: tbl.columns,
        })
    })
}


// export type TableViewEntry = {
//     shareTable: ShareTable
//     duckDbView?: DuckDbView
// }

interface SqlStore {
    selectedSql: boolean,
    sql: string
    loading: boolean
    queryStatus: string | null,
    tables: ShareTable[]
    duckDbViews: DuckDbView[]
    columns: Column[]
    rows: Row[]
    setSqlString: (sql: string) => void
    setData: (cols: Column[], rows: Row[]) => void
    addTable: (table: ShareTable) => void
    addDuckDbView: (duckDbView: DuckDbView) => void
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
    duckDbViews: [],
    rows: [],
    setSqlString: (sql: string) => set((state) => ({
        sql: sql,
    })),
    setData: (cols: Column[], rows: Row[]) => set((state) => ({
        columns: cols,
        rows: rows
    })),
    addTable: (table: ShareTable) => set((state) => ({
        tables: state.tables.concat([table])
    })),
    addDuckDbView: (duckDbView: DuckDbView) => set((state) => ({
        duckDbViews: state.duckDbViews.concat([duckDbView])
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


