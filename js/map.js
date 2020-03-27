

var svg = d3.select("#map-container")
  .append("svg")
  .attr("width",600)
  .attr("height",450);

var projection = d3.geoMercator();

var path = d3.geoPath().projection(projection);

d3.json("../data/ma_zip_codes_geo.min.json", function(err, geojson) { 
    
    projection.fitSize([600,450],geojson);

      svg.append("path")
         .attr("d", path(geojson))
         .attr("stroke", "white")
         .attr("fill", "#ccc")
         .attr("transform", "translate(0, -30)");

})
