import React, { useEffect, useState } from 'react'

const Loading = ({ style, text, error, loading, fadeTime, onFinished }) => {

    const [opacity, setOpacity] = useState(100);
    useEffect(() => {
        if (loading) setOpacity(100);
    }, [loading])
    useEffect(() => {
        if (loading) return;
        else if (opacity === 0) return onFinished();
        else setTimeout(() => setOpacity(opacity - 1), Math.floor(fadeTime / 100))
    }, [loading, opacity, fadeTime, onFinished])

    return (
        <div style={{ opacity: opacity / 100 }} className="font-bold text-lg text-center">

            {loading ?
                <div style={style} className=" border-8 rounded-full animate-spin" />
                :

                (error.length === 0 ?
                    <p className="text-brand2-400 bg-white rounded-sm"> {text} </p>
                    :
                    <p className="text-brand2-300 bg-white rounded-sm"> {error} </p>
                )
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
    fadeTime: 900,
    onFinished: () => null
}


export default Loading
