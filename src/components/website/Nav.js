import React, { useContext, useEffect, useState } from 'react'
import UserContext from '../UserContext';
import { Link } from 'react-router-dom';

const navigations = [
    {
        title: 'Tasks',
        url: '/taskTracker'
    },
    {
        title: 'Gallery',
        url: '/gallery'
    },
    {
        title: 'Doodle',
        url: '/drawing'
    },
    {
        title: 'Asteroids',
        url: '/game'
    },
]


const Nav = () => {

    const { meta } = useContext(UserContext)

    const [path, setPath] = useState(window.location.pathname);


    return (

        <nav className="px-5 py-1 fixed w-full top-0 z-50 border-b border-brand2-100 bg-dark-700 flex justify-evenly text-white font-bold">

            {navigations.map((nav, i) => (
                <Link key={i} to={!meta.user ? '/' : nav.url} onClick={ e => setPath(!meta.user ? '/' : nav.url) }
                    className={"py-1 hover:underline " + (nav.url === path ? "text-brand2-100" : "")} >
                    {nav.title}
                </Link>
            ))}

            <a className="py-1 hover:underline" href="/user/logout">Logout</a>

        </nav>


    )

}

export default Nav;