var _ = require('lodash');
var domain = require('wires-domain');
var Promise = require('promise')
var walk = require("walk");
var path = require("path");
var includeAll = function(folder, myOptions) {

   return new Promise(function(resolve, reject) {
      walker = walk.walk(folder, {
         followLinks: true
      });
      var files = [];
      var options = myOptions || {};
      var rootPath = options.rootPath;
      var tagOutput = options.tagOutput;

      var order = options.order || [];
      var ignore = options.ignore || [];
      var bottom = options.bottom || [];

      walker.on("file", function(root, fileStats, next) {
         var fname = fileStats.name;
         var ext = path.extname(fileStats.name);
         // Pass only javascript files
         if (ext === ".js") {
            files.push(path.join(root, fname));
         }

         next();
      });

      walker.on("errors", function(root, nodeStatsArray, next) {
         next();
      });

      walker.on("end", function() {
         var sortedList = [];
         var bottomFiles = [];

         // ignoring files ***********************
         _.each(files, function(f, index) {
               _.each(ignore, function(ignoreMask) {
                  if (f && f.indexOf(ignoreMask) > -1) {
                     files.splice(index, 1)
                  }
               });
            })
            // bottoms files ***********************
         _.each(files, function(f, index) {
            _.each(bottom, function(bottomMask) {
               if (f && f.indexOf(bottomMask) > -1) {
                  files.splice(index, 1);
                  bottomFiles.push(f);
               }
            });
         })



         _.each(order, function(item) {
            _.each(files, function(f) {
               if (f.indexOf(item) > -1) {
                  if (_.indexOf(sortedList, f) < 0) {
                     sortedList.push(f)
                  }
               }
            })
         });
         // Add files that did not match the order
         _.each(files, function(f) {
            if (_.indexOf(sortedList, f) < 0) {
               sortedList.push(f);
            }
         })
         // Appending bottom files
         _.each(bottomFiles, function(bottomFiles){
            sortedList.push(bottomFiles);
         })

         // Adding rootPath if needed
         if (rootPath) {
            folder = folder.replace("./", '');
            _.each(sortedList, function(item, index) {
               sortedList[index] = path.join(rootPath, item.replace(folder, ''));
            })
         }

         if (tagOutput) {
            var tpl = _.template('<script src="<%- file %>"></script>');
            var output = [];
            _.each(sortedList, function(item) {
               output.push(tpl({
                  file: item
               }))
            })
            sortedList = output.join("\n");
         }
         return resolve(sortedList)
      });
   })
}

module.exports = includeAll;
includeAll("./test_folder", {
   order: ['app.js', 'first/'],
   ignore: ['some.js'],
   bottom: ['thelast'],
   rootPath: "myfiles",
   tagOutput : true
}).then(function(list) {
   console.log(list)
})
