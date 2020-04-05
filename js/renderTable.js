var parseDate = d3.timeParse('%m/%d/%Y');
var keys, 
    allData, 
    currentData,
    startPos = 0,
    increment = 1000;

var tRefs = {}
var brushedRows = []
var brushedData = []

var table = d3.selectAll("#table-container").append("table"),
thead = table.append("thead"),
tbody = table.append("tbody");
                
// load data
d3.csv('data/MassDataClean.csv', function(data) {

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


//render table, passes in the current date on the slider to filter and display
function renderTable(date) {
    var filtered = allData.filter(function (d) {
      return d.Date.includes(date);
    });
  
    currentData = filtered

  tRefs = {};
  var selecting = false;
  brushedRows = [];
  brushedData = [];
    
  // Delete previous rows.
  tbody.selectAll('tr').remove();
  
  // Create new rows.
  var tr = tbody.selectAll("tr")
                .data(currentData).enter()
                .append("tr")
                .classed("even", function(d, i) {
                  return i % 2 == 1; 
                })
                .on("mouseover", function(d) {
                    var target = mRefs[d.ZipCode.toString()];
                    d3.select(target).dispatch("mouselinkon");
                    if (selecting) {
                      if (!brushedRows.includes(this)) {
                        brushedRows.push(this);
                        brushedData.push(d);
                        d3.select(this).classed("hovered", function() {
                          return true;
                        })
                      }
                    }
                })
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
                .on("mousedown", function(d) {
                  selecting = !selecting;
                  // Deselect All
                  brushedData.map(function (item) {
                    var target = mRefs[item.ZipCode.toString()];
                    d3.select(target).dispatch("mouselinkoff");
                  })
                  currentData.map(d => {
                    var target = mRefs[d.ZipCode.toString()];
                    d3.select(target).classed("hovered", function() {
                      return false;
                    })
                  })
                  brushedRows.map(item => d3.select(item).classed("hovered", function() {
                    return false;
                  }))
                  // Reset containers
                  brushedRows = []
                  brushedData = [];
                  // Brush current row
                  brushedRows.push(this);
                  brushedData.push(d);
                  d3.select(this).dispatch("mouseover");
                })
                .on("mouseup", function (d) {
                  selecting = false;
                  brushedRows.push(this);
                  brushedData.push(d);
                })
                .on("start", function(d) {
                  if (!(d.ZipCode.toString() in tRefs)) {
                    tRefs[d.ZipCode.toString()] = []
                  }
                  tRefs[d.ZipCode.toString()].push(this);
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


