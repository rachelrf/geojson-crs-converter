const transformation = require('transform-coordinates');
const fs = require('fs');

// import geojson file
const fileName = "KyleCityLimits";
const geojson = require(`./${fileName}.json`);

// Set from and to coordinate systems, WGS 84 (EPSG:4326) is standard
const transform = transformation('EPSG:2278', '4326');

function replaceCoordinates(coordinateSet) {
  return coordinateSet.map(coordinatePair => {
    let lat = coordinatePair[0];
    let lng = coordinatePair[1];
    let transformedCoordinate = transform.forward({ x: lat, y: lng });
    let newCoord = [transformedCoordinate.x, transformedCoordinate.y];
    return newCoord;
  });
}

function convertCoordinates(geojson) {
  delete geojson.crs;

  geojson.features.forEach(feature => {
    let {coordinates, type} = feature.geometry;

    if (type === "Polygon") {
      coordinates.forEach((coordinateSet, index) => {
        coordinates[index] = replaceCoordinates(coordinateSet);
      })
    } else if (type === "MultiPolygon") {
      coordinates.forEach(polygonCoordinates => {
        polygonCoordinates.forEach((coordinateSet, index) => {
          polygonCoordinates[index] = replaceCoordinates(coordinateSet);
        });
      })
    }
  });
}

convertCoordinates(geojson)
const jsonContent = JSON.stringify(geojson);

fs.writeFile(`${fileName}-converted.json`, jsonContent, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
    console.log("JSON file has been saved.");
});
