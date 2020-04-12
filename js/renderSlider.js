// Initialize string formatters for dates 
var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var formatDateForMap = d3.timeFormat("%Y-%m");

// Initialize default user-defined variables for map data
let dropdownCount = "BeeCount";
let date = "2012-04";

var startDate = new Date("2012-04-16"),
    endDate = new Date("2020-02-20");

// Declare pixel offsets for container
var margin = { top: 0, right: 50, bottom: 0, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

// Initialize slider element
var sliderFill = d3
    .sliderBottom()
    .min(startDate)
    .max(endDate)
    .width(width)
    .tickFormat(d3.timeFormat("%Y"))
    .ticks(8)
    .default(0.015)
    .fill('#2196f3')
    .on('onchange', val => {
        d3.select('.label').text(formatDate(sliderFill.value()));
        highlight(sliderFill.value());
    });

// Initialize dynamic fill for slider
var gFill = d3
    .select('div#slider-fill')
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height)
    .append('g')
    .attr('transform', 'translate(20,10)');

// Generate date labels for slider
var label = d3
    .select('svg')
    .append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(" + (45) + "," + (75) + ")")

gFill.call(sliderFill);


// updates the map and the table based on the current values of the slider and dropdown menu
function highlight(h) {
    date = formatDateForMap(h);
    renderTable(date);
    getData(date, dropdownCount);
}

// code for the dropdown to select the different kinds of counts bee, brood or honey to display on the map
var selectbox = d3.select("#selectbox").on("change", function () {
    if (this.value == "BeeCount") {
        console.log("Selected Bee")
        dropdownCount = "BeeCount";
        renderTable(date);
        getData(date, "BeeCount");
    }
    else if (this.value == "BroodCount") {
        console.log("Selected Brood")
        dropdownCount = "BroodCount";
        renderTable(date);
        getData(date, "BroodCount");
    }
    else if (this.value == "HoneyCount") {
        console.log("Selected Honey")
        dropdownCount = "HoneyCount";
        renderTable(date);
        getData(date, "HoneyCount");
    } else {
        console.log("Selected Default")
        dropdownCount = "BeeCount";
        renderTable(date);
        getData(date, "BeeCount");
    }
});

