import {useEffect} from 'react'
import './App.css'
import {DeltaSharingBrowser} from "./components/sql-editor/DeltaSharingBrowser";
import {Navbar} from "./components/navbar/Navbar";
import {Container} from "@mui/material";
import {startDuckDB, useDuckDB} from "./components/store/DuckDB";
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()


function App() {
    // const [count, setCount] = useState(0)
    // const [db, setDB] = useState<duckdb.AsyncDuckDB | null>(null)
    // const [conn, setConn] = useState<AsyncDuckDBConnection | null>(null)
    const [db, setDB] = useDuckDB((state) => [
        state.db, state.setDB
    ])
    // const {db} = useDuckDB((state) => state.db)
    const createAndCloseConnection = async () => {
        console.log("Setting up duckdb")
        if (db != null)
            return
        await startDuckDB(setDB)
    }
    // const runQuery = () => {
    //             const results = await conn?.query<{ v: arrow.Int32 }>(`
    //         SELECT * FROM generate_series(1, 100) t(v)
    //     `);
    //     console.log(results)
    //     await closeDuckDB(db, conn, setDB, setConn)
    // }

    useEffect(() => {
        createAndCloseConnection()
        return () => {
        }
    }, [])

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
