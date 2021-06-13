import React from 'react'


const Nav = ({ navigations }) => {

    navigations.forEach(nav => nav.active = nav.url === window.location.pathname );

    return (

        <nav className="px-5 fixed w-full top-0 z-50 border-b-2 border-brand2-100 bg-dark-700 flex justify-between text-white font-bold">

            {navigations.map( nav => (
                <a href={nav.url} className={"btn-header " + (nav.active ? "active" : "") } >{nav.title}</a>
            ))}

        </nav>


    )

}

export default Nav;