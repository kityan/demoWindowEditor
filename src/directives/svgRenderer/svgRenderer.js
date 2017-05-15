(function () {
	'use strict';

	angular.module('app')
		.directive('svgRenderer', svgRenderer);

	function svgRenderer() {
		return {
			restrict: "E",
			templateUrl: 'directives/svgRenderer/svgRenderer.tpl.html',
			replace: true,
			scope: {
				model: '<',
				stat: '=',
			},

			link: function (scope, elem, attrs) {

				scope.$watch('model', function () {
					if (scope.model) {
						scope.stat = draw(angular.copy(scope.model), elem);
					}
				});

			}
		}
	}



	function draw(model, element) {

		// объект статистики
		var stat = getEmptyStatObject();

		prepareModelTree(model)

		var lineFunction = d3.svg.line()
			.x(function (d) { return d.x; })
			.y(function (d) { return d.y; })
			.interpolate("linear");

		var view = document.getElementById('svg');
		var w = svg.clientWidth || svg.parentNode.clientWidth; // 2nd - for firefox
		var h = svg.clientHeight || svg.parentNode.clientHeight; // 2nd - for firefox

		var max = d3.max([model.aperture.size.horizontal, model.aperture.size.vertical]);
		var scale = 1;

		// пока без привязки к размеру самого view, потому как она пока не резиновый
		var levels = [
			{ max: 500, scale: 0.7 },
			{ max: 800, scale: 0.5 },
			{ max: 1000, scale: 0.4 },
			{ max: 1400, scale: 0.35 },
			{ max: 1900, scale: 0.25 },
			{ max: 2200, scale: 0.2 },
			{ max: 3000, scale: 0.16 }
		]

		levels.forEach(function (level) { scale = (max > level.max) ? level.scale : scale; });

		// обратаное масштабирование текстуры пустого проёма
		d3.select('#img1').attr('width', 20 / scale).attr('height', 20 / scale);
		d3.select('#img1 image').attr('width', 20 / scale).attr('height', 20 / scale);

		var view = document.getElementById('view');

		// empty
		while (view.firstChild) {
			view.removeChild(view.firstChild);
		}

		// устанавливаем масштаб (перейти всё-таки к шкалам d3?)
		d3.select(view)
			.attr("transform", function () {
				return "translate(" +
					Math.round((w / 2 - model.aperture.size.horizontal * scale / 2))
					+ "," +
					Math.round((h / 2 - model.aperture.size.vertical * scale / 2)) + ") scale(" + scale + ")";
			});


		function render(placeholder, aperture) {
			var a = createAperture(aperture);
			placeholder.appendChild(a);
			if (aperture.content) {
				var c = createContent(aperture.content, aperture);
				a.appendChild(c.pre);
				if (aperture.content.aperture) {
					// может и не быть, например у стеклоапакета, а может быть несколько - у импоста
					if (Array.isArray(aperture.content.aperture)) {
						aperture.content.aperture.forEach(function (el) {
							render(a, el);
						})
					} else {
						render(a, aperture.content.aperture);
					}
				}
				if (c.post) {
					a.appendChild(c.post); // пост-апертурный контет, для створок - лейблы
				}
			}
		}


		render(view, model.aperture);


		// временно, на самом деле стоит считать их при создании/редактировании контента
		function calculateAperturePoints(aperture) {

			//корневой просвет
			if (!aperture._parent) {
				return {
					translation: { x: 0, y: 0 },
					points: [
						{ x: 0, y: 0 },
						{ x: aperture.size.horizontal, y: 0 },
						{ x: aperture.size.horizontal, y: aperture.size.vertical },
						{ x: 0, y: aperture.size.vertical }
					]
				}
			}

			// контент, создавший просвет
			var contentCreatingThisAperture = aperture._parent;
			// просвет в котором он стоит
			var outerAperturePoints = calculateAperturePoints(contentCreatingThisAperture._parent).points;
			// передняя стенка
			var hf = contentCreatingThisAperture.properties.sizes.heightFront;
			// сдвиг оси импоста относительно начала просвета
			var oL = contentCreatingThisAperture.properties.offsetLeft;

			// если импост, то создал пару просветов:
			if (contentCreatingThisAperture.type == 'impost') {
				var left = (aperture.side == 'left');
				// пока только вертикальный и не учитываем его сдвиг от центра просвета
				return {
					points: [
						{
							x: 0, y: 0
						},
						{
							x: ((left) ? oL : -oL) + (outerAperturePoints[1].x - hf) / 2, y: 0
						},
						{
							x: ((left) ? oL : -oL) + (outerAperturePoints[2].x - hf) / 2,
							y: outerAperturePoints[2].y
						},
						{
							x: 0, y: outerAperturePoints[2].y
						}
					],
					// смещение относительно родительского проёма
					translation: {
						x: (left) ? 0 : oL + ((outerAperturePoints[1].x + hf) / 2),
						y: 0
					}
				};

			}

			return {
				points: [
					{ x: 0, y: 0 },
					{ x: outerAperturePoints[1].x - 2 * hf, y: 0 },
					{ x: outerAperturePoints[2].x - 2 * hf, y: outerAperturePoints[2].y - 2 * hf },
					{ x: 0, y: outerAperturePoints[3].y - 2 * hf }
				],
				translation: {
					x: hf,
					y: hf
				}
			};
		}


		// формируем группу и обводку просвета 
		function createAperture(aperture) {
			var res = calculateAperturePoints(aperture);
			var points = res.points;
			var translation = res.translation;

			var g = _g();
			d3.select(g)
				.attr('transform', 'translate(' + translation.x + ',' + translation.y + ')')
				.classed('aperture', true)
				.classed('aperture--empty', !aperture.content)
				.attr('fill', 'url(#img1)')
				.append('svg:path')
				.attr('d', lineFunction(points) + ' z')
				;
			return g;
		}

		// рисуем контент просвета
		function createContent(content, aperture) {
			switch (content.type) {
				case 'frame': return createFrame(content, aperture);
				case 'glass': return createGlass(content, aperture);
				case 'sash': return createSash(content, aperture);
				case 'impost': return createImpost(content, aperture);
			}
		}


		// рисуем стеклопакет 
		function createGlass(glass, aperture) {

			var hb = glass._parent._parent.properties.sizes.beadHeight;

			var points = calculateAperturePoints(aperture).points;

			// временно, вынести в отдельные функции
			stat.glass.rects.push({ width: points[1].x - points[0].x, height: points[2].y - points[1].y });
			stat.bead.lengths.push(points[1].x - points[0].x);
			stat.bead.lengths.push(points[1].x - points[0].x);
			stat.bead.lengths.push(points[2].y - points[1].y);
			stat.bead.lengths.push(points[2].y - points[1].y);

			var g = _g();
			d3.select(g)
				.classed('glass', true)
				.classed('content', true)
				.append('svg:path')
				.attr('d', lineFunction(points) + ' z')
				;

			// заполняем конфиг из 4 штапиков
			var config = []

			// сократить config! переделать на translate аналогично створке	
			config.push({
				side: 'top',
				points: function (offest) {
					return [
						{ x: points[0].x + offest, y: points[0].y + offest },
						{ x: points[1].x - offest, y: points[1].y + offest },
						points[1],
						points[0],
					]
				}
			});

			config.push({
				side: 'left',
				points: function (offest) {
					return [
						{ x: points[0].x + offest, y: points[0].y + offest },
						{ x: points[3].x + offest, y: points[3].y - offest },
						points[3],
						points[0],
					]
				}
			});

			config.push({
				side: 'right',
				points: function (offest) {
					return [
						{ x: points[1].x - offest, y: points[1].y + offest },
						{ x: points[2].x - offest, y: points[2].y - offest },
						points[2],
						points[1],
					]
				}
			});

			config.push({
				side: 'bottom',
				points: function (offest) {
					return [
						{ x: points[3].x + offest, y: points[3].y - offest },
						{ x: points[2].x - offest, y: points[2].y - offest },
						points[2],
						points[3],
					]
				}
			});

			for (var i = 0; i < config.length; i++) {
				var bead = _g();
				d3.select(bead)
					.classed('bead bead--' + config[i].side, true)
					.append('svg:path')
					.attr('d', lineFunction(config[i].points(hb)) + ' Z')
					.attr('stroke-linejoin', 'round')
					.attr('vector-effect', 'non-scaling-stroke')
					;
				g.appendChild(bead);
			}

			return { pre: g };

		}

		/**
		 * Рисуем раму 
		 * @param {*} frame 
		 * @param {*} aperture 
		 */
		function createFrame(frame, aperture) {

			var g = _g();
			d3.select(g)
				.classed('frame', true)
				.classed('content', true)
				;

			// просвет, который заполняем 
			var points = calculateAperturePoints(aperture).points;
			// параметры профиля коробки
			var hb = frame.properties.sizes.heightRear;
			var hf = frame.properties.sizes.heightFront;

			// временно, вынести в отдельные функции
			stat.frame.lengths.push(points[1].x - points[0].x);
			stat.frame.lengths.push(points[1].x - points[0].x);
			stat.frame.lengths.push(points[2].y - points[1].y);
			stat.frame.lengths.push(points[2].y - points[1].y);


			// заполняем конфиг из 4 балок
			var config = []

			// сократить config! переделать на translate аналогично створке
			config.push({
				side: 'top',
				points: function (offest) {
					return [
						{ x: points[0].x + offest, y: points[0].y + offest },
						{ x: points[1].x - offest, y: points[1].y + offest },
						points[1],
						points[0],
					]
				}
			});

			config.push({
				side: 'left',
				points: function (offest) {
					return [
						{ x: points[0].x + offest, y: points[0].y + offest },
						{ x: points[3].x + offest, y: points[3].y - offest },
						points[3],
						points[0],
					]
				}
			});

			config.push({
				side: 'right',
				points: function (offest) {
					return [
						{ x: points[1].x - offest, y: points[1].y + offest },
						{ x: points[2].x - offest, y: points[2].y - offest },
						points[2],
						points[1],
					]
				}
			});

			config.push({
				side: 'bottom',
				points: function (offest) {
					return [
						{ x: points[3].x + offest, y: points[3].y - offest },
						{ x: points[2].x - offest, y: points[2].y - offest },
						points[2],
						points[3],
					]
				}
			});

			for (var i = 0; i < config.length; i++) {
				var beam = _g();

				// задняя стенка
				d3.select(beam)
					.classed('beam beam--' + config[i].side, true)
					.append('svg:path')
					.attr('d', lineFunction(config[i].points(hb)) + ' Z')
					.attr('stroke-linejoin', 'round')
					.attr('vector-effect', 'non-scaling-stroke')
					;

				// передняя стенка
				d3.select(beam)
					.append('svg:path')
					.attr('d', lineFunction(config[i].points(hf)) + ' Z')
					.attr('stroke-linejoin', 'round')
					.attr('vector-effect', 'non-scaling-stroke')
					;

				g.appendChild(beam);

			}

			return { pre: g };

		}


		/**
		 * Рисуем створку 
		 * @param {Object} sash 
		 * @param {Object} aperture 
		 */
		function createSash(sash, aperture) {

			var g = _g();
			d3.select(g)
				.classed('sash', true)
				.classed('content', true)
				;

			// проём
			var points = calculateAperturePoints(aperture).points;

			// временно, вынести в отдельные функции
			stat.sash.qty++;
			stat.sash.lengths.push(points[1].x - points[0].x);
			stat.sash.lengths.push(points[1].x - points[0].x);
			stat.sash.lengths.push(points[2].y - points[1].y);
			stat.sash.lengths.push(points[2].y - points[1].y);

			// заполняем конфиг из 4 балок
			var config = []

			// верхняя и нижняя балка
			var f1 = function (offest, overlap) {
				return [
					{ x: points[0].x + offest, y: points[0].y + offest },
					{ x: points[1].x - offest, y: points[1].y + offest },
					{ x: points[1].x + overlap, y: points[1].y - overlap },
					{ x: points[0].x - overlap, y: points[0].y - overlap },
				]
			};
			config.push({ side: 'top', points: f1 });
			config.push({ side: 'bottom', points: f1 });

			// левая и правая балка
			var f2 = function (offest, overlap) {
				return [
					{ x: points[0].x + offest, y: points[0].y + offest },
					{ x: points[3].x + offest, y: points[3].y - offest },
					{ x: points[3].x - overlap, y: points[3].y + overlap },
					{ x: points[0].x - overlap, y: points[0].y - overlap },
				]
			};
			config.push({ side: 'left', points: f2 });
			config.push({ side: 'right', points: f2 });

			// ширина и высота коробки для translate
			var width = points[1].x;
			var height = points[2].y;

			for (var i = 0; i < config.length; i++) {
				var beam = _g();

				d3.select(beam)
					.classed('beam beam--' + config[i].side, true)
					.attr('transform', function () {
						if (config[i].side == 'right') { return 'scale(-1 1) translate(-' + width + ', 0)'; }
						if (config[i].side == 'bottom') { return 'scale(1 -1) translate(0, -' + height + ')'; }
						return null;
					})

					// задняя стенка				
					.append('svg:path')
					.attr('d', lineFunction(config[i].points(sash.properties.sizes.heightRear, sash.properties.sizes.overlap)) + ' Z')
					.attr('stroke-linejoin', 'round')
					.attr('vector-effect', 'non-scaling-stroke')
					;

				// передняя стенка
				d3.select(beam)
					.append('svg:path')
					.attr('d', lineFunction(config[i].points(sash.properties.sizes.heightFront, sash.properties.sizes.overlap)) + ' Z')
					.attr('stroke-linejoin', 'round')
					.attr('vector-effect', 'non-scaling-stroke')
					;

				// добавим ручку
				if (config[i].side == sash.properties.handleSide) {
					beam.append(createSashHandle(config[i], sash));
				}

				g.appendChild(beam);

			}

			return {
				pre: g,
				post: createSashLabel(sash, points)	// кладём в post, чтобы svg-элемент лёг поверх элемента с дочерним содержимым (у створки это стеклопакет или импост)
			};

		}


		/**
		 * Добавляем ручки
		 * @param {Object} beamConfig - конфиг балки
		 * @param {Object} sash - створка
		 */
		function createSashHandle(beamConfig, sash) {

			var lineArr = beamConfig.points(sash.properties.sizes.heightFront, sash.properties.sizes.overlap);

			// заменить на высчитывание BBox (но без опоры на DOM, поскольку элемент еще не добавлен)
			var minY = d3.min(lineArr, function (d) { return d.y; });
			var maxY = d3.max(lineArr, function (d) { return d.y; });
			var minX = d3.min(lineArr, function (d) { return d.x; });
			var maxX = d3.max(lineArr, function (d) { return d.x; });
			var elName = (beamConfig.side == 'bottom' || beamConfig.side == 'top') ? 'handleHorizontal' : 'handleVertical';
			var handleBBox = document.getElementById(elName).getBBox();
			var x = (maxX - minX - handleBBox.width) / 2;
			var y = (maxY - minY - handleBBox.height) / 2;

			var handle = _g();

			d3.select(handle)
				.append('svg:use')
				.attr('xlink:href', '#' + elName)
				.attr('x', x - sash.properties.sizes.overlap)
				.attr('y', y - sash.properties.sizes.overlap)
				;

			return handle;

		}

		/**
		 * Рисуем обозначение типа открывания створки.
		 * [+] Возможно имеет смысл уйти к use, аналогично ручкам и петлям
		 * @param {Object} sash - объект створки в модели конструкции
		 * @param {Oject[]} p - массив точек прямоугольника просвета, который заполняется створкой
		 */
		function createSashLabel(sash, p) {

			var offset =
				// высота передней стенки профиля створки
				sash.properties.sizes.heightFront +
				// высота штапика
				sash.properties.sizes.beadHeight +
				// отступ линий обозначения от штапика (просто в декоративных целях, чтобы не блоы примыкания)
				sash.properties.sizes.labelPadding;

			// порядок точек линни условного обозначения в зависимости от стороны открывания
			var config = {}
			config.top = config.bottom = {
				labelPoints: [
					{ x: p[3].x + offset, y: p[3].y - offset },
					{ x: p[1].x / 2, y: p[1].y + offset },
					{ x: p[2].x - offset, y: p[2].y - offset },
				],
				translateValue: p[2].y - p[1].y
			}
			config.right = config.left = {
				labelPoints: [
					{ x: p[0].x + offset, y: p[0].y + offset },
					{ x: p[1].x - offset, y: p[2].y / 2 },
					{ x: p[3].x + offset, y: p[3].y - offset },
				],
				translateValue: p[2].x - p[3].x

			}

			var label = _g();

			var turnLabel = d3.select(label)
				.classed('sash--label', true)
				.append('svg:path')
				.attr('d', lineFunction(config[sash.properties.handleSide].labelPoints))
				.attr('stroke-linejoin', 'round')
				.attr('vector-effect', 'non-scaling-stroke')
				;

			// точки мы задали для bottom одинаковые с top, поэтому для bottom зеркально отражаем
			if (sash.properties.handleSide == 'bottom') {
				turnLabel
					.attr('transform', function () { return 'scale(1,-1) translate(0, ' + (-config[sash.properties.handleSide].translateValue) + ')'; });
			}
			// аналогично right и left
			if (sash.properties.handleSide == 'left') {
				turnLabel
					.attr('transform', function () { return 'scale(-1, 1) translate(' + (-config[sash.properties.handleSide].translateValue) + ', 0)'; });
			}

			// откидная? тогда добавим top
			if (sash.properties.tilt) {
				d3.select(label)
					.append('svg:path')
					.attr('d', lineFunction(config['top'].labelPoints))
					.attr('stroke-linejoin', 'round')
					.attr('vector-effect', 'non-scaling-stroke')
					;
			}

			return label;

		}



		/**
		 * 	Рисуем импост пока только вертикальный
		 * @param {Object} impost
		 * @param {Object} aperture 
		 */

		function createImpost(impost, aperture) {

			var g = _g();
			d3.select(g)
				.classed('impost', true)
				.classed('content', true)
				;

			var beam = _g();
			var points = calculateAperturePoints(aperture).points;

			// временно, вынести в отдельные функции
			stat.impost.qty++;
			stat.impost.lengths.push(points[2].y - points[1].y);

			var hb = impost.properties.sizes.heightRear;
			var hf = impost.properties.sizes.heightFront;
			var oL = impost.properties.offsetLeft;
			var cut = (hb - hf) / 2;

			var arr = [
				{ x: oL + (points[1].x / 2) - hb / 2, y: points[1].y + cut },
				{ x: oL + (points[1].x / 2) + hb / 2, y: points[1].y + cut },
				{ x: oL + (points[2].x / 2) + hb / 2, y: points[2].y - cut },
				{ x: oL + (points[2].x / 2) - hb / 2, y: points[2].y - cut },
			]
			var line = [
				{ x: oL + (points[1].x / 2) - hf / 2, y: points[1].y },
				{ x: oL + (points[1].x / 2) + hf / 2, y: points[1].y },
				{ x: oL + (points[2].x / 2) + hf / 2, y: points[2].y },
				{ x: oL + (points[2].x / 2) - hf / 2, y: points[2].y },
			]


			d3.select(beam)
				.classed('beam beam--vertical', true)
				.append('svg:path')
				.attr('d', lineFunction(arr) + ' Z')
				.attr('stroke-linejoin', 'round')
				.attr('vector-effect', 'non-scaling-stroke')
				;

			d3.select(beam)
				.append('svg:path')
				.attr('d', lineFunction(line) + ' Z')
				.attr('stroke-linejoin', 'round')
				.attr('vector-effect', 'non-scaling-stroke')
				;


			g.appendChild(beam);
			return {
				pre: g
			};

		}


		// Функция обработки дерева модели. Добавляем _parent
		function prepareModelTree(tree) {

			function setParent(node, parentNode) {
				if (!node) { return; }
				node._parent = parentNode;
				for (var k in node) {
					if (k == 'content' || k == 'aperture') {
						if (k == 'aperture' && Array.isArray(node[k])) {
							node[k].forEach(function (n) { setParent(n, node); })
						}
						setParent(node[k], node);
					}
				}
			}

			tree.aperture._parent = null;
			for (var k in tree.aperture) {
				if (k == 'content' || k == 'aperture') {
					setParent(tree.aperture[k], tree.aperture);
				}
			}

		}



		// создаём g
		function _g() {
			return document.createElementNS('http://www.w3.org/2000/svg', 'g');
		}

		function getEmptyStatObject() {
			return {
				frame: {	// профиль коробки
					lengths: [] // длины
				},
				impost: {	// профиль импоста
					qty: 0, // количество импостов
					lengths: [] // длины
				},
				sash: {
					qty: 0, // количество створок
					lengths: [] // длины
				},
				bead: { // штапик
					lengths: [] // длины
				},
				glass: {
					rects: [] // массив {width: number, height: number}
				}
			}
		}

		// reduce stat. убрать копипасть, выделить в отдельную функцию
		stat.frame.totalLength = stat.frame.lengths.reduce(function (total, length) { return total + length; }, 0)
		stat.sash.totalLength = stat.sash.lengths.reduce(function (total, length) { return total + length; }, 0)
		stat.bead.totalLength = stat.bead.lengths.reduce(function (total, length) { return total + length; }, 0)
		stat.impost.totalLength = stat.impost.lengths.reduce(function (total, length) { return total + length; }, 0)
		stat.glass.totalArea = stat.glass.rects.reduce(function (total, rect) { return total + rect.width * rect.height; }, 0)
		return stat;

	}



})();