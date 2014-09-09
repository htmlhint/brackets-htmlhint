/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, window, CSSLint, Mustache */

define(function (require, exports, module) {
	'use strict';

	var AppInit                 = brackets.getModule("utils/AppInit"),
		CodeInspection			= brackets.getModule("language/CodeInspection"),
        FileSystem              = brackets.getModule("filesystem/FileSystem"),
        FileUtils               = brackets.getModule("file/FileUtils"),
        ProjectManager          = brackets.getModule("project/ProjectManager");
        
	require("htmlhint/htmlhint");

    var configFileName = ".htmlhintrc";
    
	function htmlHinter(text, fullPath) {
        return _loadRules().then(function (rules) {
            var results;
            
            results = HTMLHint.verify(text, rules);

            if (results.length) {

                var result = { errors: [] };

                for(var i=0, len=results.length; i<len; i++) {

                    var messageOb = results[i];

                    if(!messageOb.line) continue;
                    //default
                    var type = CodeInspection.Type.WARNING;

                    if(messageOb.type === "error") {
                        type = CodeInspection.Type.ERROR;
                    } else if(messageOb.type === "warning") {
                        type = CodeInspection.Type.WARNING;
                    }

                    result.errors.push({
                        pos: {line:messageOb.line-1, ch:messageOb.col},
                        message:messageOb.message,
                        
                        type:type
                    });
                    
                }
                
                return result;
            } else {
                //no errors
                return null;
            }
        });
	}

    function _loadRules() {
        var result = new $.Deferred();
        
        var projectRootEntry = ProjectManager.getProjectRoot(),
            
        if (!projectRootEntry) {
            return result.resolve(undefined).promise();
        }
            
        var file = FileSystem.getFileForPath(projectRootEntry.fullPath + configFileName);
        file.read(function (err, content) {
            if (!err) {
                result.resolve(undefined);
                return;
            }
            
            var config;
            
            try {
                config = JSON.parse(content);
            } catch (e) {
                console.error("HTMLHint: error parsing " + file.fullPath + ". Details: " + e);
                result.reject(e);
                return;
            }
            
            result.resolve(config);
        });
        return result.promise();
    }
    
	CodeInspection.register("html", {
		name: "HTMLHint",
		scanFileAsync: htmlHinter
	});
	CodeInspection.register("htm", {
		name: "HTMLHint",
		scanFileAsync: htmlHinter
	});


});
