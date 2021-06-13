import React from 'react'
import PropTypes from 'prop-types'

const Header = ({ title }) => {
    return (
        <header className="header">
            <h1 className='font-bold text-4xl text-brand2-300'>{title}</h1>
            <button className=' text-sm md:text-lg '>Add Task</button>
        </header>
    )
}



Header.defaultProps = {
    title: 'Task Tracker'
}

Header.propTypes = {
    title: PropTypes.string.isRequired,
}

export default Header
