import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import {useGeneralState} from "../store/GeneralState";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


export const HowToModal = () => {
    const open = useGeneralState((state) => state.openInfoModal)
    const setOpen = useGeneralState((state) => state.setOpenInfoModal)

    return (
        <div>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                keepMounted
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                        <b> How to use this Application </b>
                    </Typography>
                    <Typography id="modal-modal-description" sx={{mt: 2}}>
                        <ol>
                            <li> Expand Browse Shares, and then click the download icons into your share.</li>
                            <li> Expand the Loaded Tables and you should see items being populated.</li>
                            <li> Click on a schema and you should see the environment set to use that schema.</li>
                            <li> Fire away all your queries!</li>
                        </ol>
                        <b>You may notice that delta sharing involves downloading files but the moment one file is
                            downloaded you can start running queries.</b>
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
}