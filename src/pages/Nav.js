import React from 'react'


const Nav = () => {

    return (

        <nav className="p-5 px-5 bg-dark-700 flex justify-between text-white font-bold">

            <a href="/CurrencyCalculator"
                className="btn-header active"
            >Currency Calculator</a>

            <a href="/MaggiTable"
                className="btn-header"
            >Maggi Table</a>

        </nav>


    )

}

export default Nav;