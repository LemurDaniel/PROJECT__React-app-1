import React from 'react'


const Loading = props => {
    return (
        
        <div style={ props } className=" border-8 rounded-full animate-spin" />
        
    )
}

Loading.defaultProps = {
    'border-color': '#242e42',
    'border-top-color': '#00fe2c',
    height: 100, 
    width: 100
}

export default Loading
