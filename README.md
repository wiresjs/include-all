# Wires Include

      var includeAll = require("wires-include-all");

      includeAll("./test_folder", {
         order: ['app.js', 'first/'],
         ignore: ['some.js'],
         bottom: ['thelast'],
         rootPath: "myfiles",
         tagOutput : true
      }).then(function(list) {
         console.log(list)
      })
