const grid = document.querySelector("#grid");
const colorPalette = document.querySelector("#color-palette");
const addRemoveBtns = document.querySelector("#add-remove-btns");
const brushSlider = document.querySelector("#brush-slider");
const brushSliderDisplay = document.querySelector("#brush-slider-display");
const gridSlider = document.querySelector("#grid-slider");
const gridSliderDisplay = document.querySelector("#grid-slider-display");
const clearBtn = document.querySelector("#clear-btn");
const randomBtn = document.querySelector("#random-btn");
const rainbowBtn = document.querySelector("#rainbow-btn");
const brushTool = document.querySelector("#brush-tool");
const fillTool = document.querySelector("#fill-tool");
const eraseTool = document.querySelector("#erase-tool");
const undoBtn = document.querySelector("#undo-btn");
const redoBtn = document.querySelector("#redo-btn");
const gridlinesBtn = document.querySelector("#gridlines-btn");
const addColorBtn = document.querySelector("#add-color-btn");
const removeColorBtn = document.querySelector("#remove-color-btn");
const canvasHistory = [];
const gridSizeHistory = [];
const toolColorOn = "goldenrod";
const toolColorOff = "#fff9";
const toolColorUnavailable = "#555";
const tools = document.querySelectorAll(".tool");
const btns = document.querySelectorAll(".btn");
const modeBtns = document.querySelectorAll(".mode-btn");
const colorPicker = document.querySelector("#color-picker");
const gridWidth = 512;
const body = document.body;


// let gridSize = gridSlider.value;

let gridMultiplier = gridSlider.value;
// creates grid sizes of 2, 4, 8, 16, 32, 64
let gridSize = 2**gridMultiplier;


// let pixelSize = `${512 / gridSize}px`;
let pixelSize = `${gridWidth/gridSize}px`;

let currentColor = "#FF0000";
//initial color palette
let colors = [
    "#FF0000", 
    "#F2A93B", 
    "#FFFF54", 
    "#A5CC4F", 
    "#377E22", 
    "#42C5D7", 
    "#075EBB", 
    "#8C00FF", 
    "#6B0E71", 
    "#DE179F", 
    "#FFADAD", 
    "#FBE5C8", 
    "#712C0E", 
    "#000000", 
    "#666666", 
    "#CCCCCC",
    "#FFFFFF"
];
let mouseDown = 0;
let isRandomColors = false;
let isRainbowColors = false;
let isFill = false;
let isErase = false;
let isRemoveItem = false;
let undoCounter = 0;
let undoCounterMax = 0;
let isGridlinesOn = true;
let randomCounter = 0;
let brushSize = 1;
let redSpeed = 0;
let greenSpeed = 0;
let blueSpeed = 0;
let colorTemp = currentColor;

let xPos = null;
let yPos = null;



// detect when mouse is down
body.onmousedown = () => {
    mouseDown = 1;
};
body.onmouseup = () => {
    mouseDown = 0;
};
body.onmouseleave = () => {
    mouseDown = 0;
};

createGrid(gridSize, pixelSize);

// create pixel grid
function createGrid(gridSize, pixelSize, saveUndo = true, canvasToLoad = []) {
    
    let currentCanvas = [];
    let isCanvasImported = false;

    if (canvasToLoad.length != 0) {
        currentCanvas = copyArray(canvasToLoad);
        isCanvasImported = true;
    }
    
    //reset current grid
    grid.innerHTML = "";

    // create new grid
    for (let i = 0; i < gridSize; i++) {
        const currentCanvasRow = [];
        for(let j = 0; j < gridSize; j++) {
            const pixel = document.createElement("div");
            pixel.className = "pixel";
            pixel.style.width = pixelSize;
            pixel.style.height = pixelSize;
            pixel.setAttribute('id', `i${i}j${j}`);
            if (isCanvasImported) {
                pixel.style.backgroundColor = currentCanvas[i][j];
            } else {
                pixel.style.backgroundColor = "white";
            }

            if (isGridlinesOn) {
                pixel.style.borderWidth = "1px";
            } else {
                pixel.style.borderWidth = "0px";
            }

            grid.appendChild(pixel);
            //pixel.textContent = i + " , " + j;

            pixel.addEventListener("mouseover", () => {
                xPos = j;
                yPos = i;

                // returns an array of pixels
                const brushPixels = createBrushPixels();
                
                if (mouseDown && !isFill) {
                    if (isRandomColors) {
                        randomColor();
                    }
                    if (isRainbowColors){
                        rainbowColors();
                    }
                    // brush pixels is and array of pixels within the current brush size
                    brushPixels.forEach((brushPixel) => {
                        document.querySelector(brushPixel).style.backgroundColor = currentColor;
    
                        // extract i & j from pixel id
                        // use regex to split id at i and j and get their values
                        let iBrushPixel = brushPixel.split(/[ij]/)[1];
                        let jBrushPixel = brushPixel.split(/[ij]/)[2];
                        currentCanvas[iBrushPixel][jBrushPixel] = currentColor;
                    });
                }
            });
            pixel.addEventListener("mousedown", () => {
                if (isRandomColors) {
                    randomColor();
                }
                if (isRainbowColors){
                    rainbowColors();
                }
                if (isFill && currentCanvas[yPos][xPos] !== currentColor) {
                    fill(xPos, yPos, currentCanvas[yPos][xPos], currentCanvas);
                    createGrid(gridSize, pixelSize, false, currentCanvas);
                }
                
                createBrushPixels().forEach((brushPixel) => {
                    document.querySelector(brushPixel).style.backgroundColor = currentColor;

                    // extract i & j from pixel id
                    // use regex to split id at i and j and get their values
                    let iBrushPixel = brushPixel.split(/[ij]/)[1];
                    let jBrushPixel = brushPixel.split(/[ij]/)[2];
                    currentCanvas[iBrushPixel][jBrushPixel] = currentColor;
                });
                console.log(currentColor);
            });


            pixel.addEventListener("mouseout", () => {
                removeBrushOutline();
            });
            pixel.addEventListener("mouseup", () => {
                saveCanvasUndo(currentCanvas, gridSize);
                undoRedoStyleUpdate();
            });
            if (!isCanvasImported) {
                currentCanvasRow.push("#FFFFFF");
            }
        }
        if (!isCanvasImported){
            currentCanvas.push(currentCanvasRow);
        }
    }
    // When adjusting grid size for an undo, we don't want to save the state of the current canvas
    // so the function is called with the saveUndo parameter set to false
    if (saveUndo == true) {
        saveCanvasUndo(currentCanvas, gridSize);
    }
}




// save current grid to undo history
function saveCanvasUndo(canvasSnapshot, gridSizeSnapshot) {

    canvasHistory[undoCounter] = copyArray(canvasSnapshot);
    gridSizeHistory[undoCounter] = gridSizeSnapshot;

    // keeps track of undo position
    undoCounter++;
    undoCounterMax = undoCounter;
    undoRedoStyleUpdate();

}




// undo function
undoBtn.addEventListener("click", undo);

function undo() {
    if (undoCounter <= 1) {
        //console.log("NOTHING TO UNDO");
        return;
    }

    const lastUndo = canvasHistory[undoCounter - 2];
    const lastGridSize = gridSizeHistory[undoCounter - 2];
    const lastPixelSize = `${gridWidth/lastGridSize}px`;

    updateSlider(lastGridSize);

    createGrid(lastGridSize, lastPixelSize, false, lastUndo);

    undoCounter--;
    undoRedoStyleUpdate();
}


undoRedoStyleUpdate();

function undoRedoStyleUpdate() {
    if (undoCounter <= 1) {
        undoBtn.style.color = toolColorUnavailable;
    } else {
        undoBtn.style.color = toolColorOff;
    }

    if (undoCounter >= undoCounterMax) {
        redoBtn.style.color = toolColorUnavailable;
    } else {
        redoBtn.style.color = toolColorOff;
    }
}



// redo function
redoBtn.addEventListener("click", redo);

function redo() {
    if (undoCounter >= undoCounterMax) {
        //console.log("NOTHING TO REDO");
        return;
    }
    const nextRedo = canvasHistory[undoCounter];
    const nextGridSize = gridSizeHistory[undoCounter];
    const nextPixelSize = `${gridWidth/nextGridSize}px`;

    updateSlider(nextGridSize);

    createGrid(nextGridSize, nextPixelSize, false, nextRedo);

    undoCounter++;
    undoRedoStyleUpdate();
}


// undo & redo shortcut keys

document.onkeydown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code == "KeyZ") {
        redo();
    }
    else if ((e.metaKey || e.ctrlKey) && e.code == "KeyZ") {
        undo();
    }
}

// create color pallet from colors array

createColorPalette(colors);

function createColorPalette(colors) {
    colorPalette.innerHTML = "";

    colors.forEach((color) => {
        const colorBox = document.createElement("div");
        colorBox.style.backgroundColor = color;
        colorPalette.append(colorBox);
        colorBox.setAttribute('id', color);
        colorBox.setAttribute("title", color);
        colorBox.className = 'color';
        colorBox.addEventListener("click", () => {
            if (!(isRainbowColors || isRemoveItem)) {
                if(isErase) {
                    colorTemp = color;
                    colorPicker.value = colorTemp;
                } else {
                    currentColor = color;
                    colorTemp = color;
                    colorPicker.value = currentColor;
                }
            }
        });
    });
}


// add color button

addColorBtn.addEventListener("click", () => {
    // add new color to array
    if (colors.length >= 45) {
        //console.log("Reached color limit");
    }
    else if (colors.includes(currentColor)) {
        //console.log("ALEADY IN ARRAY");
    } else {
        colors.push(currentColor);
        createColorPalette(colors);
    }
})

// add colorbutton click style styling
addColorBtn.addEventListener("mousedown", () => {
    addColorBtn.style.backgroundColor = toolColorOn;
    addColorBtn.style.color = "#222";
});
addColorBtn.addEventListener("mouseup", () => {
    addColorBtn.style.transitionDuration = "0.1s";
    addColorBtn.style.backgroundColor = "#333";
    addColorBtn.style.color = "#ccc";
});
addColorBtn.addEventListener("mouseout", (e) => {
    //addColorBtn.style.transitionDuration = "0.2s";
    addColorBtn.style.backgroundColor = "#333";
    addColorBtn.style.color = "#ccc";
});


// Remove color button
removeColorBtn.addEventListener("click", (e) => {
    if (isRemoveItem == false && colors.length > 1) {
        isRemoveItem = true;
        removeColorBtn.classList.add("remove-btn-active");
        removeColorBtn.textContent = "Done";

        const colorBoxes = document.querySelectorAll(".color");
        colorBoxes.forEach((box) => {
            box.textContent = "−";
            setTimeout(() => {
                box.classList.add("remove-item");
            }, Math.random() * 100);

            box.addEventListener("click", (e) => {
                if(colors.includes(box.id) && colors.length > 1) {
                    index = colors.indexOf(box.id);
                    colors.splice(index, 1);
                    box.remove();
                    //console.table(colors);
                } 
            });

            // remove color from array
        });
    } else {
        isRemoveItem = false;
        const colorBoxes = document.querySelectorAll(".color");
        colorBoxes.forEach((box) => {
            box.textContent = "";
            box.classList.remove("remove-item");
        });
        removeColorBtn.classList.remove("remove-btn-active");
        removeColorBtn.textContent = "−";
        createColorPalette(colors);
    }
        
});




// current color display
function displayCurrentColor() {
    if (isErase) {
        colorPicker.value = colorTemp;
    }
    else {
        colorPicker.value = currentColor;
    }
}

// update current color using colorpicker
colorPicker.addEventListener("input", (e) => {
    if (isErase) {
        colorTemp = e.target.value;
    } else {
        colorTemp = e.target.value;
        currentColor = e.target.value;
    }
});




// brush size adjustment
brushSlider.addEventListener("input", () => {
    if (isFill) {
        brushSliderDisplay.textContent = `${brushSlider.value}px`;
        brushSizeTemp = brushSlider.value;
    } else {
        brushSliderDisplay.textContent = `${brushSlider.value}px`;
        brushSize = brushSlider.value;
        brushSizeTemp = brushSlider.value;
    }
});



// grid size adjustment
gridSlider.addEventListener("input", () => {
    gridMultiplier = gridSlider.value;
    gridSize = 2**gridMultiplier;
    gridSliderDisplay.textContent = `${gridSize} x ${gridSize}`;
    pixelSize = `${gridWidth/gridSize}px`;
    createGrid(gridSize, pixelSize, false);
    
});

gridSlider.addEventListener("change", () => {
    createGrid(gridSize, pixelSize);
});


// update grid size slider & display
function updateSlider(newGridSize) {
    gridSliderDisplay.textContent = `${newGridSize} x ${newGridSize}`;
    gridSlider.value = Math.log2(newGridSize);
}

// clear button
clearBtn.addEventListener("click", () => {
    createGrid(gridSize, pixelSize);
});




// random color generator
randomBtn.addEventListener("click", () => {
    if (isRandomColors == false) {
        resetAllTools();
        isRandomColors = true;
    }
});

function randomColor() {
    let i = Math.floor(Math.random() * (colors.length));
    currentColor = colors[i];
    colorTemp = colors[i];
    colorPicker.value = currentColor;
}  


// copy array function
function copyArray(arrayToCopy) {
    const newArray = [];
    for (let i = 0; i < arrayToCopy.length; i++) {
        let newArrayRow = [];
        for (let j = 0; j < arrayToCopy.length; j++) {
            newArrayRow[j] = arrayToCopy[i][j];
        }
        newArray.push(newArrayRow);
    }
    return newArray;
}


function createBrushPixels() {
    // floor just in case user enters even number
    let spread = Math.floor((brushSize - 1) / 2);
    const brushPixels = [];

    for (let i = yPos - spread; i <= yPos + spread; i++) {
        for(let j = xPos - spread; j <= xPos + spread; j++) {
            if (i < 0 || i > gridSize -1 || j < 0 || j > gridSize - 1) {
                continue;
            }
            brushPixels.push(`#i${i}j${j}`);

            let borderStyle = "3px solid #0002";

            // top pixels
            if (i <= yPos - spread) {
                document.querySelector(`#i${i}j${j}`).style.borderTop = borderStyle;
            }
            // bottom pixels
            if (i >= yPos + spread) {
                document.querySelector(`#i${i}j${j}`).style.borderBottom = borderStyle;
            }
            // left pixels
            if (j <= xPos - spread) {
                document.querySelector(`#i${i}j${j}`).style.borderLeft = borderStyle;
            }
            // bottom pixels
            if (j >= xPos + spread) {
                document.querySelector(`#i${i}j${j}`).style.borderRight = borderStyle;
            }
        }
    }
    return brushPixels;

}


function removeBrushOutline() {
    // reset border
    let pixels = document.querySelectorAll(".pixel");
    pixels.forEach((pixel) => {
        if (isGridlinesOn) {
            pixel.style.borderWidth = "1px";
        } else {
            pixel.style.borderWidth = "0px";
        }
    });
}





// rainbow mode

// rainbow color generator
rainbowBtn.addEventListener("click", () => {

    if (isRainbowColors == false) {
        resetAllTools();

        isRainbowColors = true;
        colorTemp = currentColor;
        currentColor = "rgba(255,0,0)"
    }
});

// rainbow mode 
function rainbowColors() {

    let red = parseInt(currentColor.split(/[(,)]/)[1]);
    let green = parseInt(currentColor.split(/[(,)]/)[2]);
    let blue = parseInt(currentColor.split(/[(,)]/)[3]);


    if (red == 255 && green == 0 && blue == 0) {
        redSpeed = 0;
        greenSpeed = 15;
        blueSpeed = 0;
    } 
    else if (red == 255 && green == 255 && blue == 0) {
        redSpeed = -15;
        greenSpeed = 0;
        blueSpeed = 0;
    } 
    else if (red == 0 && green == 255 && blue == 0) {
        redSpeed = 0;
        greenSpeed = 0;
        blueSpeed = 15;
    } 
    else if (red == 0 && green == 255 && blue == 255) {
        redSpeed = 0;
        greenSpeed = -15;
        blueSpeed = 0;
    } 
    else if (red == 0 && green == 0 && blue == 255) {
        redSpeed = 15;
        greenSpeed = 0;
        blueSpeed = 0;
    } 
    else if (red == 255 && green == 0 && blue == 255) {
        redSpeed = 0;
        greenSpeed = 0;
        blueSpeed = -15;
    } 
    red = red + redSpeed;
    blue = blue + blueSpeed;
    green = green +greenSpeed;

    let newColor = `rgba(${red},${green},${blue})`;
    //console.log(newColor);
    currentColor = newColor;
}


let fillCounter = 0;


function fill(x, y, pixelColor, currentCanvas) {
    // pixel above
    if (y > 0 && currentCanvas[y - 1][x] == pixelColor) {
        currentCanvas[y - 1][x] = currentColor;
        fill(x, y - 1, pixelColor, currentCanvas);
    }
    
    // pixel to the right
    if (x < (gridSize - 1) && currentCanvas[y][x + 1] == pixelColor) {
        currentCanvas[y][x + 1] = currentColor;
        fill(x + 1, y, pixelColor, currentCanvas);
    }
    
    // pixel below
    if (y < (gridSize - 1) && currentCanvas[y + 1][x] == pixelColor) {
        currentCanvas[y + 1][x] = currentColor;
        fill(x, y + 1, pixelColor, currentCanvas);
    }

    // pixel to the left
    if (x > 0 && currentCanvas[y][x - 1] == pixelColor) {
        currentCanvas[y][x - 1] = currentColor;
        fill(x - 1, y, pixelColor, currentCanvas);
    }
    else {
        currentCanvas[y][x] = currentColor;
        return;
    }
}



// tool buttons change style
tools.forEach((tool)=> {
    tool.addEventListener("click", (e) => {
        tools.forEach((tool) => {
            // below is what happens to the other targets
            tool.style.color = toolColorOff;
        });
        // below is what happens to the click target
        e.target.style.color = toolColorOn;
    });
});


// fill tool button specific settings
let brushSizeTemp = brushSize;

fillTool.addEventListener("click", () => {
    if (isFill == false) {
        resetAllTools();
        isFill = true;
        brushSizeTemp = brushSize;
        brushSize = 1;
        currentColor = colorTemp;
    }
});


// brush tool button specific settings
brushTool.style.color = toolColorOn;
brushTool.addEventListener("click", () => {
    resetAllTools();
    brushSize = brushSizeTemp;
    currentColor = colorTemp;
});

// eraser tool button specific settings

eraseTool.addEventListener("click", () => {
    resetAllTools();
    isErase = true;
    brushSize = brushSizeTemp;
    colorTemp = currentColor;
    currentColor = "#FFFFFF";
});


// Grid button & grid creation

gridlinesBtn.style.color = toolColorOn;
    
gridlinesBtn.addEventListener("click", (e) => {
    if (isGridlinesOn == false) {
        isGridlinesOn = true;
        gridlinesBtn.style.color = toolColorOn;
        // grid style on
        let pixels = document.querySelectorAll(".pixel");
        pixels.forEach((pixel) => {
            pixel.style.borderWidth = "1px";
            pixel.style.borderColor = "#0002"
        });
    }
    else {
        isGridlinesOn = false;
        gridlinesBtn.style.color = toolColorOff;
        // grid style off
        let pixels = document.querySelectorAll(".pixel");
        pixels.forEach((pixel) => {
            pixel.style.borderWidth = "0px";
            pixel.style.borderColor = "#0000";
        });
    }
})


// mode button styles (rainbow / random)
// makes mode buttons exclusive and able to toggle
modeBtns.forEach((modeBtn) => {
    modeBtn.addEventListener("click", (e) => {
        
        // below is what happens to the click target
        
        if (e.target.style.color == toolColorOn) {
            e.target.style.color = toolColorOff;
        } else {
            modeBtns.forEach((modeBtn) => {
            // below is what happens to the other targets
            modeBtn.style.color = toolColorOff;
            });
            e.target.style.color = toolColorOn;
        }
    })
});


// one-click button style settings

btns.forEach((btn) => {
    btn.addEventListener("mousedown", (e) => {
        btn.style.transitionDuration = "0s";
        btn.style.color = toolColorOn;
    })
    btn.addEventListener("mouseup", (e) => {
        btn.style.transitionDuration = "0.2s";
        btn.style.color = toolColorOff;
    })

    btn.addEventListener("mouseout", (e) => {
        btn.style.color = toolColorOff;
    })
});


// confirmations before leaving
window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});

// Sets all tool status to false and resets colors
function resetAllTools() {
    isFill = false;
    isErase = false;
    isRainbowColors = false;
    isRandomColors = false;
    currentColor = colorTemp;
    brushSize = brushSizeTemp;
}