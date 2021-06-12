import React from 'react'
import PropTypes from 'prop-types'
import Button from './Button'

const Header = ({ title }) => {
    return (
        <header className="header">
            <h1 className='font-bold text-4xl text-brand2-300'>{title}</h1>
            <Button className="mx-auto" text='Add Task' />
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
