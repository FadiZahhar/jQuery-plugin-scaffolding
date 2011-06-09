(function($, jQuery, window, document, undefined) {
    var toString = Object.prototype.toString,
        // uid for elements
        uuid = 0,
        PLUGIN_NAME, defaults, Wrap, Base, create, main;

    var scaffolding = function _scaffolding() {
        // over-ride bind so it uses a namespace by default
        // namespace is PLUGIN_NAME_<uid>
        $.fn.bind = function  _bind(type, data, fn, nsKey) {
            if (typeof type === "object") {
                for (var key in type) {
                    nsKey = key + this.data(PLUGIN_NAME)._ns;
                    this.bind(nsKey, data, type[key], fn);
                }
                return this;
            }

            nsKey = type + this.data(PLUGIN_NAME)._ns;
            return jQuery.fn.bind.call(jQuery, nsKey, data, fn);
        };

        // override unbind so it uses a namespace by default.
        // add new override. .unbind() with 0 arguments unbinds all methods
        // for that element for this plugin. i.e. calls .unbind(_ns)
        $.fn.unbind = function _unbind(type, fn, nsKey) {
            // Handle object literals
            if ( typeof type === "object" && !type.preventDefault ) {
                for ( var key in type ) {
                    nsKey = key + this.data(PLUGIN_NAME)._ns;
                    this.unbind(nsKey, type[key]);
                }
            } else if (arguments.length === 0) {
                nsKey = type + this.data(PLUGIN_NAME)._ns;
                this.unbind(nsKey);
            } else {
                nsKey = type + this.data(PLUGIN_NAME)._ns;
                return jQuery.fn.unbind.call(jQuery, nsKey, fn);    
            }
            return this;
        };

        // Creates a new Wrapped element. This is cached. One wrapped element 
        // per HTMLElement. Uses data-PLUGIN_NAME-cache as key and 
        // creates one if not exists.
        create = (function _cache_create() {
            function _factory(elem) {
                return Object.create(Wrap, {
                    "elem": {value: elem},
                    "$elem": {value: $(elem)},
                    "uid": {value: ++uuid}
                })._init();
            }
            var uid = 0;
            var cache = {};

            return function _cache(elem) {
                var key = "";
                for (var k in cache) {
                    if (cache[k].elem == elem) {
                        key = k;
                        break;
                    }
                }
                if (key === "") {
                    cache[PLUGIN_NAME + "_" + ++uid] = _factory(elem);
                    key = PLUGIN_NAME + "_" + uid;
                } 
                return cache[key];
            };
        }());

        // Base object which every Wrap inherits from
        Base = (function() {
            var self = Object.create({});
            // destroy method. unbinds, removes data
            self.destroy = function _destroy() {
                this.$elem.unbind();
                this.$elem.removeData(PLUGIN_NAME);
            };

            // initializes the namespace and stores it on the elem.
            self._init = function _init() {
                this._ns = "." + PLUGIN_NAME + "_" + this.uid;
                this.data("_ns", this._ns);
                return this;
            };

            // returns data thats stored on the elem under the plugin.
            self.data = function _data(name, value) {
                var $elem = this.$elem, data;
                if (name === undefined) {
                    return $elem.data(PLUGIN_NAME);
                } else if (typeof name === "object") {
                    data = $elem.data(PLUGIN_NAME) || {};
                    for (var k in name) {
                        data[k] = name[k];
                    }
                    $elem.data(PLUGIN_NAME, data);
                } else if (value === undefined) {
                    return $elem.data(PLUGIN_NAME)[name];
                } else if (value && name) {
                    data = $elem.data(PLUGIN_NAME) || {};
                    data[name] = value;
                    $elem.data(PLUGIN_NAME, data);
                }
            };
            return self;
        })();

        // Call methods directly. $.PLUGIN_NAME(elem, "method", option_hash)
        var methods = jQuery[PLUGIN_NAME] = function _methods(elem, op, hash) {
            if (typeof elem === "string") {
                hash = op || {};
                op = elem;
                elem = hash.elem;
            } else if ((elem && elem.nodeType) || Array.isArray(elem)) {
                if (typeof op !== "string") {
                    hash = op;
                    op = null;
                }
            } else {
                hash = elem || {};
                elem = hash.elem;
            }

            hash = hash || {}
            op = op || PLUGIN_NAME;
            elem = elem || document.body;
            if (Array.isArray(elem)) {
                var defs = elem.map(function(val) {
                    return create(val)[op](hash);    
                });
            } else {
                var defs = [create(elem)[op](hash)];    
            }

            return $.when.apply($, defs).then(hash.cb);
        };
        
        // expose publicly.
        Object.defineProperties(methods, {
            "_Wrap": {
                "get": function() { return Wrap; },
                "set": function(v) { Wrap = v; }
            },
            "_create":{
                value: create
            },
            "_$": {
                value: $    
            },
            "global": {
                "get": function() { return defaults; },
                "set": function(v) { defaults = v; }
             }
        });
        
        // main plugin. $(selector).PLUGIN_NAME("method", option_hash)
        jQuery.fn[PLUGIN_NAME] = function _main(op, hash) {
            if (typeof op === "object" || !op) {
                hash = op;
            }
            op = op || PLUGIN_NAME;
            hash = hash || {};

            // map the elements to deferreds.
            var defs = this.map(function() {
                return create(this)[PLUGIN_NAME](hash);
            }).toArray();

            // call the cb when were done and return the deffered.
            return $.when.apply($, defs).then(hash.cb);

        };
    };

    // -------------------------------
    // --------- YOUR CODE -----------
    // -------------------------------

    PLUGIN_NAME = "Identity";
    // default options hash.
    defaults = {
        // TODO: Add defaults
    };

    // run scaffolding
    scaffolding();

    main = function(options) {
        this.options = options = $.extend(true, defaults, options); 
        var def = $.Deferred();

        // Identity returns this & the $elem.
        // TODO: Replace with custom logic
        def.resolve([this, this.elem]);

        return def;
    }

    Wrap = (function() {
        var self = Object.create(Base);
        
        var $destroy = this.destroy;
        self.destroy = function _destroy() {
            // custom destruction logic
            // remove elements and other events / data not stored on .$elem

            $destroy.apply(this, arguments);
        };

        self[PLUGIN_NAME] = main;

        // TODO: Add custom logic for public methods

        return self;
    }());

})(jQuery.sub(), jQuery, this, document);