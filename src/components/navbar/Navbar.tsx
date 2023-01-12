import React from "react";
import {AppBar, Box, Button, Toolbar} from "@mui/material";


import {ShareAnimation} from "./ShareAnimation";
import {useGeneralState} from "../store/GeneralState";

export const Navbar = () => {
    const setOpen = useGeneralState((state) => state.setOpenInfoModal)
    // const transition =
    return <AppBar position="sticky"
                   style={{backgroundColor: "#12262e"}}>
        <Toolbar variant="dense">
            <ShareAnimation/>
            <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}, paddingLeft: 3}}>
                {/*<Button*/}
                {/*    key={"app"}*/}
                {/*    sx={{my: 2, color: 'white', display: 'block'}}*/}
                {/*>*/}
                {/*    Home*/}
                {/*</Button>*/}
                <Button
                    key={"howto"}
                    onClick={() => setOpen(true)}
                    sx={{my: 2, color: 'white', display: 'block'}}
                >
                    Instructions
                </Button>
            </Box>
        </Toolbar>
    </AppBar>
}