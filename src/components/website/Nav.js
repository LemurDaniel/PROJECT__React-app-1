import React, { useContext } from 'react'
import UserContext from '../UserContext';


const Nav = ({ navigations }) => {

    navigations.forEach(nav => nav.active = nav.url === window.location.pathname );
    const { user } = useContext(UserContext)

    return (

        <nav className="px-5 fixed w-full top-0 z-50 border-b border-brand2-100 bg-dark-700 flex justify-evenly text-white font-bold">

            {navigations.map( (nav,i) => (
                <a key={i} href={ !user ? '/' : nav.url } 
                    className={"btn-header " + (nav.active ? "active" : "") } >
                        {nav.title}
                </a>
            ))}

        </nav>


    )

}

export default Nav;