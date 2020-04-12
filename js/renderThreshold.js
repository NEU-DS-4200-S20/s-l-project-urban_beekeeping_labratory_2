// Global variables for floor/ceiling of dataset
var minVal = 0;
var maxVal = 19;

// Initializes threshold container
var svg = d3.select("#thresh-slider")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height);

// Generates spanning function for threshold data values
var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, width])
    .clamp(true);


/**
 * Sets gradient start/stop colors to default white values
 */
function initializeGradientColors() {
    gradient.append("stop")
        .attr("id", "gstart")
        .attr("offset", "0%")
        .attr("stop-color", "#ffffff");
    gradient.append("stop")
        .attr("id", "gstop")
        .attr("offset", "100%")
        .attr("stop-color", "#ffffff");
}

// Declares color gradient for threshold
var defs = svg.append("defs");
var gradient = defs.append("linearGradient")
    .attr("id", "grad")
initializeGradientColors();

// Declares slider for threshold
var thresh = svg.append("g")
    .attr("class","slider")

// Adds threshold color bar
thresh.insert("rect")
    .attr("width", x.range()[1])
    .attr("height", 25)
    .style("fill", "url(#grad")
    .attr("transform", "translate(20, 12)")

// Adds threshold user-controlled slider line
thresh.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
    .attr("stroke-width", 110)
    .attr("transform", "translate(45, 25)")
    .style("opacity", 0.0)
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { thresh.interrupt(); })
        .on("start drag", function() { 
            dehighlight(x.invert(d3.event.x));
        }));

/**
 * Sets tick marks for threshold slider
 */
function threshTicks() {
    d3.select("#thresh-slider").selectAll("text").remove();
    // Starting coordinates for tick marks
    var startTransX = 22;
    var startTransY = 70;
    // Tick mark increment amount
    var incr = 2
    for (var i = minVal; i <= maxVal; i += incr) {
        thresh.append("text")
                .attr("class", "label")
                .text((Math.round(i) * 2).toString())
                .attr("font-size", "11px")
                .attr("transform", "translate(" + startTransX + "," + startTransY + ")")
        startTransX += (x.range()[1] / ((maxVal - minVal) / 2));
    }
}
threshTicks();

// Adds threshold user-controlled slider handle
var tHandle = thresh.insert("rect", ".track-overlay")
                    .attr("transform", "translate(20, 0)")
                    .attr("class", "handle")
                    .attr("id", "thresh-handle")
                    .attr("height", 45)
                    .attr("width", 5);

/**
 * Handles determining path's fill color based on threshold
 * @param {*} path - d3 path element
 * @param {*} threshed - Indicator for path being within threshold
 * @param {*} fill - Path fill color
 */
function fillPath(path, threshed, fill) {
    d3.select(path)
        .classed("threshed", function() {
        return threshed;
    }).style("fill", fill);
}

/**
 * Handles determining if rows should display based on threshold
 * @param {*} rows - Current table rows
 * @param {*} display - Indicator to display rows
 */
function displayTableRows(rows, display) {
    Object.values(rows).forEach(row => {
        d3.select(row).style("display", display);
    })
}

/**
 * Handles behaviour for deselecting regions & rows based on threshold
 * @param {*} h - Current threshold value
 */
function dehighlight(h) {
    tHandle.attr("x", x(h));
    var amt = (x(h) / x(endDate)) * maxVal;
    Object.keys(mRefs).forEach(zip => {
        // Retrieve all regions/rows & corresponding data
        var path = mRefs[zip];
        var rows = tRefs[zip];
        var pathData = d3.select(path).attr("id").slice(6);
        pathData = parseFloat(pathData) / 2;
        if (pathData <= amt) {
            // Path not within threshold; do not display path/corresponding rows
            fillPath(path, true, "#ccc")
            displayTableRows(rows, "none");
        } else {
            // Path within threshold; display path/corresponding rows
            fillPath(path, false, ramp(pathData * 2));
            displayTableRows(rows, "");
        }
    })
};
