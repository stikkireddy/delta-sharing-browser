import * as React from 'react';
import LinearProgress, {LinearProgressProps} from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {Snackbar, Stack} from "@mui/material";
import {useDownloadState} from "../store/DownloadFileStore";
import shallow from 'zustand/shallow'

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
        <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Box sx={{width: '100%', mr: 1}}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{minWidth: 35}}>
                <Typography variant="body2" color="text.secondary">{`${Math.round(
                    props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
}

const getProgressBars = (downloadReq: Record<string, number>, progress: Record<string, Array<string>>) => {
    const progressBars = Object.keys(downloadReq).map((k) => {
                            let itemProgress = progress[k] ?? []
                            let downloadProgress = (itemProgress.length / downloadReq[k]) * 100
                            let parts = k.split("/")
                            if (downloadReq[k] >= 0 && downloadProgress < 100)
                                return <Stack className={"progressbar-stack"}
                                              justifyContent={"space-between"}
                                              direction="row" key={k}>
                                    <span style={{minWidth: "200px"}}>{parts[parts.length-1]}</span>
                                    <FetchProgressbar providedProgress={downloadProgress} className={"snackbar"}/>
                                </Stack>
                            return null
    })
    const actualProgressBars = progressBars.filter((v) => v != null)
    // if (actualProgressBars.length == 0)
    //     return <></>
    return <Snackbar
            anchorOrigin={{vertical: "top", horizontal: "right"}}
            open={actualProgressBars.length != 0}
            // action={action}
            // onClose={handleClose}
            message={
                <Stack direction="column">
                    {actualProgressBars}
                </Stack>
            }
            key={"downloadsnackbar"}
        />
}

export function LoadSnackBar(props: { key: string }) {
    const downloadReq = useDownloadState(state => state.downloadReq, shallow)
    const progress = useDownloadState(state => state.progress, shallow)
        return getProgressBars(downloadReq, progress)

}

export function FetchProgressbar(props: { className?: string, currentFile?: number, maxFiles?: number,
    providedProgress?: number
}) {
    const [progress, setProgress] = React.useState(props.currentFile ?? 0);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prevProgress) => (prevProgress >= 100 ? 10 : prevProgress + 10));
        }, 800);
        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <Box sx={{width: '100%'}}>
            <LinearProgressWithLabel className={props.className} value={props.providedProgress ?? progress}/>
        </Box>
    );
}