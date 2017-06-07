(function () {
	'use strict';

	// сервис-генератор контекстного меню

	angular
		.module('app')
		.factory('ContextMenu', ['NodeActions', Service]);

	function Service(NodeActions) {

		var nodeTitles = {
			aperture: 'проём',
			impost: 'импост',
			frame: 'рама',
			sash: 'створка',
			glass: 'стеклопакет'
		}


		function get(model, renderModelCallback) {

			var itemNodeTitle = [
				function ($itemScope, $event, refIndex, text, $li) {
					return '<strong>' + nodeTitles[model._refs[refIndex].type] + '</strong>'
				},
				angular.noop,
				function () { return false; } // название не кликабельно
			];


			var actFrame = function (act) {
				return [
					'раму',
					function ($itemScope, $event, refIndex) {
						NodeActions[act](model._refs[refIndex], { type: 'frame' });
						renderModelCallback();
					}
				];
			}

			var actImpost = function (act) {
				return [
					'импост',
					[
						[
							'вертикальный',
							function ($itemScope, $event, refIndex) {
								NodeActions[act](model._refs[refIndex], { type: 'impost', direction: 'vertical' });
								renderModelCallback();
							},
						],
						[
							'горизонтальный',
							function ($itemScope, $event, refIndex) {
								NodeActions[act](model._refs[refIndex], { type: 'impost', direction: 'horizontal' });
								renderModelCallback();
							},
						]
					]
				];
			}


			var actSash = function (act) {
				return [
					'створку',
					[
						[
							'поворотную левую',
							function ($itemScope, $event, refIndex) {
								NodeActions[act](model._refs[refIndex], { type: 'sash', handleSide: 'left' });
								renderModelCallback();
							},
						],
						[
							'поворотную правую',
							function ($itemScope, $event, refIndex) {
								NodeActions[act](model._refs[refIndex], { type: 'sash', handleSide: 'right' });
								renderModelCallback();
							},
						],
						[
							'поворотную верхнюю',
							function ($itemScope, $event, refIndex) {
								NodeActions[act](model._refs[refIndex], { type: 'sash', handleSide: 'top' });
								renderModelCallback();
							},
						],
						[
							'поворотную нижнюю',
							function ($itemScope, $event, refIndex) {
								NodeActions[act](model._refs[refIndex], { type: 'sash', handleSide: 'bottom' });
								renderModelCallback();
							},
						],
						[
							'поворотно-откидную левую',
							function ($itemScope, $event, refIndex) {
								NodeActions[act](model._refs[refIndex], { type: 'sash', handleSide: 'left', tilt: true });
								renderModelCallback();
							},
						],
						[
							'поворотно-откидную правую',
							function ($itemScope, $event, refIndex) {
								NodeActions[act](model._refs[refIndex], { type: 'sash', handleSide: 'right', tilt: true });
								renderModelCallback();
							},
						]

					]
				];
			}

			var actGlass = function (act) {
				return [
					'стеклопакет',
					function ($itemScope, $event, refIndex) {
						NodeActions[act](model._refs[refIndex], { type: 'glass' });
						renderModelCallback();
					}
				]
			}


			return function (refIndex) { // здесь refIndex передаём напрямую, например так: .attr('context-menu', 'menuOptions(' + aperture._ref + ')')

				return [
					itemNodeTitle,
					null,
					[].concat(
						model._refs[refIndex].type == 'aperture'
							?
							[
								'вставить',
								angular.noop,
								[]
									.concat(model._refs[refIndex].isRootAperture ? [actFrame('insert')] : [])
									.concat(model._refs[refIndex].isRootAperture ? [] : [actImpost('insert'), actSash('insert'), actGlass('insert')])
							]
							:
							(
								model._refs[refIndex].type == 'frame'
									?
									[[]]
									:
									[
										'заменить на',
										angular.noop,
										[]
											.concat([actImpost('replaceWith'), actSash('replaceWith'), actGlass('replaceWith')])
									]
							)
					)

				];
			}


		}



		return {
			get: get
		}
	}



})();