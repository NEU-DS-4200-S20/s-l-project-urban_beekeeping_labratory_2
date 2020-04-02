var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var formatDateForMap = d3.timeFormat("%Y-%m");
let dropdownCount = "BeeCount";
let date = "2012-04";

var startDate = new Date("2012-04-16"),
    endDate = new Date("2020-02-20");

var margin = {top:0, right:50, bottom:0, left:50},
    width = 960 -margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

var svg = d3.select("#slider")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height);
    
var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, width])
    .clamp(true);

var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");

slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() { hue(x.invert(d3.event.x)); }));

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
  .selectAll("text")
    .data(x.ticks(10))
    .enter()
    .append("text")
    .attr("x", x)
    .attr("y", 10)
    .attr("font-family", "Open Sans")
    .attr("text-anchor", "middle")
    .text(function(d) { return formatDateIntoYear(d); });

var label = slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-25) + ")")

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

function hue(h) {
  handle.attr("cx", x(h));
  label
    .attr("x", x(h))
    .text(formatDate(h));
    date = formatDateForMap(h);
    renderTable(date);
    getData(date, dropdownCount);
}

var selectbox = d3.select("#selectbox").on("change", function() {
        if (this.value == "BeeCount") {
            console.log("Selected Bee")
            dropdownCount = "BeeCount";
            getData(date, "BeeCount");
        }
        else if (this.value == "BroodCount") {
            console.log("Selected Brood")
            dropdownCount = "BroodCount";
            getData(date, "BroodCount");
        }
        else if (this.value == "HoneyCount") {
            console.log("Selected Honey")
            dropdownCount = "HoneyCount";
            getData(date, "HoneyCount");
        } else {
            console.log("Selected Default")
            dropdownCount = "BeeCount";
            getData(date, "BeeCount");
        }
  });