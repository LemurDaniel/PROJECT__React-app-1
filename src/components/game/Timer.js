import React, { useEffect } from 'react';

const Timer = ({ticks, setTicks, pause}) => {

    useEffect(() => {
        if(pause) return;
        const ticker = setInterval( () => setTicks(t => t+1), 1000)
        return () => clearInterval(ticker);
    },[ticks, pause])
    
    const sec = ticks % 60;
    const min = Math.floor(ticks / 60) % 60;
    const h   = Math.floor(ticks / 3600);

    let str = h <= 0 ? '' : (h+':');
    str += (min < 10 ? '0' : '') + min + ':';
    str += (sec < 10 ? '0' : '') + sec;

    return (
        <>
            <p>{str}</p>
        </>
    )
}

export default Timer
