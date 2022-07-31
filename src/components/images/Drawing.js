import React, { useEffect, useRef, useState, useContext } from 'react'

import Strokecontrol from './Strokecontrol'
import UserContext from '../UserContext'
import Loading from '../website/Loading'
import useAudio from '../useAudio'

// Set positioning for drawing.
const pos = { x: null, y: null }
const Drawing = ({ size }) => {

    const [playSound, toggleLoop] = useAudio();

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
            .then(cl => setClassifier(cl))
            .catch(err => console.log(err));
    }, [])


    // Get the translation.
    const { meta } = useContext(UserContext)
    const [translation, setTranslation] = useState({});
    useEffect(() => {
        const call = async () => {
            const res = await fetch(meta.endpoint + '/translation');
            const data = await res.json();
            setTranslation(data);
        }
        call();
    }, []);

    // classify the drawn image.
    const [ml5, setMl5] = useState(new Array(10).fill({ label: '', confidence: 0 }));
    const [timeout, setTimeout] = useState(0);
    const classify = () => {

        if (classifier === null) return;

        const date = new Date().getTime();
        if (date <= timeout) return;
        setTimeout(date + 1 * 500)

        classifier.predict(canvasHidden.current)
            .then(res => setMl5(res.map(v => ({ ...v, label: translation[v.label] ?? v.label }))))
            .catch(err => console.log(err))

    }


    // Disable and enable the rubber.
    const [rubber, setRubber] = useState(false);
    const handleRubber = e => {
        if (e.button !== 2) return false;
        else if (e.type === 'mousedown') setRubber(true);
        else if (e.type === 'mouseup') setRubber(false);
    }


    const onMouseUp = e => {
        toggleLoop("pen_erase", false);
        toggleLoop("pen_brush", false); 
        classify()
    }
    const onMouseDown = e => {
        if (e.button === 2) toggleLoop("pen_erase", true, 0.7);
        else toggleLoop("pen_brush", true, 1);
        updatePosition(e);
    }
    const updatePosition = e => {
        const frame = canvasFrame.current;
        let cursor = e;
        if (e.type === 'touchmove' || e.type === 'touchstart') cursor = e.nativeEvent.touches[0]
        pos.x = cursor.clientX - frame.offsetLeft;
        pos.y = cursor.clientY - frame.offsetTop + window.scrollY;

    }

    // Color, Width and darwing method.
    const strokeBounds = [2, 25];
    const [strokeWidth, setStrokeWidth] = useState(15);
    const onScrollStroke = e => {
        if (e.deltaY === -100) {
            if (strokeWidth >= strokeBounds[1]) return;
            setStrokeWidth(strokeWidth + 1);
        }
        else if (e.deltaY === 100) {
            if (strokeWidth <= strokeBounds[0]) return;
            setStrokeWidth(strokeWidth - 1);
        }
    }
    const [strokeColor, setStrokeColor] = useState('#000000');
    const draw = e => {

        if (e.buttons !== 1 && e.buttons !== 2 && e.type !== 'touchmove') return;

        const ctxMain = canvasMain.current.getContext('2d');
        const ctxHidden = canvasHidden.current.getContext('2d');

        ctxMain.beginPath();
        ctxHidden.beginPath();

        ctxMain.lineWidth = strokeWidth;
        ctxHidden.lineWidth = strokeWidth;

        // Erase with white when rubber active.
        if (!rubber) {
            ctxMain.strokeStyle = strokeColor;
            ctxHidden.strokeStyle = 'black';
        } else {
            ctxMain.strokeStyle = 'white';
            ctxHidden.strokeStyle = 'white';
        }

        ctxMain.lineCap = 'round'
        ctxHidden.lineCap = 'round'

        if (pos.x === null) updatePosition(e)
        ctxMain.moveTo(pos.x, pos.y);
        ctxHidden.moveTo(pos.x, pos.y);
        updatePosition(e);
        ctxMain.lineTo(pos.x, pos.y);
        ctxHidden.lineTo(pos.x, pos.y);

        ctxMain.stroke();
        ctxHidden.stroke();
    }

    const clearCanvas = () => {
        const ctxMain = canvasMain.current.getContext('2d');
        const ctxHidden = canvasHidden.current.getContext('2d');

        ctxHidden.fillStyle = 'white';
        ctxHidden.fillStyle = 'white';

        ctxMain.fillRect(0, 0, canvasMain.current.width, canvasMain.current.height);
        ctxHidden.fillRect(0, 0, canvasHidden.current.width, canvasHidden.current.height);

        setMl5(new Array(10).fill({ label: '', confidence: 0 }));
        setTitle('');
        setPath('');
    }

    // Methods and states for sending picutre to server.
    const [path, setPath] = useState('');
    const [title, setTitle] = useState('');

    const [text, setText] = useState('')
    const [error, setError] = useState('')
    const [sending, setSending] = useState(false);
    const [loaderHidden, setLoaderHidden] = useState(true);

    const sendToServer = async e => {
   
        if (sending || !loaderHidden) return;

        playSound("button_click")
        setSending(true);
        setLoaderHidden(false);

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
            if (res.status !== 200) throw 'Something went wrong: ' + data.err;

            setError('');
            setText(path === '' ? 'Image has been sent' : 'Image has been updated');
            setPath(data.path);
            setTitle(image.name);
        } catch (err) {
            setError(err.toString());
        }

        // Some fake time for a nice spinning circle.
        window.setTimeout(() => setSending(false), 750);
    }

    return (

        <div className="mt-10 shadow-none w-min mx-auto flex flex-col " onMouseDown={handleRubber} onMouseUp={handleRubber}>

            {/* The input element for naming the drawing */}
            <input className="input-light mx-auto text-center"
                type="text" placeholder={'Name your drawing'} defaultValue={title} onChange={e => setTitle(e.target.value)} />

            {/* The component containing the rubber, strokewidth and strokecolor controls. */}
            < Strokecontrol widthMin={strokeBounds[0]} widthMax={strokeBounds[1]}
                color={strokeColor} setColor={setStrokeColor}
                width={strokeWidth} setWidth={setStrokeWidth}
                rubber={rubber} setRubber={setRubber}
                onClearCanvas={clearCanvas}
            />

            <div className={"z-50 relative " + (loaderHidden ? 'hidden' : '')} >
                <div className="w-28 mx-auto inset-x-0 top-10 absolute">
                    <Loading text={text} error={error} loading={sending} onFinished={() => setLoaderHidden(true)} />
                </div>
            </div>


            {/* The two canvas. */}
            <div ref={canvasFrame} className="relative bg-transparent " style={{ 'touchAction': 'none' }}
                onContextMenu={e => e.preventDefault()} onWheel={onScrollStroke}
                onMouseEnter={e => document.getElementsByTagName("body")[0].classList.add("stop-scrolling")}
                onMouseLeave={e => { onMouseUp(e); document.getElementsByTagName("body")[0].classList.remove("stop-scrolling") }}
            >

                <canvas ref={canvasHidden} height={size} width={size} className="absolute top-0" />
                <canvas ref={canvasMain} height={size} width={size} className="relative rounded-sm bg-white"
                    onMouseDown={onMouseDown} onMouseMove={draw} onMouseUp={onMouseUp}
                    onTouchStart={onMouseDown} onTouchMove={draw} onTouchEnd={onMouseUp}
                />


                {/* The classifications. */}

                <div className=" font-bold text-brand2-100 absolute top-0 left-full hidden md:block">
                    {ml5.map(({ label, confidence }, i) => (
                        <div key={i} className="ml-5 pb-1 w-max" >
                            <p className="w-16 inline-block">{(Math.floor(confidence * 10000) / 100)}%</p>
                            <p className="inline-block">{label}</p>
                        </div>))
                    }
                </div>

                <div className="pt-1 w-full font-bold  text-brand2-100 block md:hidden">
                    {ml5.slice(0, 3).map(({ label, confidence }, i) => (
                        <div key={i} className=" pb-1 mx-auto w-48" >
                            <p className="w-16 inline-block">{(Math.floor(confidence * 10000) / 100)}%</p>
                            <p className="inline-block">{label}</p>
                        </div>))
                    }
                </div>
            </div>


            {/* The Button for sending the image to the server. */}
            <button className="btn-decent btn-light font-bold mt-4"
                onClick={sendToServer}  >Send Image</button>

        </div>

    )
}

Drawing.defaultProps = {
    size: 280,
    lineWidthMax: 20,
    lineWidthMin: 2,
}

export default Drawing;
