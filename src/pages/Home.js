import React, { useContext } from 'react'

import Clock from '../components/Clock'
import Authorization from '../components/Authorization'
import UserContext from '../components/UserContext'


const Home = () => {

  const { meta } = useContext(UserContext)

  return (
    <div className="flex-col flex">

      {!meta.user ? <Authorization /> : (

        <>
          <div className="mt-4">
            <Clock size={200} digital={false} />
          </div>

          <div className="pt-4 mx-auto text-white text-4xl text-center">
            <h1 className="pb-5">You are logged in as: </h1>
            <i className="text-brand2-100 underline">{meta.user} </i>
          </div>
        </>
      )
      }

    </div>
  )
}

export default Home
