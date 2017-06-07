(function () {
	'use strict';

	angular
		.module('app')
		.controller('MainController', ['$scope', 'CurrentModel', Controller]);

	function Controller($scope, CurrentModel) {

		$scope.modelData = CurrentModel.modelData;
		$scope.$watch('stat', function () {
			if ($scope.stat) {
				CurrentModel.modelData = $scope.updatedModel;
			}
		}, true)

	}

})();