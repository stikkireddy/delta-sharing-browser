import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import {useSQLStore} from "../store/SqlStore";
import {Backdrop, CircularProgress} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useEffect} from "react";

export const TableOutput = () => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const rows = useSQLStore((state) => state.rows)
    const columns = useSQLStore((state) => state.columns)
    const loading = useSQLStore((state) => state.loading)

    useEffect(() => {
        setPage(0)
    }, [rows, columns])



    return (

        <Paper sx={{
            width: '100%',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {
            loading && <Backdrop
                sx={{color: '#fff', position: 'absolute', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={true}
                // onClick={handleClose}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>
        }
            {/*TODO: backdrop during loading*/}
            {/*<Backdrop*/}
            {/*  sx={{ color: '#fff', position: 'absolute', zIndex: (theme) => theme.zIndex.drawer + 1 }}*/}
            {/*  open={true}*/}
            {/*  // onClick={handleClose}*/}
            {/*>*/}
            {/*  <CircularProgress color="inherit" />*/}
            {/*</Backdrop>*/}
            <TableContainer sx={{maxHeight: 440}}>
                <Table stickyHeader size="small" aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.name}
                                    style={{minWidth: 120}}
                                >
                                    {column.name}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, rowIndex) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                                        {columns.map((column, colIndex) => {
                                            const value = row[column.name];
                                            return (
                                                <TableCell key={colIndex}>
                                                    {(column.name === "explain_value") ? <Typography
                                                        style={{whiteSpace: 'break-spaces', fontFamily: 'courier'}}
                                                    >
                                                        {value}
                                                    </Typography> : <>{value}</>

                                                    }
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}