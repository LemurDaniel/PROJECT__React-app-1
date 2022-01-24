import React, { useEffect, useRef } from 'react'

import { BiEraser } from 'react-icons/bi'
import { MdAutorenew } from 'react-icons/md'

const Strokecontrol = ({ size, widthMin, widthMax, width, setWidth, color, setColor, rubber, setRubber, onClearCanvas }) => {

    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;

        // Note https://coderwall.com/p/vmkk6a/how-to-make-the-canvas-not-look-like-crap-on-retina
        canvas.height = size * 2;
        canvas.width = size * 2;
        canvas.style.width = size + 'px'
        canvas.style.height = size + 'px';

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


    // Detects and disables hovereffect on touchscreens to fix bug with rubber button.
    const isTouchDevice = navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

    return (
        <div className="m-5 flex justify-evenly ">

            <div className="mx-1 ">
                <MdAutorenew className={"rounded-inactive " + (!isTouchDevice ? 'hoverable' : '')} onClick={onClearCanvas} />
            </div>

            <div className="mx-1">
                {rubber ?
                    <BiEraser className={"rounded-active " + (!isTouchDevice ? 'hoverable' : '')} onClick={e => setRubber(false)} />
                    :
                    <BiEraser className={"rounded-inactive " + (!isTouchDevice ? 'hoverable' : '')} onClick={e => setRubber(true)} />
                }
            </div>

            <div className="relative mx-1">
                <div className="bg-white rounded-full  hover:bg-blue-100 duration-300">
                    <canvas ref={canvasRef} height={size} width={size} />
                    <input style={{ height: size, width: size }} className="opacity-0 absolute top-0"
                        type="color" value={color} onChange={e => setColor(e.target.value)} />
                </div>
            </div>

            <div className="mx-1 my-2">
                <input type="range" min={widthMin} max={widthMax} value={width} onChange={e => setWidth(e.target.value)} />
            </div>
        </div>
    )
}

Strokecontrol.defaultProps = {
    widthMax: 25,
    widthMin: 2,
    size: 35,
}

export default Strokecontrol
