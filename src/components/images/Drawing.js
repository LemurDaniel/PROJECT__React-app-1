import React, { useEffect, useRef, useState, useContext } from 'react'

import Strokecontrol from './Strokecontrol'
import UserContext from '../UserContext'


const Drawing = ({ size }) => {

    // The div containing the canvas elements is set to relative.
    // So its position must be used to calculate the mouse position on canvas.
    const canvasFrame = useRef(null)
    const canvasMain = useRef(null)
    const canvasHidden = useRef(null)
    useEffect(() => {
        const canvas = canvasMain.current;
        const hidden = canvasHidden.current;

        // Note https://coderwall.com/p/vmkk6a/how-to-make-the-canvas-not-look-like-crap-on-retina
        canvas.height = size * 4;
        canvas.width = size * 4;
        canvas.style.width = size + 'px'
        canvas.style.height = size + 'px';

        hidden.height = size * 4;
        hidden.width = size * 4;
        hidden.style.width = size + 'px'
        hidden.style.height = size + 'px';

        // Scale  once.
        canvas.getContext('2d').scale(4, 4);
        hidden.getContext('2d').scale(4, 4);

        canvas.getContext('2d').fillStyle = 'white';
        hidden.getContext('2d').fillStyle = 'white';

        canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);
        hidden.getContext('2d').fillRect(0, 0, hidden.width, hidden.height);

    }, [canvasMain, canvasHidden, size])





    const pos = { x: 0, y: 0 }
    const updatePosition = e => {

        const frame = canvasFrame.current;
        pos.x = e.clientX - frame.offsetLeft;
        pos.y = e.clientY - frame.offsetTop;

    }

    const [rubber, setRubber] = useState(false);
    const handleRubber = e => {
        console.log(e)
        if(e.button !== 2) return false;
        else if(e.type === 'mousedown') setRubber(true);
        else if(e.type === 'mouseup') setRubber(false);
    }
    const [strokeWidth, setStrokeWidth] = useState(15);
    const [strokeColor, setStrokeColor] = useState('#000000');
    const draw = e => {

        if (e.buttons !== 1 && e.buttons !== 2) return;

        const ctxMain = canvasMain.current.getContext('2d');
        const ctxHidden = canvasHidden.current.getContext('2d');

        ctxMain.beginPath();
        ctxHidden.beginPath();

        ctxMain.lineWidth = strokeWidth;
        ctxHidden.lineWidth = strokeWidth;

        // Erase with white on rightclick
        if(!rubber) {
            ctxMain.strokeStyle = strokeColor;
            ctxHidden.strokeStyle = 'black';
        } else {
            ctxMain.strokeStyle = 'white';
            ctxHidden.strokeStyle = 'white';
        }

        ctxMain.lineCap = 'round'
        ctxHidden.lineCap = 'round'

        ctxMain.moveTo(pos.x, pos.y);
        ctxHidden.moveTo(pos.x, pos.y);
        updatePosition(e);
        ctxMain.lineTo(pos.x, pos.y);
        ctxHidden.lineTo(pos.x, pos.y);

        ctxMain.stroke();
        ctxHidden.stroke();
    }

    const download = useRef(null);
    const test = e => {
        const data = canvasHidden.current.toDataURL('image/png');
        download.current.href = data;
        console.log(download.current)
        download.current.click();
    }




    const { meta } = useContext(UserContext)
    // Methods and states for sending picutre to server.
    const [title, setTitle] = useState('');
    const [path, setPath] = useState('');
    const [ml5, setMl5] = useState('');

    const sendToServer = async e => {

        const image = {
            data: canvasMain.current.toDataURL('image/png'),
            name: title.length > 0 ? title : 'My Drawing',
            path: path,
            ml5: {
                label: "Mona Lisa",
                confidence: 0.9772739410400391,
                meta: [
                    {
                        "label": "Mona_Lisa",
                        "confidence": 0.9772739410400391
                    },
                    {
                        "label": "Kommode",
                        "confidence": 0.005375720094889402
                    },
                    {
                        "label": "Eule",
                        "confidence": 0.002738814102485776
                    },
                    {
                        "label": "Tarnung",
                        "confidence": 0.0022942202631384134
                    },
                    {
                        "label": "Pullover",
                        "confidence": 0.0011353222653269768
                    },
                    {
                        "label": "Wolkenkratzer",
                        "confidence": 0.0011329142143949866
                    },
                    {
                        "label": "Kamin",
                        "confidence": 0.0010690263006836176
                    },
                    {
                        "label": "Jacke",
                        "confidence": 0.0006844614399597049
                    },
                    {
                        "label": "Unterwäsche",
                        "confidence": 0.0005997282569296658
                    },
                    {
                        "label": "Chinesische_Mauer",
                        "confidence": 0.0005635494599118829
                    }
                ]
            }
        }

        try {
            const res = await fetch(meta.endpoint + `/images?token=${meta.token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(image)
            })

            const data = await res.json();
            setPath(data.path);
            setTitle(image.name);
            console.log(data);

        } catch (err) {

        }

    }


    return (
        <div>
            <div className="w-min mx-auto flex flex-col " onMouseDown={handleRubber} onMouseUp={handleRubber}>

                <input className="mx-auto rounded-sm bg-transparent border-b  text-center text-brand2-100"
                    type="text" placeholder={'Name your drawing'} defaultValue={title} onChange={e => setTitle(e.target.value)} />

                < Strokecontrol color={strokeColor} setColor={setStrokeColor}
                    width={strokeWidth} setWidth={setStrokeWidth}
                    rubber={rubber} setRubber={setRubber}
                />

                <div ref={canvasFrame} className="relative bg-transparent" onContextMenu={ e => e.preventDefault() }>
                    <canvas className="absolute top-0"
                        ref={canvasHidden} height={size} width={size} />
                    <canvas className="relative rounded-sm bg-white"
                        ref={canvasMain} height={size} width={size}
                        onMouseDown={updatePosition} onMouseMove={draw} onMouseEnter={updatePosition} />
                </div>

                <a ref={download} download href="http://localhost/doodle" className="absolute hidden">Download</a>
                
                <button className="mt-4 px-2 mx-auto border-b rounded-sm font-bold   border-brand2-100 text-brand2-100 hover:bg-brand2-100 hover:text-dark-700 duration-300"
                    onClick={sendToServer}  >Send Image</button>

            </div>
        </div>
    )
}

Drawing.defaultProps = {
    size: 280,
    lineWidthMax: 20,
    lineWidthMin: 2,
}

export default Drawing;
