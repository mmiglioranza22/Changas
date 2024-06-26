import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearSinglePost, getSinglePost, getReviewAverage } from '../../Redux/actions'
import FavoriteComponent from '../FavoriteComponent/FavoriteComponent';
import SafeTips from "../SafeTips/SafeTips";
import Reviews from "../Review/Reviews";
import { useAuth0 } from "@auth0/auth0-react";
import Questions from '../Question/Questions';
import MapComponent from '../MapComponent/MapComponent';
import Rating from '../Review/Rating';


function DetailComponent() {
    const { isAuthenticated } = useAuth0();
    const dispatch = useDispatch();
    // const userLogin = useSelector(state => state.userLogin);
    const singlePost = useSelector(state => state.singlePost);

    const { title, image, description, priceRange, category, specialty, location, paymentMethods, timeRange } =

        useSelector((state) => state.singlePost);

    const postRatingAverage = useSelector(state => state.postRatingAverage)

    let { id } = useParams();

    useEffect(() => {
        dispatch(getSinglePost(id));
        dispatch(getReviewAverage(id)) // esta accion tiene que estar en el modalReviewValidate, y dispararse solo cuando acepta reviews (se proteje de mala fe/competencia, pero no se favorece al chanta)
        dispatch(clearSinglePost());
    }, [dispatch, id]);


    return (
        <>
            {
                singlePost ?
                    <section className="text-gray-600 body-font overflow-hidden">
                        <div className="container px-5 py-24 mx-auto">
                            <div className="lg:w-4/5 mx-auto flex flex-wrap">
                                <img alt="ecommerce" className="lg:w-1/2 w-full lg:h-auto h-64 object-cover object-center rounded" src={image} />
                                <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0 relative">
                                    <div className="absolute top-0 right-0">
                                        <FavoriteComponent id={id} title={title} img={image} />
                                    </div>
                                    <h1 className="text-gray-900 text-3xl title-font font-medium mb-1">{title}</h1>
                                    <h2 className="text-sm title-font text-gray-500 tracking-widest">{category?.title}</h2>
                                    <h2 className="text-sm title-font text-gray-500 tracking-widest">{specialty?.title}</h2>
                                    <p className="m-2 leading-relaxed"> Puntaje promedio: <Rating rating={postRatingAverage} /> </p>
                                    <div className="flex justify-around">
                                        <p className=" m-2 leading-relaxed">
                                            {" "}
                                            <b>Metodos de pago:</b> {" "}
                                            {paymentMethods &&
                                                paymentMethods?.map((metodo) => <li key={metodo.indexOf()} className='text-left list-none'>{`- ${metodo}`}</li>)}{" "}
                                        </p>

                                        <p className=" m-2 leading-relaxed">
                                            {" "}
                                            <b>Horarios:</b> {" "}

                                            {timeRange &&
                                                timeRange?.map((horario) => (
                                                    <li className="text-left list-none" key={horario.indexOf()}>{`- ${horario[0].toUpperCase() + horario.slice(1)}`}</li>
                                                ))}

                                            {" "}
                                        </p>
                                    </div>

                                    <p className="m-2 leading-relaxed pb-2">"{description}"</p>
                                    <div className="flex flex-row">
                                        <div className="title-font font-medium text-2xl text-gray-900">Precio Base: {!isNaN(priceRange) ? <span>${priceRange}</span> : <span>{priceRange}</span>}</div>
                                        <SafeTips />
                                    </div>
                                    <div className="flex flex-row justify-between space-x-2">
                                        <div>
                                            {isAuthenticated /* && user?.id !== userLogin?.id*/ ? /*el boton se renderiza si esta autenticado Y el usuario del login NO es el usuario del posteo */

                                                <Link to={`/reviews`} className="flex pt-4 ml-auto"><button className="flex ml-auto text-white bg-blue-600 border-0 py-2 px-6 focus:outline-none hover:bg-blue-500 rounded">Dejar reseña</button></Link>

                                                : null}
                                        </div>
                                        <div>
                                            {isAuthenticated /*&& user?.id !== userLogin?.id */ ?
                                                <Link to={`/question`} className="flex pt-4 ml-auto"><button className="flex ml-auto text-white bg-blue-600 border-0 py-2 px-6 focus:outline-none hover:bg-blue-500 rounded">Hacer pregunta</button></Link>
                                                : null}
                                        </div>

                                        <div>
                                            {isAuthenticated /*&& user?.id !== userLogin?.id */ ?

                                                <Link to={`/report/post/${id}`} className="flex pt-4 ml-auto"><button className="flex ml-auto text-white bg-blue-600 border-0 py-2 px-6 focus:outline-none hover:bg-red-600 rounded">Reportar anuncio</button></Link>
                                                : null}
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="pt-6 grid grid-row justify-center auto-cols-auto" >
                                <h2 className="text-gray-900 pb-4 text-2xl title-font font-medium mb-1">{`Esta publicación aplica para ${location?.name}:`}</h2>
                                <div style={{ width: "800px", height: "200px" }} >
                                    <MapComponent googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process.env.REACT_APP_GOOGLE_KEY}`}
                                        location={location}
                                        loadingElement={<div style={{ height: `100%` }} />}
                                        containerElement={<div style={{ height: `100%` }} />}
                                        mapElement={<div style={{ height: `100%` }} />} />
                                </div>
                            </div>
                        </div>

                        <div className="self-center place-content-center">
                            <Reviews />
                        </div>
                        <div className="self-center place-content-center">
                            <Questions questions={singlePost?.questions} />
                        </div>

                    </section> :
                    <div>Cargando</div>}

        </>
    )
}

export default DetailComponent;
