/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, HTMLHint */

define(function (require) {
    "use strict";

    var FileSystem      = brackets.getModule("filesystem/FileSystem");
    var CodeInspection  = brackets.getModule("language/CodeInspection");
    var LanguageManager = brackets.getModule("language/LanguageManager");
    var ProjectManager  = brackets.getModule("project/ProjectManager");
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager");

    var htmlpm = PreferencesManager.getExtensionPrefs("htmlhint");
    var htmlDefaults;
    var HTMLhintDefaultObject = {
        "tagname-lowercase": true,
        "attr-lowercase": true,
        "attr-value-double-quotes": true,
        "doctype-first": true,
        "tag-pair": true,
        "spec-char-escape": true,
        "id-unique": true,
        "src-not-empty": true,
        "attr-no-duplication": true,
        "title-require": true
    };
    htmlpm.definePreference("options", "object", HTMLhintDefaultObject).on("change", function () {
        htmlDefaults = htmlpm.get("options");
    });
    htmlDefaults = htmlpm.get("options");

    var xmlpm = PreferencesManager.getExtensionPrefs("xmlhint");
    var xmlDefaults;
    xmlpm.definePreference("options", "object", {
        "doctype-first": false
    }).on("change", function () {
        xmlDefaults = xmlpm.get("options");
    });
    xmlDefaults = xmlpm.get("options");

    var csspm = PreferencesManager.getExtensionPrefs("csslint");
    var cssDefaults;
    csspm.on("change", function () {
        cssDefaults = csspm.get("options");
    });
    cssDefaults = csspm.get("options");

    var jspm = PreferencesManager.getExtensionPrefs("jshint");
    var jsDefaults;
    function _loadJSDefaults() {
        jsDefaults = jspm.get("options");
        if (jsDefaults) {
            var globals = jspm.get("globals") || {};
            jsDefaults.predef = Object.keys(globals).map(function(el) {
                return globals[el] ? el : '-' + el;
            });
        }
    }
    jspm.on("change", function () {
        _loadJSDefaults();
    });
    _loadJSDefaults();

    require("htmlhint/htmlhint");

    function _hinter(text, fullPath, configFileName, defaults) {
        return _loadRules(configFileName).then(function (rules) {
            var results = HTMLHint.verify(text, $.extend(true, {}, HTMLhintDefaultObject, defaults, rules));
            if (results.length) {
                var result = {
                    errors: []
                };

                for (var i = 0, len = results.length; i < len; i++) {
                    var messageOb = results[i];
                    console.log(messageOb);
                    if (!messageOb.line) {
                        continue;
                    }
                    //default
                    var type = CodeInspection.Type.WARNING;

                    if (messageOb.type === "error") {
                        type = CodeInspection.Type.ERROR;
                    } else if (messageOb.type === "warning") {
                        type = CodeInspection.Type.WARNING;
                    }

                    result.errors.push({
                        pos: {
                            line: messageOb.line - 1,
                            ch: messageOb.col - 1
                        },
                        message: messageOb.message,
                        type: type
                    });
                }

                return result;
            } else {
                //no errors
                return null;
            }
        });
    }

    function htmlHinter(text, fullPath) {
        var defaults = htmlDefaults;
        return _loadRules(".jshintrc").then(function (rules) {
            if (!window.JSHINT) {
                defaults.jshint = false;
            } else {
                defaults.jshint = $.extend(true, {}, jsDefaults||{}, rules);
                if ($.isEmptyObject(defaults.jshint)) defaults.jshint = false;
            }
            return _loadRules(".csslintrc");
        }).then(function (rules) {
            if (!window.CSSLint) {
                defaults.csslint = false;
            } else {
                defaults.csslint = $.extend(true, {}, cssDefaults||{}, rules);
                if ($.isEmptyObject(defaults.csslint)) defaults.csslint = false;
            }
            return _hinter(text, fullPath, ".htmlhintrc", defaults);
        });
    }

    function xmlHinter(text, fullPath) {
        return _hinter(text, fullPath, ".xmlhintrc", xmlDefaults);
    }

    function _loadRules(configFileName) {
        var result = new $.Deferred();

        var projectRootEntry = ProjectManager.getProjectRoot();
        if (!projectRootEntry) {
            return result.resolve(undefined).promise();
        }

        var file = FileSystem.getFileForPath(projectRootEntry.fullPath + configFileName);
        file.read(function (err, content) {
            if (err) {
                result.resolve(undefined);
                return;
            }

            var config;
            if (!content) {
                result.resolve(undefined);
                return;
            }

            try {
                config = JSON.parse(content);
            } catch (e) {
                //console.error("HTMLHint: error parsing " + file.fullPath + ". Details: " + e);
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

    CodeInspection.register("xml", {
        name: "XMLHint",
        scanFileAsync: xmlHinter
    });

    LanguageManager.getLanguage("json").addFileName([".htmlhintrc", ".xmlhintrc"]);
});
