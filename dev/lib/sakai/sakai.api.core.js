/**
 *
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 */

/**
 * @name sakai
 * @namespace
 * Main sakai namespace
 *
 * @description
 * Main sakai namespace. This is where all the initial namespaces should be defined
 */
var sakai = sakai || {};

/**
 * @name sakai.data
 */
sakai.data = {};

/**
 * @name sakai.api
 *
 * @namespace
 * Main API Namespace
 *
 * @class api
 *
 * @description
 * Convenience functions to aid Sakai 3 front-end development.
 * This class is the basis of all Sakai 3 front-end development. This should
 * be included on all pages, along with the sakai_api.js which is an extension
 * of this class, providing higher level functions.
 *
 * @requires
 * jQuery-1.3.2, Fluid, Trimpath
 *
 * @version 0.0.1
 *
 */
sakai.api = {

    /** API Major version number */
    API_VERSION_MAJOR: 0,

    /** API minor version number */
    API_VERSION_MINOR: 0,

    /** API build number  */
    API_VERSION_BUILD: 1

};

/**
 * window.debug, a console dot log wrapper
 * adapted from html5boilerplate.com's window.log and Ben Alman's window.debug
 *
 * Only logs information when sakai.config.displayDebugInfo is switched on
 *
 * debug.log, debug.error, debug.warn, debug.debug, debug.info
 * usage: debug.log("argument", {more:"arguments"})
 *
 * paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
 * benalman.com/projects/javascript-debug-console-log/
 * https://gist.github.com/466188
 */
window.debug = (function() {
    var that = {},
        methods = [ 'error', 'warn', 'info', 'debug', 'log' ],
        idx = methods.length;

    var createLogMethod = function(method) {
        that[method] = function() {
            if (!window.console || !sakai.config.displayDebugInfo) {
                return;
            }
            if (console.firebug) {
                console[method].apply(console, arguments);
            } else if (console[method]) {
                console[method](Array.prototype.slice.call(arguments));
            } else {
                console.log(Array.prototype.slice.call(arguments));
            }
        };
    };

    while (--idx>=0) {
        createLogMethod(methods[idx]);
    }

    return that;
})();

/**
 * @class Activity
 *
 * @description
 * Activity related convenience functions which build on the top of Nakamura's
 * event system.
 * This should only hold functions which are used across multiple pages,
 * and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Events related functions
 */
sakai.api.Activity = sakai.api.Activity || {};


/**
 * Wrapper function for creating a Nakamura activity
 *
 * @param nodeUrl {String} The URL of the node we would like the activity to be
 * stored on
 * @param appID {String} The ID of the application/functionality creating the
 * activity
 * @param templateID {String} The ID of the activity template
 * @param extraData {Object} Any extra data which will be stored on the activity
 * node
 * @param callback {Function} Callback function executed at the end of the
 * operation
 * @returns void
 */
sakai.api.Activity.createActivity = function(nodeUrl, appID, templateID, extraData, callback) {

    // Check required params
    if (typeof appID !== "string" || appID === "") {
        debug.error("sakai.api.Activity.createActivity(): appID is required argument!");
        return;
    }
    if (typeof templateID !== "string" || templateID === "") {
        debug.error("sakai.api.Activity.createActivity(): templateID is required argument!");
    }

    // Create event url with appropriate selector
    var activityUrl = nodeUrl + ".activity.json";
    // Create data object to send
    var dataToSend = {
        "sakai:activity-appid": appID,
        "sakai:activity-templateid": templateID
    };
    for (var i in extraData) {
        if (extraData.hasOwnProperty(i)) {
            dataToSend[i] = extraData[i];
        }
    }

    // Send request to create the activity
    $.ajax({
        url: activityUrl,
        traditional: true,
        type: "POST",
        data: dataToSend,
        success: function(data){

            if ($.isFunction(callback)) {
                callback(data, true);
            }
        },
        error: function(xhr, textStatus, thrownError) {

            if ($.isFunction(callback)) {
                callback(xhr.status, false);
            }
        }
    });
};

/**
 * @class Datetime
 *
 * @description
 * Datetime format related functions
 *
 * @namespace
 * Datetime related functions
 */
sakai.api.Datetime = sakai.api.Datetime || {};

/**
 * Parse a date string into a date object
 * @param {Object} dateString    date to parse in the format 2010-10-06T14:45:54+01:00
 */
sakai.api.Datetime.parseDateString = function(dateString){
    var d = new Date();
    d.setFullYear(parseInt(dateString.substring(0,4),10));
    d.setMonth(parseInt(dateString.substring(5,7),10) - 1);
    d.setDate(parseInt(dateString.substring(8,10),10));
    d.setHours(parseInt(dateString.substring(11,13),10));
    d.setMinutes(parseInt(dateString.substring(14,16),10));
    d.setSeconds(parseInt(dateString.substring(17,19),10));
    return d;
};

/**
 * Function that will return the date in GMT time
 *
 * @param {Date} date
 */
sakai.api.Datetime.toGMT = function(date){
    date.setFullYear(date.getUTCFullYear());
    date.setMonth(date.getUTCMonth());
    date.setDate(date.getUTCDate());
    date.setHours(date.getUTCHours());
    return date;
};

/**
 * Function that returns how many years, months, days or hours since the dateinput based on GMT time
 *
 * @param {Date} date
 */
sakai.api.Datetime.getTimeAgo = function(date){
    if (date !== null) {
        // convert date input to GMT time
        date = sakai.api.Datetime.toGMT(date);

        var currentDate = new Date();
        // convert current date to GMT time
        currentDate = sakai.api.Datetime.toGMT(currentDate);

        var iTimeAgo = (currentDate - date) / (1000);
        if (iTimeAgo < 60) {
            if (Math.floor(iTimeAgo) === 1) {
                return Math.floor(iTimeAgo) +" " + sakai.api.i18n.General.getValueForKey("SECOND");
            }
            return Math.floor(iTimeAgo) + " "+sakai.api.i18n.General.getValueForKey("SECONDS");
        } else if (iTimeAgo < 3600) {
            if (Math.floor(iTimeAgo / 60) === 1) {
                return Math.floor(iTimeAgo / 60) + " "+sakai.api.i18n.General.getValueForKey("MINUTE");
            }
            return Math.floor(iTimeAgo / 60) + " "+sakai.api.i18n.General.getValueForKey("MINUTES");
        } else if (iTimeAgo < (3600 * 60)) {
            if (Math.floor(iTimeAgo / (3600)) === 1) {
                return Math.floor(iTimeAgo / (3600)) + " "+sakai.api.i18n.General.getValueForKey("HOUR");
            }
            return Math.floor(iTimeAgo / (3600)) + " "+sakai.api.i18n.General.getValueForKey("HOURS");
        } else if (iTimeAgo < (3600 * 60 * 30)) {
            if (Math.floor(iTimeAgo / (3600 * 60)) === 1) {
                return Math.floor(iTimeAgo / (3600 * 60)) + " "+sakai.api.i18n.General.getValueForKey("DAY");
            }
            return Math.floor(iTimeAgo / (3600 * 60)) + " "+sakai.api.i18n.General.getValueForKey("DAYS");
        } else if (iTimeAgo < (3600 * 60 * 30 * 12)) {
            if (Math.floor(iTimeAgo / (3600 * 60 * 30)) === 1) {
                return Math.floor(iTimeAgo / (3600 * 60 * 30)) + " "+sakai.api.i18n.General.getValueForKey("MONTH");
            }
            return Math.floor(iTimeAgo / (3600 * 60 * 30)) + " "+sakai.api.i18n.General.getValueForKey("MONTHS");
        } else {
            if (Math.floor(iTimeAgo / (3600 * 60 * 30 * 12) === 1)) {
                return Math.floor(iTimeAgo / (3600 * 60 * 30 * 12)) + " "+sakai.api.i18n.General.getValueForKey("YEAR");
            }
            return Math.floor(iTimeAgo / (3600 * 60 * 30 * 12)) + " "+sakai.api.i18n.General.getValueForKey("YEARS");
        }
    }
    return null;
};

/**
 * @class UI
 *
 * @description
 * User interface elements within Sakai 3 which require JS to work.
 * All UI element init functions should be defined here.
 *
 * @namespace
 * Standard Sakai 3 UI elements
 */
sakai.api.UI = sakai.api.UI || {};

sakai.api.UI.getPageContext = function(){
    if (sakai.content_profile) {
        return "content";
    } else if (sakai.group || sakai.groupedit) {
        return "group";
    } else if (sakai.directory) {
        return "directory";
    } else if (sakai.content_profile || sakai.profile){
        return "user";
    } else {
        return false;
    }
};

sakai.api.UI.getDirectoryStructure = function(){
    /**
     * Converts directory array into a node structure
     * so that it can be rendered into the jstree.
     *
     * @param {Object} directory list of directories
     * @return result the json object in the structure necessary to render in jstree
     */
    var convertToHierarchy = function(directory){
        var item, path;

        var result = [];
        // loop through all the directory
        for (item in directory) {
            if (directory.hasOwnProperty(item)) {
                // url for the first level nodes
                var url = "/dev/directory.html#" + item;
                // call buildnoderecursive to get the node structure to render.
                result.push(buildNodeRecursive(item, directory, url));
            }
        }
        return result;
    };

    /**
     * Recursive method that create the node structure
     * so that it can be rendered into the jstree.
     *
     * @param {String} node_id  the unique id for each node for example firstyearcourses
     * @param {Object} directory directory list json object for example "collegeofengineering": { ... }
     * @param {String} url the url of the page to render when directory node is clicked for example /dev/directory.html#collegeofengineering
     *
     * @return node the json object in the structure necessary to render in jstree
     */
    var buildNodeRecursive = function(node_id, directory, url){
        // node title
        var p_title = directory[node_id].title;
        // node id
        var p_id = node_id;
        // icon url
        var p_url = directory[node_id].icon;
        // description
        var p_description = directory[node_id].description;

        // create the node based on the parameters
        var node = {
            attr: {
                id: p_id,
                "data-url": p_url,
                "data-description": p_description
            },
            data: {
                title: p_title,
                attr: {
                    "href": url,
                    "title": p_title
                }
            },
            children: []
        };

        // if current node has any children
        // call buildNoderecursive method create the node structure for
        // all level of child
        for (var child in directory[node_id].children) {
            if (directory[node_id].children.hasOwnProperty(child)) {
                // for each child node, call buildnoderecursive to build the node structure
                // pass current child(id), the list of all sibligs(json object) and url append/child
                // for example first level node /dev/directory.html#courses/firstyearcourses
                // for second level node /dev/directory.html#course/firstyearcourses/chemistry
                node.children.push(buildNodeRecursive(child, directory[node_id].children, url + "/" + child));
            }
        }
        return node;
    };

    return convertToHierarchy(sakai.config.Directory);
};

/**
 * Recursive function that gets the title corresponding to an ID in the directory
 * @param {Object} key Key to get title for
 * @param {Object} child Object to check for children next, if not supplied start with first child
 */
sakai.api.UI.getValueForDirectoryKey = function(key){
    var directory = sakai.api.UI.getDirectoryStructure();

    var searchDirectoryForKey = function(key, child){
        if (!child) {
            child = directory[0];
        }
        if (key == child.attr.id) {
            return child.data.title;
        }
        else {
            if (child.children) {
                for (var item in child.children) {
                    if (child.children.hasOwnProperty(item)) {
                        var result = searchDirectoryForKey(key, child.children[item]);
                        if(result){
                            return result;
                        }
                    }
                }
            }
        }
    };

    return searchDirectoryForKey(key, false);
};

// -----------------------------------------------------------------------------

/**
 * @name $
 * @namespace
 * jQuery Plugins and overrides for Sakai.
 */


/*
 * Functionality that allows you to create HTML Templates and give that template
 * a JSON object. That template will then be rendered and all of the values from
 * the JSON object can be used to insert values into the rendered HTML. More information
 * and examples can be found over here:
 *
 * http://code.google.com/p/trimpath/wiki/JavaScriptTemplates
 *
 * Template should be defined like this:
 *  <div><!--
 *   // Template here
 *  --></div>
 *
 *  IMPORTANT: There should be no line breaks in between the div and the <!-- declarations,
 *  because that line break will be recognized as a node and the template won't show up, as
 *  it's expecting the comments tag as the first one.
 *
 *  We do this because otherwise a template wouldn't validate in an HTML validator and
 *  also so that our template isn't visible in our page.
 */
(function($){

    /**
     * A cache that will keep a copy of every template we have parsed so far. Like this,
     * we avoid having to parse the same template over and over again.
     */
    var templateCache = [];

    /**
    * Trimpath Template Renderer: Renders the template with the given JSON object, inserts it into a certain HTML
    * element if required, and returns the rendered HTML string
    * @function
    * @param {String|Object} templateElement The name of the template HTML ID or a jQuery selection object.
    * @param {Object} templateData JSON object containing the template data
    * @param {Object} outputElement (Optional) jQuery element in which the template needs to be rendered
    * @param {Boolean} doSanitize (Optional) perform html sanitization. Defaults to true
    */
    $.TemplateRenderer = function (templateElement, templateData, outputElement, doSanitize) {

        var templateName;
        var sanitize = true;
        if (doSanitize !== undefined) {
            sanitize = doSanitize;
        }

        // The template name and the context object should be defined
        if(!templateElement || !templateData){
            throw "$.TemplateRenderer: the template name or the templateData is not defined";
        }

        if(templateElement instanceof jQuery && templateElement[0]){
            templateName = templateElement[0].id;
        }
        else if (typeof templateElement === "string"){
            templateName = templateElement.replace("#", "");
            templateElement = $("#" + templateName);
        }
        else {
            throw "$.TemplateRenderer: The templateElement '" + templateElement + "' is not in a valid format or the template couldn't be found.";
        }

        if (!templateCache[templateName]) {
            var templateNode = templateElement.get(0);
            if (templateNode) {
                var firstNode = templateNode.firstChild;
                var template = null;
                // Check whether the template is wrapped in <!-- -->
                if (firstNode && (firstNode.nodeType === 8 || firstNode.nodeType === 4)) {
                    template = firstNode.data.toString();
                }
                else {
                    template = templateNode.innerHTML.toString();
                }
                // Parse the template through TrimPath and add the parsed template to the template cache
                templateCache[templateName] = TrimPath.parseTemplate(template, templateName);

            }
            else {
                throw "$.TemplateRenderer: The template '" + templateName + "' could not be found";
            }
        }

        // Run the template and feed it the given JSON object
        var render = templateCache[templateName].process(templateData);

        // Run the rendered html through the sanitizer
        if (sanitize) {
            render = sakai.api.Security.saneHTML(render);
        }

        // Check it there was an output element defined
        // If so, put the rendered template in there
        if (outputElement) {
            outputElement.html(render);
        }

        return render;

    };

})(jQuery);



///////////////////////////
// jQuery AJAX extention //
///////////////////////////

/*
 * We override the standard $.ajax error function, which is being executed when
 * a request fails. We will check whether the request has failed due to an authorization
 * required error, by checking the response code and then doing a request to the me service
 * to find out whether we are no longer logged in. If we are no longer logged in, and the
 * sendToLoginOnFail variable has been set in the options of the request, we will redirect
 * to the login page with the current URL encoded in the url. This will cause the system to
 * redirect to the page we used to be on once logged in.
 */
(function($){

    /**
    * Override default jQuery error behavior
    * @function
    * @param {String} s description
    * @param {Object} xhr xhr object
    * @param {String} status Status message
    * @param {Object} e Thrown error
    */
    $.handleError = function (s, xhr, status, e) {

        var requestStatus = xhr.status;

        // Sometimes jQuery comes back with a parse-error, although the request
        // was completely successful. In order to prevent the error method to be called
        // in this case, we need this if clause.
        if (requestStatus === 200) {
            if (s.success) {
                s.success(xhr.responseText);
            }
        }
        else {
            // if the sendToLoginOnFail hasn't been set, we assume that we want to redirect when
            // a 403 comes back
            s.sendToLoginOnFail = s.sendToLoginOnFail || true;
            if (requestStatus === 403 && s.sendToLoginOnFail) {

                var decideLoggedIn = function(response, exists){
                    var originalURL = document.location;
                    originalURL = encodeURI(originalURL.pathname + originalURL.search + originalURL.hash);
                    var redirecturl = sakai.config.URL.GATEWAY_URL + "?url=" + originalURL;
                    if (exists && response.preferences && (response.preferences.uuid === "anonymous" || !response.preferences.uuid)) {
                        document.location = redirecturl;
                    }
                };

                $.ajax({
                    url: sakai.config.URL.ME_SERVICE,
                    cache: false,
                    success: function(data){
                        decideLoggedIn(data, true);
                    }
                });

            }

        // Handle HTTP conflicts thrown back by K2 (409) (for example when somebody tries to write to the same node at the very same time)
        // We do this by re-sending the original request with the data transparently, behind the curtains, until it succeeds.
        // This still does not eliminate a possibility of another conflict, but greatly reduces
        // the chance and works in the background until the request is successful (ie jQuery will try to re-send the initial request until the response is not 409
        // WARNING: This does not solve the locking/overwriting problem entirely, it merely takes care of high volume request related issues. Users
        // should be notified in advance by the UI when somebody else is editing a piece of content, and should actively try reduce the possibility of
        // overwriting.
/*        if (requestStatus === 409) {
            // Retry initial post
            $.ajax(s);
        }*/

        // Call original error handler, but not in the case of 409 as we want that to be transparent for users
        if ((s.error) && (requestStatus !== 409)) {
          s.error(xhr, status, e);
        }

        if (s.global) {
          $.event.trigger("ajaxError", [xhr, status, e]);
        }
          }

    };

})(jQuery);


/**
 * Extend jQuery to include a serializeObject function
 * which uses $.serializeArray to serialize the form
 * and then creates an object from that array
 *
 * http://stackoverflow.com/questions/1184624/serialize-form-to-json-with-jquery
 */
(function($){
    $.fn.serializeObject = function()
    {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
})(jQuery);

/**
 * @name Array
 * @namespace
 * Array extensions for Sakai
 */
if(Array.hasOwnProperty("indexOf") === false){

    /**
    * Finds the first occurrence of an element in an array and returns its
    * position. This only kicks in when the native .indexOf method is not
    * available in the browser.
    *
    * @param {Object/String/Integer} obj The element we are looking for
    * @param {Integer} start Where the search starts within the array
    *
    * @returns Returns the position of the first matched element
    * @type Integer
    */
    Array.prototype.indexOf = function(obj,start){

        for(var i=(start||0),j=this.length; i<j; i++){
            if(this[i]===obj){
                return i;
            }
        }
        return -1;

    };
}


/**
 * Entry point for functions which needs to automatically start on each page
 * load.
 *
 * @returns {Void}
 */
sakai.api.autoStart = function() {

    // When DOM is ready...
    $(function(){

        // Load logged in user data
        sakai.api.User.loadMeData(function(success, data){

            // Start i18n
            sakai.api.i18n.init();

        });

    });
};
sakai.api.autoStart();
