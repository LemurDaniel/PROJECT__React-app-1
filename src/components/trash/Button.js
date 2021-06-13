import React from 'react'
import PropTypes from 'prop-types'

const Button = ( { color, text, onClick } ) => {

    return (
        <button className={color + ' text-sm md:text-lg '} onClick={onClick}>{text}</button>
    )
}

Button.defaultProps = {
    color: 'btn-orange',
    onClick: (e) => console.log(e) 
}

Button.propTypes = {
    text: PropTypes.string,
    color: PropTypes.string,
    onClick: PropTypes.func.isRequired,
}

export default Button
