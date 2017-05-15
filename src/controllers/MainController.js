(function () {
	'use strict';

	angular
		.module('app')
		.controller('MainController', ['$scope', 'ModelsExamples', Controller]);

	function Controller($scope, ModelsExamples) {

		$scope.models = ModelsExamples.models;
		$scope.selectedModelData = ModelsExamples.models[0].data;
		$scope.render = function(index){
			$scope.selectedModelData = ModelsExamples.models[index].data;
		}

	}

})();