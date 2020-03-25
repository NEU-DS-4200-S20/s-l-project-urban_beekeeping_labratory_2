// var svgStates = d3.select("svg #states"),
//     svgBoundary = d3.select("svg #boundary"),
//     states = {},
//     startYear = 1790,
//     currentYear = startYear;

// var width = window.innerWidth, // (1)
//   height = window.innerHeight;
// var projection = d3.geoAlbersUsa()
//   .translate([width / 2, height / 2]);  // (2)

// var path = d3.geoPath()
//     .projection(projection);  // (3)

// d3.json("data/usa.json", function(error, boundary) {
//     svgBoundary.selectAll("path")
//         .data(boundary.features)
//         .enter()
//         .append("path")
//         .attr("d", path)
//     });

// d3.json("data/states.json", function(error, topologies) {  // (4)

//   var state = topojson.feature(topologies[0], topologies[0].objects.stdin);  // (5)

//   svgStates.selectAll("path")  // (6)
//       .data(state.features)
//       .enter()
//     .append("path")
//       .attr("d", path)
//       .style("fill", function(d, i) { 
//         console.log("d is ", d)
//         var name = d.properties.STATENAM.replace(" Territory", ""); 
//         return colors[name]; 
//       });
// });



var projection = d3.geoAlbersUsa();

var path = d3.geoPath().projection(projection); 

var width = 960,
  height = 500;

var svg = d3.select("map-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(-2100,-100)scale(3)");

// var color = d3.scale.category20();

d3.queue()
    .defer(d3.json, "data/ma.topo.json")
    .defer(d3.json, "data/ct.topo.json")
    .defer(d3.json, "data/nh.topo.json")
    .defer(d3.json, "data/vt.topo.json")
    .defer(d3.json, "data/ri.topo.json")
    .await(ready);

function ready(error, ma, ct, nh, vt, ri) {

  var matopo = {type: "FeatureCollection", id: "MA", features: topojson.feature(ma, ma.objects.ma).features};
  var cttopo = {type: "FeatureCollection", id: "CT", features: topojson.feature(ct, ct.objects.ct).features};
  var nhtopo = {type: "FeatureCollection", id: "NH", features: topojson.feature(nh, nh.objects.nh).features};
  var vttopo = {type: "FeatureCollection", id: "VT", features: topojson.feature(vt, vt.objects.vt).features};
  var ritopo = {type: "FeatureCollection", id: "RI", features: topojson.feature(ri, ri.objects.ri).features};

  var topo = [matopo, cttopo, nhtopo, vttopo, ritopo];

  var town = svg.selectAll(".land").data(topo);

  town.enter().insert("path")
      .attr("class", "land")
      .attr("d", path)
      .attr("id", function(d,i) { return d.id; })
      .style("fill", function(d,i) { return color(i) });


  // //tooltips
  // town
  //   .on("mousemove", function(d,i) {
  //     var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
  //       tooltip
  //         .classed("hidden", false)
  //         .attr("style", "left:"+(mouse[0])+"px;top:"+(mouse[1])+"px")
  //         .html(d.id)
  //     })
  //     .on("mouseout",  function(d,i) {
  //       tooltip.classed("hidden", true)
  //     }); 


}

d3.select(self.frameElement).style("height", height + "px");