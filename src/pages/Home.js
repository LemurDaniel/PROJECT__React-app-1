import React, { useContext } from 'react'

import Clock from '../components/Clock'
import Authorization from '../components/Authorization'
import UserContext from '../components/UserContext'


const Home = () => {

    const { user } = useContext(UserContext)

    return (
        <div className="flex-col flex">   

            { !user ? <Authorization /> : (
              
              <>
                <Clock size={250} digital={false} />

                <div className="pt-4 mx-auto text-white text-4xl text-center">
                    <h1 className="pb-5">You are logged in as: </h1>
                    <i className="text-brand2-400 underline">{user} </i>
                </div>
              </>
            )
            }

        </div>
    )
}

export default Home
