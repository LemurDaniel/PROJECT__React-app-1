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


    // Load the Imageclassifier asyncroniously in the background.
    const [classifier, setClassifier] = useState(null);
    useEffect(() => {
        window.ml5.imageClassifier("DoodleNet")
        .then( cl => setClassifier(cl) )
        .catch( err => console.log(err) );
    }, [])


    // Get the translation.
    const { meta } = useContext(UserContext)
    const [translation, setTranslation] = useState({});
    useEffect(() => {
        const call = async () => {
            const res = await fetch(meta.endpoint+'/translation');
            const data = await res.json();
            setTranslation(data);
        }
        call();
    },[]);

    // classify the drawn image.
    const [ml5, setMl5] = useState(new Array(10).fill({ label: 'Not classified', confidence: 0 }));
    const [timeout, setTimeout] = useState(0);
    const classify = () => {

        if(classifier === null) return;

        const date = new Date().getTime();
        if(date <= timeout) return;
        setTimeout(date + 1 * 150)

        classifier.predict(canvasHidden.current)
        .then( res => setMl5(res.map( v => new Object({ ...v, label: translation[v.label] ?? v.label }))) )
        .catch( err => console.log(err) )

    }


    // Disable and enable the rubber.
    const [rubber, setRubber] = useState(false);
    const handleRubber = e => {
        if(e.button !== 2) return false;
        else if(e.type === 'mousedown') setRubber(true);
        else if(e.type === 'mouseup') setRubber(false);
    }

    // Set positioning for drawing.
    const pos = { x: null, y: null }
    const updatePosition = e => {

        const frame = canvasFrame.current;
        pos.x = e.clientX - frame.offsetLeft;
        pos.y = e.clientY - frame.offsetTop;

    }

    // Color, Width and darwing method.
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

        if(pos.x === null) updatePosition(e)
        ctxMain.moveTo(pos.x, pos.y);
        ctxHidden.moveTo(pos.x, pos.y);
        updatePosition(e);
        ctxMain.lineTo(pos.x, pos.y);
        ctxHidden.lineTo(pos.x, pos.y);

        ctxMain.stroke();
        ctxHidden.stroke();
        classify();
    }

    const download = useRef(null);




    // Methods and states for sending picutre to server.
    const [title, setTitle] = useState('');
    const [path, setPath] = useState('');

    const sendToServer = async e => {

        const image = {
            data: canvasMain.current.toDataURL('image/png'),
            name: title.length > 0 ? title : 'My Drawing',
            path: path,
            ml5: {
                label: ml5[0].label,
                confidence: ml5[0].confidence,
                meta: ml5,
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

        } catch (err) {

        }

    }


    return (
        <div>
            <div className="w-min mx-auto flex flex-col " onMouseDown={handleRubber} onMouseUp={handleRubber}>

                {/* The input element for naming the drawing */}
                <input className="mx-auto rounded-sm bg-transparent border-b  text-center text-brand2-100 focus:outline-none"
                    type="text" placeholder={'Name your drawing'} defaultValue={title} onChange={e => setTitle(e.target.value)} />

                {/* The component containing the rubber, strokewidth and strokecolor controls. */}
                < Strokecontrol color={strokeColor} setColor={setStrokeColor}
                    width={strokeWidth} setWidth={setStrokeWidth}
                    rubber={rubber} setRubber={setRubber}
                />

    
                {/* The two canvas. */}
                <div ref={canvasFrame} className="relative bg-transparent" onContextMenu={e => e.preventDefault()} >
                    <canvas className="absolute top-0"
                        ref={canvasHidden} height={size} width={size} />
                    <canvas className="relative rounded-sm bg-white"
                        ref={canvasMain} height={size} width={size}
                        onMouseDown={updatePosition} onMouseMove={draw} />


                    {/* The classifications. */}

                    <ol className="text-brand2-100 font-bold  absolute top-0 left-full">
                        {ml5.map(({ label, confidence }, i) => (
                            <div key={i} className="w-max pl-5" >
                                <p className="w-16 inline-block">{(Math.floor(confidence * 10000) / 100)}%</p>
                                <p className="inline-block">{label}</p>
                            </div>))
                        }
                    </ol>
                </div>
              

                 {/* The Button for sending the image to the server. */}
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
