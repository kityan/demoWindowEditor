(function () {
	'use strict';

	angular
		.module('app')
		.controller('TemplatesController', ['$scope', 'ModelsExamples', '$state', 'CurrentModel', Controller]);

	function Controller($scope, ModelsExamples, $state, CurrentModel) {

		$scope.models = ModelsExamples.models;

		$scope.startEditingFromThisTemplate = function (modelData) {
			CurrentModel.modelData = modelData;
			$state.go('main');
		}

	}

})();