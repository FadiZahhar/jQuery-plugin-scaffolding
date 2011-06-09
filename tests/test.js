"use strict"

var strict = false;
try {
	eval("foo = 42")
} catch (err) {
	strict = true;
}

var after = function _after(times, func) {
	return function _return() {
		if (--times < 1) { return func.apply(this, arguments); }
	};
};

$(function() {
	var I = $.Identity;
	var testReturnValue = function _testReturnValue(o, elem) {
		return I._Wrap.isPrototypeOf(o[0]) && o[1] === elem;
	};

	test("Existance", function _Existance() {
		ok(I, "Plugin does not exist");
		ok($.fn.Identity, "Plugin does not exist on prototype");
		ok(I._Wrap, "Wrap is not exposed");
		ok(I._create, "create is not exposed");
		ok(I._$, "jQuery sub is not exposed");
		ok(I.global, "global is not exposed");
	});

	test("Public setters", function _ReadOnly() {
		if (strict) {
			raises(function _jQueryThrows() {
				I._$ = 42;
			}, "$ is not read only");
			raises(function _createThrows() {
				I._create = 42;
			}, "create is not read only");
		} else {
			I._$ = 42;
			I._create = 42;
			notStrictEqual(I._$, 42, "$ is not read only");
			notStrictEqual(I._create, 42, "create is not read only");
		}
	});

	module("API");

	asyncTest("Testing Identity", 19, function _Identity() {
		var one = $("#one");
		var div = $("div");

		stop();
		var go = after(7, start);
		start();

		var testThen = function _testThen(ret) {
			ok(testReturnValue(ret, one[0]), "return value is wrong")	
			go();
		}

		var testThenObj = function _testThenObj(ret) {
			ok(testReturnValue(ret, one[0]), "return value is wrong");
			ok(ret[0].options.foo === "bar",
				"options are not stored properly on the Wrap");
			go();
		}

		var identity = one.Identity();
		ok(identity.isRejected && identity.isResolved, 
			"Identity does not return deferred");

		one.Identity().then(testThen);

		one.Identity({"foo": "bar"}).then(testThenObj);

		one.Identity({
			"cb": testThen
		});

		one.Identity("Identity").then(testThen);

		one.Identity("Identity", {"foo": "bar"}).then(testThenObj);

		one.Identity("Identity", {
			"cb": function _cb(ret) {
				ok(testReturnValue(ret, one[0]), "return value is wrong");
				strictEqual(ret[0].options.cb, _cb, 
					"callback not stored on options");
				go();
			}
		});

		div.Identity().then(function _multipleReturns(ret) {
			strictEqual(4, arguments.length, 
				"The deferred array passed back is missing elements");
			Array.prototype.forEach.call(arguments, function(ret, k) {
				ok(testReturnValue(ret, ret[1]), "return value is wrong");
				ok(div.toArray().some(
					function _divContainsRet(elem) {
						return elem === ret[1];	
					}), 
					"returned identities do not contain the right divs"
				);	
			});
			go();
		});
	});

	asyncTest("Testing jQuery.Identity", 29, function _jQueryIdentity() {
		var one = $("#one");
		var div = $("div");

		stop();
		var go = after(17, start);
		start();

		var testThen = function _testThen($elem, ret) {
			//console.log($elem, ret);
			ok(testReturnValue(ret, $elem[0]), "return value is wrong")	
			go();
		}

		var testThenObj = function _testThenObj($elem, ret) {
			ok(testReturnValue(ret, $elem[0]), "return value is wrong");
			ok(ret[0].options.foo === "bar",
				"options are not stored properly on the Wrap");
			go();
		}

		var testThenBody = testThen.bind(null, $(document.body));
		var testThenObjBody = testThenObj.bind(null, $(document.body));

		var testThenOne = testThen.bind(null, one);
		var testThenObjOne = testThenObj.bind(null, one);

		var testThenDiv = testThen.bind(null, div);
		var testThenObjDiv = testThenObj.bind(null, div);

		var identity = I();
		ok(identity.isRejected && identity.isResolved, 
			"Identity does not return deferred");

		I().then(testThenBody);
		I({"foo":"bar"}).then(testThenObjBody);
		I({
			"foo":"bar",
			"cb": testThenObjBody
		});
		I({
			"foo": "bar",
			"elem": one[0]
		}).then(testThenObjOne);
		I({
			"foo":"bar",
			"elem": $.makeArray(div)
		}).then(testThenObjDiv);
		I("Identity").then(testThenBody)
		I("Identity", {"foo": "bar"}).then(testThenObjBody);
		I("Identity", {
			"foo": "bar",
			"elem": one[0]
		}).then(testThenObjOne);
		I("Identity", {
			"foo":"bar",
			"elem": $.makeArray(div)
		}).then(testThenObjDiv);
		I(one[0]).then(testThenOne);
		I($.makeArray(div)).then(testThenDiv);
		I(one[0], {
			"foo": "bar"
		}).then(testThenObjOne);
		I($.makeArray(div), {
			"foo": "bar"
		}).then(testThenObjDiv);
		I(one[0], "Identity").then(testThenOne);
		I($.makeArray(div), "Identity").then(testThenDiv);
		I(one[0], {
			"foo": "bar"
		}, "Identity").then(testThenObjOne);
		I($.makeArray(div), {
			"foo": "bar"
		}, "Identity").then(testThenObjDiv);
		
	});

	module("");

	test("Create", function _Create() {
		var c = I._create;

		var o = c(document.body);
		var p = c(document.body);
		var q = c($("div")[0]);
		strictEqual(o, p, "create does not cache");
		ok(I._Wrap.isPrototypeOf(o), "o is not instance of Wrap");
		ok(o.elem, "Wrap does not have an element");
		ok(o.$elem, "Wrap does not have a $element");
		ok(o.uid, "Wrap does not have a uid");
		ok(o._ns, "Wrap does not have a event namespace");
		notEqual(o.uid, q.uid, "uid is not unique");
		notEqual(o._ns, q._ns, "ns is not unique");
		strictEqual(o._ns, o.data("_ns"), 
			"the event namespace is not stored in data properely")
	});

	/* TEST create (including ._ns) */

	module("Wrap");

	/* TEST Wrap.data */

	/* TEST Wrap.destroy */

	module("_$");

	/* TEST _$.fn.bind */

	/* TEST _$.fn.unbind */

	module("");

	/* TEST global */


});