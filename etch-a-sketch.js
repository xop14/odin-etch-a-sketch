const grid = document.querySelector("#grid");
const colorSelector = document.querySelector("#color-selector");
const sizeSlider = document.querySelector("#size-slider");
const sizeSliderDisplay = document.querySelector("#size-slider-display");
const clearBtn = document.querySelector("#clear-btn");
const randomBtn = document.querySelector("#random-btn");
const undoBtn = document.querySelector("#undo-btn");
const canvasHistory = [];
const gridSizeHistory = [];

const body = document.body;


let gridSize = 16;
let pixelSize = `${512 / gridSize}px`;
let currentColor = "red";
let colors = ["red", "orange", "yellow", "limegreen", "green", "blue", "skyblue", "purple", "deeppink", "brown", "black", "grey" ,"white"];
let mouseDown = 0;
let brushSize = 3;
let isRandomColors = false;

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
function createGrid(gridSize, pixelSize, saveUndo = true) {
    const currentCanvas = [];
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
            pixel.style.backgroundColor = "white";
            pixel.setAttribute('id', `i${i}j${j}`);

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
            
            currentCanvasRow.push("white");
        }
        currentCanvas.push(currentCanvasRow);
    }
    // When adjusting grid size for an undo, we don't want to save the state of the current canvas
    // so the function is called with the saveUndo parameter set to false
    if (saveUndo == true) {
        saveCanvasUndo(currentCanvas, gridSize);
    }
}


// save current grid to undo history
function saveCanvasUndo(canvasArray, gridSizeToSave) {
    const newCanvasUndo = [];
    for (let i = 0; i < canvasArray.length; i++) {
        let newCanvasUndoRow = [];
        for (let j = 0; j < canvasArray.length; j++) {
            newCanvasUndoRow[j] = canvasArray[i][j];
        }
        newCanvasUndo.push(newCanvasUndoRow);
    }
    canvasHistory.push(newCanvasUndo);
    gridSizeHistory.push(gridSizeToSave);
}

// undo history
undoBtn.addEventListener("click", undo);

function undo() {
    console.log("UNDO PRESSED");
    if (canvasHistory.length - 1 <= 0) {
        console.log("NO HISTORY");
        return;
    }
    console.log("HISTORY FOUND");

    const lastUndo = canvasHistory[canvasHistory.length - 2];
    const lastGridSize = gridSizeHistory[gridSizeHistory.length - 2];
    const lastPixelSize = `${512 / lastGridSize}px`;
    console.log(lastUndo);
    console.log(lastGridSize);
    console.log(lastPixelSize);
    createGrid(lastGridSize, lastPixelSize, false);
    sizeSliderDisplay.textContent = `${sizeSlider.value} x ${sizeSlider.value}`;
    
    for (let i = 0; i < lastUndo.length; i++) {
        for (let j = 0; j < lastUndo.length; j++) {
            document.querySelector(`#i${i}j${j}`).style.backgroundColor = lastUndo[i][j];
        }
    }
    if (canvasHistory.length > 1) {
        canvasHistory.pop();
        gridSizeHistory.pop();
    }
    console.log(canvasHistory);
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
        randomBtn.style.backgroundColor = "yellow";
        randomBtn.textContent = "Random color mode ON";
    }
    else {
        isRandomColors = false;
        randomBtn.style.backgroundColor = "#f0f0f0";
        randomBtn.textContent = "Random color mode OFF";
    }
});

function randomColor() {
    let i = Math.floor(Math.random() * (colors.length - 3));
    currentColor = colors[i];
    updateColorCss(currentColor);
}  


// opacity function

