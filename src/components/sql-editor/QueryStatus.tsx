import * as React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import {useSQLStore} from "../store/SqlStore";
import Typography from "@mui/material/Typography";

export default function QueryStatus() {
    const queryStatus = useSQLStore((state) => state.queryStatus)
    const severity = queryStatus?.startsWith("Error:") ? "error" : "success"
    return (
        <>
            {queryStatus && <Box sx={{width: '100%'}}>
                <Alert
                    severity={severity}
                    sx={{mb: 2}}
                >
                    <Typography
                      style={{whiteSpace: 'break-spaces', fontFamily: 'courier'}}
                    >
                    {queryStatus}
                    </Typography>
                </Alert>
            </Box>}
        </>
    );
}