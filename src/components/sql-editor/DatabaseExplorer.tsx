import * as React from 'react';
import SvgIcon, {SvgIconProps} from '@mui/material/SvgIcon';
import {alpha, styled} from '@mui/material/styles';
import TreeView from '@mui/lab/TreeView';
import TreeItem, {TreeItemProps, treeItemClasses} from '@mui/lab/TreeItem';
import Collapse from '@mui/material/Collapse';
// web.cjs is required for IE11 support
// import { useSpring, animated } from 'react-spring/web.cjs';
import {TransitionProps} from '@mui/material/transitions';
import {useSpring, animated} from "react-spring";
import {ShareAnimation} from "../navbar/ShareAnimation";
import CachedIcon from "@mui/icons-material/Cached";
import LoadingButton from "@mui/lab/LoadingButton";
import {Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {
    DuckDbColumn,
    DuckDbTreeView,
    DuckDbView, getAllTablesInDuckDb,
    ShareHelper,
    ShareTable,
    ShareTreeView,
    useSQLStore
} from "../store/SqlStore";
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import {useEffect, useState} from "react";
import {useDuckDB} from "../store/DuckDB";
import {useUrlsState} from "../store/PresignedUrlCache";
import {useDownloadState} from "../store/DownloadFileStore";
import {AsyncDuckDB, DuckDBDataProtocol} from "@duckdb/duckdb-wasm";
import {AsyncDuckDBConnection} from "@duckdb/duckdb-wasm/dist/types/src/parallel/async_connection";
import {FileSystemDirectoryHandle} from "native-file-system-adapter/types/src/showDirectoryPicker";
import {getOrPutArrayBuffer} from "../../cache/FileSystemCache";
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import {toast} from "react-toastify";



function MinusSquare(props: SvgIconProps) {
    return (
        <SvgIcon fontSize="inherit" style={{width: 14, height: 14}} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path
                d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z"/>
        </SvgIcon>
    );
}

function PlusSquare(props: SvgIconProps) {
    return (
        <SvgIcon fontSize="inherit" style={{width: 14, height: 14}} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path
                d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z"/>
        </SvgIcon>
    );
}

function CloseSquare(props: SvgIconProps) {
    return (
        <SvgIcon
            className="close"
            fontSize="inherit"
            style={{width: 14, height: 14}}
            {...props}
        >
            {/* tslint:disable-next-line: max-line-length */}
            <path
                d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z"/>
        </SvgIcon>
    );
}

function TransitionComponent(props: TransitionProps) {
    const style = useSpring({
        from: {
            opacity: 0,
            transform: 'translate3d(20px,0,0)',
        },
        to: {
            opacity: props.in ? 1 : 0,
            transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
        },
    });

    return (
        <animated.div style={style}>
            <Collapse {...props} />
        </animated.div>
    );
}

const StyledTreeItem = styled((props: TreeItemProps) => (
    <TreeItem {...props} TransitionComponent={TransitionComponent}/>
))(({theme}) => ({
    [`& .${treeItemClasses.iconContainer}`]: {
        '& .close': {
            opacity: 0.3,
        },
    },
    [`& .${treeItemClasses.group}`]: {
        marginLeft: 15,
        paddingLeft: 18,
        borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
}));

const registerTable = async (urls: Array<string>,
                             db: AsyncDuckDB | null,
                             conn: AsyncDuckDBConnection | null,
                             urlCache: Record<string, boolean>,
                             addToUrlCache: (url: string) => void,
                             shareTable: ShareTable,
                             updateProgress: (table: string, entry?: string) => void,
                             resetProgress: (table: string) => void,
                             cacheDirHandle: FileSystemDirectoryHandle | null,
) => {
    let tablePath = ShareHelper.makeDuckDbParquetBasePath(shareTable)
    await Promise.all(urls
        // .slice(0, 10)
        .map(async (url, index) => {
            let urlBase = url.split("?")[0]
            let fileNameParts = urlBase.split("/")
            let fileName = fileNameParts[fileNameParts.length - 1]
            if (urlCache[urlBase] === undefined) {
                const data = (cacheDirHandle == null) ?
                    (await fetch(url).then((r) => {
                        return r.blob()
                    }).then((r) => {
                        return r.arrayBuffer()
                    })) : getOrPutArrayBuffer(cacheDirHandle,
                        shareTable.shareName,
                        shareTable.schemaName,
                        shareTable.tableName,
                        fileName,
                        url).then((r) => {
                        return r
                    })
                // const parts = urlBase.split("/")
                // const fileName = parts[parts.length - 1]
                try {
                    console.log("loading from browser filereader")
                    if (cacheDirHandle != null) {
                        // local dir requires registering the file handle
                        // TODO: refactor the weird awaits
                        await db?.registerFileHandle(`${tablePath}/${fileName}`, await (await data).getFile(), DuckDBDataProtocol.BROWSER_FILEREADER, true)
                    } else {
                        await db?.registerFileBuffer(`${tablePath}/${fileName}`, new Uint8Array(await data));
                    }
                } catch (e) {
                    console.log(`Error to load file: ${tablePath}/${fileName}`)
                    throw e
                }
                addToUrlCache(urlBase)
            }
            let viewSchemaName = ShareHelper.makeDuckDbViewSchema(shareTable)
            let viewFullName = ShareHelper.makeDuckDbViewFullName(shareTable)
            let viewSchemaSql = ShareHelper.makeDuckDbViewSchemaSql(shareTable)
            let viewSql = ShareHelper.makeDuckDbViewSql(shareTable)
            console.log(`Creating schema view: ${viewSchemaName} to path ${tablePath}/* from request: ${index}`)
            // const conn = await db?.connect()
            console.log(viewSchemaSql)
            await conn?.query(viewSchemaSql);
            // hack to let atleast one of them create a view who ever finishes first
            console.log(`Loading view: ${viewFullName} to path ${tablePath}/* from request: ${index}`)
            console.log(viewSql)
            await conn?.query(viewSql);
            // conn?.close()
            updateProgress(tablePath, url)
        }))
    resetProgress(tablePath)
}

const ReloadDataButton = (props: {table: ShareTable}) => {
    const [loading, setLoading] = useState(false)
    const [shareName, schemaName, tableName] = [props.table.shareName,
        props.table.schemaName,
        props.table.tableName,]
    const db = useDuckDB((state) => state.db)
    const conn = useDuckDB((state) => state.conn)
    const urlCache = useUrlsState((state) => state.urls)
    const addToUrlCache = useUrlsState((state) => state.addEntry)

    const setDownloadReq = useDownloadState(state => state.setDownloadReq)
    const resetProgress = useDownloadState(state => state.resetProgress)
    const addToProgress = useDownloadState(state => state.addToProgress)

    const cacheDirHandle = useDownloadState((state) => state.cacheDirHandle)

    const addDuckDbView = useSQLStore((state => state.addDuckDbView))

    const onClickHandler = async () => {
        setLoading(true)
        const urls = await fetch(`https://dev.api.tsriharsha.io/sharing/urls/${shareName}/${schemaName}/${tableName}`).then((r) => {
            return r.json()
        }).then((r) => {
            return r["urls"]
        })


        // let tablePath = `${shareName}/${schemaName}/${tableName}`
        let tablePath = ShareHelper.makeDuckDbParquetBasePath(props.table)
        setDownloadReq(tablePath, urls.length)
        await registerTable(
            urls,
            db,
            conn,
            urlCache,
            addToUrlCache,
            props.table,
            addToProgress,
            resetProgress,
            cacheDirHandle
        )


        // const conn = await db?.connect()
        let viewSchemaSql = ShareHelper.makeDuckDbViewSchemaSql(props.table)
        console.log(viewSchemaSql)
        await conn?.query(viewSchemaSql);
        let viewSql = ShareHelper.makeDuckDbViewSql(props.table)
        console.log(viewSql)
        await conn?.query(viewSql);
        // conn?.close()
        // console.log(results?.toString())

        // const conn2 = await db?.connect()
        const results2 = await conn?.query(`SELECT count(1)
                                            from ${ShareHelper.makeDuckDbViewFullName(props.table)}`);
        // conn?.close()
        console.log(results2?.toString())
        await getAllTablesInDuckDb(conn, addDuckDbView)
        setLoading(false)

    }

    return <LoadingButton variant="contained"
                                       className={"TreeRefreshButton"}
                                       style={{minWidth: "0px"}}
                                       loading={loading}
                                       onClick={onClickHandler}
                                       loadingIndicator={<ShareAnimation
                                           height={22}
                                           width={22}
                                           color={"rgba(159, 90, 253, 0.70)"}
                                       />}
                                       size={"small"}
                                       endIcon={<DownloadForOfflineIcon/>}/>
}

const TableLabel = (props: { tableName: string, table: ShareTable }) => {
    return <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
    >
        <Typography>{props.tableName}</Typography>
        <ReloadDataButton table={props.table}/>
    </Stack>
}

const ColumnLabel = (props: { name: string, dataType: string }) => {
    return <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
    >
        <Typography>{props.name}</Typography>
        <Typography>{props.dataType}</Typography>
    </Stack>
}

const computeShareTreeView = (treeView: ShareTreeView) => {
    let firstLevelNodesToExpand: Array<string> = [];
    let secondLevelNodesToExpand: Array<string> = [];
    let res = Object.keys(treeView).map((firstLevelNode: string, firstLevelIndex) => {
            let firstKey = firstLevelIndex+1
            firstLevelNodesToExpand.push(`${firstKey}`)
            return <StyledTreeItem key={`${firstKey}`} nodeId={`${firstKey}`} label={firstLevelNode}>
                {
                    Object.keys(treeView[firstLevelNode]).map((secondLevelNode: string, secondLevelIndex) => {
                        let secondKey = secondLevelIndex+1
                        secondLevelNodesToExpand.push(`${secondKey}000`)
                        return <StyledTreeItem key={`${secondKey}000`} nodeId={`${secondKey}000`} label={secondLevelNode}>
                            {
                                Object.keys(treeView[firstLevelNode][secondLevelNode]).map((thirdLevelNode: string, thirdLevelIndex) =>
                                    <StyledTreeItem key={`${thirdLevelIndex}000000`} nodeId={`${thirdLevelIndex}000000`} label={<TableLabel
                                        tableName={thirdLevelNode} table={treeView[firstLevelNode][secondLevelNode][thirdLevelNode]}
                                    />}/>
                                )
                            }
                        </StyledTreeItem>
                    })
                }
            </StyledTreeItem>
        }
    )
    return {
        expandNodes: [...firstLevelNodesToExpand, ...secondLevelNodesToExpand],
        res: res
    }

}

const computeDuckDbTreeView = (treeView: DuckDbTreeView) => {
    let firstLevelNodesToExpand: Array<string> = [];
    const toastFunc = () => {};
        // toast('🦄 Wow so easy!', {
        // position: "top-center",
        // autoClose: 2000,
        // hideProgressBar: false,
        // closeOnClick: true,
        // pauseOnHover: true,
        // draggable: true,
        // progress: undefined,
        // theme: "light",
        // });
    let res = Object.keys(treeView).map((firstLevelNode: string, firstLevelIndex) => {
            let firstKey = firstLevelIndex+1
            firstLevelNodesToExpand.push(`${firstKey}`)
            return <StyledTreeItem
                    key={`${firstLevelNode}`}
                    // onClick={(data) => {toastFunc(); console.log(firstLevelNode);}}
                    nodeId={`${firstLevelNode}`}
                    label={firstLevelNode}>
                {
                    Object.keys(treeView[firstLevelNode]).map((secondLevelNode: string, secondLevelIndex) => {
                        let secondKey = secondLevelIndex+1
                        return <StyledTreeItem
                                // onClick={(data) => {toastFunc(); console.log(firstLevelNode);}}
                                key={`${firstLevelNode}//${secondLevelNode}`}
                                nodeId={`${firstLevelNode}//${secondLevelNode}`}
                                label={secondLevelNode}>
                            {
                                treeView[firstLevelNode][secondLevelNode].columns.map((col: DuckDbColumn, thirdLevelIndex) =>
                                    <StyledTreeItem
                                        key={`${thirdLevelIndex}000000`}
                                        // onClick={(data) => {toastFunc(); console.log(firstLevelNode);}}
                                        nodeId={`${firstLevelNode}//${secondLevelNode}//${col.columnName}`}
                                        label={<ColumnLabel name={col.columnName} dataType={col.dataType} />}
                                        // label={`${col.columnName} - ${col.dataType}`}
                                    />
                                )
                            }
                        </StyledTreeItem>
                    })
                }
            </StyledTreeItem>
        }
    )
    return {
        expandNodes: [...firstLevelNodesToExpand],
        res: res
    }

}

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

function SharingBrowserAccordion(props: {shares: React.ReactNode, views?: React.ReactNode}) {
  // const [expanded, setExpanded] = React.useState<string | false>('sharesPanel');
  //
  // const handleChange =
  //   (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
  //     setExpanded(newExpanded ? panel : false);
  //   };

  return (
    <div>
      <Accordion className={"DatabaseViewerAccordion"}
                 defaultExpanded={true}
                 // expanded={expanded === 'sharesPanel'}
                 // onChange={handleChange('sharesPanel')}
      >
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Typography>Browse Shares</Typography>
        </AccordionSummary>
        <AccordionDetails>
            {props.shares}
        </AccordionDetails>
      </Accordion>
        {props.views && <Accordion className={"DatabaseViewerAccordion"}
                                   defaultExpanded={true}
                                   // expanded={expanded === 'viewsPanel'}
                                   // onChange={handleChange('viewsPanel')}
        >
            <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
                <Typography>Loaded Tables</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {props.views}
            </AccordionDetails>
        </Accordion>}
    </div>
  );
}

export default function CustomizedTreeView() {
    const tables = useSQLStore((state) => state.tables)
    const duckDbViews = useSQLStore((state) => state.duckDbViews)
    const treeView = ShareHelper.makeShareTreeView(tables)
    const duckDbTreeView = ShareHelper.makeDuckDbTreeView(duckDbViews)
    const {expandNodes, res} = computeShareTreeView(treeView)
    const {expandNodes: duckDbExpandNodes, res: duckDbTreeRes} = computeDuckDbTreeView(duckDbTreeView)
    // console.log([...first, ...second])
    const shareTree = (
        <TreeView
            aria-label="customized"
            defaultExpanded={expandNodes}
            defaultCollapseIcon={<MinusSquare/>}
            defaultExpandIcon={<PlusSquare/>}
            defaultEndIcon={<CloseSquare/>}
            sx={{flexGrow: 1, maxWidth: 400, overflowY: 'auto'}}
        >
            {...res}
        </TreeView>)
    const duckDbTree = (
        <TreeView
            aria-label="customized"
            // defaultExpanded={duckDbExpandNodes}
            defaultCollapseIcon={<MinusSquare/>}
            defaultExpandIcon={<PlusSquare/>}
            defaultEndIcon={<CloseSquare/>}
            sx={{flexGrow: 1, maxWidth: 400, overflowY: 'auto'}}
        >
            {...duckDbTreeRes}
        </TreeView>
    );
    return <><SharingBrowserAccordion shares={shareTree} views={duckDbTree}/></>
}