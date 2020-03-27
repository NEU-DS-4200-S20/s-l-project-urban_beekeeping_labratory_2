var height = 450;

var tooltip = d3.select("#map-container").append("div").attr("class", "tooltip hidden");

var projection = d3.geoAlbersUsa()

var path = d3.geoPath().projection(projection);

var svg = d3.select("#map-container").append("svg")
  .attr("width", '100%')
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(-2100, -200)scale(3)");

var color = d3.scaleOrdinal(d3.schemeCategory10);

queue()
  .defer(d3.json, "../data/ma.topojson")
  .await(ready);

function ready(error, ma) {

  var matopo = { type: "FeatureCollection", id: "MA", features: topojson.feature(ma, ma.objects.ma).features };
  console.log(matopo['features'])

  var topo = [matopo];

  var town = svg.selectAll(".land").data(topo);

  town.enter().insert("path")
    .attr("class", "land")
    .attr("d", path)
    .attr("id", function (d, i) { return d.id; })
    .style("fill", function (d, i) { return "#0000" });



  //tooltips
  // town
  //   .on("mousemove", function (d, i) {
  //     var mouse = d3.mouse(svg.node()).map(function (d) { return parseInt(d); });
  //     tooltip
  //       .classed("hidden", false)
  //       .attr("style", "left:" + (mouse[0]) + "px;top:" + (mouse[1]) + "px")
  //       .html(d.id)
  //   })
  //   .on("mouseout", function (d, i) {
  //     tooltip.classed("hidden", true)
  //   });


}

d3.select(self.frameElement).style("height", height + "px");