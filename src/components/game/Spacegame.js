import React from 'react'
import { useEffect, useRef, useState } from 'react/cjs/react.development';

import Vector from './Vector';
import Ship from './ship';
import Asteroid from './asteroid';
import ParticleManager, { Particle } from './particle';







const MAX_ASTEROIDS = 30;
const SCALE = 2;
const height = 600;
const width = 800;

const Spacegame = () => {

    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;

        canvas.height = height * SCALE;
        canvas.width = width * SCALE;
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px';

        // Scale and translate origin once.
        canvas.getContext('2d').scale(SCALE, SCALE);

        return () => canvas.getContext('2d').scale(-SCALE, -SCALE);
    }, [canvasRef]);





    const [gameRunning, setGameRunning] = useState(true);

    const [ship, setShip] = useState(null);
    const [asteroids, setAsteroids] = useState(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        setShip(new Ship(canvas.width / 2, canvas.height / 2, 0));
        setAsteroids(new ParticleManager());

    }, [canvasRef]);

    const [cursor, setCursor] = useState(true);
    const [mousePos, setMousePos] = useState(new Vector());
    const onMouseMove = e => {
        const canvas = canvasRef.current;
        mousePos.x = (e.clientX - canvas.offsetLeft) * SCALE;
        mousePos.y = (e.clientY - canvas.offsetTop) * SCALE;
        setMousePos(mousePos);
    }
    

    const [astAmount, setAstAmount] = useState(7   );
    useEffect(() => {
        const loop = () => {
                
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (Math.round(Math.random() * 25) === 0 && asteroids.count() < astAmount) {
                asteroids.push(Asteroid.getRandom(canvas, ship));
            }

            ctx.strokeStyle = 'white';
            ctx.fillStyle = 'white';
            ctx.lineCap = 'round';
            ctx.lineWidth = 4;

            const cannon = ship.cannon;
            asteroids.render(canvas);
            cannon.render(canvas)
            ship.setCursor(mousePos);
            ship.render(canvas)
            
            if(cursor) {  
                ctx.beginPath();
                ctx.arc(mousePos.x, mousePos.y, 5, 0, Math.PI*2)
                ctx.fill();
            }
            ctx.font = '35px arial';
            ctx.lineWidth = 2;
            ctx.fillText('Highscore: ' + ship.score, 10, 40);

            asteroids.particles.forEach(prt => asteroids.calculateCollsision(prt));
            cannon.particles.forEach( bullet => {
                asteroids.particles.forEach(prt => asteroids.calculateCollsision(bullet, ship.setScore ));
            })
        };

        if(!ship || !asteroids) return;

        loop();
        if(!cursor) return;
        const ticker = setInterval(() => loop(), 1000/ 60 );
        return () => clearInterval(ticker);
    }, [asteroids, ship, cursor]);




    return (
        <div className="w-min mx-auto  rounded-md border border-brand2-100">
            <canvas height={height} width={width} onMouseMove={onMouseMove} 
                onMouseLeave={ e => setCursor(false) } onMouseEnter={ e => setCursor(true) }
                ref={canvasRef} className="bg-dark-800" ></canvas>
        </div>
    )
}

export default Spacegame
