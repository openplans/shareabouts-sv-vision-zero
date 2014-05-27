var fs = require('graceful-fs');

function getIntersectionFileUrl(intersectionId) {
  var count, i, dataFilePath;

  dataFilePath = '../app/data/';
  for (count = 0, i = intersectionId.length - 2;
       count < 2; ++i, ++count) {
    dataFilePath += intersectionId[i] + '/';
  }
  dataFilePath += intersectionId + '.json';

  return dataFilePath;
}

fs.readFile('intersection_safety.json', function (err, safetyData) {
  if (err) throw err;

  console.log(process.cwd());

  safetyData = JSON.parse(safetyData);

  safetyData.forEach(function(sd, i) {
    var fileName = getIntersectionFileUrl(sd.NodeID_1);
    console.log(i, sd.NodeID_1, fileName);

    fs.readFile(fileName, function (err, fileData) {
      if (err) throw err;

      fileData = JSON.parse(fileData);
      fileData.hcc_text = sd.hcc_text;

      fs.writeFile(fileName, JSON.stringify(fileData, null, 2), function (err) {
        if (err) throw err;
        console.log('Saved', fileName);
      });
    });

  });

  // console.log(data);
});