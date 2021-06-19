import React, { useRef, useEffect, useState } from 'react'

const Clock = props => {


    const canvasRef = useRef(null);
    // Changes heigt and style height of canvas for better resolution on retina displays.
    useEffect(() => {

        // Only draw a canvas if the analog Clock is disabled.
        if (props.analog) {
            const canvas = canvasRef.current;

            // Note https://coderwall.com/p/vmkk6a/how-to-make-the-canvas-not-look-like-crap-on-retina
            canvas.height = props.size * 4;
            canvas.width = props.size * 4;
            canvas.style.width = props.size + 'px'
            canvas.style.height = props.size + 'px';

            // Scale and translate origin once.
            canvas.getContext('2d').scale(4, 4);
            canvas.getContext('2d').translate(props.size / 2, props.size / 2);
        }

        // Set an Intervall to update the Clock time.
        const ticks = setInterval(() => setDate(new Date()), props.interval);
        // Cleanup of old Intervall when effect is called again.
        return () => clearInterval(ticks);

        // Only do logic again when size changes instead of every single render
    }, [props.size, props.interval, props.analog])


    // Handle the drawing of the clock for every new timechange.
    const [date, setDate] = useState(new Date());
    useEffect(() => {
        // Don't draw a canvas if the analog Clock is disabled.
        if (!props.analog) return;

        // Basic method for drawing the clock.
        // if(!this.props.analog) return;
        const ctx = canvasRef.current.getContext('2d');
        const radius = props.size * 0.5 * 0.95;

        draw_backdrop(ctx, radius, props);
        draw_numbers(ctx, radius, props);
        draw_time(ctx, radius, date, props);

        // Only use Effect (redraw the canvas) when the time has changed.
    }, [date])


    return (
        <div className="bg-transparent w-min mx-auto">
            {!props.analog ? null : <canvas height={props.size} width={props.size} ref={canvasRef}></canvas>}
            {!props.digital ? null : <h1 className="text-center text-white text-2xl">{date.toLocaleTimeString()}</h1>}
        </div>
    )
}


Clock.defaultProps = {
    size: 150,
    interval: 1000,
    analog: true,
    digital: true,
    clock_strokeStyle: '#61DAFB',
    clock_fillStyle: '#282c34',
    numbers_fillStyle: '#FFFFFF',
    hour_strokeStyle: '#FFFFFF',
    min_strokeStyle: '#FFFFFF',
    sec_strokeStyle: '#FFFFFF',
}


function draw_backdrop(ctx, radius, props) {

    ctx.beginPath();

    ctx.fillStyle = props.clock_fillStyle;
    ctx.strokeStyle = props.clock_strokeStyle;
    ctx.lineWidth = radius * 0.025;
    ctx.lineCap = "round";
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function draw_numbers(ctx, radius, props) {

    ctx.beginPath();

    ctx.fillStyle = props.numbers_fillStyle;
    ctx.font = radius * 0.20 + 'px arial';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    for (let num = 1; num <= 12; num++) {
        const angle = (2 * Math.PI / 12) * num;
        ctx.rotate(angle);
        ctx.translate(0, -radius * 0.8);
        ctx.rotate(-angle); // undo rotation to draw numbers unrotated.
        ctx.fillText(num.toString(), 0, 0);
        ctx.rotate(angle); // apply rotation again, to undo translation.
        ctx.translate(0, radius * 0.8);
        ctx.rotate(-angle);
    }
}

function draw_time(ctx, radius, date, props) {

    const milli = date.getMilliseconds();
    const sec = date.getSeconds();
    const min = date.getMinutes();
    const h = date.getHours();

    // TAU / 60seconds *sec = angle for seconds

    // TAU / 60minutes *min = angle for minutes
    // angle for minutes + (TAU / 3600seconds *sec) = smooth angle minutes
    // By smoothing the angle, the minute hand moves a little bit with each passing second, instead of jumping by one when the minute changes.

    const TAU = 2 * Math.PI;
    const ang_sec = TAU / 60 * sec + (TAU / (60 * 1000) * milli);
    const ang_min = TAU / 60 * min + (TAU / (60 * 60) * sec);
    const ang_hour = TAU / 12 * (h % 12) + (TAU / (24 * 60) * min) + (TAU / (24 * 60 * 60) * sec);

    draw_hand(ctx, ang_sec, radius * 0.7, radius * 0.02, props.sec_strokeStyle);
    draw_hand(ctx, ang_min, radius * 0.6, radius * 0.025, props.min_strokeStyle);
    draw_hand(ctx, ang_hour, radius * 0.35, radius * 0.04, props.hour_strokeStyle);

    ctx.beginPath();
    ctx.lineWidth = radius * 0.001;
    ctx.arc(0, 0, radius * 0.35, 0, TAU);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.05, 0, TAU);
    ctx.lineWidth = radius * 0.005;
    ctx.fillStyle = props.clock_fillStyle;
    ctx.strokeStyle = props.hour_strokeStyle;
    ctx.fill();
    ctx.stroke();
}


function draw_hand(ctx, pos, length, width, strokeStyle) {
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
    ctx.closePath();
}


export default Clock
