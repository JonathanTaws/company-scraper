'use strict';

angular.module('jkuri.touchspin', [])
		.provider('ngTouchSpin', ngTouchSpinProvider)
		.directive('ngTouchSpin', ngTouchSpinDirective);

ngTouchSpinDirective.$inject = ['$timeout', '$interval', '$document', 'ngTouchSpin'];
function ngTouchSpinDirective($timeout, $interval, $document, ngTouchSpin) {

	var key_codes = {
		left  : 37,
		right : 39
	};

	var setScopeValues = function (scope, attrs) {
		scope.min = parseFloat(Number(attrs.min)) || 0;
		scope.max = parseFloat(Number(attrs.max)) || 100;
		scope.step = attrs.step || 1;
		scope.prefix = attrs.prefix || undefined;
		scope.postfix = attrs.postfix || undefined;
		scope.decimals = attrs.decimals || 0;
		scope.stepInterval = attrs.stepInterval || 100;
		scope.stepIntervalDelay = attrs.stepIntervalDelay || 500;
		scope.initval = attrs.initval || '';
		scope.val = attrs.value || scope.initval;
	};

	return {
		restrict: 'EA',
		require: '?ngModel',
		scope: true,
		replace: true,
		link: function (scope, element, attrs, ngModel) {
			setScopeValues(scope, attrs);

			var $body = $document.find('body');
			var timeout, timer, helper = true, oldval = scope.val, clickStart;

			ngModel.$setViewValue(scope.val);
			scope.focused = false;

			scope.decrement = function () {
				oldval = scope.val;
				var value = parseFloat(parseFloat(Number(scope.val)) - parseFloat(scope.step)).toFixed(scope.decimals);

				if (value < scope.min) {
					value = parseFloat(scope.min).toFixed(scope.decimals);
					scope.val = value;
					ngModel.$setViewValue(value);
					return;
				}

				scope.val = value;
				ngModel.$setViewValue(value);
			};

			scope.increment = function () {
				oldval = scope.val;
				var value = parseFloat(parseFloat(Number(scope.val)) + parseFloat(scope.step)).toFixed(scope.decimals);

				if (value > scope.max) return;

				scope.val = value;
				ngModel.$setViewValue(value);
			};

			scope.startSpinUp = function () {
				scope.checkValue();
				scope.increment();

				clickStart = Date.now();
				scope.stopSpin();

				$timeout(function() {
					timer = $interval(function() {
						scope.increment();
					}, scope.stepInterval);
				}, scope.stepIntervalDelay);
			};

			scope.startSpinDown = function () {
				scope.checkValue();
				scope.decrement();

				clickStart = Date.now();

				var timeout = $timeout(function() {
					timer = $interval(function() {
						scope.decrement();
					}, scope.stepInterval);
				}, scope.stepIntervalDelay);
			};

			scope.stopSpin = function () {
				if (Date.now() - clickStart > scope.stepIntervalDelay) {
					$timeout.cancel(timeout);
					$interval.cancel(timer);
				} else {
					$timeout(function() {
						$timeout.cancel(timeout);
						$interval.cancel(timer);
					}, scope.stepIntervalDelay);
				}
			};

			scope.checkValue = function () {
				var val;

				if (scope.val !== '' && !scope.val.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
					val = oldval !== '' ? parseFloat(oldval).toFixed(scope.decimals) : parseFloat(scope.min).toFixed(scope.decimals);
					scope.val = val;
					ngModel.$setViewValue(val);
				}

				scope.focused = false;
			};

			scope.updateValue = function () {
				var newValue = scope.val;

				if (newValue !== '') {
					if (newValue.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
						newValue = parseFloat(newValue);
						if (newValue < scope.min) newValue = scope.min;
						if (newValue > scope.max) newValue = scope.max;
						newValue = newValue.toFixed(scope.decimals);
					} else {
						newValue = oldval;
					}
					scope.val = newValue;
					ngModel.$setViewValue(newValue);
				}
			};

			scope.handleEmptyValue = function () {
				var newValue = scope.val;

				if (newValue === '' && attrs.value) {
					newValue = attrs.value;
				}

				scope.val = newValue;
				ngModel.$setViewValue(newValue);
			};

			/**
			 * I have no idea what is causing it but the modelValue gets overwritten to an empty string.
			 * Change it back into the current value if it does!
			 */
			function modelChanged() {
				if (ngModel.$modelValue == '' && scope.val) ngModel.$setViewValue(scope.val);
			}
			ngModel.$viewChangeListeners.push(modelChanged);

			scope.focus = function () {
				scope.focused = true;
			};

			ngModel.$render = function () {
				scope.val = ngModel.$viewValue;
			};

			if (ngTouchSpin.arrowControlsEnabled()) {
				$body.bind('keydown', function(event) {
					if (!scope.focused) {
						return;
					}

					event.preventDefault();

					var which = event.which;

					if (which === key_codes.right) {
						scope.increment();
					} else if (which === key_codes.left) {
						scope.decrement();
					}

					scope.$apply();
				});
			}

		},
		template:
		'<div class="input-group">' +
		'  <span class="input-group-btn" ng-show="!verticalButtons">' +
		'    <button type="button" class="btn btn-default" ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()"><i class="fa fa-minus"></i></button>' +
		'  </span>' +
		'  <span class="input-group-addon" ng-show="prefix" ng-bind="prefix"></span>' +
		'  <input type="text" ng-model="val" class="form-control" ng-change="updateValue()" ng-blur="handleEmptyValue()" ng-focus="focus()">' +
		'  <span class="input-group-addon" ng-show="postfix" ng-bind="postfix"></span>' +
		'  <span class="input-group-btn" ng-show="!verticalButtons">' +
		'    <button type="button" class="btn btn-default" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()"><i class="fa fa-plus"></i></button>' +
		'  </span>' +
		'</div>'
	};
}

function ngTouchSpinProvider() {
	var arrowControlsEnabled = true;

	/**
	 * @ngdoc method
	 * @name ngTouchSpinProvider#arrowControlsEnabled
	 * @description
	 * @param {boolean=} flag enable or disable arrow controls
	 * @returns {*} current value if used as getter or itself (chaining) if used as setter
	 */
	this.arrowControlsEnabled = function(flag) {
		if (angular.isDefined(flag)) {
			arrowControlsEnabled = flag;
			return this;
		} else {
			return arrowControlsEnabled;
		}
	};

	this.$get = function () {
		return this;
	};
}