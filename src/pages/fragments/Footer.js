import React from 'react'


const Footer = () => {

    return (

        <footer className="px-5 fixed bottom-0 w-full bg-dark-100 flex justify-between text-white font-bold">

            <a href="/CurrencyCalculator"
                className="btn-header active"
            >Currency Calculator</a>

            <a href="/MaggiTable"
                className="btn-header"
            >Maggi Table</a>

        </footer>

    )

}

export default Footer;