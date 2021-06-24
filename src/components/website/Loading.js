import React, { useEffect, useState } from 'react'

const Loading = ({style, text, loading, fadeTime, onFinished}) => {

    const [opacity, setOpacity] = useState(100);
    useEffect(() => {
        if(loading) setOpacity(100);
    }, [loading])
    useEffect(() => {
        if(loading) return;
        else if(opacity === 0) return onFinished();
        else setTimeout(() => setOpacity(opacity-1), Math.floor(fadeTime/100) )
    }, [loading, opacity, fadeTime, onFinished])

    console.log(loading)
    return (
        <div style={{ opacity: opacity/100 }} className="font-bold text-lg text-center">

            { loading ?
                <div style={style} className=" border-8 rounded-full animate-spin" />
                :
                <p > {text} </p> 
            }
        </div>
    )
}

Loading.defaultProps = {
    style: {
        'border-color': '#242e42',
        'border-top-color': '#00fe2c',
        height: 100,
        width: 100
    },
    fadeTime: 700,
    onFinished: () => null
}


export default Loading
