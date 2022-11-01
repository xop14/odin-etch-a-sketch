const grid = document.querySelector("#grid");
const colorSelector = document.querySelector("#color-selector");
const sizeSlider = document.querySelector("#size-slider");
const sizeSliderDisplay = document.querySelector("#size-slider-display");
const clearBtn = document.querySelector("#clear-btn");
const randomBtn = document.querySelector("#random-btn");
const undoBtn = document.querySelector("#undo-btn");
const redoBtn = document.querySelector("#redo-btn");
const gridlinesBtn = document.querySelector("#gridlines-btn");
const canvasHistory = [];
const gridSizeHistory = [];
const buttonOnColor = "yellow";
const buttonOffColor = "#f0f0f0";

const body = document.body;


let gridSize = 16;
let pixelSize = `${512 / gridSize}px`;
let currentColor = "red";
let colors = ["red", "orange", "yellow", "limegreen", "green", "blue", "skyblue", "purple", "deeppink", "brown", "black", "grey" ,"white"];
let mouseDown = 0;
let brushSize = 3;
let isRandomColors = false;
let undoCounter = 0;
let undoCounterMax = 0;
let isGridlinesOn = true;

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
                if (mouseDown) {
                    if (isRandomColors) {
                        randomColor();
                    }
                    pixel.style.backgroundColor = currentColor;
                    currentCanvas[i][j] = currentColor;
                }
                pixel.classList.add("pixel-hover");
                xPos = j;
                yPos = i;
                //console.log("x: " + j + " y: " + i);
            });
            pixel.addEventListener("mousedown", () => {
                if (isRandomColors) {
                    randomColor();
                }
                pixel.style.backgroundColor = currentColor;
                currentCanvas[i][j] = currentColor;
            });
            pixel.addEventListener("mouseout", () => {
                pixel.classList.remove("pixel-hover");
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
        currentColor = color;
        updateColorCss(currentColor);
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
        isRandomColors = true;
        randomBtn.style.backgroundColor = buttonOnColor;
        randomBtn.textContent = "Random color mode ON";
    }
    else {
        isRandomColors = false;
        randomBtn.style.backgroundColor = buttonOffColor;
        randomBtn.textContent = "Random color mode OFF";
    }
});

function randomColor() {
    let i = Math.floor(Math.random() * (colors.length - 3));
    currentColor = colors[i];
    updateColorCss(currentColor);
}  



// remove gridlines button
gridlinesBtn.addEventListener("click", () => {
    if (isGridlinesOn == false) {
        isGridlinesOn = true;
        gridlinesBtn.textContent = "Gridlines ON";
        let pixels = document.querySelectorAll(".pixel");
        pixels.forEach((pixel) => {
            pixel.style.borderWidth = "1px";
        });
        
    }
    else {
        isGridlinesOn = false;
        gridlinesBtn.textContent = "Gridlines OFF";
        let pixels = document.querySelectorAll(".pixel");
        pixels.forEach((pixel) => {
            pixel.style.borderWidth = "0px";
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