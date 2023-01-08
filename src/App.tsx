import {useEffect} from 'react'
import './App.css'
import {DeltaSharingBrowser} from "./components/sql-editor/DeltaSharingBrowser";
import {Navbar} from "./components/navbar/Navbar";
import {Container} from "@mui/material";
import {startDuckDB, useDuckDB} from "./components/store/DuckDB";
import {QueryClient, QueryClientProvider,} from '@tanstack/react-query'

const queryClient = new QueryClient()


function App() {

    const db = useDuckDB((state) => state.db)
    const setDB = useDuckDB((state) => state.setDB)

    const createAndCloseConnection = async () => {
        if (db != null)
            return
        console.log("Setting up duckdb")
        await startDuckDB(setDB)
    }

    useEffect(() => {
        createAndCloseConnection()
        return () => {
        }
    }, [db])

    return (
        <div className="App">
            <QueryClientProvider client={queryClient}>
                <Navbar/>
                <Container style={{
                    marginTop: 25,
                    marginBottom: 25
                }}>
                    <DeltaSharingBrowser/>
                </Container>
            </QueryClientProvider>
        </div>
    )
}

export default App
