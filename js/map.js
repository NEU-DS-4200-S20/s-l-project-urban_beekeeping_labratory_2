var width = 600;
var height = 450;

var lowColor = '#f9f9f9'
var highColor = '#bc2a66'

var svg = d3.select("#map-container")
  .append("svg")
  .attr("width",width)
  .attr("height",height);

var projection = d3.geoMercator().translate(width / 2, height / 2).scale(width);

var path = d3.geoPath().projection(projection);

var tooltip = d3.select("#map-container").append("div") 
        .attr("class", "tooltip")       
        .style("opacity", 0);

d3.csv("data/MassData.csv", function(data) {

	var dataArray = [];

	for (var d = 0; d < data.length; d++) {
	dataArray.push(parseFloat(data[d].BeeCount));
	}	

	var minVal = d3.min(dataArray);
	var maxVal = 50
	// var minVal = 0
	// var maxVal = 15
	var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor])


	d3.json("../data/ma_zip_codes_geo.min.json", function(err, geojson) {

		for (var i = 0; i < data.length; i++) {

	      // Grab State Name
	      	var dataZipcode = data[i].ZipCode;

	      	// Grab data value 
	      	var dataValue = data[i].BeeCount;
	     
	      	// Find the corresponding state inside the GeoJSON
	      	for (var j = 0; j < geojson.features.length; j++) {
	        	var jsonZipcode = geojson.features[j].properties.ZCTA5CE10;

	        	if (dataZipcode == jsonZipcode) {

		            // Copy the data value into the JSON
		            geojson.features[j].properties.value = dataValue;
		            // Stop looking through the JSON
		            break;
	        	}
	      	}
	      
	    }
	    
	    projection.fitSize([500,450],geojson);

	    var mapGroup = svg.append("g")
	    				.attr("class", "mapGroup")

	    mapGroup.selectAll("path")
	      .data(geojson.features)
	      .enter()
	      .append("path")
	      .attr("d", path)
	      .style("stroke", "#fff")
	      .style("stroke-width", "1")
	      .style("fill", function(d) {
	      	return ramp(d.properties.value)})
	      .on("mouseover", function(d) {    
            tooltip.transition()    
            .duration(200)    
            .style("opacity", .9);    
            tooltip.html(d.properties.ZCTA5CE10)  
            .style("left", (d3.event.pageX + 15) + "px")   
            .style("top", (d3.event.pageY - 28) + "px");  
          })          
          .on("mouseout", function(d) {   
            tooltip.transition()    
            .duration(500)    
            .style("opacity", 0); 
          });

})});


