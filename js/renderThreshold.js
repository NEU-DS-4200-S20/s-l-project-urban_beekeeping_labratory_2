var minVal = 0;
var maxVal = 19;

var svg = d3.select("#thresh-slider")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height);


var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, width])
    .clamp(true);

// Threshold
var defs = svg.append("defs");
var gradient = defs.append("linearGradient")
    .attr("id", "grad")
gradient.append("stop")
    .attr("id", "gstart")
    .attr("offset", "0%")
    .attr("stop-color", "#ffffff");
gradient.append("stop")
    .attr("id", "gstop")
    .attr("offset", "100%")
    .attr("stop-color", "#ffffff");

var thresh = svg.append("g")
    .attr("class","slider")
    // .attr("transform", "translate(" + margin.left + "," + height / 4 + ")");

thresh.insert("rect")
    .attr("width", x.range()[1])
    .attr("height", 25)
    .style("fill", "url(#grad")
    .attr("transform", "translate(50, 12)")

thresh.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
    .attr("stroke-width", 110)
    .attr("transform", "translate(75, 25)")
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

function threshTicks() {
    d3.select("#thresh-slider").selectAll("text").remove();
    var startTransX = 52;
    var startTransY = 70;
    var incr = 2
    for (var i = minVal; i <= maxVal; i += incr) {
        thresh.append("text")
                .attr("class", "label")
                .text(Math.round(i).toString())
                .attr("font-size", "11px")
                .attr("transform", "translate(" + startTransX + "," + startTransY + ")")
        startTransX += (x.range()[1] / ((maxVal - minVal) / 2));
    }
}

threshTicks();

var tHandle = thresh.insert("rect", ".track-overlay")
                    .attr("transform", "translate(50, 0)")
                    .attr("class", "handle")
                    .attr("id", "thresh-handle")
                    .attr("height", 45)
                    .attr("width", 5);

function dehighlight(h) {
    tHandle.attr("x", x(h));
    var amt = (x(h) / x(endDate)) * maxVal;
    Object.keys(mRefs).forEach(zip => {
        var path = mRefs[zip];
        var rows = tRefs[zip];
        var pathData = d3.select(path).attr("id").slice(6);
        pathData = parseFloat(pathData) / 2;
        if (pathData <= amt) {
            d3.select(path)
                .classed("threshed", function() {
                    return true;
                })
                .style("fill", "#ccc");
            Object.values(rows).forEach(row => {
                d3.select(row).style("display", "none");
            })
        } else {
            d3.select(path)
                .classed("threshed", function() {
                    return false;
                })
                .style("fill", ramp(pathData * 2));
            Object.values(rows).forEach(row => {
                d3.select(row).style("display", "");
            })
        }
    })
};
