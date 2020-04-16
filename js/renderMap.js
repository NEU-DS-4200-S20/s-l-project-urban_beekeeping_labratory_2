// Intialize height and width for map svg element.
var width = 600;
var height = 400;

// Initialize min and max colors for chloropleth color scale.
var lowColor = '#5DADE2'
var highColor = '#1B4F72'

// Create SVG element for map projection.
var svg = d3.select("#map-container")
	.append("svg")
	.attr("id", "map-svg")
	.attr("width", width)
	.attr("height", height);

// Declare global variables used for brushing map elements
var brushX;
var brushY;
var mapBrushing = false;

// Declare global transform variable used for zooming
var zoomTransform = 1;

/**
 * Calculates distance from one coordinate to another
 * @param {*} x1 - Starting x coordinate
 * @param {*} y1 - Starting y coordinate
 * @param {*} x2 - Ending x coordinate
 * @param {*} y2 - Ending y coordinate
 */
function distance(x1, y1, x2, y2) {
	return Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2))
}

/**
 * Handles resetting the brush variables to their default values
 * @param {*} svgElement - d3 svg element with id #map-svg
 */
function initializeBrushing(svgElement) {
	resetBrushed();
	// Reset map selection to 0 currently selected regions
	Object.entries(mRefs).forEach(function ([key, val]) {
		d3.select(val).dispatch("mouselinkoff")
	})
	// Declare that user is currently brushing
	mapBrushing = true;
	// Set distance origin point
	brushX = d3.event.pageX;
	brushY = d3.event.pageY;
	// Display brushing circle
	svg.append("circle")
		.attr("id", "map-brush")
		.attr("cx", d3.mouse(svgElement)[0])
		.attr("cy", d3.mouse(svgElement)[1])
		.attr("r", 0)
		.attr("opacity", 0.33)
		.attr("fill", "#69a3b2")
}

/**
 * Handles selecting and deslecting of map regions via brushing
 * @param {*} circleX - Brushing circle origin x coordinate
 * @param {*} circleY - Brushing circle origin y coordinate
 * @param {*} dist - Distance from brushing circle start to end
 */
function selectBrushed(circleX, circleY, dist) {
	Object.entries(mRefs).forEach(function ([key, val]) {
		var pathLength = Math.floor(val.getTotalLength());
		var mapBrushed = false;
		// Iterates over every 8th point & determines if the point 
		// lies within the brushing circle
		for (var i = 0; i < pathLength; i += 8) {
			var point = val.getPointAtLength(i);
			if (distance(zoomTransform.applyX(point.x), 
				zoomTransform.applyY(point.y), circleX, circleY) < dist) {
				d3.select(val).dispatch("mouselinkon2");
				mapBrushed = true;
				break;
			}
		}
		if (!mapBrushed) {
			d3.select(val).dispatch("mouselinkoff");
		}
	})
}

/**
 * Controls which elements will be brushed via a distance algorithm
 */
function setBrushing() {
	if (mapBrushing) {
		// Set distance end point
		var currentX = d3.event.pageX;
		var currentY = d3.event.pageY;
		// Calculate length from distance starting point to end point
		var dist = distance(currentX, currentY, brushX, brushY)
		// Expand brushing circle to new distance
		d3.select("#map-brush").attr("r", dist);
		// Locate brushiing circle origin point 
		var circleX = d3.select("#map-brush").attr("cx");
		var circleY = d3.select("#map-brush").attr("cy");
		// Select map regions if inside brushing circle, deselect otherwise
		selectBrushed(circleX, circleY, dist);
	}
}

// Mouse down and mouse move help enable brushing on the map to select multiple regions.
// The user can initiate brushing by clicking and dragging on the map. A circle will be created 
// and any region inside of the circle will be selected. These regions will remain selected 
// until the user clicks the map again. 
svg.on("mousedown", function () {
	initializeBrushing(this);
	}).on("mousemove", function () {
		setBrushing();
	}).on("mouseup", function () {
	mapBrushing = false;
	d3.select("#map-brush").remove();
	}).on("mouseleave", function() {
		if (mapBrushing) {
			mapBrushing = false;
			d3.select("#map-brush").remove();
		}
	})


// Initialize the Mercator projection.
var projection = d3.geoMercator().translate(width / 2, height / 2).scale(width);
var path = d3.geoPath().projection(projection);

// Create tooltip object to display information on demand.
var tooltip = d3.select("#map-container").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

var mData = [];
var geojson;

var mRefs = {};
var pathRefs = {};
var ramp;

/**
 * Initializes threshold elements
 */
function resetThreshold() {
	// Reset threshold start color
	d3.select("#gstart").attr("stop-color", ramp(minVal))
	// Reset threshold end color
	d3.select("#gstop").attr("stop-color", ramp(maxVal))
	// Reset threshold handle
	d3.select("#thresh-handle").attr("x", 0);
	// Reset Threshold tick marks
	threshTicks();
}


/**
 * Handles linking each map region to its corresponding data
 * @param {*} data - Current filtered bee data
 */
function setMapData(data) {
	// Reset map elements to contain undefined values
	for (var i = 0; i < geojson.features.length; i++) {
		geojson.features[i].properties.value = undefined;
	}
	for (var i = 0; i < data.length; i++) {
		// Grab Zipcode
		var dataZipcode = data[i].key;
		// Grab data value 
		var dataValue = data[i].value
		// Find the corresponding zipcode inside the GeoJSON.
		for (var j = 0; j < geojson.features.length; j++) {
			var jsonZipcode = geojson.features[j].properties.ZCTA5CE10;
			if (dataZipcode == jsonZipcode) {
				// Copy the data value into the JSON.
				geojson.features[j].properties.value = dataValue;
				// Stop looking through the JSON
				break;
			}
		}
	}
}

/**
 * Draws new blank container for map
 */
function resetMap() {
	// Delete previous map & corresponding map references
	d3.select("#map-container").select("svg").select("g").remove();
	mRefs = {};
	// Append a mapgroup element to the html. 
	var mapGroup = svg.append("g")
		.attr("id", "mGroup")
		.attr("class", "mapGroup")
		.attr("transform", "translate(0, -35)")
	return mapGroup;
}

/**
 * Generates a tooltip notification over hovered map region
 * @param {*} regionData - Corresponding region data
 */
function displayTooltip(regionData) {
	tooltip.transition()
		.duration(200)
		.style("opacity", .9);
	if (regionData.properties.value == undefined) {
		// Display region zipcode with marker indicating undefined data
		tooltip.html("<b/>" + "Zip Code: " + "<b/>" + regionData.properties.ZCTA5CE10 + "</br>" + "<b/>"
			+ dropdownCount + ": " + "<b/>" + "No Data")
			.style("left", (d3.event.pageX + 15) + "px")
			.style("top", (d3.event.pageY - 28) + "px");
	}
	else {
		// Display region zipcode along with region data
		tooltip.html("<b/>" + "Zip Code: " + "<b/>" + regionData.properties.ZCTA5CE10 + "</br>" + "<b/>"
			+ dropdownCount + ": " + "<b/>" + regionData.properties.value.toFixed(0))
			.style("left", (d3.event.pageX + 15) + "px")
			.style("top", (d3.event.pageY - 28) + "px");
	}
}

/**
 * Handles entering hover behaviour for regions
 * @param {*} region - d3 path element 
 * @param {*} regionData - Corresponding region data
 */
function hoverRegion(region, regionData) {
	// Determines if region is within user defined threshold
	if (!d3.select(region).classed("threshed")) {
		// Sets fill to highlight region selection
		d3.select(region).style("fill", "#fccc88");
		// Determines if region has corresponding table rows
		if (regionData.properties.ZCTA5CE10 in tRefs) {
			var target = tRefs[regionData.properties.ZCTA5CE10]
			target.forEach(function (row) {
				// Highlights corresponding table rows
				d3.select(row).classed("hovered", function () {
					return true;
				})
			});
		}
	}
}

/**
 * Handles exiting hover behaviour for regions 
 * @param {*} region - d3 path element
 */
function exitHoverRegion(region) {
	// Determines if region is within user defined threshold
	if (!d3.select(region).classed("threshed")) {
		d3.select(region).style("fill", function (regionData) {
			var brushed = false;
			// Determines if region has corresponding brushed rows
			brushedData.forEach(item => {
				if (item.ZipCode == regionData.properties.ZCTA5CE10) {
					brushed = true;
				}
			});
			if (!brushed) {
				// Region isnt brushed; dehighlight rows & reset region fill
				resetRegionRows(regionData, false);
				return getRegionFill(regionData);
			} else {
				// Region is brushed; set region fill to show selection
				return "#fccc88";
			}
		})
	}
}

/**
 * Highlights/dehighlights table rows linked to region
 * @param {*} regionData - Corresponding region data
 * @param {*} highlight - Choice for row higlighting
 */
function resetRegionRows(regionData, highlight) {
	if (regionData.properties.ZCTA5CE10 in tRefs) {
		// Group of rows with corresponding region zipcode
		var target = tRefs[regionData.properties.ZCTA5CE10]
		target.forEach(function (row) {
			d3.select(row).classed("hovered", function () {
				return highlight;
			})
		});
	}
}

/**
 * Highlights table rows linked to region & adds to tracked brushed rows
 * @param {*} regionData - Corresponding region data
 */
function addRegionRows(regionData) {
	if (regionData.properties.ZCTA5CE10 in tRefs) {
		// Group of rows with corresponding region zipcode
		var target = tRefs[regionData.properties.ZCTA5CE10]
		brushedData.push({ ZipCode: regionData.properties.ZCTA5CE10 });
		target.forEach(function (row) {
			brushedRows.push(row);
			d3.select(row).classed("hovered", function () {
				return true;
			})
		});
	}
}

/**
 * Generates an id for a given region
 * @param {*} regionData - Corresponding region data
 */
function getRegionId(regionData) {
	if (regionData.properties.value == undefined) {
		// Region zipcode unchanged
		return regionData.properties.ZCTA5CE10;
	} else {
		// Region zipcode concatenated with region data
		return regionData.properties.ZCTA5CE10 + ":" 
			+ regionData.properties.value.toString();
	}
}

/**
 * Generates a fill color for a given region
 * @param {*} regionData - Corresponding region data
 */
function getRegionFill(regionData) {
	if (regionData.properties.value == undefined) {
		// Default fill
		return "#ccc"
	}
	else {
		// Fill calculated using region data
		return ramp(regionData.properties.value)
	}
}

/**
 * Generates default map region paths
 */
function initMap() {
	var mapGroup = resetMap();
	// Draws the projection from the GeoJson file. 
	mapGroup.selectAll("path")
		.data(geojson.features)
		.enter()
		.append("path")
		.attr("d", path)
		.style("stroke", "#fff")
		.style("stroke-width", "1")
		.on("start", function (d) {
			pathRefs[d.properties.ZCTA5CE10] = this;
			mRefs[d.properties.ZCTA5CE10] = this;
		})
		.dispatch("start");
}

/**
 * Updates map regions to reflect new data
 * @param {*} data - Current bee data
 */
function updateMap(data) {
	var dataZips = data.map((d) => d.key);
	var tempRefs = {};
	// Iterate through each map region
	geojson.features.forEach(function(feature) {
		var zipcode = feature.properties.ZCTA5CE10;
		// Only alters regions that have changed
		if ((zipcode in mRefs) || (dataZips.includes(zipcode))) {
			var path = pathRefs[zipcode];
			d3.select(path)
					.attr("id", function (regionData) {
						return getRegionId(regionData);
					})
					.style("fill", function (regionData) {
						return getRegionFill(regionData);
					})
					// Mouse over helps with tooltip functionality to highlight the regions the user is over
					// and to enable details on demand on the map.
					.on("mouseover", function (regionData) {
						displayTooltip(regionData);
						hoverRegion(this, regionData);
					})
					// Mouse out ensures that a region will not be highlighted and the details on demand will
					// disappear when a user leaves the region.
					.on("mouseout", function (d) {
						tooltip.transition()
							.duration(500)
							.style("opacity", 0);
						exitHoverRegion(this);
					})
					.on("mouselinkon", function (d) {
						// Determines if region is within user defined threshold
						if (!d3.select(this).classed("threshed")) {
							// Sets fill to show region is selected
							d3.select(this).style("fill", "#fccc88");
						}
					})
					.on("mouselinkon2", function (d) {
						// Determines if region is within user defined threshold
						if (!d3.select(this).classed("threshed")) {
							// Sets fill to show region is selected
							d3.select(this).style("fill", "#fccc88");
							// Adds region's rows to brushed rows
							addRegionRows(d);
						}
					})
					.on("mouselinkoff", function (regionData) {
						// Determines if region is within user defined threshold
						if (!d3.select(this).classed("threshed")) {
							// Sets fill to show region is deselected
							d3.select(this).style("fill", getRegionFill(regionData));
							resetRegionRows(regionData, false);
						}
					})
					.on("start", function (d) {
						if (d.properties.value != undefined) {
							tempRefs[d.properties.ZCTA5CE10] = this;
						}
					})
					.dispatch("start");
		}
	})
	mRefs = tempRefs;
}


/**
 * Filters set of data to subset containing only data
 * corresponding to user specified attribute
 * @param {*} data - Current bee data
 * @param {*} count_tag - Chosen bee data variable
 */
function getSubset(data, count_tag) {
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
	return subset;
}

// getData is a function that filters and preps data for the map in order for it 
// to display the correct data for the designated date. Also it will feed the 
// data type wanted based on user selection from the dropdown box. This function also
// initiates the rendering of the map and it's user functionality dispatch calls.
function getData(date, count_tag, startup=false) {
	resetBrushed();

	// Filter data so only values for the designated date are passed forward.
	var filtered = mData.filter(function (d) {
		return d.Date.includes(date);
	});
	var data = filtered

	// Want to average the counts for a user specified attribute in 
	// order to correctly display a color value on the map.
	data = getSubset(data, count_tag);

	// Isolates specified data values from corresponding dataset
	var dataArray = [];
	for (var d = 0; d < data.length; d++) {
		dataArray.push(parseFloat(data[d].value));
	};

	// Get min and max values for the color scale for the chloropleth map.
	minVal = d3.min(dataArray);
	maxVal = d3.max(dataArray) / 2;
	
	// Create a domain objects for the color scale.
	ramp = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor])

	// Assign map regions to corresponding data
	setMapData(data);

	// Handles first getData case
	if (startup) {
		initMap();
	}
	updateMap(data);

	// Reset zoom transformation
	svg.call(zoom.transform, d3.zoomIdentity);
	resetThreshold();
}

// Load Massachusetts bee data 
d3.csv("data/NewMassDataClean.csv", function (massData) {
	mData = massData;
	// Load Massachussetts region data
	d3.json("data/ma_zip_codes_geo.min.json", function (err, gJson) {
		geojson = gJson;
		projection.fitSize([550, 450], geojson);
		getData("2012-04", "BeeCount", true);
	});
});


// Declare zoom object
var zoom = d3.zoom()
	.extent([[0, 0], [width, height]])
	.scaleExtent([1, 16])
	.on("zoom", zoomed);

// Link zoom object to map container
svg.call(zoom);

// Cancel zoom when brushing
d3.select('svg').on('mousedown.zoom', null);

/**
 * Scales map to reflect new zoom transformation
 */
function zoomed() {
	var z = d3.event.transform;
	d3.select("#map-container").select("svg").select("g").attr("transform", z);
	zoomTransform = z;
}
