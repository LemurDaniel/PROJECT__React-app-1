import React, { useEffect, useRef } from 'react'

import { BiEraser } from 'react-icons/bi'

const Strokecontrol = ({ size, widthMin, widthMax, width, setWidth, color, setColor, rubber, setRubber }) => {

    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;

        // Note https://coderwall.com/p/vmkk6a/how-to-make-the-canvas-not-look-like-crap-on-retina
        canvas.height = size * 2;
        canvas.width = size * 2;
        canvas.style.width = size + 'px'
        canvas.style.height = size + 'px';

        // Scale  once.
        canvas.getContext('2d').scale(2, 2);
    }, [canvasRef, size])

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(1, 0, 0, 1, size, size);

        ctx.beginPath();
        ctx.strokeStyle = '#00000';
        ctx.fillStyle = color;

        ctx.arc(0, 0, width, 0, 2 * Math.PI);
        ctx.stroke()
        ctx.fill();

    }, [width, color, size])

    return (
        <div className="m-5 flex justify-evenly ">
            <BiEraser className={rubber ? "rounded-inactive" : "rounded-active"} onClick={e => setRubber(!rubber)} />

            <div className="relative">
                <div className="bg-white rounded-full  hover:bg-blue-100 duration-300">
                    <canvas ref={canvasRef} height={size} width={size} />
                    <input style={{ height: size, width: size }} className="opacity-0 absolute top-0"
                        type="color" value={color} onChange={e => setColor(e.target.value)} />
                </div>
            </div>

            <input type="range" min={widthMin} max={widthMax} value={width} onChange={e => setWidth(e.target.value)} />
        </div>
    )
}

Strokecontrol.defaultProps = {
    widthMax: 25,
    widthMin: 2,
    size: 35,
}

export default Strokecontrol
