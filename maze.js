let numEdits = 0;
let solved = false;
let lastEdits = [];
let undoneEdits = [];
let mazeCellSize = 20;
document
  .getElementById("change-cell-size")
  .addEventListener("click", function () {
    const size = parseInt(document.getElementById("sizeCell").value);
    if (size == mazeCellSize) {
      return;
    }
    if (size >= 5 && size <= 30) {
      mazeCellSize = size;
      document.documentElement.style.setProperty("--cell-size", `${size}px`);
      document.getElementById("generate-maze").click();
      document.querySelector(".error").textContent = "";
    }
  });

document
  .getElementById("sizeCell")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      document.getElementById("change-cell-size").click();
    }
  });

document.getElementById("generate-maze").addEventListener("click", function () {
  const width = parseInt(document.getElementById("rows").value);
  const maze = document.querySelector(".maze");
  maze.style.display = "grid";
  maze.style.gridTemplateColumns = `repeat(${width}, ${mazeCellSize}px)`;
  maze.style.gridTemplateRows = `repeat(${width}, ${mazeCellSize}px)`;

  maze.innerHTML = "";
  for (let i = 0; i < width; i++) {
    const row = document.createElement("div");
    row.classList.add("maze-row");
    maze.appendChild(row);
    for (let j = 0; j < width; j++) {
      const cell = document.createElement("div");
      cell.id = `cell-${i}-${j}`;
      if (j == 0 || j == width - 1 || i == 0 || i == width - 1) {
        cell.classList.add("wall");
      }
      cell.classList.add("cell");
      row.appendChild(cell);
    }
  }

  numEdits = 0;
  document.getElementById("goBack").style.display = "inline-block";
  document.getElementById("goBack").classList.add("disabled-btn");
  document.getElementById("redo").style.display = "inline-block";
  document.getElementById("redo").classList.add("disabled-btn");
  document.querySelector(".design-maze").style.display = "flex";
  document.querySelector(".settings").style.display = "flex";
  document.querySelector(".error").textContent = "";
  lastEdits = [];
  undoneEdits = [];
  startDrawn = false;
  endDrawn = false;

  document.querySelector(".solve-container").style.display = "block";
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    document.getElementById("generate-maze").click();
  }
});

let drawMode = "wall";
document.querySelectorAll('input[name="draw-mode"]').forEach((elem) => {
  elem.addEventListener("change", function (event) {
    drawMode = event.target.id;
  });
});

let startDrawn = false;
let endDrawn = false;
const error = document.querySelector(".error");
function showError(message) {
  error.style.color = "red";
  error.textContent = message;
}
function clearError() {
  error.textContent = "";
}

function reset() {
  if (solved) {
    document.querySelectorAll(".cell").forEach((cell) => {
      cell.classList.remove("solution");
      const cellID = cell.id;
      const cellPos = cellID.split("-");
      const row = parseInt(cellPos[1]);
      const col = parseInt(cellPos[2]);
      if (
        row !== 0 &&
        col !== 0 &&
        row !== parseInt(document.getElementById("rows").value) - 1 &&
        col !== parseInt(document.getElementById("rows").value) - 1
      ) {
        cell.classList.remove("wall");
      }
      cell.classList.remove("start");
      cell.classList.remove("end");
      solved = false;
    });
    lastEdits = [];
    undoneEdits = [];
    numEdits = 0;
    startDrawn = false;
    endDrawn = false;
    document.getElementById("goBack").classList.add("disabled-btn");
    document.getElementById("redo").classList.add("disabled-btn");
    clearError();
  }
}

function draw(event) {
  reset();
  clearError();
  const hadStart = event.target.classList.contains("start");
  const hadEnd = event.target.classList.contains("end");
  const prevClass = event.target.className;

  event.target.className = "cell";

  if (hadStart) {
    startDrawn = false;
  }
  if (hadEnd) {
    endDrawn = false;
  }

  if (drawMode === "start") {
    if (startDrawn) {
      showError("Start point already drawn!");
      return;
    } else {
      startDrawn = true;
    }
  }
  if (drawMode === "end") {
    if (endDrawn) {
      showError("End point already drawn!");
      return;
    } else {
      endDrawn = true;
    }
  }
  event.target.classList.add(drawMode);
  numEdits++;
  appendEdit(drawMode, event.target, prevClass);
  if (numEdits > 0) {
    document.getElementById("goBack").classList.remove("disabled-btn");
  }
  undoneEdits = [];
  document.getElementById("redo").classList.add("disabled-btn");
}
document.querySelector(".maze").addEventListener("click", function (event) {
  if (event.target.classList.contains("cell")) {
    draw(event);
  }
});

document.querySelector(".maze").addEventListener("mousedown", function (event) {
  if (event.target.classList.contains("cell")) {
    draw(event);
  }
});
document.querySelector(".maze").addEventListener("mouseover", function (event) {
  if (event.buttons === 1) {
    if (event.target.classList.contains("cell")) {
      draw(event);
    }
  }
});

function appendEdit(action, cell, prevClass) {
  lastEdits.push({ action: action, cell: cell, prevClass: prevClass });
  if (lastEdits.length > 1000) {
    lastEdits.shift();
  }
}

function GoBack() {
  reset();
  if (numEdits > 0) {
    const lastEdit = lastEdits.pop();
    lastEdit.cell.className = lastEdit.prevClass;
    numEdits--;
    if (lastEdit.action === "start") {
      startDrawn = false;
    }
    if (lastEdit.action === "end") {
      endDrawn = false;
    }
    if (lastEdit.prevClass.includes("start")) {
      startDrawn = true;
    }
    if (lastEdit.prevClass.includes("end")) {
      endDrawn = true;
    }
    if (numEdits === 0) {
      document.getElementById("goBack").classList.add("disabled-btn");
    }
    undoneEdits.push(lastEdit);
    document.getElementById("redo").classList.remove("disabled-btn");
    clearError();
  }
}

document.getElementById("goBack").addEventListener("click", GoBack);

document.getElementById("goBack").addEventListener("mousedown", GoBack);

document.addEventListener("keydown", function (event) {
  if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
    GoBack();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "y" && (event.ctrlKey || event.metaKey)) {
    redo();
  }
});

function redo() {
  if (undoneEdits.length > 0) {
    const redoEdit = undoneEdits.pop();
    redoEdit.cell.className = "cell";
    redoEdit.cell.classList.add(redoEdit.action);

    if (redoEdit.action === "start") {
      startDrawn = true;
    }
    if (redoEdit.action === "end") {
      endDrawn = true;
    }
    if (redoEdit.prevClass.includes("start")) {
      startDrawn = false;
    }
    if (redoEdit.prevClass.includes("end")) {
      endDrawn = false;
    }

    numEdits++;
    lastEdits.push(redoEdit);
    document.getElementById("goBack").classList.remove("disabled-btn");

    if (undoneEdits.length === 0) {
      document.getElementById("redo").classList.add("disabled-btn");
    }
    clearError();
  }
}

document.getElementById("redo").addEventListener("click", redo);

document.getElementById("redo").addEventListener("mousedown", redo);

document.getElementById("clear-maze").addEventListener("click", function () {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    let cellID = cell.id;
    let cellPos = cellID.split("-");
    let row = parseInt(cellPos[1]);
    let col = parseInt(cellPos[2]);
    if (
      row === 0 ||
      col === 0 ||
      row === parseInt(document.getElementById("rows").value) - 1 ||
      col === parseInt(document.getElementById("rows").value) - 1
    ) {
      cell.className = "cell wall";
    } else {
      cell.className = "cell";
    }
  });
  lastEdits = [];
  undoneEdits = [];
  numEdits = 0;
  startDrawn = false;
  endDrawn = false;
  document.getElementById("goBack").classList.add("disabled-btn");
  document.getElementById("redo").classList.add("disabled-btn");
});

let speed = 50;
document.getElementById("speed").addEventListener("input", function (event) {
  speed = parseInt(event.target.value);
});

document.getElementById("solve-maze").addEventListener("click", function () {
  if (!startDrawn) {
    showError("You must place a Start point.");
    return;
  }
  if (!endDrawn) {
    showError("You must place an End point.");
    return;
  }
  const size = parseInt(document.getElementById("rows").value);
  const mazeDOM = document.querySelector(".maze");
  const cells = mazeDOM.querySelectorAll(".cell");

  const maze = [];
  let start = null;
  let end = null;

  for (let i = 0; i < size; i++) {
    maze[i] = [];
    for (let j = 0; j < size; j++) {
      const cell = document.getElementById(`cell-${i}-${j}`);
      let type = cell.classList.contains("wall")
        ? "#"
        : cell.classList.contains("start")
        ? "S"
        : cell.classList.contains("end")
        ? "E"
        : " ";
      maze[i][j] = {
        x: i,
        y: j,
        val: type,
        visited: false,
        prev: null,
        dom: cell,
      };

      if (type === "S") end = maze[i][j];
      if (type === "E") start = maze[i][j];
    }
  }

  if (!start) {
    showError("You must place a Start point.");
    return;
  }
  if (!end) {
    showError("You must place an End point.");
    return;
  }

  const queue = [];
  queue.push(start);
  start.visited = true;

  const dx = [-1, 0, 1, 0];
  const dy = [0, 1, 0, -1];

  let found = false;

  while (queue.length > 0) {
    const curr = queue.shift();

    if (curr === end) {
      found = true;
      break;
    }

    for (let k = 0; k < 4; k++) {
      const nx = curr.x + dx[k];
      const ny = curr.y + dy[k];

      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        const neigh = maze[nx][ny];
        if (!neigh.visited && neigh.val !== "#") {
          neigh.visited = true;
          neigh.prev = curr;
          queue.push(neigh);
        }
      }
    }
  }

  if (!found) {
    showError("No path found.");
    return;
  }
  solved = true;
  document.querySelectorAll(".solution").forEach((cell) => {
    cell.classList.remove("solution");
  });

  cells.forEach((c) => c.classList.remove("path"));

  let curr = end;
  let steps = 0;

  while (curr !== start) {
    steps++;
    if (curr.val !== "S") {
      const cellDom = curr.dom;
      const delay = steps * speed;
      setTimeout(() => cellDom.classList.add("solution"), delay);
    }
    curr = curr.prev;
  }

  steps--;

  document.querySelector(
    ".error"
  ).textContent = `Shortest Path Found! Steps: ${steps}`;
  document.querySelector(".error").style.color = "green";
});
