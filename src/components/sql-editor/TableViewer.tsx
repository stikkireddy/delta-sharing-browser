import * as React from 'react';
import {useEffect} from 'react';
import {useSQLStore} from "../store/SqlStore";
import CustomizedTreeView from "./DatabaseExplorer";


export function TableViewer() {
    // const [tables, setTables] = useState<Array<ShareTable>>([])
    const addTable = useSQLStore((state) => state.addTable)
    const tables = useSQLStore((state) => state.tables)

    // TODO: for future when cors is easier
    // const credentialsFileData = useDownloadState((state) => state.credentialsFileData)

    const getTables = async () => {
        const tablesReq = await fetch("https://dev.api.tsriharsha.io/sharing/get-tables").then((r) => {
            return r.json()
        }).then((r) => {
            return r
        })
        const tables = await tablesReq

        tables.map((table: Record<string, string>) => {
            let shareName = table["share_name"]
            let schemaName = table["schema_name"]
            let tableName = table["table_name"]
            let shareTable = {
                shareName: shareName,
                schemaName: schemaName,
                tableName: tableName
            }
            addTable(shareTable)
            return shareTable
            // addTable(`${schemaName}_${tableName}`)
        })
        // (tables)

    }

    useEffect(() => {
        getTables()
        return () => {}
    }, [])


    return <>
        {(tables.length > 0) && <CustomizedTreeView/>}
    </>
}