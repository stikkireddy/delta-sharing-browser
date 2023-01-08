import * as React from 'react';
import {useEffect, useState} from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import TableViewIcon from '@mui/icons-material/TableView';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import {useDuckDB} from "../store/DuckDB";
import {useUrlsState} from "../store/PresignedUrlCache";
import {AsyncDuckDB} from "@duckdb/duckdb-wasm";
import LoadingButton from "@mui/lab/LoadingButton";
import CachedIcon from '@mui/icons-material/Cached';
import {useSQLStore} from "../store/SqlStore";
import {useDownloadState} from "../store/DownloadFileStore";
import {ShareAnimation} from "../navbar/ShareAnimation";

const registerTable = async (urls: Array<string>,
                             db: AsyncDuckDB | null,
                             filePath: string,
                             urlCache: Record<string, boolean>,
                             addToUrlCache: (url: string) => void,
                             tablePath: string,
                             updateProgress: (table: string, entry?: string) => void,
                             resetProgress: (table: string) => void,
                             viewName: string,
) => {
    await Promise.all(urls.slice(0, 10).map(async (url, index) => {
        const urlBase = url.split("?")[0]
        if (urlCache[urlBase] === undefined) {
            const data = await fetch(url).then((r) => {
                return r.blob()
            }).then((r) => {
                return r.arrayBuffer()
            })
            const parts = urlBase.split("/")
            const fileName = parts[parts.length - 1]
            await db?.registerFileBuffer(`${filePath}/${fileName}`, new Uint8Array(await data));
            addToUrlCache(urlBase)
        }
        // hack to let atleast one of them create a view who ever finishes first
        console.log(`Loading view: ${viewName} to path ${tablePath}/* from request: ${index}`)
        const query = `
    CREATE OR REPLACE VIEW ${viewName} 
    AS SELECT * FROM read_parquet('${tablePath}/*')
`
        console.log(query)
        const conn = await db?.connect()
        await conn?.query(query);
        conn?.close()


        updateProgress(tablePath, url)
    }))
    resetProgress(tablePath)
}

const TableItem = (props: { table: Record<string, string>, index: number }) => {

    const [loading, setLoading] = useState(false)
    const [shareName, schemaName, tableName] = [props.table["share_name"],
        props.table["schema_name"],
        props.table["table_name"],]
    const [db] = useDuckDB((state) => [
        state.db
    ])
    const urlCache = useUrlsState((state) => state.urls)
    const addToUrlCache = useUrlsState((state) => state.addEntry)

    const setDownloadReq = useDownloadState(state => state.setDownloadReq)
    const resetProgress = useDownloadState(state => state.resetProgress)
    const addToProgress = useDownloadState(state => state.addToProgress)


    const onClickHandler = async () => {
        setLoading(true)
        const urls = await fetch(`https://dev.api.tsriharsha.io/sharing/urls/${shareName}/${schemaName}/${tableName}`).then((r) => {
            return r.json()
        }).then((r) => {
            return r["urls"]
        })

        let tablePath = `${shareName}/${schemaName}/${tableName}`
        setDownloadReq(tablePath, urls.length)
        await registerTable(urls, db,
            `${shareName}/${schemaName}/${tableName}`, urlCache, addToUrlCache,
            tablePath,
            addToProgress,
            resetProgress,
            `${schemaName}_${tableName} `
        )

        const query = `
        CREATE OR REPLACE VIEW ${schemaName}_${tableName} 
        AS SELECT * FROM read_parquet('${shareName}/${schemaName}/${tableName}/*')
    `
        console.log(query)
        const conn = await db?.connect()
        await conn?.query(query);
        conn?.close()

        const conn2 = await db?.connect()
        await conn2?.query(`SELECT count(1)
                            from ${schemaName}_${tableName}`);
        conn2?.close()
        setLoading(false)

    }

    return <ListItem key={props.index} style={{paddingTop: 0, paddingBottom: 0}}>
        <ListItemIcon style={{minWidth: "35px", width: "30px"}}>
            <TableViewIcon/>
        </ListItemIcon>
        <ListItemText id="switch-list-label-wifi"
                      primary={`${props.table.table_name}`}/>
        <LoadingButton variant="contained"
                       className={"RefreshButton"}
                       style={{minWidth: "0px"}}
                       loading={loading}
                       loadingIndicator={<ShareAnimation color={"rgba(159, 90, 253, 0.70)"}/>}
                       onClick={onClickHandler}
                       size={"small"}
                       endIcon={<CachedIcon/>}>
        </LoadingButton>
    </ListItem>
}


export function TableViewer() {
    const [tables, setTables] = useState([])
    const addTable = useSQLStore((state) => state.addTable)
    const [db] = useDuckDB((state) => [
        state.db
    ])

    // const addView = async (shareName: string, schemaName: string, tableName: string) => {
    //     const conn = await db?.connect()
    //             const query = `
    //         CREATE OR REPLACE VIEW ${schemaName}_${tableName}
    //         AS SELECT * FROM read_parquet('${shareName}/${schemaName}/${tableName}/*')
    //     `
    //     await conn?.query(query)
    //     conn?.close()
    // }

    const getTables = async () => {
        const urls = await fetch("https://dev.api.tsriharsha.io/sharing/get-tables").then((r) => {
            return r.json()
        }).then((r) => {
            return r
        })
        const tables = await urls

        setTables(tables)
        tables.map((table: Record<string, string>) => {
            let schemaName = table["schema_name"]
            let tableName = table["table_name"]
            addTable(`${schemaName}_${tableName}`)
        })

    }

    useEffect(() => {
        getTables()
        return () => {

        }
    }, [])


    return (
        <List
            sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}
            subheader={<ListSubheader>Share Tables</ListSubheader>}
        >
            {tables && tables.map((table, index) => {
                return <TableItem key={index} table={table} index={index}/>
            })}
        </List>
    );
}