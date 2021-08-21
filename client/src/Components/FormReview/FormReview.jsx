import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getAllPosts, getUserAdmin, postReview } from '../../Redux/actions'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'

export default function AddFormReview(props) {

  const dispatch = useDispatch();
  const { push, goBack } = useHistory()

  //const user = useSelector(state => state.userAdmin);
  //const post = useSelector(state => state.postList);
  const singlePost = useSelector(state => state.singlePost)
  const userLogin = useSelector(state => state.userLogin);

  const [postInput, setPostInput] = useState({
    user_id: userLogin.id,
    post_id: singlePost.id,
    rating: null,
    description: "",
  })
  useEffect(() => {
    dispatch(getUserAdmin())
    dispatch(getAllPosts())
  }, [dispatch])
  function handleChange(e) {
    setPostInput(values => ({
      ...values,
      [e.target.name]: e.target.value
    }))
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(postReview(postInput))
    alert("Reseña enviada")
    push(`/posts/${singlePost.id}`) //OJO, antes de que se muestr el review, el dueño del posteo tiene que VALIDARLO
  }

  return (
    <div>
      <Header />
      {
        !singlePost.id ?
          goBack()
          :
          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="min-h-screen bg-yellow-100 py-6 flex flex-col justify-center py-12">
              <div className="py-3 max-w-md mx-auto">
                <div className="bg-white min-w-2xl flex flex-col rounded-xl shadow-lg">
                  <div className="px-12 py-5">
                    <h2 className="text-gray-800 text-3xl font-semibold">Califica el servicio</h2>
                  </div>
                  <div className="bg-blue-200 w-full flex flex-col items-center">
                    <div className="flex flex-col items-center py-6 space-y-3">
                      {/*<div className="grid grid-cols-1">
                    <label className="uppercase md:text-sm text-xs text-gray-500 text-light font-semibold">Nombre de Usuario</label>
                    <input name="user_id" disabled value={userLogin.fullName} className="text-center py-2 px-3 rounded-lg border-2 border-purple-300 mt-1 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" />
                  </div>*/}
                      <div className="grid grid-cols-1">
                        <label className="uppercase md:text-sm text-xs text-gray-500 text-light font-semibold">Publicación</label>
                        <input name="post_id" disabled value={singlePost.title} className="text-center py-2 px-3 rounded-lg border-2 border-purple-300 mt-1 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" />
                      </div>
                      <select onChange={handleChange} name='rating' className="w-50  border  hover:border-gray-500 px-4 py-2 pr-8 rounded  ">
                        <option>Calificación</option>
                        <option type='number' value='1'>1 ⭐</option>
                        <option type='number' value="2">2 ⭐⭐</option>
                        <option type='number' value="3">3 ⭐⭐⭐</option>
                        <option type='number' value="4">4 ⭐⭐⭐⭐</option>
                        <option type='number' value="5">5 ⭐⭐⭐⭐⭐</option>
                      </select>
                    </div>
                    <div className="w-3/4 flex flex-col">
                      <textarea rows="3" name="description" className="p-4 text-gray-500 rounded-xl resize-none" onChange={handleChange} autoComplete="off" placeholder="Cuéntanos tu experiencia con el servicio" />
                      <button type='submit' onClick={(e) => handleSubmit(e)} className="py-3 my-8 text-lg rounded-xl text-white  bg-indigo-500 border-0 focus:outline-none hover:bg-green-600 rounded">Enviar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
      }
      <Footer />
    </div>
  )
}
