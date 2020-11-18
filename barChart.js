//Canvas variable declerations
const myCanvas = document.getElementById("myCanvas");
myCanvas.width = 300;
myCanvas.height = 450;
const ctx = myCanvas.getContext("2d");

//legend, x and y axis, gridScale, color Randomizer, buttons, slider and input variables decleration.
const userButton = document.getElementById("user-input-enter");
const userInput = document.getElementById("user-input");
const ul = document.querySelector("ul");
const list = document.getElementsByTagName("li");
const deleteBtns = document.getElementsByClassName("delete");
const legendInputName = document.getElementById("legend-input");
const legendButton = document.getElementById("legend-input-enter");
const valueInputName = document.getElementById("value-input");
const valueButton = document.getElementById("value-input-enter");
const genNew = document.getElementById("genNew");
const slider = document.getElementById("slider");
const dropDown = document.getElementById("bar-value-position");

let dataSet = {
  "Classical music": 10,
  "Alternative rock": 14,
  "Pop": 2,
  "Jazz": 12
};

function barValueCoord(height, upperY, barValuePosition) {
  let coord = 0;
  switch(barValuePosition) {
    case "top": 
      coord = upperY + 20;
      break;
    case "center": 
      coord = (upperY + height) / 2;
      break;
    case "bottom":
      coord = height - 40;
  }
  return coord;
}

function drawLine(ctx, startX, startY, endX, endY, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.restore();
}

function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height, color, value, posFunction, selectedPos)
{
  let txtWidth = ctx.measureText(value).width;
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
  ctx.fillStyle = "#000000";
  ctx.font = "bold 10px Arial";
  ctx.fillText(value, upperLeftCornerX + (width - txtWidth) / 2, posFunction(myCanvas.height, upperLeftCornerY, selectedPos));
  ctx.restore();
}

class Barchart {
  constructor(options) {
    this.options = options;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.colors = options.colors;
  }
  draw() {
    let maxValue = 0;
    for (let categ in this.options.data) {
      maxValue = Math.max(maxValue, this.options.data[categ]);
    }
    let canvasActualHeight = this.canvas.height - this.options.padding * 2;
    let canvasActualWidth = this.canvas.width - this.options.padding * 2;
   
    //everytime the draw function is called it will draw to the next rounded up 5, using the slider scale.
    slider.setAttribute("max", Math.ceil(Number(maxValue) / 5) * 5);
   
    //drawing the grid lines

    let gridValue = 0;
    while (gridValue <= maxValue) {
      let gridY = canvasActualHeight * (1 - gridValue / maxValue) + this.options.padding;
      drawLine(
        this.ctx,
        0,
        gridY,
        this.canvas.width,
        gridY,
        this.options.gridColor
      );

      //writing grid markers
      this.ctx.save();
      this.ctx.fillStyle = this.options.gridColor;
      this.ctx.textBaseline = "bottom";
      this.ctx.font = "bold 10px Arial";
      this.ctx.fillText(gridValue, 10, gridY - 2);
      this.ctx.restore();

      gridValue += this.options.gridScale;
    }

    //drawing the bars
    let barIndex = 0;
    let numberOfBars = Object.keys(this.options.data).length;
    let barSize = (canvasActualWidth) / numberOfBars;

    for (let categ in this.options.data) {
      let val = this.options.data[categ];
      let barHeight = Math.round(canvasActualHeight * val / maxValue);
      drawBar(
        this.ctx,
        this.options.padding + barIndex * barSize,
        this.canvas.height - barHeight - this.options.padding,
        barSize,
        barHeight,
        this.colors[barIndex % this.colors.length],
        val,
        barValueCoord,
        this.options.barValPos
      );
      barIndex++;
    }

    //drawing value name
    this.ctx.save();
    this.ctx.font = "bold 14px Arial";
    this.ctx.fillStyle = "#000000";
    this.ctx.fillText(this.options.valueName, 2, 15);
    this.ctx.restore();
    
    //drawing series name
    this.ctx.save();
    this.ctx.textBaseline = "bottom";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#000000";
    this.ctx.font = "bold 14px Arial";
    this.ctx.fillText(this.options.seriesName, this.canvas.width / 2, this.canvas.height);
    this.ctx.restore();

    //draw legend
    barIndex = 0;
    let legend = document.querySelector("legend[for='myCanvas']");
    let ul = document.createElement("ul");
    legend.append(ul);
    for (let categ in this.options.data) {
      let color = this.colors;
      if(this.options.data[categ] === 0) {
        color = "transparent";
      };
      ul.append(defaultListElement(barIndex, categ, color));
      deleteBtns[barIndex].addEventListener("click", removeParent, false);
      deleteBtns[barIndex].setAttribute("id", categ);
      barIndex++;
    }
  };
}

let myBarchart = new Barchart(
  {
    canvas: myCanvas,
    seriesName: "Vinyl records",
    valueName: "# of Vinyls sold",
    padding: 30,
    gridScale: 5,
    gridColor: "#000000",
    barValPos: "top",
    data: dataSet,
    colors: ["#a55ca5", "#67b6c7", "#bccd7a", "#eb9743"]
  }
);

myBarchart.draw();


function removeParent() {
  this.removeEventListener("click", removeParent, false);
  delete dataSet[this.id];
  this.parentNode.remove();
  freshCanvas();
  myBarchart.draw();
}

/* This Function can also be written as 
function removeParent(evt) {
  evt.target.removeEventListener("click", removeParent, false);
  evt.target.parentNode.remove();
} */

//Essentially this = evt.target; What happens in removeParent(evt) is the evt is given as parameter(so I clicked this specific text node). Then .target property says getElementByWhateverTriggeredThis.
//Which is the textNode. this works the same. 


function defaultListElement(index, input, color) {
  let li = document.createElement("li");
  let btns = document.createElement("button");
  btns.className = 'delete';
  btns.textContent = 'delete';
  li.style.listStyle = "none";
  if(color === "transparent") {
    li.style.borderLeft = "20px solid " + color
  } else {
    li.style.borderLeft = "20px solid " + color[index % color.length];
  }
  li.style.padding = "5px";
  li.textContent = input;
  li.appendChild(btns);
  return li;
}

function freshCanvas() {
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  let legend = document.getElementById("legend");
  legend.removeChild(legend.childNodes[0]);
}

function createListElement() {
  // /\d/.test checks wether or not there is a number in the string. No idea how it works will look into it further later. 
  // from stackoverflow "Check whether an input string contains a number in javascript."
  if (userInput.value.indexOf(":") !== -1 && /\d/.test(userInput.value)) {
    let splitStr = userInput.value.split(":");
    dataSet[splitStr[0].trim()] = Number(splitStr[1]);
    userInput.value = "";
    freshCanvas();
    myBarchart.draw();
  } else {
    alert("Don't forget to write in this format <data:value> without :<> and make sure data is 'alphabetic' and value numberic.")
  }
}
//User input Data
userButton.addEventListener("click", () => {
  if (userInput.value.length > 0) {
    createListElement();
    deleteBtns[deleteBtns.length - 1].addEventListener("click", removeParent, false);
  }
});

userInput.addEventListener("keypress", (event) => {
  if (userInput.value.length > 0 && event.keyCode === 13) {
    createListElement();
    deleteBtns[deleteBtns.length - 1].addEventListener("click", removeParent, false);
  }
});

//User legend Name Change
legendButton.addEventListener("click", () => {
  if (legendInputName.value.length > 0) {
    myBarchart.options.seriesName = legendInputName.value;
    freshCanvas();
    myBarchart.draw();
    legendInputName.value = "";
  }
});

legendInputName.addEventListener("keypress", (event) => {
  if (legendInputName.value.length > 0 && event.keyCode === 13 ) {
    myBarchart.options.seriesName = legendInputName.value;
    freshCanvas();
    myBarchart.draw();
    legendInputName.value = "";
  }
});

//User Value Name Change
valueButton.addEventListener("click", () => {
  if (valueInputName.value.length > 0) {
    myBarchart.options.valueName = valueInputName.value;
    freshCanvas();
    myBarchart.draw();
    valueInputName.value = "";
  }
});

valueInputName.addEventListener("keypress", (event) => {
  if (valueInputName.value.length > 0 && event.keyCode === 13) {
    myBarchart.options.valueName = valueInputName.value;
    freshCanvas();
    myBarchart.draw();
    valueInputName.value = "";
  }
});

//Color Randomzier
genNew.addEventListener("click", () => {
  let colors = [];
  for (let i = 0; i < 4; i++) {
    let randomColor = "";
    do {
      randomColor = Math.floor(Math.random() * 16777215).toString(16);
    } while (randomColor.length < 6)
    colors.push("#" + randomColor);
  }
  myBarchart.colors = colors;
  freshCanvas();
  myBarchart.draw();
});

dropDown.addEventListener("change" , () => {
  myBarchart.options.barValPos = dropDown.value;
  freshCanvas();
  myBarchart.draw();
});

//gridScale slider
slider.oninput = function () {
  myBarchart.options.gridScale = Number(this.value);
  freshCanvas();
  myBarchart.draw();
};