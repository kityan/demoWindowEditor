(function () {
	'use strict';

	// сервис с действиями с узалами модели

	angular
		.module('app')
		.factory('NodeActions', function () {

			var actions = {

				// замена контента на контент
				replaceWith: function (content, params) {
					this.insert(content._parent, params);
				},


				// вставка контента в проём
				insert: function (aperture, params) {
					
					switch (params.type) {

						case 'frame':
							aperture.content = {
								type: params.type,
								properties: {
									sizes: { heightFront: 48, heightRear: 68, beadHeight: 18 }
								},
								aperture: {}
							}
							break;

						case 'sash':
							aperture.content = {
								type: params.type,
								properties: {
									handleSide: params.handleSide || 'left',
									tilt: !!params.tilt,
									sizes: { labelPadding: 20, heightFront: 52, heightRear: 72, overlap: 8, beadHeight: 18 }
								},
								aperture: {}
							}
							break;

						case 'impost':
							aperture.content = {
								type: params.type,
								properties: {
									offset: 0,
									direction: params.direction || 'vertical',
									sizes: { heightFront: 48, heightRear: 88, beadHeight: 18 }
								},
								aperture: (params.direction == 'horizontal') ? [{ side: 'top' }, { side: "bottom" }] : [{ side: 'left' }, { side: "right" }]
							}
							break;


						case 'glass':
							aperture.content = {
								type: params.type
							}
							break;


					}

				}
			}

			return actions;

		});

})();