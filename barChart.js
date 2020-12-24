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
const userInputAlert = document.getElementById("user-input-alert");
const dragger = document.getElementsByClassName("box color-picker-binded");

let dataSet = {
  "Classical music": 10,
  "Alternative rock": 14,
  "Pop": 2,
  "Jazz": 12
};

//determines what the user has selected from the drop down menu. Either "top", "center", or "bottom".
function barValueCoord(height, upperY, barValuePosition) {
  let coord = 0;
  switch (barValuePosition) {
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

function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height, color, value, posFunction, selectedPos) {
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
      if (this.options.data[categ] === 0) {
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

//delete button will remove color from array and make sure the div elements containing the draggable colors will reset accordingly and delete the corresponding one. 

function removeParent() {
  this.removeEventListener("click", removeParent, false);
  const index = Object.keys(dataSet).indexOf(this.id);
  delete dataSet[this.id];
  myBarchart.colors.splice(index, 1);
  this.parentNode.remove();
  $('div[draggable="true"]').eq(index).remove();
  for(let index of myBarchart.colors.keys()) {
    dragger[index].setAttribute("color-id", index);
  }
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
  btns.className = 'delete btn btn-danger';
  btns.textContent = 'delete';
  li.style.listStyle = "none";
  if (color === "transparent") {
    li.style.borderLeft = "20px solid " + color;
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

class ListElementError extends Error {};


function createListElement() {
  // /\d/.test checks wether or not there is a number in the string. It is a regular expression. between the two
  // forward slashes "//". \d is a type of expression, whereas .test() is a method. It is the same meaning as 
  // /[0-9]/.test(). It says check if there are any digits at all within this string. It will return a boolean. 
  //  List of other expressions can be found pg 147 of Eloquent Javascript.
  if (/.+:\s*\d/.test(userInput.value)) {
    let splitStr = userInput.value.split(":");
    dataSet[splitStr[0].trim()] = Number(splitStr[1]);
    userInput.value = "";
    userInputAlert.className = "";
    userInputAlert.textContent = "";
    freshCanvas();
    myBarchart.draw();
  } else {
    userInputAlert.className = "alert alert-warning";
    userInputAlert.textContent = "Don't forget to write in this format <data:value>"
    throw new ListElementError(console.log("Invalid input: " + userInput.value));
  }
}

function makeColorBox() {
  const divContainer = document.querySelector("div[id='bgColorSequence']");
  for (let i = 0; i < divContainer.childElementCount; i++) {
    if (divContainer.childElementCount < myBarchart.colors.length) {
      let diff = myBarchart.colors.length - divContainer.childElementCount;
      while (diff > 0) {
        let index = myBarchart.colors.length - diff;
        let div = document.createElement('div');
        div.setAttribute("color-id", index);
        div.setAttribute('draggable', "true");
        div.setAttribute("class", "box color-picker-binded");
        divContainer.appendChild(div);
        diff--;
        PICKER.bind_input(index);
      }
    }
    divContainer.children[i].style.backgroundColor = myBarchart.colors[i];
  }
  dragAndDrop();
}

//returns length of string from userInput fields
function elementLength(targetedElement) {
  return targetedElement.value.length;
}

//does many things here, first creates a new color, next it tries to create a list element(bar, legend and delete button)
// if the input was incorrect it will delete the color that it created. Need the color first in order to make the bar.
function addNewElement() {
  if (elementLength(userInput) > 0) {
    let randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    myBarchart.colors.push(randomColor);
    try {
      createListElement();
    } catch (e) {
      if (e instanceof ListElementError) {
        myBarchart.colors.pop();
      } else {
        throw e;
      }
    }
    makeColorBox();
    deleteBtns[deleteBtns.length - 1].addEventListener("click", removeParent, false);
  }
}

function legendNameChg() {
  if (elementLength(legendInputName) > 0) {
    myBarchart.options.seriesName = legendInputName.value;
    freshCanvas();
    myBarchart.draw();
    legendInputName.value = "";
  }
}

function valueNameChg() {
  if (elementLength(valueInputName) > 0) {
    myBarchart.options.valueName = valueInputName.value;
    freshCanvas();
    myBarchart.draw();
    valueInputName.value = "";
  }
}

//User input Data
userButton.addEventListener("click", addNewElement);

userInput.addEventListener("keypress", (event) => {
  if (elementLength(userInput) > 0 && event.keyCode === 13) {
    addNewElement();
  }
});

//User legend Name Change
legendButton.addEventListener("click", legendNameChg);

legendInputName.addEventListener("keypress", (event) => {
  if (elementLength(legendInputName) > 0 && event.keyCode === 13) {
    legendNameChg();
  }
});

//User Value Name Change
valueButton.addEventListener("click", valueNameChg);

valueInputName.addEventListener("keypress", (event) => {
  if (elementLength(valueInputName) > 0 && event.keyCode === 13) {
   valueNameChg();
  }
});

//Color Randomzier
genNew.addEventListener("click", () => {
  let colors = [];
  for (let i = 0; i < myBarchart.colors.length; i++) {
    let randomColor = "";
    do {
      randomColor = Math.floor(Math.random() * 16777215).toString(16);
    } while (randomColor.length < 6)
    colors.push("#" + randomColor);
  }

  myBarchart.colors = colors;
  makeColorBox();
  freshCanvas();
  myBarchart.draw();
});

//dropDown changes position of the value within the bar of barChart
dropDown.addEventListener("change", () => {
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

//Drag and Drop items (working progress) functionality of drag and drop works. Trying to associate colors to boxes now.
let dragAndDrop = (event) => {

  let dragSrcEl;

  function handleDragStart(e) {
    this.style.opacity = '0.4';

    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.textContent);

  }

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';

    return false;
  }

  function handleDragEnter(e) {
    this.classList.add('over');
  }

  function handleDragLeave(e) {
    this.classList.remove('over');
  }

  function handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation(); // stops the browser from redirecting.
    }

    if (dragSrcEl != this) {
      dragSrcEl.textContent = this.textContent;
      this.textContent = e.dataTransfer.getData('text/html');

      idToReplace = this.attributes["color-id"].value;
      draggedId = dragSrcEl.attributes["color-id"].value;
      bgColorToReplace = this.attributes['style'].value;
      draggedBgColor = dragSrcEl.attributes['style'].value;
      draggedBgColor = draggedBgColor.replace("opacity: 0.4", "");

      this.setAttribute("style", draggedBgColor);
      dragSrcEl.setAttribute("style", bgColorToReplace);

      let colorList = myBarchart.colors;
      let b = colorList[idToReplace];
      colorList[idToReplace] = colorList[draggedId];
      colorList[draggedId] = b;
      
      freshCanvas();
      myBarchart.draw();
    }

    return false;
  }

  function handleDragEnd(e) {
    this.style.opacity = '1';

    items.forEach(function (item) {
      item.classList.remove('over');
    });
  }


  let items = document.querySelectorAll('.container .box');
  items.forEach(function (item) {
    item.addEventListener('dragstart', handleDragStart, false);
    item.addEventListener('dragenter', handleDragEnter, false);
    item.addEventListener('dragover', handleDragOver, false);
    item.addEventListener('dragleave', handleDragLeave, false);
    item.addEventListener('drop', handleDrop, false);
    item.addEventListener('dragend', handleDragEnd, false);
  });

};


const PICKER = {
  mouse_inside: false,

  to_hex: function (dec) {
    hex = dec.toString(16);
    return hex.length == 2 ? hex : '0' + hex;
  },

  show: function () {
    let input = $(this);
    let position = input.offset();

    PICKER.$colors = $('<canvas width="230" height="150" ></canvas>');
    PICKER.$colors.css({
      'position': 'absolute',
      'top': position.top + input.height() + 9,
      'left': position.left,
      'cursor': 'crosshair',
      'display': 'none'
    });
    $('body').append(PICKER.$colors.fadeIn());
    PICKER.colorctx = PICKER.$colors[0].getContext('2d');

    PICKER.render();

    PICKER.$colors
      .click(function (e) {
        let new_color = PICKER.get_color(e);
        $(input).css({ 'background-color': new_color }).val(new_color).trigger('change').removeClass('color-picker-binded');
        PICKER.close();
        let i = $(input).index();
        myBarchart.colors[i] = new_color;
        freshCanvas();
        myBarchart.draw();
      })
      .hover(function () {
        PICKER.mouse_inside = true;
      }, function () {
        PICKER.mouse_inside = false;
      });

    $("body").mouseup(function () {
      if (!PICKER.mouse_is_inside) PICKER.close();
    });
  },

  bind_inputs: function () {
    $('div[draggable="true"]').each(function () {
      $(this).click(PICKER.show);
    }).addClass('color-picker-binded');
  },

  bind_input: function (index) {
    $('div[draggable="true"]').eq(index).click(PICKER.show);
  },

  close: function () { PICKER.$colors.fadeOut(PICKER.$colors.remove); },

  get_color: function (e) {
    let pos_x = e.pageX - PICKER.$colors.offset().left;
    let pos_y = e.pageY - PICKER.$colors.offset().top;

    data = PICKER.colorctx.getImageData(pos_x, pos_y, 1, 1).data;
    return '#' + PICKER.to_hex(data[0]) + PICKER.to_hex(data[1]) + PICKER.to_hex(data[2]);
  },

  // Build Color palette
  render: function () {
    let gradient = PICKER.colorctx.createLinearGradient(0, 0, PICKER.$colors.width(), 0);

    // Create color gradient
    gradient.addColorStop(0, "rgb(255,   0,   0)");
    gradient.addColorStop(0.15, "rgb(255,   0, 255)");
    gradient.addColorStop(0.33, "rgb(0,     0, 255)");
    gradient.addColorStop(0.49, "rgb(0,   255, 255)");
    gradient.addColorStop(0.67, "rgb(0,   255,   0)");
    gradient.addColorStop(0.84, "rgb(255, 255,   0)");
    gradient.addColorStop(1, "rgb(255,   0,   0)");

    // Apply gradient to canvas
    PICKER.colorctx.fillStyle = gradient;
    PICKER.colorctx.fillRect(0, 0, PICKER.colorctx.canvas.width, PICKER.colorctx.canvas.height);

    // Create semi transparent gradient (white -> trans. -> black)
    gradient = PICKER.colorctx.createLinearGradient(0, 0, 0, PICKER.$colors.height());
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(0.5, "rgba(0,     0,   0, 0)");
    gradient.addColorStop(1, "rgba(0,     0,   0, 1)");

    // Apply gradient to canvas
    PICKER.colorctx.fillStyle = gradient;
    PICKER.colorctx.fillRect(0, 0, PICKER.colorctx.canvas.width, PICKER.colorctx.canvas.height);
  }
};

PICKER.bind_inputs();
makeColorBox();