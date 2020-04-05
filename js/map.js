var width = 600;
var height = 450;

var lowColor = '#5DADE2'
var highColor = '#1B4F72'

var svg = d3.select("#map-container")
	.append("svg")
	.attr("id", "map-svg")
	.attr("width", width)
	.attr("height", height);

var brushX;
var brushY;
var mapBrushing = false;
var mRefs = {};

svg.on("mousedown", function () {
	Object.entries(mRefs).forEach(function([key, val]) {
		d3.select(val).dispatch("mouselinkoff")
	})
	d3.select("#map-brush").remove();
	mapBrushing = true;
	brushX = d3.event.pageX;
	brushY = d3.event.pageY;
	svg.append("circle")
		.attr("id", "map-brush")
		.attr("cx", d3.mouse(this)[0])
		.attr("cy", d3.mouse(this)[1])
		.attr("r", 0)
		.attr("opacity", 0.33)
		.attr("fill", "#69a3b2")
}).on("mousemove", function() {
	if (mapBrushing) {
		var currentX = d3.event.pageX;
		var currentY = d3.event.pageY;
		var dist = distance(currentX, currentY, brushX, brushY)
		d3.select("#map-brush").attr("r", dist);
		var circleX = d3.select("#map-brush").attr("cx");
		var circleY = d3.select("#map-brush").attr("cy");
		Object.entries(mRefs).forEach(function([key, val]) {
			var box = d3.select(val).node().getBBox();
			if (distance(box.x, box.y, circleX, circleY) < dist) {
				d3.select(val).dispatch("mouselinkon");
			} else if (distance(box.x, box.y + box.height, circleX, circleY) < dist) {
				d3.select(val).dispatch("mouselinkon");
			} else if (distance(box.x + box.width, box.y, circleX, circleY) < dist) {
				d3.select(val).dispatch("mouselinkon");
			} else if (distance(box.x + box.width, box.y + box.height, circleX, circleY) < dist) {
				d3.select(val).dispatch("mouselinkon");
			} else {
				d3.select(val).dispatch("mouselinkoff");
			}
		})
	}
}).on("mouseup", function() {
	mapBrushing = false;
	d3.select("#map-brush").remove();
})

function distance(x1, y1, x2, y2) {
	return Math.sqrt(((x2 - x1)**2) + ((y2 - y1)**2))
}

var projection = d3.geoMercator().translate(width / 2, height / 2).scale(width);

var path = d3.geoPath().projection(projection);

var tooltip = d3.select("#map-container").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

var mData = [];
var geojson;

function getData(date, count_tag) {
	var filtered = mData.filter(function (d) {
		return d.Date.includes(date);
	});

	var data = filtered

	var subset = d3.nest()
		.key(function (d) { return d.ZipCode; })
		.rollup(function (d) {
			return d3.mean(d, function (g) {
				switch (count_tag) {
					case "BeeCount":
						return g.BeeCount
					case "BroodCount":
						return g.BroodCount
					case "HoneyCount":
						return g.HoneyCount
					default:
						return g.BeeCount;
				}
			});
		}).entries(data);

	data = subset

	var dataArray = [];

	for (var d = 0; d < data.length; d++) {
		dataArray.push(parseFloat(data[d].value));
	};

	var minVal = d3.min(dataArray);
	var maxVal = d3.max(dataArray) / 2;
	// var minVal = 0
	// var maxVal = 15
	var ramp = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor])

	for (var i = 0; i < geojson.features.length; i++) {
		geojson.features[i].properties.value = undefined;
	}

	for (var i = 0; i < data.length; i++) {

		// Grab State Name
		var dataZipcode = data[i].key;

		// Grab data value 
		var dataValue = data[i].value

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

	d3.select("#map-container").select("svg").select("g").remove();
	mRefs = {};

	var mapGroup = svg.append("g")
		.attr("class", "mapGroup")
		.attr("transform", "translate(0, -35)")

	mapGroup.selectAll("path")
		.data(geojson.features)
		.enter()
		.append("path")
		.attr("d", path)
		.style("stroke", "#fff")
		.style("stroke-width", "1")
		.style("fill", function (d) {
			if (d.properties.value == undefined) {
				return "#ccc"
			}
			else {
				return ramp(d.properties.value)
			}
		})
		.on("mouseover", function (d) {
			tooltip.transition()
				.duration(200)
				.style("opacity", .9);
			if (d.properties.value == undefined) {
				tooltip.html("<b/>" + "Zip Code: " + "<b/>" + d.properties.ZCTA5CE10 + "</br>" + "<b/>"
				+ dropdownCount + ": " + "<b/>" + "No Data")
				.style("left", (d3.event.pageX + 15) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
			}
			 else {
				 tooltip.html("<b/>" + "Zip Code: " + "<b/>" + d.properties.ZCTA5CE10 + "</br>" + "<b/>"
				+ dropdownCount + ": " + "<b/>" + d.properties.value.toFixed(0))
				.style("left", (d3.event.pageX + 15) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
			 }
			d3.select(this).style("fill", "#fccc88");
			if (d.properties.ZCTA5CE10 in tRefs) {
				var target = tRefs[d.properties.ZCTA5CE10]
				target.forEach(function (row) {
					d3.select(row).classed("hovered", function() {
						return true;
					})
				});
			}
		})
		.on("mouseout", function (d) {
			tooltip.transition()
				.duration(500)
				.style("opacity", 0);
			d3.select(this).style("fill", function (d) {
			if (d.properties.ZCTA5CE10 in tRefs) {
				var target = tRefs[d.properties.ZCTA5CE10]
				target.forEach(function (row) {
					d3.select(row).classed("hovered", function() {
						return false;
					})
				});
			}
			if (d.properties.value == undefined) {
				return "#ccc"
			}
			else {
				return ramp(d.properties.value)
			}
		})})
		.on("mouselinkon", function(d) {
			d3.select(this).style("fill", "#fccc88");
			if (d.properties.ZCTA5CE10 in tRefs) {
				var target = tRefs[d.properties.ZCTA5CE10]
				target.forEach(function (row) {
					d3.select(row).classed("hovered", function() {
						return true;
					})
				});
			}
		})
		.on("mouselinkoff", function(d) {
			if (d.properties.value == undefined) {
				d3.select(this).style("fill", "#ccc");
			}
			else {
				d3.select(this).style("fill", ramp(d.properties.value));
			}
			if (d.properties.ZCTA5CE10 in tRefs) {
				var target = tRefs[d.properties.ZCTA5CE10]
				target.forEach(function (row) {
					d3.select(row).classed("hovered", function() {
						return false;
					})
				});
			}
		})
		.on("start", function(d) {
			if (d.properties.value != undefined) {
				mRefs[d.properties.ZCTA5CE10] = this;
			}
		})
		.dispatch("start");
}

d3.csv("data/MassDataClean.csv", function (massData) {
	mData = massData;
	d3.json("../data/ma_zip_codes_geo.min.json", function (err, gJson) {
		geojson = gJson;
		projection.fitSize([550, 450], geojson);
		getData("2012-04", "BeeCount");
	});
});