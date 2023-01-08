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

const registerTable = async (urls: Array<string>,
                             db: AsyncDuckDB | null,
                             filePath: string,
                             urlCache: Record<string, boolean>,
                             addToUrlCache: (url: string) => void) => {
    await Promise.all(urls.slice(0,10).map(async (url) => {
        const urlBase = url.split("?")[0]
        if (urlCache[urlBase] === undefined) {
            const data = await fetch(url).then((r) => {
                return r.blob()
            }).then((r) => {
                console.log(r)
                return r.arrayBuffer()
            })
            const parts = urlBase.split("/")
            const fileName = parts[parts.length - 1]
            await db?.registerFileBuffer(`${filePath}/${fileName}`, new Uint8Array(await data));
            addToUrlCache(urlBase)
        }
    }))
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

    const onClickHandler = async () => {
        setLoading(true)
        const urls = await fetch(`https://dev.api.tsriharsha.io/sharing/urls/${shareName}/${schemaName}/${tableName}`).then((r) => {
            return r.json()
        }).then((r) => {
            return r["urls"]
        })

        console.log(urlCache)
        await registerTable(urls, db,
            `${shareName}/${schemaName}/${tableName}`, urlCache, addToUrlCache)
        // const urlBase = urls[0].split("?")[0]
        // if (urlCache[urlBase] === undefined){
        //     const data = await fetch(urls[0]).then((r) => {
        //         return r.blob()
        //     }).then((r) => {
        //         console.log(r)
        //         return r.arrayBuffer()
        //     })
        //
        //     await db?.registerFileBuffer('flights/data1.parquet', new Uint8Array(await data));
        //     addToUrlCache(urlBase)
        // }

        // const url_list = JSON.stringify(urls)
        console.log(urls)
        // --         SELECT count(1) FROM parquet_scan('flights/*')
        const query = `
        CREATE OR REPLACE VIEW ${schemaName}_${tableName} 
        AS SELECT * FROM read_parquet('${shareName}/${schemaName}/${tableName}/*')
    `
        console.log(query)
        const conn = await db?.connect()
        const results = await conn?.query(query);
        console.log(results?.toString())
        conn?.close()

        const conn2 = await db?.connect()
        const results2 = await conn2?.query(`SELECT count(1)
                                             from ${schemaName}_${tableName}`);
        console.log(results2?.toString())
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
                       onClick={onClickHandler}
            //            loadingPosition="end"
                       size={"small"}
                       endIcon={<CachedIcon/>}>
        </LoadingButton>
        {/*<Switch*/}
        {/*    edge="end"*/}
        {/*    onChange={onClickHandler}*/}
        {/*/>*/}
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
            let shareName = table["share_name"]
            addTable(`${schemaName}_${tableName}`)
            //cant do this no file means no schema for inference
            // addView(shareName, schemaName, tableName)
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
            {/*<ListItem style={{paddingTop: 0, paddingBottom: 0}}>*/}
            {/*    <ListItemIcon style={{minWidth: "35px", width: "30px"}}>*/}
            {/*        <TableViewIcon/>*/}
            {/*    </ListItemIcon>*/}
            {/*    <ListItemText id="switch-list-label-bluetooth" primary="Bluetooth"/>*/}
            {/*    <Switch*/}
            {/*        edge="end"*/}
            {/*        onChange={handleToggle('bluetooth')}*/}
            {/*        checked={checked.indexOf('bluetooth') !== -1}*/}
            {/*        inputProps={{*/}
            {/*            'aria-labelledby': 'switch-list-label-bluetooth',*/}
            {/*        }}*/}
            {/*    />*/}
            {/*</ListItem>*/}
        </List>
    );
}