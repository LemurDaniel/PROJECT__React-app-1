import React, { useContext } from 'react'

import Clock from '../components/Clock'
import Authorization from '../components/Authorization'
import UserContext from '../components/UserContext'


const Home = () => {

    const { meta } = useContext(UserContext)

    return (
        <div className="flex-col flex">   

            { !meta.token ? <Authorization /> : (
              
              <>
                <Clock size={250} digital={false} />

                <div className="pt-4 mx-auto text-white text-4xl text-center">
                    <h1 className="pb-5">You are logged in as: </h1>
                    <i className="text-brand2-400 underline">{meta.user} </i>
                </div>
              </>
            )
            }

        </div>
    )
}

export default Home
