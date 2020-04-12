// Initialize date formatting object
var parseDate = d3.timeParse('%m/%d/%Y');

// Initialize global data variables
var keys, 
    allData, 
    currentData,
    startPos = 0,
    increment = 1000;

// Initialize global table variables
var table,
    thead,
    tbody,
    tRefs = {}

// Initialize global brushed variables
var brushedRows = [],
    brushedData = [];

/**
 * Generates empty table element
 */
function initializeTable() {
  table = d3.selectAll("#table-container").append("table"),
  thead = table.append("thead"),
  tbody = table.append("tbody");
}
initializeTable();

// Append html tags to create the table header and body.
var table = d3.selectAll("#table-container").append("table"),
thead = table.append("thead"),
tbody = table.append("tbody");
                
// load data
d3.csv('data/NewMassDataClean.csv', function(data) {
    keys     = Object.keys(data[0]),
    allData  = data;
    
    thead.append('tr')
      .selectAll('th')
      .data(keys).enter()
      .append('th')
      .text(function (d) {
      return d;
    });
    renderTable("2012-04");
});


/**
 * Sets currently brushed table rows & respect data to empty
 */
function resetBrushed() {
	brushedRows = [];
	brushedData = [];
}

/**
 * Isolates data to subset containing elements with matching date
 * @param {*} date - User specified date
 */
function filterTableData(date) {
  var filtered = allData.filter(function (d) {
    return d.Date.includes(date);
  });
  return filtered;
}

/**
 * Handles displaying scrollbar for table container
 * @param {*} currentData - Isolated dataset
 */
function setTableScroll(currentData) {
  if (currentData.length > 8) {
    d3.select(".container").style("overflow-y", "scroll");
  } else {
    d3.select(".container").style("overflow-y", "hidden");
  }
}

/**
 * Initializes table references for table rows to zipcodes
 * @param {*} row - d3 row element
 * @param {*} rowData - Corresponding row data
 */
function resetTableReferences(row, rowData) {
  if (!(rowData.ZipCode.toString() in tRefs)) {
    tRefs[rowData.ZipCode.toString()] = []
  }
  tRefs[rowData.ZipCode.toString()].push(row);
}

/**
 * Dehighlights all table rows & deselects all map regions
 */
function resetHoverRows() {
  // Dehighlight rows
  brushedData.map(function (rowData) {
    var target = mRefs[rowData.ZipCode.toString()];
    d3.select(target).dispatch("mouselinkoff");
  })
  // Deselect map regions
  currentData.map(data => {
    var target = mRefs[data.ZipCode.toString()];
    d3.select(target).classed("hovered", function() {
      return false;
    })
  })
}

/**
 * Handles row selection when hovering with mouse
 * @param {*} hover - Indicator to display row selection
 */
function setHoverRow(row, hover) {
  d3.select(row).classed("hovered", function() {
    return hover;
  })
}

/**
 * Handles behaviour for mouse starting hovering over rows
 * @param {*} selecting - Indicator for currently selecting rows
 * @param {*} row - d3 table row element
 * @param {*} rowData - Corresponding row data
 */
function enterHoverRow(selecting, row, rowData) {
  if (selecting) {
    if (!brushedRows.includes(row)) {
      brushedRows.push(row);
      brushedData.push(rowData);
      setHoverRow(row, true);
    }
  }
}

/**
 * Handles behaviour for mouse ending hovering over rows
 * @param {*} selecting - Indicator for currently selecting rows
 * @param {*} row - d3 table row element
 * @param {*} rowData - Corresponding row data
 */
function exitHoverRow(selecting, row, rowData) {
  if (!selecting) {
    if (!brushedRows.includes(row)) {
      setHoverRow(row, false);
      // Map region corresponding to row
      var target = mRefs[rowData.ZipCode.toString()];
      var mapBrushed = false;
      // Iterate over brushed elements to determine if map region is brushed
      brushedData.forEach(bData => {
        var brushedZip = bData.ZipCode;
        if (brushedZip == rowData.ZipCode) {
          mapBrushed = true;
        }
      })
      if (!mapBrushed) {
        // Deselect map region
        d3.select(target).dispatch("mouselinkoff");
      }
    }
  }
}

//render table, passes in the current date on the slider to filter and display
function renderTable(date) {
  currentData = filterTableData(date);
  setTableScroll(currentData);
  tRefs = {};
  var selecting = false;
  resetBrushed();
    
  // Delete previous rows.
  tbody.selectAll('tr').remove();
  
  // Create new rows.
  var tr = tbody.selectAll("tr")
                .data(currentData).enter()
                .append("tr")
                .classed("even", function(d, i) {
                  return i % 2 == 1; 
                })
                .on("mouseover", function(rowData) {
                    var target = mRefs[rowData.ZipCode.toString()];
                // Highlighs rows as user hovers over them. Also highlights selected
                // rows when the user is brushing over the table.
                .on("mouseover", function(d) {
                    var target = mRefs[d.ZipCode.toString()];
                    d3.select(target).dispatch("mouselinkon");
                    enterHoverRow(selecting, this, rowData);
                })
                .on("mouseout", function(rowData) {
                  exitHoverRow(selecting, this, rowData);
                // Unhiglights rows as user hovers over them. Keeps selected
                // rows highlighed when the user is brushing over the table.
                .on("mouseout", function(d) {
                  if (!selecting) {
                    if (!brushedRows.includes(this)) {
                      var target = mRefs[d.ZipCode.toString()];
                      d3.select(this).classed("hovered", function() {
                        return false;
                      })
                      var mapBrushed = false;
                      brushedData.forEach(bd => {
                        var brushedZip = bd.ZipCode;
                        if (brushedZip == d.ZipCode) {
                          mapBrushed = true;
                        }
                      })
                      if (!mapBrushed) {
                        d3.select(target).dispatch("mouselinkoff");
                      }
                    }
                  }
                })
                // Initiates brushing so the user can select single or multiple rows.
                .on("mousedown", function(d) {
                  selecting = true;
                  // Deselect all rows & regions
                  resetHoverRows();
                  // Reset containers
                  resetBrushed();
                  // Brush current row
                  brushedRows.push(this);
                  brushedData.push(d);
                  // Highlight current row
                  d3.select(this).dispatch("mouseover");
                })
                // Signals brusing on the table to stop once the mouse is released.
                .on("mouseup", function (d) {
                  selecting = false;
                  // Deselect if only 1 row brushed
                  if (brushedRows.length == 1) {
                    brushedRows.pop();
                    brushedData.pop();
                    d3.select(this).dispatch("mouseout");
                  }
                })
                .on("start", function(rowData) {
                  resetTableReferences(this, rowData);
                })
                .dispatch("start")
      tr.selectAll('td')
        .data(function (d) { 
          return keys.map(function (e) {
            return { 
              key: e,
              value: d[e]
            }
          });
        }).enter()
        .append('td')
        .text(function (d) {
          return d.value; 
        });
};


