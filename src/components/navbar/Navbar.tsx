import React from "react";
import {AppBar, Box, Button, Toolbar} from "@mui/material";


import {ShareAnimation} from "./ShareAnimation";

export const Navbar = () => {
    // const transition =
    return <AppBar position="sticky"
                   style={{backgroundColor: "#12262e"}}>
        <Toolbar variant="dense">
            <ShareAnimation/>
            <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}, paddingLeft: 3}}>
                <Button
                    key={"app"}
                    sx={{my: 2, color: 'white', display: 'block'}}
                >
                    Home
                </Button>
            </Box>
        </Toolbar>
    </AppBar>
}