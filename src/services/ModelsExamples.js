(function () {
	'use strict';

	// сервис с примерами конструкций для оценки работы построителя

	angular
		.module('app')
		.constant('ModelsExamples', {
			models: [

				// 1
				{
					name: 'Пустой проём 1900×1000',
					data: {
						"formatVersion": 1,
						"aperture": {
							"size": { "vertical": 1000, "horizontal": 1900 },
							"content": null
						}
					}
				},

				// 2
				{
					name: 'Только квадратная рама 1000×1000',
					data: {
						"formatVersion": 1,
						"aperture": {
							"size": { "vertical": 1000, "horizontal": 1000 },
							"content": {
								"type": "frame",
								"properties": {
									"sizes": { "heightFront": 48, "heightRear": 68, "beadHeight": 18 }
								},
								"aperture": {}
							}
						}
					}
				},


				// 2
				{
					name: 'Квадратная рама 1000×1000 с остеклением',
					data: {
						"formatVersion": 1,
						"aperture": {
							"size": { "vertical": 1000, "horizontal": 1000 },
							"content": {
								"type": "frame",
								"properties": {
									"sizes": { "heightFront": 48, "heightRear": 68, "beadHeight": 18 }
								},
								"aperture": {
									"content": {
										"type": "glass"
									}
								}
							}
						}
					}
				},


				// 2
				{
					name: 'Квадратная рама 1000×1000 со створкой с остеклением',
					data: {
						"formatVersion": 1,
						"aperture": {
							"size": { "vertical": 1000, "horizontal": 1000 },
							"content": {
								"type": "frame",
								"properties": {
									"sizes": { "heightFront": 48, "heightRear": 68, "beadHeight": 18 }
								},
								"aperture": {
									"content": {
										"type": "sash",
										"properties": {
											"handleSide": "left",
											"tilt": true,
											"sizes": { "labelPadding": 20, "heightFront": 52, "heightRear": 72, "overlap": 8, "beadHeight": 18 }
										},
										"aperture": {
											"content": {
												"type": "glass"
											}
										}
									}
								}
							}
						}
					}
				},


		// 3
				{
					name: 'Рама 2000×1500 с импостом со смещением',
					data: {
						"formatVersion": 1,
						"aperture": {
							"size": { "vertical": 1500, "horizontal": 2000 },
							"content": {
								"type": "frame",
								"properties": {
									"sizes": { "heightFront": 48, "heightRear": 68, "beadHeight": 18 }
								},
								"aperture": {
									"content": {
										"type": "impost",
										"properties": {
											"offsetLeft": -200,
											"direction": "vertical",
											"sizes": { "heightFront": 48, "heightRear": 88, "beadHeight": 18 }
										},
										aperture: [
											{
												side: 'left',
											},
											{
												side: "right",
											}
										]
									}
								}
							}
						}
					}
				},


				// 3
				{
					name: 'Рама с двумя створками без остекления 2000×1500',
					data: {
						"formatVersion": 1,
						"aperture": {
							"size": { "vertical": 1500, "horizontal": 2000 },
							"content": {
								"type": "frame",
								"properties": {
									"sizes": { "heightFront": 48, "heightRear": 68, "beadHeight": 18 }
								},
								"aperture": {
									"content": {
										"type": "impost",
										"properties": {
											"offsetLeft": 0,
											"direction": "vertical",
											"sizes": { "heightFront": 48, "heightRear": 88, "beadHeight": 18 }
										},
										aperture: [
											{
												side: 'left',
												content: {
													"type": "sash",
													"properties": {
														"handleSide": "right",
														"sizes": { "labelPadding": 20, "heightFront": 52, "heightRear": 72, "overlap": 8, "beadHeight": 18 }
													},
													"aperture": {
													}
												}
											},
											{
												side: "right",
												content: {
													"type": "sash",
													"properties": {
														"handleSide": "left",
														"tilt": false,
														"sizes": { "labelPadding": 20, "heightFront": 52, "heightRear": 72, "overlap": 8, "beadHeight": 18 }
													},
													"aperture": {
													}
												}
											}
										]
									}
								}
							}
						}
					}
				},


				// 10
				{
					name: 'Глухое окно и две створки 2800×1600',
					data: {
						"formatVersion": 1,
						"aperture": {
							"size": { "vertical": 1600, "horizontal": 2800 },
							"content": {
								"type": "frame",
								"properties": {
									"sizes": { "heightFront": 48, "heightRear": 68, "beadHeight": 18 }
								},
								"aperture": {
									"content": {
										"type": "impost",
										"properties": {
											"offsetLeft": -100,
											"direction": "vertical",
											"sizes": { "heightFront": 48, "heightRear": 88, "beadHeight": 18 }
										},
										aperture: [
											{
												side: "left",
												content: {
													"type": "impost",
													"properties": {
														"offsetLeft": 0,
														"direction": "vertical",
														"sizes": { "heightFront": 48, "heightRear": 88, "beadHeight": 18 }
													},
													aperture: [
														{
															side: 'left',
															"content": {
																"type": "glass",
																"properties": {
																	"sizes": { "beadHeight": 18 }
																}
															}
														},
														{
															side: 'right',
															content: {
																"type": "sash",
																"properties": {
																	"handleSide": "top",
																	"sizes": { "labelPadding": 20, "heightFront": 52, "heightRear": 72, "overlap": 8, "beadHeight": 18 }
																},
																"aperture": {
																	"content": {
																		"type": "glass",
																		"properties": {
																			"sizes": { "beadHeight": 18 }
																		}
																	}
																}
															}
														}
													]
												}
											},
											{
												side: "right",
												content: {
													"type": "sash",
													"properties": {
														"handleSide": "left",
														"tilt": true,
														"sizes": { "labelPadding": 20, "heightFront": 52, "heightRear": 72, "overlap": 8, "beadHeight": 18 }
													},
													"aperture": {
														"content": {
															"type": "glass",
															"properties": {
																"sizes": {}
															}
														}
													}
												}
											}
										]
									}
								}
							}
						}
					}
				} // 10

			]

		});

})();