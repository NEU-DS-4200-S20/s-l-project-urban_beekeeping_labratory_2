var width = 960,
  height = 500;

var tooltip = d3.select("#map-container").append("div").attr("class", "tooltip hidden");

var projection = d3.geoAlbersUsa()

var path = d3.geoPath().projection(projection);

var svg = d3.select("#map-container").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(-2100,-100)scale(3)");

var color = d3.scaleOrdinal(d3.schemeCategory10);

queue()
  .defer(d3.json, "../data/ma.topo.json")
  .defer(d3.json, "../data/ct.topo.json")
  .defer(d3.json, "../data/nh.topo.json")
  .defer(d3.json, "../data/vt.topo.json")
  .defer(d3.json, "../data/ri.topo.json")
  .await(ready);

function ready(error, ma, ct, nh, vt, ri, me) {

  var matopo = { type: "FeatureCollection", id: "MA", features: topojson.feature(ma, ma.objects.ma).features };
  var cttopo = { type: "FeatureCollection", id: "CT", features: topojson.feature(ct, ct.objects.ct).features };
  var nhtopo = { type: "FeatureCollection", id: "NH", features: topojson.feature(nh, nh.objects.nh).features };
  var vttopo = { type: "FeatureCollection", id: "VT", features: topojson.feature(vt, vt.objects.vt).features };
  var ritopo = { type: "FeatureCollection", id: "RI", features: topojson.feature(ri, ri.objects.ri).features };

  var topo = [matopo, cttopo, nhtopo, vttopo, ritopo];

  var town = svg.selectAll(".land").data(topo);

  town.enter().insert("path")
    .attr("class", "land")
    .attr("d", path)
    .attr("id", function (d, i) { return d.id; })
    .style("fill", function (d, i) { return color(i) });


  //tooltips
  town
    .on("mousemove", function (d, i) {
      var mouse = d3.mouse(svg.node()).map(function (d) { return parseInt(d); });
      tooltip
        .classed("hidden", false)
        .attr("style", "left:" + (mouse[0]) + "px;top:" + (mouse[1]) + "px")
        .html(d.id)
    })
    .on("mouseout", function (d, i) {
      tooltip.classed("hidden", true)
    });


}

d3.select(self.frameElement).style("height", height + "px");