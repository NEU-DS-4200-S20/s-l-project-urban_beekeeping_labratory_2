var parseDate = d3.timeParse('%m/%d/%Y');
var keys, 
    allData, 
    currentData,
    startPos = 0,
    increment = 1000;

var table = d3.selectAll("#table-container").append("table"),
thead = table.append("thead"),
tbody = table.append("tbody");
                
d3.csv('data/BeeData.csv', function(data) {

    keys     = Object.keys(data[0]),
    allData  = data;

    // date: parseDate(d.Date),
    // hiveId: d.HiveID,
    // zipcode: d.ZipCode,
    // beeCount: d.BeeCount,
    // broodCount: d.BroodCount,
    // honeyCount: d.HoneyCount
    
    thead.append('tr')
      .selectAll('th')
      .data(keys).enter()
      .append('th')
      .text(function (d) {
      return d;
    });

    renderTable();
});

function renderTable() {
    // console.log(data);
    currentData = allData.slice(startPos, startPos + increment);
    
  // Delete previous rows.
  tbody.selectAll('tr').remove();
  
  // Create new rows.
  var tr = tbody.selectAll("tr")
                .data(currentData).enter()
                .append("tr")
                .classed("even", function(d, i) {
                  return i % 2 == 1; 
                });
      
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


