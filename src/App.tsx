import React, {useEffect} from 'react'
import './App.css'
import {DeltaSharingBrowser} from "./components/sql-editor/DeltaSharingBrowser";
import {Navbar} from "./components/navbar/Navbar";
import {Container} from "@mui/material";
import {startDuckDB, useDuckDB} from "./components/store/DuckDB";
import {QueryClient, QueryClientProvider,} from '@tanstack/react-query'
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {useDownloadState} from "./components/store/DownloadFileStore";
import {HowToModal} from "./components/navbar/HowToModal";

const queryClient = new QueryClient()


function App() {

    const db = useDuckDB((state) => state.db)
    const setDB = useDuckDB((state) => state.setDB)
    const setConn = useDuckDB((state) => state.setConn)
    const conn = useDuckDB((state) => state.conn)
    const cacheDirHandle = useDownloadState((state) => state.cacheDirHandle)
    const setCacheDirHandle = useDownloadState((state) => state.setCacheDirHandle)

    const startDb = async () => {
        if (db != null)
            return
        console.log("Setting up duckdb")
        await startDuckDB(setDB, setConn, cacheDirHandle, setCacheDirHandle)
    }

    const closeDb = async () => {
        await conn?.close()
    }


    useEffect(() => {
        startDb()
        return () => {
            closeDb()
        }
    }, [])

    return (
        <div className="App">
            <QueryClientProvider client={queryClient}>
                <Navbar/>
                <Container
                    className={"MainCanvasContainer"}
                    // style={{
                    // marginTop: 25,
                    // marginBottom: 25
                // }}
                    maxWidth={false}>
                    <DeltaSharingBrowser/>
                </Container>
                <ToastContainer />
                <HowToModal/>
            </QueryClientProvider>
        </div>
    )
}

export default App
