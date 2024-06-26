const { Op } = require("sequelize")
const axios = require('axios').default;
const { User, Post, Order, Category, Specialty, Question, Answer, Report, Review } = require("../db.js");

async function getAllUser(_req, res, next) { //http://localhost:3001/user --> TODA ESTA INFO DEBERIA VERLA EL ADMIN (ver si conviene una route /admin)
	try {
		let users = await User.findAll({
			//order: [["createdAt", 'DESC']], // esto es lo que hace lenta la busqueda
			include: [
				{
					model: Order,
					//	order: [["createdAt", 'DESC']],
				},
				{
					model: Report, // los que hizo
					attributes: { exclude: ['reported_user', 'post_id', 'question_id', 'answer_id', 'updatedAt'] }
				},
				{
					model: Review,
					//		order: [["createdAt", 'DESC']],
				},
				{
					model: Question,
					attributes: { exclude: ['updatedAt', "user_id", "post_id"] },
					include: {
						model: Report, // los reportes que tengan las preguntas que hizo
						attributes: { exclude: ['updatedAt'] },
						//		order: [["createdAt", 'DESC']],
					}
				},
				{
					model: Post,
					attributes: { exclude: ["user_id", "category_id", "specialty_id"] },
					//order: [["createdAt", 'DESC']],
					include: [
						{
							model: Category,
							attributes: ["id", "title"]
						},
						{
							model: Specialty,
							attributes: ["id", "title"]
						},
						{
							model: Report, // los reports que tienen sus posteosi
							attributes: { exclude: ['reportSubject', 'reported_user', 'user_id', 'post_id', 'question_id', 'answer_id', 'isSettled', 'updatedAt'] },
							// order: [["createdAt", 'DESC']],
						},
						{
							model: Question,
							attributes: { exclude: ['post_id', 'user_id', "isActive", 'updatedAt'] },
							//	order: [["createdAt", 'ASC']],
							include: [
								{
									model: Answer,
									attributes: { exclude: ['question_id', 'isActive', 'updatedAt'] },
									//	order: [["createdAt", 'ASC']],
									include: {
										model: Report, // los reports que tienen sus respuestas
										attributes: { exclude: ['reportSubject', 'reported_user', 'user_id', 'post_id', 'question_id', 'answer_id', 'isSettled', 'updatedAt'] }
									}
								}
							]
						},
					]
				}
			]
		});
		res.json(users);
	} catch (err) {
		next(err); i
	};
};

async function getUserById(req, res, next) {
	let { idUser } = req.params;
	if (idUser && idUser.length === 36) { // 36 es la length del UUID /// TODA ESTA INFO DEBERIA VERLA SOLO EL ADMIN
		try {
			let result = await User.findOne({
				where: {
					id: idUser
				},
				include: [
					{
						model: Order,
						order: [["createdAt", 'DESC']],
					},
					{
						model: Report, // los que hizo
						attributes: { exclude: ['reported_user', 'post_id', 'question_id', 'answer_id', 'updatedAt'] }
					},
					{
						model: Review,
						order: [["createdAt", 'DESC']],
					},
					{
						model: Question,
						attributes: { exclude: ['updatedAt', "user_id", "post_id"] },
						include: {
							model: Report, // los reportes que tengan las preguntas que hizo
							attributes: { exclude: ['updatedAt'] },
							order: [["createdAt", 'DESC']],
						}
					},
					{
						model: Post,
						attributes: { exclude: ["user_id", "category_id", "specialty_id"] },
						order: [["createdAt", 'DESC']],
						include: [
							{
								model: Category,
								attributes: ["id", "title"]
							},
							{
								model: Specialty,
								attributes: ["id", "title"]
							},
							{
								model: Review,
								attributes: ["rating", "isValidated"]
							},
							{
								model: Report, // los reports que tienen sus posteosi
								attributes: { exclude: ['reportSubject', 'reported_user', 'user_id', 'post_id', 'question_id', 'answer_id', 'isSettled', 'updatedAt'] },
								order: [["createdAt", 'DESC']],
							},
							{
								model: Question,
								attributes: { exclude: ['post_id', 'user_id', "isActive", 'updatedAt'] },
								order: [["createdAt", 'ASC']],
								include: [
									{
										model: Answer,
										attributes: { exclude: ['question_id', 'isActive', 'updatedAt'] },
										order: [["createdAt", 'ASC']],
										include: {
											model: Report, // los reports que tienen sus respuestas
											attributes: { exclude: ['reportSubject', 'reported_user', 'user_id', 'post_id', 'question_id', 'answer_id', 'isSettled', 'updatedAt'] }
										}
									}
								]
							},
						]
					}
				]
			});
			if (result) res.json(result);
			else throw new Error('ERROR 500: El usuario no fue encontrado en la base de datos (UUID no existe).');
		} catch (err) {
			next(err);
		};
	};
	if (idUser && idUser.length !== 36) {
		try {
			throw new TypeError('ERROR 404: ID inválido (ID no es un tipo UUID válido).')
		} catch (err) {
			next(err);
		}
	};
};

async function createUser(req, res, next) {
	let { given_name, family_name, sub, age, ID_Passport, address, phoneNumber, email, summary, picture, score, jobsDone, isVaccinated, isAdmin } = req.body;
	// hacer un if donde si el email es "adminuser@admin.com", el isAdmin = true y isDataComplete = true
	//console.log(req.body)

	if (email === "mambito1998@gmail.com" || email === "dariiooo710@gmail.com" || email === "mmiglioranza22@gmail.com") {
		isAdmin = true;
	};
	try {
		let [newUser, isCreated] = await User.findOrCreate({ // en el login con google, crea el usuario con pocos datos (given_name, family_name, sub, email...)
			where: {
				sub,
				given_name,
				family_name,
				age,
				ID_Passport,
				address,
				phoneNumber,
				email,
				//email_verified,
				summary,
				picture,
				score,
				jobsDone,
				isVaccinated,
				isAdmin,
			},
			include: [
				// cuando se crea, esto nunca va a devolverse aunque este escrito aca, porque la primera vez se le asigna un ID y ahi crea las FK. 
				// Tendria que hacer un nuevo User.findOne con el id creado para que traiga las tablas vinculada, creo
				{
					model: Order,
				},
				{
					model: Report,
				},
				{
					model: Review,
				},
				{
					model: Question, // las que el hizo a otros posts
				},
				{
					model: Post,
					attributes: { exclude: ["user_id", "category_id", "specialty_id"] },
					include: [
						{
							model: Category,
							attributes: ["id", "title"]
						},
						{
							model: Specialty,
							attributes: ["id", "title"]
						},
						{
							model: Report // VER SI ES PERTINENTE TRAER ESTO ACA
						},
						{
							model: Question,
							include: {
								model: Answer,
								include: {
									model: Report
								}
							}
						},
					]
				}
			]
		});
		return res.json(newUser); // se envia el user recien creado con pocos datos al front
	} catch (err) {
		try {

			let updatedUser = await User.findOne({ // busca nuevo usuario actualizado y lo devuelve con todas las tablas asociadas
				where: {
					sub: req.body.sub,
				},
				include: [
					{
						model: Order,
					},
					{
						model: Report,
					},
					{
						model: Review, // TAMBIEN DEBERIA REPORTARSE LOS
					},
					{
						model: Question, // las que el hizo a otros posts
					},
					{
						model: Post,
						attributes: { exclude: ["user_id", "category_id", "specialty_id"] },
						include: [
							{
								model: Category,
								attributes: ["id", "title"]
							},
							{
								model: Specialty,
								attributes: ["id", "title"]
							},
							{
								model: Report // VER SI ES PERTINENTE TRAER ESTO ACA
							},
							{
								model: Question,
								include: [
									{
										model: Answer,
										include: {
											model: Report
										}
									}
								]
							},
						]
					},
				]
			});
			return res.json(updatedUser); // se envia el user modificado al front
		} catch (error) {
			next(error)
		}
		/* next(err) */;
	};
};

async function updateUser(req, res, next) { // hacer cambios para poder setear score (desde UserProfile.jsx) Y jobsDone (desde modalReviewValidate.jsx) 
	//let { sub } = req.body;
	let changes = req.body;
	changes = { ...changes, isDataComplete: true } // como el usuario ya existia y ahora manda datos completos, se setea isDataComplete a true
	if (req.body.sub) {
		try {
			await User.update(changes, { // actualiza datos
				where: {
					sub: req.body.sub
				}
			});
			let updatedUser = await User.findOne({ // busca nuevo usuario actualizado y lo devuelve con todas las tablas asociadas
				where: {
					sub: req.body.sub,
				},
				include: [
					{
						model: Order,
					},
					{
						model: Report,
					},
					{
						model: Review, // TAMBIEN DEBERIA REPORTARSE LOS
					},
					{
						model: Question, // las que el hizo a otros posts
					},
					{
						model: Post,
						attributes: { exclude: ["user_id", "category_id", "specialty_id"] },
						include: [
							{
								model: Category,
								attributes: ["id", "title"]
							},
							{
								model: Specialty,
								attributes: ["id", "title"]
							},
							{
								model: Report // VER SI ES PERTINENTE TRAER ESTO ACA
							},
							{
								model: Question,
								include: [
									{
										model: Answer,
										include: {
											model: Report
										}
									}
								]
							},
						]
					},
				]
			});
			return res.json(updatedUser); // se envia el user modificado al front
		} catch (err) {
			next(err);
		};
	} else {
		try {
			throw new Error("ERROR 404: El sub del usuario no esta siendo enviado por req.body") // a ser modificado
		} catch (err) {
			next(err);
		};
	}
	// update previo, que filtraba por id
	//
	// let { idUser } = req.params;
	// let changes = req.body;
	// // contemplar el caso de hacer un if completo si isDataComplete viene en false, o directamente poner siempre en isDataComplete en true, venga lo que venga.
	// // habria que en tal caso manipular lo que viene por req.body y hacer desctructuring.
	// try {
	// 	await User.update(changes, {
	// 		where: {
	// 			id: idUser
	// 		}
	// 	});
	// 	let updatedUser = await User.findOne({ // await User.findByPk(idUser);
	// 		where: {
	// 			id: idUser
	// 		},
	// 		include: {
	// 			model: Post,
	// 			attributes: { exclude: ["user_id", "category_id", "specialty_id"] },
	// 			include: [
	// 				{
	// 					model: Category,
	// 					attributes: ["id", "title"]
	// 				},
	// 				{
	// 					model: Specialty,
	// 					attributes: ["id", "title"]
	// 				}
	// 			]
	// 		}
	// 	});
	// 	res.json(updatedUser); // se envia el user modificado al front
	// } catch (err) {
	// 	next(err);
	// };
};

async function deleteUser(req, res, next) {
	let { idUser } = req.params;
	try {
		let existsInDB = await User.findByPk(idUser); // primero busca si existe el user en la DB. Si existe lo guarda en esta variable 
		if (existsInDB) {
			await User.destroy({ // de existir, lo destruye
				where: {
					id: idUser
				}
			});
			return res.json(existsInDB); // devuelve el post eliminado como el metodo pop()
		} else {
			throw new Error('ERROR 500: El usuario no fue encontrado en la base de datos (UUID no existe).');
		}
	} catch (err) {
		next(err);
	};
};


module.exports = {
	getAllUser,
	getUserById,
	createUser,
	updateUser,
	deleteUser
};