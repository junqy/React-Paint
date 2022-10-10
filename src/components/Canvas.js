import React, { useLayoutEffect, useState } from 'react'
import rough from 'roughjs/bundled/rough.esm'
import { Stack, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Box, IconButton, Checkbox } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InputDialog from './InputDialog';

function Canvas() {
    const generator = rough.generator()
    const [items, setItems] = useState([])
    const [actionType, setActionType] = useState('none')
    const [selectedTool, setSelectedTool] = useState("line")
    const [selectedItem, setSelectedItem] = useState(null)
    const [inputItem, setInputItem] = useState(false)
    const [dialog, setDialog] = useState(false)
    const [xDialog, setXDialog] = useState(null)
    const [yDialog, setYDialog] = useState(null)

    useLayoutEffect(() => {
        const canvas = document.getElementById('canvas')
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const roughCanvas = rough.canvas(canvas)
        
        items.forEach(({roughEl}) => roughCanvas.draw(roughEl))

    }, [items])

    const createItem = (id, x1, y1, x2, y2, elementType) => {
        if (elementType === "line") {
            const roughEl = generator.line(x1, y1, x2, y2)
            return {id, x1, y1, x2, y2, elementType, roughEl}
        } else if (elementType === "rectangle") {
            const roughEl = generator.rectangle(x1, y1, x2 - x1, y2 - y1)
            return {id, x1, y1, x2, y2, elementType, roughEl}
        } else if (elementType === "circle") {
            const roughEl = generator.ellipse(x1, y1, x2 - x1, y2 - y1)
            return {id, x1, y1, x2, y2, elementType, roughEl}
        }
    }

    const createItemDialog = (id, x1, y1, width, height, elementType) => {
        if (elementType === "line") {
            const roughEl = generator.line(x1, y1, x1 + width, y1 + height)
            const x2 = x1 + width
            const y2 = y1 + height
            return {id, x1, y1, x2, y2, elementType, roughEl}
        } else if (elementType === "rectangle") {
            const roughEl = generator.rectangle(x1, y1, width, height)
            const x2 = x1 + width
            const y2 = y1 + height
            return {id, x1, y1, x2, y2, elementType, roughEl}
        } else if (elementType === "circle") {
            const roughEl = generator.ellipse(x1, y1, width, height)
            const x2 = x1 + width
            const y2 = y1 + height
            return {id, x1, y1, x2, y2, elementType, roughEl}
        }
    }

    const updateItem = (id, x1, y1, x2, y2, type) => {
        const item = createItem(id, x1, y1, x2, y2, type)
        setItems(items.map((el, index) => 
            index === id ? el = item : el
        ))
    }

    const clearItems = () => {
        setItems([])
    }

    const handleInputItemChange = (e) => {
        setInputItem(e.target.checked)
    }
    
    const insideBoundaries = (x, y, item) => {
        if (item.elementType === "rectangle" || item.elementType === "circle") {
            const minX = Math.min(item.x1, item.x2)
            const maxX = Math.max(item.x1, item.x2)
            const minY = Math.min(item.y1, item.y2)
            const maxY = Math.max(item.y1, item.y2)
            return x >= minX && x <= maxX && y >= minY && y <= maxY
        } else {
            const pointA = { x: item.x1, y: item.y1 }
            const pointB = { x: item.x2, y: item.y2 }
            const pointC = { x: x, y: y }
            const res = distanceEquation(pointA, pointB) - (distanceEquation(pointA, pointC) + distanceEquation(pointB, pointC))
            return Math.abs(res) < 1
        }
    }
    
    //obliczanie czy punkt znajduje się na linii
    const distanceEquation = (pointA, pointB) => {
        return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2))
    }
    
    const getItemPosition = (x, y, items) => {
        return items.find(item => insideBoundaries(x, y, item))
    }

    const handleSelectedElement = (e) => {
        setSelectedTool(e.target.value)
    }

    const dialogItemHelper = (id, x, y, width, height ) => {
        console.log(createItemDialog(id, x, y, width, height, selectedTool))
        return createItemDialog(id, x, y, width, height, selectedTool)
    }

    const handleDialogClose = () => {
        setDialog(false)
    }

    const handleMouseDown = (e) => {
        if (selectedTool === 'select') {
            const item = getItemPosition(e.clientX, e.clientY, items)
            if(item){
                const positionX = e.clientX - item.x1
                const positionY = e.clientY - item.y1
                setSelectedItem({...item, positionX, positionY})
                setActionType('moving')  
                console.log("hehe")
            }
        } else if (inputItem  && (selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'line')) {
            setXDialog(e.clientX)
            setYDialog(e.clientY)
            setDialog(true)
        } else if (selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'line') {
            const id = items.length
            setActionType('drawing')
            const item = createItem(id, e.clientX, e.clientY, e.clientX, e.clientY, selectedTool)
            setItems([...items, item])
        }

    }

    const handleMouseMove = (e) => {
        if (selectedTool === 'select'){
            e.target.style.cursor = getItemPosition(e.clientX, e.clientY, items) ? 
            'move' : 'default'
        }

        if (actionType === 'none') {
            return

        } else if (actionType === 'drawing') {
            const id = items.length - 1
            updateItem(id, items[id].x1, items[id].y1, e.clientX, e.clientY, selectedTool)

        } else if (actionType === 'moving') {
            const {id, x1, y1, x2, y2, elementType, positionX, positionY} = selectedItem
            const width = x2 - x1
            const height = y2 - y1
            const centerX = e.clientX - positionX
            const centerY = e.clientY - positionY
            updateItem(id, centerX, centerY, centerX + width, centerY + height, elementType)

        }
    }

    const handleMouseUp = () => {
        setActionType('none')
        setSelectedItem(null)
    }

    return (
        <Box>
            <Stack>
                <Stack 
                    direction='row' 
                    position='fixed'                        
                    sx={{
                        marginLeft: 2, 
                        marginTop: 1, 
                        paddingX: 2,
                        paddingY: 1,
                        backgroundColor: "#F3E37C",
                        borderRadius: 2
                    }}
                >
                    <Box>
                        <FormControl>
                            <FormLabel id="element-buttons-form" disabled>
                                Tools
                            </FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby="element-buttons-form"
                                name="element-radio-group"
                                value={selectedTool}
                                onChange={(e) => handleSelectedElement(e)}
                            >
                                <FormControlLabel value="select" control={<Radio color='default'/>} label="Selection" />
                                <FormControlLabel value="line" control={<Radio color='default'/>} label="Line" />
                                <FormControlLabel value="rectangle" control={<Radio color='default'/>} label="Rectangle" />
                                <FormControlLabel value="circle" control={<Radio color='default'/>} label="Circle" />
                            </RadioGroup>
                        </FormControl>
                    </Box>
                    <Box marginTop={3}>
                        <FormControlLabel 
                            control={
                                <Checkbox 
                                checked={inputItem} 
                                onChange={handleInputItemChange}
                                color='default'
                            />} 
                            label="Input Values" />
                    </Box>
                    <Box marginTop={3}>
                        <IconButton onClick={clearItems} sx={{fontSize: 'small'}}>
                            <DeleteIcon/>
                        </IconButton>
                    </Box>
                </Stack>
                <InputDialog 
                    handleClose={handleDialogClose} 
                    open={dialog} 
                    createItem={dialogItemHelper}
                    xDialog={xDialog}
                    yDialog={yDialog}
                    items={items}
                    setItems={setItems}
                />
                <canvas 
                    id="canvas" 
                    width={window.innerWidth}
                    height={window.innerHeight}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                </canvas>
            </Stack>
        </Box>
    )
}

export default Canvas