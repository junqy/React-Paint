import React, { useState } from 'react'
import { Dialog, TextField, Stack, Button, Typography } from '@mui/material' 

function InputDialog({open, handleClose, createItem, xDialog, yDialog, items, setItems}) {
    const [height, setHeight] = useState("0")
    const [width, setWidth] = useState("0")

    const handleChangeWidth = (e) => {
        setWidth(e.target.value)
    }

    const handleChangeHeight = (e) => {
        setHeight(e.target.value)
    }

    const handleSubmit = () => {
        const id = items.length
        const widthParsed = parseInt(width)
        const heightParsed = parseInt(height)
        const item = createItem(id, xDialog, yDialog, widthParsed, heightParsed)
        setItems([...items, item])
        handleClose()
    }

    return (
        <Dialog
        open={open}
        onClose={handleClose}
        >
            <Stack spacing={2} sx={{padding: 2}}>
                <Typography variant='body2'>Use negative values to change direction.</Typography>
                <Typography variant='caption' align='center'>- in height: up direction</Typography>
                <Typography variant='caption' align='center'>- in width: left direction</Typography>
                <TextField id="width" label="Width" value={width} onChange={handleChangeWidth} variant="outlined" />
                <TextField id="height" label="Height" value={height} onChange={handleChangeHeight} variant="outlined" />
                <Button variant='outlined' onClick={handleSubmit}>Submit</Button>
            </Stack>
        </Dialog>
    )
}

export default InputDialog