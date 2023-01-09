import {Backdrop, Box, CircularProgress, Grid, Hidden, Stack, Switch} from "@mui/material";
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
import {getDirHandle, getShareTokenAuth} from "../../cache/FileSystemCache";
import {useDownloadState} from "../store/DownloadFileStore";
// @ts-ignore
import sqlLimiter from 'sql-limiter'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Typography from "@mui/material/Typography";
import * as React from "react";

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
        let actualQuery = sqlLimiter.limit(sql, ["limit"], 1000000)
        console.log(`Executing query: ${actualQuery}`)
        const results = await conn?.query(actualQuery);
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
    const setCacheDirHandle = useDownloadState((state) => state.setCacheDirHandle)
    const cacheDirHandle = useDownloadState((state) => state.cacheDirHandle)
    const tables = useSQLStore((state) => state.tables)
    const selectedSql = useSQLStore((state) => state.selectedSql)
    // const credentialsFileData = useDownloadState((state) => state.credentialsFileData)
    // const setCreds = useDownloadState((state) => state.setCredentialsFileData)

    const getMetaStore = (host: string) => {
        let parts = host.split("/")
        return parts[parts.length - 1]
    }

    return <>
        {(db === null || tables.length === 0) && <Backdrop
                sx={{color: '#fff', position: 'absolute', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={true}
                // onClick={handleClose}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>}
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="center"
                        spacing={1}
                    >
                        {/*TODO: document cors before enabling this feature*/}

                        {/*    {credentialsFileData && <Typography*/}
                        {/*        style={{whiteSpace: 'break-spaces',}}*/}
                        {/*    >*/}
                        {/*        Connected to: {getMetaStore(credentialsFileData.host)}*/}
                        {/*    </Typography>}*/}
                        {/*    <LoadingButton variant="contained"*/}
                        {/*        // loading={loading}*/}
                        {/*                   onClick={() => {*/}
                        {/*                       getShareTokenAuth().then((auth) => {*/}
                        {/*                               setCreds(auth)*/}
                        {/*                           }*/}
                        {/*                       )*/}
                        {/*                   }}*/}
                        {/*                   loadingPosition="end"*/}
                        {/*                   size={"small"}*/}
                        {/*                   endIcon={<FileUploadIcon/>}>*/}
                        {/*        Attach Share*/}
                        {/*    </LoadingButton>*/}
                        <FormGroup>
                            <FormControlLabel
                                control={<Switch color={"success"}
                                                 checked={cacheDirHandle !== null}
                                                 onClick={() => {
                                                     if (cacheDirHandle === null) {
                                                         getDirHandle().then((r) => {
                                                             setCacheDirHandle(r)
                                                             console.log("Configured Cache Dir Handle")
                                                         })
                                                     }
                                                 }}
                                />}
                                label={(cacheDirHandle === null) ? "Create Local Cache" : "Using Local Cache"}
                                labelPlacement={"end"}
                            />
                        </FormGroup>
                        <LoadingButton variant="contained"
                                       loading={loading}
                                       onClick={() => execSql(db, sql, setData, setLoading, setQueryStatus)}
                                       loadingPosition="end"
                                       size={"small"}
                                       endIcon={<PlayArrowIcon/>}>
                            RUN {selectedSql ? "Selected" : ""}
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