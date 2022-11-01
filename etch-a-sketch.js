const grid = document.querySelector("#grid");
const colorSelector = document.querySelector("#color-selector");
const sizeSlider = document.querySelector("#size-slider");
const sizeSliderDisplay = document.querySelector("#size-slider-display");
const clearBtn = document.querySelector("#clear-btn");
const randomBtn = document.querySelector("#random-btn");

const body = document.body;


let gridSize = 16;
let pixelSize = `${512 / gridSize}px`;
let currentColor = "red";
let colors = ["red", "orange", "yellow", "limegreen", "green", "blue", "skyblue", "purple", "deeppink", "brown", "black", "grey" ,"white"];
let mouseDown = 0;
let brushSize = 3;
let isRandomColors = false;
const currentCanvas = [];


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
function createGrid(gridSize, pixelSize) {
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
            
            currentCanvasRow.push("white");
        }
        currentCanvas.push(currentCanvasRow);
    }
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
    createGrid(gridSize, pixelSize); 
})


// clear button
clearBtn.addEventListener("click", () => {
    createGrid(gridSize, pixelSize);
})

// random color generator

randomBtn.addEventListener("click", () => {
    if (isRandomColors == false) {
        isRandomColors = true;
        randomBtn.style.backgroundColor = "yellow";
        randomBtn.textContent = "Random mode ON";
    }
    else {
        isRandomColors = false;
        randomBtn.style.backgroundColor = "#f0f0f0";
        randomBtn.textContent = "Random mode OFF";
    }
});

function randomColor() {
    let i = Math.floor(Math.random() * (colors.length - 3));
    currentColor = colors[i];
    updateColorCss(currentColor);
}  