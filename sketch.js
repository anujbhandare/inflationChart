let table;
let headers = [];
let dataRows = [];
let filteredData = null;
let countryInput;
let searchButton;
let message = ""; // Message for invalid country input

function preload() {
  table = loadTable('global_inflation_data.csv', 'csv');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Load headers and data rows
  headers = table.getRow(0).arr;
  for (let r = 1; r < table.getRowCount(); r++) {
    let row = table.getRow(r).arr;
    dataRows.push({ country: row[0], inflation: row.slice(1).map(Number) });
  }

  // Create input field and search button
  countryInput = createInput();
  searchButton = createButton('Search');
  let totalWidth = countryInput.width + searchButton.width;
  let centerX = (width - totalWidth) / 2;
  countryInput.position(centerX, 10);
  searchButton.position(centerX + countryInput.width, 10);
  searchButton.mousePressed(searchCountry);

  textSize(12);
}

function searchCountry() {
  let countryName = countryInput.value().toLowerCase();
  filteredData = dataRows.find(data => data.country.toLowerCase() === countryName);

  if (!filteredData) {
    message = "Country not found. Please try again.";
    filteredData = null;
  } else {
    message = "";
    draw();
  }
}

function draw() {
  background(255);
  drawAxes();
  if (message) {
    fill(255, 0, 0);
    textAlign(CENTER);
    text(message, width / 2, height / 2 - 20);
  } else if (filteredData) {
    let minInflation = Math.min(...filteredData.inflation);
    let maxInflation = Math.max(...filteredData.inflation);
    drawBarChart(filteredData.inflation, minInflation, maxInflation);
  }
}

function drawAxes() {
  stroke(0);
  
  // Set a fixed font size and color for axis labels
  textSize(16); // Increased font size for axis labels
  fill(0); // Fixed color to black for consistency
  
  let xyAxis = height / 2;
  line(50, xyAxis, width - 50, xyAxis); // X-axis
  line(50, 50, 50, height - 50); // Y-axis

  textAlign(CENTER);
  text("Year", width / 2, height - 10); // X-axis label

  // Y-axis label rotated for "Inflation"
  push();
  translate(30, height / 2); 
  rotate(-PI / 2); 
  text("Inflation", 0, 0);
  pop();
}

function drawBarChart(inflationData, minInflation, maxInflation) {
  let totalBars = inflationData.length;
  let barSpacing = 5;
  let barWidth = (width - 100) / totalBars - barSpacing;
  let barHeight = Math.max(Math.abs(minInflation), Math.abs(maxInflation));
  let xyAxis = height / 2;

  let hoveredYear = null;
  let hoveredInflation = null;

  // Set a font size and color for year labels on bars
  textSize(14); // Increased font size for year labels on bars
  fill(0); // Set color to black for year labels

  for (let i = 0; i < totalBars; i++) {
    let year = headers[i + 1];
    let inflation = inflationData[i];
    let x = 50 + i * (barWidth + barSpacing);
    let y = inflation >= 0 ? map(inflation, 0, barHeight, xyAxis, 50) : map(inflation, 0, -barHeight, xyAxis, height - 50);

    // Draw bar with fixed colors for positive and negative values
    fill(inflation >= 0 ? 'red' : 'green');
    rect(x, inflation >= 0 ? y : xyAxis, barWidth, inflation >= 0 ? xyAxis - y : y - xyAxis);

    // Draw year label with space above/below the bar
    textAlign(CENTER);
    const labelOffset = 15; // Offset for spacing between the label and the bar
    text(year, x + barWidth / 2, inflation >= 0 ? y - labelOffset : y + labelOffset);

    // Detect hover and set data for tooltip display
    if (mouseX > x && mouseX < x + barWidth && mouseY > min(y, xyAxis) && mouseY < max(y, xyAxis)) {
      hoveredYear = year;
      hoveredInflation = inflation;
    }
  }

  // Display tooltip if hovering over a bar
  if (hoveredYear && hoveredInflation !== null) {
    showTooltip(hoveredYear, hoveredInflation);
  }
}

function showTooltip(year, inflation) {
  // Tooltip background and text styling
  fill(0);
  rect(mouseX + 10, mouseY - 25, 92, 38, 5);
  fill(255);
  textSize(12); // Set tooltip font size
  textAlign(LEFT, CENTER);
  text(`Year: ${year}`, mouseX + 15, mouseY - 15);
  text(`Inflation: ${inflation}%`, mouseX + 15, mouseY);
}
