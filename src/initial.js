(function () {
	'use strict';

	angular
		.module('app', ['app-templates', 'ui.router', 'ui.bootstrap', 'ui.bootstrap.contextMenu'])
		.config(['$stateProvider', '$urlRouterProvider', '$sceDelegateProvider', '$uibTooltipProvider', config])


	function config($stateProvider, $urlRouterProvider, $sceDelegateProvider, $uibTooltipProvider) {

		var isTouchDevice = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
		if (isTouchDevice) {
			$uibTooltipProvider.options({ trigger: 'dontTrigger' });
		} else {
			$uibTooltipProvider.options({ trigger: 'mouseenter' });
		}

		$urlRouterProvider.otherwise("/");

		$stateProvider
			.state('main', {
				url: '/',
				views: {
					'nav': {
						templateUrl: 'views/nav.tpl.html',
						//controller: 'NavController'
					},
					'main': {
						templateUrl: 'views/main.tpl.html',
						controller: 'MainController'
					}
				}
			});


	}

})();