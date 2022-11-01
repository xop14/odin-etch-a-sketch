const grid = document.querySelector("#grid");
const colorSelector = document.querySelector("#color-selector");
const sizeSlider = document.querySelector("#size-slider");
const sizeSliderDisplay = document.querySelector("#size-slider-display");
const clearBtn = document.querySelector("#clear-btn");
const body = document.body;


let gridSize = 32;
let pixelSize = `${512 / gridSize}px`;
let currentColor = "red";
let colors = ["red", "green", "blue", "yellow", "transparent"];
let mouseDown = 0;


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
    for (let i = 0; i < gridSize**2; i++) {
        const pixel = document.createElement("div");
        pixel.style.width = pixelSize;
        pixel.style.height = pixelSize;
        grid.appendChild(pixel);
        //pixel.style.fontSize = "6px"; 
        //pixel.textContent = i;
        pixel.addEventListener("mouseover", () => {
            if (mouseDown) {
                pixel.style.backgroundColor = currentColor;
            }
        });
    }
}

//create color pallet
colors.forEach((color) => {
    const colorBox = document.createElement("div");
    colorBox.style.backgroundColor = color;
    colorSelector.append(colorBox);
    colorBox.setAttribute('id', color);
    colorBox.addEventListener("click", () => {
        currentColor = color;
    });
});


// grid size adjustment

sizeSlider.addEventListener("input", () => {
    sizeSliderDisplay.textContent = `${sizeSlider.value} x ${sizeSlider.value}`;
    gridSize = sizeSlider.value;
    pixelSize = `${512 / gridSize}px`;
    createGrid(gridSize, pixelSize);
})


//clear button

clearBtn.addEventListener("click", () => {
    createGrid(gridSize, pixelSize);
})