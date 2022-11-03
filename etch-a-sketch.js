const grid = document.querySelector("#grid");
const colorSelector = document.querySelector("#color-selector");
const sizeSlider = document.querySelector("#size-slider");
const sizeSliderDisplay = document.querySelector("#size-slider-display");
const clearBtn = document.querySelector("#clear-btn");
const randomBtn = document.querySelector("#random-btn");
const rainbowBtn = document.querySelector("#rainbow-btn");
const fillBtn = document.querySelector("#fill-btn");
const undoBtn = document.querySelector("#undo-btn");
const redoBtn = document.querySelector("#redo-btn");
const gridlinesBtn = document.querySelector("#gridlines-btn");
const canvasHistory = [];
const gridSizeHistory = [];
const buttonOnColor = "#666";
const buttonOffColor = "#333";
const brushSizes = document.querySelector("#brush-sizes");

const body = document.body;


let gridSize = 16;
let pixelSize = `${512 / gridSize}px`;
let currentColor = "red";
let colors = ["red", "orange", "gold", "yellow", "yellowgreen", "green", "lightseagreen", "darkturquoise", "lightskyblue", "deepskyblue", "blue" ,"purple", "deeppink", "plum" ,"pink", "bisque" , "brown", "black", "grey" ,"white"];
let mouseDown = 0;
let isRandomColors = false;
let isRainbowColors = false;
let isFill = false;
let undoCounter = 0;
let undoCounterMax = 0;
let isGridlinesOn = true;
let randomCounter = 0;
let brushSize = 1;
let redSpeed = 0;
let greenSpeed = 0;
let blueSpeed = 0;

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
                const brushPixels = createBrushPixels();
                if (mouseDown) {
                    if (isRandomColors) {
                        randomColor();
                    }
                    if (isRainbowColors){
                        rainbowColors();
                    }
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
            });


            pixel.addEventListener("mouseout", () => {
                removeBrushOutline();
            });
            pixel.addEventListener("mouseup", () => {
                saveCanvasUndo(currentCanvas, gridSize);
            });
            if (!isCanvasImported) {
                currentCanvasRow.push("white");
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

    undoCounter++;
    undoCounterMax = undoCounter;

}




// undo function
undoBtn.addEventListener("click", undo);

function undo() {
    if (undoCounter <= 1) {
        console.log("NOTHING TO UNDO");
        return;
    }

    const lastUndo = canvasHistory[undoCounter - 2];
    const lastGridSize = gridSizeHistory[undoCounter - 2];
    const lastPixelSize = `${512 / lastGridSize}px`;

    updateSlider(lastGridSize);

    createGrid(lastGridSize, lastPixelSize, false, lastUndo);

    undoCounter--;
}




// redo function
redoBtn.addEventListener("click", redo);

function redo() {
    if (undoCounter >= undoCounterMax) {
        console.log("NOTHING TO REDO");
        return;
    }
    const nextRedo = canvasHistory[undoCounter];
    const nextGridSize = gridSizeHistory[undoCounter];
    const nextPixelSize = `${512 / nextGridSize}px`;

    updateSlider(nextGridSize);

    createGrid(nextGridSize, nextPixelSize, false, nextRedo);

    undoCounter++;
}




// update slider & display
function updateSlider(newGridSize) {
    sizeSliderDisplay.textContent = `${newGridSize} x ${newGridSize}`;
    sizeSlider.value = newGridSize;
}




// create color pallet
colors.forEach((color) => {
    const colorBox = document.createElement("div");
    colorBox.style.backgroundColor = color;
    colorSelector.append(colorBox);
    colorBox.setAttribute('id', color);
    colorBox.className = 'color';
    colorBox.addEventListener("click", () => {
        if (!isRainbowColors) {
            currentColor = color;
            updateColorCss(currentColor);
        }
    });
});

// sets the initial selected color to red
updateColorCss("red");

// update css
function updateColorCss(currentColor) {
    //update css
    const currentColorDiv = document.querySelector(`#${currentColor}`);
    const colorsTemp = document.querySelectorAll(".color");
    colorsTemp.forEach((colorTemp) => {
        colorTemp.classList.remove("color-selected");
    });
    currentColorDiv.classList.add("color-selected");
}




// grid size adjustment
sizeSlider.addEventListener("input", () => {
    sizeSliderDisplay.textContent = `${sizeSlider.value} x ${sizeSlider.value}`;
    gridSize = sizeSlider.value;
    pixelSize = `${512 / gridSize}px`;
    createGrid(gridSize, pixelSize, false);
});

sizeSlider.addEventListener("change", () => {
    createGrid(gridSize, pixelSize);
});




// clear button
clearBtn.addEventListener("click", () => {
    createGrid(gridSize, pixelSize);
});




// random color generator
randomBtn.addEventListener("click", () => {

    if (isRandomColors == false) {
        isRainbowColors = false;
        rainbowBtn.style.backgroundColor = buttonOffColor;
        rainbowBtn.textContent = "Rainbow mode OFF";

        isRandomColors = true;
        randomBtn.style.backgroundColor = buttonOnColor;
        randomBtn.textContent = "Random mode ON";
    }
    else {
        isRandomColors = false;
        randomBtn.style.backgroundColor = buttonOffColor;
        randomBtn.textContent = "Random mode OFF";
    }
});

function randomColor() {
    let i = Math.floor(Math.random() * (colors.length - 3));
    currentColor = colors[i];
    updateColorCss(currentColor);
}  




// gridlines toggle button

gridlinesBtn.style.backgroundColor = buttonOnColor;

gridlinesBtn.addEventListener("click", () => {
    if (isGridlinesOn == false) {
        isGridlinesOn = true;
        gridlinesBtn.textContent = "Gridlines ON";
        gridlinesBtn.style.backgroundColor = buttonOnColor;
        let pixels = document.querySelectorAll(".pixel");
        pixels.forEach((pixel) => {
            pixel.style.borderWidth = "1px";
            pixel.style.borderColor = "#0002"
        });

        
    }
    else {
        isGridlinesOn = false;
        gridlinesBtn.textContent = "Gridlines OFF";
        gridlinesBtn.style.backgroundColor = buttonOffColor;
        let pixels = document.querySelectorAll(".pixel");
        pixels.forEach((pixel) => {
            pixel.style.borderWidth = "0px";
            pixel.style.borderColor = "#0000";
        });
    }
});




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


brushSizes.addEventListener("click", (e) => {
    brushSize = e.target.value;
})


function createBrushPixels() {
    // floor just in case user enters even number
    let spread = Math.floor((brushSize - 1) / 2);
    const brushPixels = [];

    for (let i = yPos - spread; i <= yPos + spread; i++) {
        for(let j = xPos - spread; j <= xPos + spread; j++) {
            if (i < 0 || i > gridSize -1 || j < 0 || j > gridSize - 1) {
                continue;
            }
            //console.log(`Paint x: ${i} y: ${j}`)
            //document.querySelector(`#i${i}j${j}`).style.backgroundColor = currentColor;
            brushPixels.push(`#i${i}j${j}`);
            // top pixels
            if (i <= yPos - spread) {
                document.querySelector(`#i${i}j${j}`).style.borderTopWidth = "3px";
            }
            // bottom pixels
            if (i >= yPos + spread) {
                document.querySelector(`#i${i}j${j}`).style.borderBottomWidth = "3px";
            }
            // left pixels
            if (j <= xPos - spread) {
                document.querySelector(`#i${i}j${j}`).style.borderLeftWidth = "3px";
            }
            // bottom pixels
            if (j >= xPos + spread) {
                document.querySelector(`#i${i}j${j}`).style.borderRightWidth = "3px";
            }
        }
    }
    //console.table(brushPixels);
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

// random color generator
rainbowBtn.addEventListener("click", () => {

    if (isRainbowColors == false) {
        isRandomColors = false;
        randomBtn.style.backgroundColor = buttonOffColor;
        randomBtn.textContent = "Random mode OFF";

        isRainbowColors = true;
        rainbowBtn.style.backgroundColor = buttonOnColor;
        rainbowBtn.textContent = "Rainbow mode ON";
        currentColor = "rgba(255,0,0)"
    }
    else {
        isRainbowColors = false;
        rainbowBtn.style.backgroundColor = buttonOffColor;
        rainbowBtn.textContent = "Rainbow mode OFF";
    }
});

// gradually change color 
function rainbowColors() {

    let red = parseInt(currentColor.split(/[(,)]/)[1]);
    let green = parseInt(currentColor.split(/[(,)]/)[2]);
    let blue = parseInt(currentColor.split(/[(,)]/)[3]);


    if (red == 255 && green == 0 && blue == 0) {
        redSpeed = 0;
        greenSpeed = 5;
        blueSpeed = 0;
    } 
    else if (red == 255 && green == 255 && blue == 0) {
        redSpeed = -5;
        greenSpeed = 0;
        blueSpeed = 0;
    } 
    else if (red == 0 && green == 255 && blue == 0) {
        redSpeed = 0;
        greenSpeed = 0;
        blueSpeed = 5;
    } 
    else if (red == 0 && green == 255 && blue == 255) {
        redSpeed = 0;
        greenSpeed = -5;
        blueSpeed = 0;
    } 
    else if (red == 0 && green == 0 && blue == 255) {
        redSpeed = 5;
        greenSpeed = 0;
        blueSpeed = 0;
    } 
    else if (red == 255 && green == 0 && blue == 255) {
        redSpeed = 0;
        greenSpeed = 0;
        blueSpeed = -5;
    } 
    red = red + redSpeed;
    blue = blue + blueSpeed;
    green = green +greenSpeed;

    let newColor = `rgba(${red},${green},${blue})`;
    //console.log(newColor);
    currentColor = newColor;
}


// fill tool

fillBtn.addEventListener("click", () => {

    if (isFill == false) {
        isFill = true;
        fillBtn.style.backgroundColor = buttonOnColor;
        fillBtn.textContent = "Fill ON";
    }
    else {
        isFill = false;
        fillBtn.style.backgroundColor = buttonOffColor;
        fillBtn.textContent = "Fill OFF";
    }
});


let fillCounter = 0;


function fill(x, y, pixelColor, currentCanvas) {


    // top
    if (y > 0 && currentCanvas[y - 1][x] == pixelColor) {
        currentCanvas[y - 1][x] = currentColor;
        fill(x, y - 1, pixelColor, currentCanvas);
    }
    
    //right
    if (x < (gridSize - 1) && currentCanvas[y][x + 1] == pixelColor) {
        currentCanvas[y][x + 1] = currentColor;
        fill(x + 1, y, pixelColor, currentCanvas);
    }
    
    // bottom
    if (y < (gridSize - 1) && currentCanvas[y + 1][x] == pixelColor) {
        currentCanvas[y + 1][x] = currentColor;
        fill(x, y + 1, pixelColor, currentCanvas);
    }

    // left
    if (x > 0 && currentCanvas[y][x - 1] == pixelColor) {
        currentCanvas[y][x - 1] = currentColor;
        fill(x - 1, y, pixelColor, currentCanvas);
    }
    else {
        return;
    }

    fillCounter++;
    console.log(fillCounter);
}



// function fill(x, y, pixelColor, currentCanvas) {

//     // top
//     if (y > 0 && currentCanvas[y - 1][x] == pixelColor) {
//         currentCanvas[y - 1][x] = currentColor;
//         fill(x, y - 1, pixelColor, currentCanvas);
//     }
    
//     //right
//     if (x < (gridSize - 1) && currentCanvas[y][x + 1] == pixelColor) {
//         currentCanvas[y][x + 1] = currentColor;
//         fill(x + 1, y, pixelColor, currentCanvas);
//     }
    
//     // bottom
//     if (y < (gridSize - 1) && currentCanvas[y + 1][x] == pixelColor) {
//         currentCanvas[y + 1][x] = currentColor;
//         fill(x, y + 1, pixelColor, currentCanvas);
//     }

//     // left
//     if (x > 0 && currentCanvas[y][x - 1] == pixelColor) {
//         currentCanvas[y][x - 1] = currentColor;
//         fill(x - 1, y, pixelColor, currentCanvas);
//     }
//     else {
//         return;
//     }

//     fillCounter++;
//     console.log(fillCounter);
//     createGrid(gridSize, pixelSize, false, currentCanvas);
// }