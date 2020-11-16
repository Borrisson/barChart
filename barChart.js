const myCanvas = document.getElementById("myCanvas");
myCanvas.width = 450;
myCanvas.height = 450;
  
const ctx = myCanvas.getContext("2d");


const myVinyls = {
    "Classical music": 10,
    "Alternative rock": 14,
    "Pop": 2,
    "Jazz": 12
};

function drawLine(ctx, startX, startY, endX, endY,color){
  ctx.save();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX,startY);
  ctx.lineTo(endX,endY);
  ctx.stroke();
  ctx.restore();
}

function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height,color){
  ctx.save();
  ctx.fillStyle=color;
  ctx.fillRect(upperLeftCornerX,upperLeftCornerY,width,height);
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
      this.ctx.textBaseline="bottom";
      this.ctx.textAlign="center";
      this.ctx.fillStyle = "#000000";
      this.ctx.font = "bold 14px Arial";
      this.ctx.fillText(this.options.seriesName, this.canvas.width/2,this.canvas.height);
      this.ctx.restore();  

      //draw legend
      barIndex = 0;
      let legend = document.querySelector("legend[for='myCanvas']");
      let ul = document.createElement("ul");
      legend.append(ul);
      for (let categ in this.options.data){
          let li = document.createElement("li");
          li.style.listStyle = "none";
          li.style.borderLeft = "20px solid "+this.colors[barIndex%this.colors.length];
          li.style.padding = "5px";
          li.textContent = categ;
          ul.append(li);
          barIndex++;
      }
    };
  }
}

let myBarchart = new Barchart(
  {
      canvas:myCanvas,
      seriesName:"Vinyl records",
      padding:45,
      gridScale:5,
      gridColor:"#000000",
      data:myVinyls,
      colors:["#a55ca5","#67b6c7", "#bccd7a","#eb9743"]
  }
);
myBarchart.draw();

//This is the list buttons that will "hopefully", be added to the barchart legend and then can be rendered onto the 
//chart.
var button = document.getElementById("enter");
var input = document.getElementById("userinput");
var ul = document.querySelector("ul");
var list = document.getElementsByTagName("li");
var deleteBtns = document.getElementsByClassName("delete");

function removeParent(evt) {
  evt.target.removeEventListener("click", removeParent, false);
  evt.target.parentNode.remove();
}

/* This Function can also be written as 
function liClick2(evt) {
	evt.target.classList.toggle("done")
} */

//Essentially this = evt.target; What happens in liClick2 is the evt is given as parameter(so I clicked this specific text node). Then .target property says getElementByWhateverTriggeredThis.
//Which is the textNode. this works the same. 


function inputLength() {
	return input.value.length;
}

function createListElement() {
	var li = document.createElement("li");
	var btns = document.createElement("button");
	btns.textContent = 'delete';
	btns.className = 'delete';
	li.appendChild(document.createTextNode(input.value));
	li.appendChild(btns);
	ul.appendChild(li);
	input.value = "";
}

function addListAfterClick() {
	if (inputLength() > 0) {
		createListElement();
		deleteBtns[deleteBtns.length-1].addEventListener("click", removeParent, false);
  }
}


function addListAfterKeypress(event) {
	if (inputLength() > 0 && event.keyCode === 13) {
		addListAfterClick();
	}
}

button.addEventListener("click", addListAfterClick);

input.addEventListener("keypress", addListAfterKeypress);

for(var i=0; i<list.length; i++){
 list[i].addEventListener("click", liClick);
}
//Same as other event listener events. The difference is the false argument, which takes a boolean value and is normally set to false. This field is optional and default value is false. 
//This argument controls the flow of event firing, either bubling (from inside out) or capturing (from outside in). 
for(var i = 0; i < deleteBtns.length; i++){
	deleteBtns[i].addEventListener("click", removeParent, false);
}
