const myCanvas = document.getElementById("myCanvas");
myCanvas.width = 450;
myCanvas.height = 450;
const ctx = myCanvas.getContext("2d");


let myVinyls = {
  "Classical music": 10,
  "Alternative rock": 14,
  "Pop": 2,
  "Jazz": 12
};

function drawLine(ctx, startX, startY, endX, endY, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.restore();
}

function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
  ctx.restore();
}

class Barchart {
  constructor(options) {
    this.options = options;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.colors = options.colors;

    this.draw = function () {
      let maxValue = 0;
      for (let categ in this.options.data) {
        maxValue = Math.max(maxValue, this.options.data[categ]);
      }
      let canvasActualHeight = this.canvas.height - this.options.padding * 2;
      let canvasActualWidth = this.canvas.width - this.options.padding * 2;
      //drawing the grid lines
      let gridValue = 0;
      while (gridValue <= maxValue) {
        let gridY = canvasActualHeight * (1 - gridValue / maxValue) - this.options.padding;
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
          this.colors[barIndex % this.colors.length]
        );

        barIndex++;
      }

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
        ul.append(defaultListElement(barIndex, categ, this.colors));
        barIndex++;
      }
    };
  }
}

let myBarchart = new Barchart(
  {
    canvas: myCanvas,
    seriesName: "Vinyl records",
    padding: 45,
    gridScale: 5,
    gridColor: "#000000",
    data: myVinyls,
    colors: ["#a55ca5", "#67b6c7", "#bccd7a", "#eb9743"]
  }
);
myBarchart.draw();

const button = document.getElementById("enter");
const input = document.getElementById("userinput");
const ul = document.querySelector("ul");
const list = document.getElementsByTagName("li");
const deleteBtns = document.getElementsByClassName("delete");

function removeParent() {
  this.removeEventListener("click", removeParent, false);
  this.parentNode.remove();
}

/* This Function can also be written as 
function removeParent(evt) {
  evt.target.removeEventListener("click", removeParent, false);
  evt.target.parentNode.remove();
} */

//Essentially this = evt.target; What happens in removeParent(evt) is the evt is given as parameter(so I clicked this specific text node). Then .target property says getElementByWhateverTriggeredThis.
//Which is the textNode. this works the same. 


function inputLength() {
  return input.value.length;
}


function defaultListElement(index, input, color) {
  let li = document.createElement("li");
  let btns = document.createElement("button");
  btns.className = 'delete';
  btns.textContent = 'delete';
  li.style.listStyle = "none";
  li.style.borderLeft = "20px solid " + color[index % color.length];
  li.style.padding = "5px";
  li.textContent = input;
  li.appendChild(btns);
  return li;
}

function createListElement() {
// /\d/.test checks wether or not there is a number in the string. No idea how it works will look into it further later. 
// from stackoverflow "Check whether an input string contains a number in javascript."
  if (input.value.indexOf(":") !== -1 && /\d/.test(input.value)) {
    let splitStr = input.value.split(":");
    myVinyls[splitStr[0].trim()] = Number(splitStr[1]);
    input.value = "";
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    myBarchart.draw();
    let legend = document.getElementById("legend");
    legend.removeChild(legend.childNodes[0]);
  } else {
    alert("Don't forget to write in this format <data:value> without :<> and make sure data is 'alphabetic' and value numberic.")
  }
}
function addListAfterClick() {
  if (inputLength() > 0) {
    createListElement();
    deleteBtns[deleteBtns.length - 1].addEventListener("click", removeParent, false);
  }
}


function addListAfterKeypress(event) {
  if (inputLength() > 0 && event.keyCode === 13) {
    addListAfterClick();
  }
}

button.addEventListener("click", addListAfterClick);

input.addEventListener("keypress", addListAfterKeypress);

//Same as other event listener events. The difference is the false argument, which takes a boolean value and is normally set to false. This field is optional and default value is false. 
//This argument controls the flow of event firing, either bubling (from inside out) or capturing (from outside in). 
for (var i = 0; i < deleteBtns.length; i++) {
  deleteBtns[i].addEventListener("click", removeParent, false);
}
