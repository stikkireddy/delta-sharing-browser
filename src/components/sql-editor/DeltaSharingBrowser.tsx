import {Box, Grid, Stack} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import {CodeEditor} from "./CodeEditor";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SplitPane from "react-split-pane";
import {TableOutput} from "./TableOutput";
import {TableViewer} from "./TableViewer";
import {useDuckDB} from "../store/DuckDB";
import {Column, Row, useSQLStore} from "../store/SqlStore";
import {AsyncDuckDB} from "@duckdb/duckdb-wasm";
import {LoadSnackBar} from "./FetchProgressbar";
import QueryStatus from "./QueryStatus";


const setStatus = (start: number, setQueryStatus: (status: string) => void, errorMsg?: string) => {
    if (!errorMsg)
        setQueryStatus(`Success: Executed in ${Date.now() - start} ms...`)
    else
        setQueryStatus(`Error: Executed in ${Date.now() - start} ms... ${errorMsg}`)
}

export const execSql = async (
    db: AsyncDuckDB | null,
    sql: string,
    setData: (columns: Column[], rows: Row[]) => void,
    setLoading: (loading: boolean) => void,
    setQueryStatus: (status: string) => void,
    maxRows?: number,
    ) => {
    setLoading(true)
    console.log("running query")
    const start = Date.now();
    const conn = await db?.connect()
    try {
        const results = await conn?.query(sql);
        let columns: { name: string }[] = []
        let resultRows = []
        let limit = maxRows ?? 1000
        var counter = 0
        if (results?.batches != null) {

            for (var i = 0; i < results?.batches.length; i++) {
                let batch = results?.batches[i]
                batch.schema.names.forEach((thisName) => {
                    columns.push({name: thisName.toString()})
                })
                let rows = batch.toArray()
                for (var j = 0; j < rows.length; j++) {
                    if (counter > limit) {
                        // finish loop here
                        setData(columns, resultRows)
                        conn?.close()
                        setLoading(false)
                        setStatus(start, setQueryStatus)
                        return
                    }
                    let row = rows[j]
                    let rowObj = row.toJSON()
                    // simplify this expense
                    const dataMap: Record<string, string> = {};
                    Object.keys(rowObj).forEach(key => {
                        dataMap[key] = String(rowObj[key]);
                    });
                    resultRows.push(dataMap)
                    counter++;
                }
            }
        }
        setData(columns, resultRows)
        conn?.close()
        setLoading(false)
        setStatus(start, setQueryStatus)
    } catch (error) {
        // @ts-ignore
        console.log(error.message)
        setLoading(false)
        conn?.close()
        // @ts-ignore
        setStatus(start, setQueryStatus, error.message)
        throw error
    }
}



export const DeltaSharingBrowser = () => {
    const [db] = useDuckDB((state) => [
        state.db
    ])
    const sql = useSQLStore((state) => state.sql)
    const setData = useSQLStore((state) => state.setData)
    const loading = useSQLStore((state) => state.loading)
    const setLoading = useSQLStore((state) => state.setLoading)
    const setQueryStatus = useSQLStore((state) => state.setQueryStatus)


    return <>
        <Grid container spacing={2}>
        <Grid item xs={12}>
            <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                spacing={2}
            >
                <LoadingButton variant="contained"
                               loading={loading}
                               onClick={() => execSql(db, sql, setData, setLoading, setQueryStatus)}
                               loadingPosition="end"
                               size={"small"}
                               endIcon={<PlayArrowIcon/>}>
                    RUN
                </LoadingButton>
            </Stack>
        </Grid>
        <Box position={"relative"} width={"100vw"}
             minHeight={"80vh"}
             height={"100%"}
             marginTop={"5px"}>
            {/*@ts-ignore*/}
            <SplitPane style={{position: "absolute", overflow: "inherit"}} split="horizontal" minSize={50}
                       defaultSize={200} maxSize={400}>
                {/*@ts-ignore*/}
                <SplitPane style={{position: "absolute"}} split="vertical" defaultSize={200} maxSize={300}>
                    <Grid item xs={2} style={{maxWidth: "100%"}}>
                        <TableViewer/>
                    </Grid>
                    <Grid item xs={9} style={{maxWidth: "100%"}}>
                        <CodeEditor/>
                    </Grid>
                </SplitPane>
                <Grid item xs={12}>
                    <QueryStatus/>
                    <TableOutput/>
                </Grid>
            </SplitPane>
        </Box>
        <Grid item xs={12} style={{maxWidth: "100%"}}>
            <LoadSnackBar key={"1"}/>
        </Grid>

    </Grid>
    </>
}