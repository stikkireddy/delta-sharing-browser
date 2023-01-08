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

export const execSql = async (
    db: AsyncDuckDB | null,
    sql: string,
    setData: (columns: Column[], rows: Row[]) => void,
    setLoading: (loading: boolean) => void,
    maxRows?: number) => {
    setLoading(true)
    console.log("running query")
    const conn = await db?.connect()
    try {
        console.log(conn)
        const results = await conn?.query(sql);
        console.log(sql)
        let columns: { name: string }[] = []
        let resultRows = []
        let limit = maxRows ?? 1000
        var counter = 0
        console.log(results)
        if (results?.batches != null) {

            for (var i = 0; i < results?.batches.length; i++) {
                let batch = results?.batches[i]
                batch.schema.names.forEach((thisName) => {
                    columns.push({name: thisName.toString()})
                })
                // console.log(batch.schema.names)
                let rows = batch.toArray()
                for (var j = 0; j < rows.length; j++) {
                    if (counter > limit) {
                        // finish loop here
                        setData(columns, resultRows)
                        conn?.close()
                        setLoading(false)
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
        console.log(columns, resultRows)
        setData(columns, resultRows)
        conn?.close()
        setLoading(false)
    } catch (error) {
        // @ts-ignore
        console.log(error.message)
        setLoading(false)
        conn?.close()
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



    return <Grid container spacing={2}>
        <Grid item xs={12}>
            <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                spacing={2}
            >
                <LoadingButton variant="contained"
                               loading={loading}
                               onClick={() => execSql(db, sql, setData, setLoading)}
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
            <SplitPane style={{position: "absolute", overflow: "inherit"}} split="horizontal" minSize={50} defaultSize={200} maxSize={400}>
                {/*@ts-ignore*/}
                <SplitPane style={{position: "absolute"}} split="vertical" defaultSize={200} maxSize={300}>
                    <Grid item xs={2} style={{maxWidth: "100%"}}>
                        <TableViewer/>
                    </Grid>
                    <Grid item xs={9} style={{maxWidth: "100%"}}>
                        <CodeEditor/>
                    </Grid>
                </SplitPane>
                {/*</div>*/}
                <Grid item xs={12}>
                    {/*@ts-ignore*/}

                    {/*@ts-ignore*/}
                    {/*    <TableViewer//>*/}
                    {/*<Grid container spacing={2}>*/}

                    {/*</Grid>*/}


                    <TableOutput/>
                </Grid>
            </SplitPane>
        </Box>
    </Grid>
}