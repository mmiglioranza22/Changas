const { Router } = require('express');
const { User, Post, Order } = require("../../db.js");
const router = Router();

// SDK de Mercado Pago
const mercadopago = require('mercadopago');
const { MP_ACCESS_TOKEN } = process.env;

const ACCESS_TOKEN = MP_ACCESS_TOKEN;

// Agrega credenciales
mercadopago.configure({
	access_token: ACCESS_TOKEN
});
// Ruta que recibe la informacion del pago PROPIA

router.get('/success', async (req, res, next) => {

	const payment_id = req.query.payment_id
	const payment_status = req.query.status
	const external_reference = req.query.external_reference
	const merchant_order_id = req.query.merchant_order_id
	const preference_id = req.query.preference_id // ID DE MP

	let infoMP = {
		payment_id,
		payment_status,
		merchant_order_id,
		status: "completed",
		mp_id: preference_id,
		isCompleted: true
	}

	let orderDB = await Order.findByPk(external_reference); // busco la order, que tiene el post_id

	let chosenPack;
	if (orderDB.title.toLowerCase() === 'semanal') chosenPack = 1;
	if (orderDB.title.toLowerCase() === 'quincenal') chosenPack = 2;
	if (orderDB.title.toLowerCase() === 'mensual') chosenPack = 3;

	try {
		let changes = { isPremium: true, pack: chosenPack };
		await Post.update(changes, {
			where: {
				id: orderDB.post_id
			}
		})
	} catch (err) {
		next(err);
	}

	// actualiza la order con los datos de MP
	try {

		await Order.update(infoMP, {
			where: {
				id: external_reference
			}
		});
		console.info('Guardando order en DB con datos de MP: SUCCESS')
		return res.redirect(`https://changas.vercel.app/paymentsuccesstest/${external_reference}`)

	} catch (err) {
		next(err);
	};
});


router.get('/failure', async (req, res, next) => {
	console.info("EN LA RUTA PAGOS ", req)
	const payment_id = req.query.payment_id
	const payment_status = req.query.status
	const external_reference = req.query.external_reference
	const merchant_order_id = req.query.merchant_order_id

	// const collection_id = req.query.collection_id

	// const payment_type = req.query.payment_type
	const preference_id = req.query.preference_id // ID DE MP


	let infoMP = {
		payment_id,
		payment_status,
		merchant_order_id,
		status: "cancelled",
		mp_id: preference_id,
		isCompleted: false
	}

	//let orderDB = await Order.findByPk(external_reference);

	try {

		await Order.update(infoMP, {
			where: {
				id: external_reference
			}
		});
		console.info('Guardando order en DB con datos de MP: FAILURE')
		return res.redirect(`http://localhost:3000/paymentfailuretest/${external_reference}`)

	} catch (err) {
		next(err);
	}
})

//Ruta que genera la URL de MercadoPago

router.get("/:id", async (req, res, next) => { // localhost:3001/testcheckout  

	let { id } = req.params;

	let order = await Order.findByPk(id);

	const carrito = [
		{ title: order.title, quantity: order.quantity, price: order.price },
	];

	const items_ml = carrito.map(i => ({
		title: i.title,
		unit_price: i.price,
		quantity: i.quantity,
	}))

	// Crea un objeto de preferencia
	let preference = {
		items: items_ml,
		external_reference: `${order.id}`,
		payment_methods: {
			excluded_payment_types: [
				{
					id: "atm"
				}
			],
			installments: 1
		},
		back_urls: {
			success: 'https://changas.herokuapp.com/testcheckoutback/success',
			failure: 'https://changas.herokuapp.com/testcheckoutback/failure',
			pending: 'https://changas.herokuapp.com/testcheckoutback/pending',
		},
	};

	let mpData = [ // que muestra la data mas importante, no todo el body.
		'client_id', 'collector_id',
		'date_created', 'external_reference',
		'id', 'init_point',
		'items',
		'operation_type',
		'payment_methods', 'redirect_urls',
		'sandbox_init_point', 'total_amount',
		'last_updated'
	];

	mercadopago.preferences.create(preference)
		.then(function (response) {
			global.id = response.body.id;
			global.id_db = response.body.external_reference;
			mpData.forEach(d => console.log({ [`${d}`]: response.body[d] }));
			res.json({ id: global.id, id_db: global.id_db });
		})
		.catch(function (err) {
			next(err)
		})
});


//Ruta que recibe la información del pago
// router.get("/pagos", (req, res) => {              // no entiendo bien esta parte, a MP a buscar datos de pago??
// 	console.info("EN LA RUTA PAGOS ", req)
// 	const payment_id = req.query.payment_id
// 	const payment_status = req.query.status
// 	const external_reference = req.query.external_reference
// 	const merchant_order_id = req.query.merchant_order_id


// 	//Aquí edito el status de mi orden --> pero en MP o en la DB??
// 	Order.findByPk(external_reference)
// 		.then((order) => {
// 			order.payment_id = payment_id
// 			order.payment_status = payment_status
// 			order.merchant_order_id = merchant_order_id
// 			order.status = "completed" // isComplete = true y status = 'approved'
// 			console.info('Salvando order')
// 			order.save()                // entiendo que esto tira un popup para guardar la order en la computadora del user. Si no, no entiendo que hace
// 				.then((_) => {
// 					console.info('redirect success')

// 					return res.redirect("http://localhost:3000")
// 				})
// 				.catch((err) => {
// 					console.error('error al salvar', err)
// 					return res.redirect(`http://localhost:3000/?error=${err}&where=al+salvar`)
// 				})
// 		})
// 		.catch(err => {
// 			console.error('error al buscar', err)
// 			return res.redirect(`http://localhost:3000/?error=${err}&where=al+buscar`)
// 		})

// 	//proceso los datos del pago 
// 	//redirijo de nuevo a react con mensaje de exito, falla o pendiente
// })


// //Busco información de una orden de pago
// router.get("/pagos/:id", (req, res) => {
// 	const mp = new mercadopago(ACCESS_TOKEN)
// 	const id = req.params.id
// 	console.info("Buscando el id", id)
// 	mp.get(`/v1/payments/search`, { 'status': 'pending' }) //{"external_reference":id})
// 		.then(resultado => {
// 			console.info('resultado', resultado)
// 			res.json({ "resultado": resultado })
// 		})
// 		.catch(err => {
// 			console.error('No se consulto:', err)
// 			res.json({
// 				error: err
// 			})
// 		})
// })

module.exports = router;