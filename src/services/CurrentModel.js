(function () {
	'use strict';

	angular
		.module('app')
		.factory('CurrentModel', function () {

			var obj = {
				modelData: null,
				stat: null
			}

			return obj;

		});

})();