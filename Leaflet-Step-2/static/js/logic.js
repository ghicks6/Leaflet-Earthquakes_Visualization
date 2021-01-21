// Initialize & create two separate LayerGroups: earthquakes & tectonicPlates
var earthquakes = new L.LayerGroup();
var tectonicPlates = new L.LayerGroup();

// Define variables for tile layers
var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 10,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

var grayscaleMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 10,
    id: "mapbox.light",
    accessToken: API_KEY
});

var outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 10,
    id: "mapbox.outdoors",
    accessToken: API_KEY
});

// Define baseMaps object to hold base layers
var baseMaps = {
    "Satellite": satelliteMap,
    "Grayscale": grayscaleMap,
    "Outdoors": outdoorsMap
};

// Create overlay object to hold overlay layers
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": tectonicPlates
};

// Create our map, giving it the satelliteMap and earthquakes layers to display on load
var myMap = L.map("map", {
  center: [
    37.09, -95.71],
  zoom: 3,
  layers: [satelliteMap, earthquakes]
});

// Create a layer control + pass in baseMaps and overlayMaps + add the layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// Store our API endpoint inside queryUrl
var earthquakesUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
d3.json(earthquakesUrl, function(data) {

// Function to set the style of the circle based on the magnitude of the earthquake
  function circleStyle(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: circleColor(feature.properties.mag),
      color: "#000000",
      radius: circleRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

//   Function to set the color of the circles based on the magnitude of the earthquake
  function circleColor(mag) {
    switch (true) {
      case mag > 5:
        return "#ea2c2c";
      case mag > 4:
        return "#eaa92c";
      case mag > 3:
        return "#d5ea2c";
      case mag > 2:
        return "#92ea2c";
      case mag > 1:
        return "#2ceabf";
      default:
        return "#2c99ea";
    }
  }

//   Function to set the size of the circles based on the magnitude of the earthquake
  function circleRadius(mag) {
    if (mag === 0) {
      return 1;
    }
    return mag * 4;
  }
  
// Create a GeoJSON layer containing the features array on the data object
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: circleStyle,

    // Give each feature a popup describing the place, time, and magnitude of the earthquake
    onEachFeature: function(feature, layer) {
        layer.bindPopup("<h4>Location: " + feature.properties.place + 
        "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) + 
        "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }
  // Add earthquakeData to earthquakes LayerGroups 
  }).addTo(earthquakes);
  // Add earthquakes layer to the map
  earthquakes.addTo(myMap);

//   Tectonic Plates GeoJSON URL
  var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

      // Retrieve platesURL (tectonic plates GeoJSON data) with D3
      d3.json(platesURL, function(plateData) {
        // Create a GeoJSON Layer the plateData
        L.geoJson(plateData, {
            color: "#DC143C",
            weight: 2
        // Add plateData to tectonicPlates layerGroups 
        }).addTo(tectonicPlates);
        // Add tectonicPlates layer to the map
        tectonicPlates.addTo(myMap);
    });

  // Set up legend
  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");

    var magnitudeLevels = [0, 1, 2, 3, 4, 5];
    var colors = ["#2c99ea", "#2ceabf", "#92ea2c", "#d5ea2c","#eaa92c", "#ea2c2c"];

  // Loop through the intervals of colors to put it in the label
    for (var i = 0; i<magnitudeLevels.length; i++) {
      div.innerHTML +=
      "<i style='background: " + colors[i] + "'></i> " +
      magnitudeLevels[i] + (magnitudeLevels[i + 1] ? "&ndash;" + magnitudeLevels[i + 1] + "<br>" : "+");
    }
    return div;

  };
  // Add legend to the map
  legend.addTo(myMap)
}); 