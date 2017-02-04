brackets-htmlhint
=================

A Brackets wrapper for the HTMLHint library (see credit below).  
Provides Brackets Code Inspection for HTML and XML.


Usage
=====
If you want to change the default rules place a `.htmlhintrc` and/or `.xmlhintrc` file at the project root.  
Check the default ruleset [here](https://github.com/yaniswang/HTMLHint/wiki/Usage).

Global default options are available under "Debug > Open Preferences File" by adding or modifying "htmlhint.options" and "xmlhint.options".
It also uses "jshint.options" and "csslint.options" for script and style tags.

Issues/Updates
=====
[02/04/2017] Fixes a cursor placement issue
[01/03/2017] Updated htmlhint - by @mornir
[01/16/2016] Big update by Peter Scheler to support passing
csslint/jshint options along to htmlhint. This means code
inside <style>/<script> blocks can be validated.
[02/17/2015] json format htmlhintrc, xmlhintrc: credit Hirse
[02/13/2015] Added support for XML code inspection  
[09/09/2014] more changes to .htmlhintrc logic  
[09/09/2014] Added support for .htmlhintrc  
[11/01/2013] Initial release.


Credit
=====
Built with [HTMLHint](http://htmlhint.com/).