import React, { useContext, useState, useEffect } from 'react'

import { BiTimer } from 'react-icons/bi'
import { IoMdCalendar } from 'react-icons/io';

import UserContext from './UserContext';

function ticksToString(ticks) {
    const sec = ticks % 60;
    const min = Math.floor(ticks / 60) % 60;
    const h = Math.floor(ticks / 3600);

    let str = h <= 0 ? '' : (h + ':');
    str += (min < 10 ? '0' : '') + min + ':';
    str += (sec < 10 ? '0' : '') + sec;

    return str;
}

const Highscore = ({ score, ticks, gameRunning, onRestart }) => {

    const { meta } = useContext(UserContext);
    const [scores, setScores] = useState([]);
    const [userScore, setUserScore] = useState({});
    useEffect(() => {
        if (gameRunning) return;
        const onGameEnd = async () => {

            const updScore = {
                score: score,
                ticks: ticks,
                timestamp: new Date().toISOString().split('.')[0]
            }
            try {
                let res = await fetch(meta.endpoint + `/score?token=${meta.token}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updScore)
                })

                res = await fetch(meta.endpoint + `/score?token=${meta.token}`);
                const data = await res.json();

                const scores = data.result;
                scores.length = 5;
                scores.sort((a, b) => b.score - a.score)
                setScores(scores);
                setUserScore(updScore);

            } catch (err) {
                console.log(err)
            }

        }
        onGameEnd();
    }, [gameRunning])


    const timestampNow = new Date(userScore.timestamp).toLocaleDateString();

    return (
        <>
            {/* Modal on gameover */}
            < div className="absolute bg-white opacity-10 inset-0 " ></div >

            <div className="absolute inset-x-0 top-40 ">
                <div className="w-72 mx-auto flex flex-col justify-center items-center   border border-brand2-100 rounded-sm shadow-2xl">
                    <header className="px-2 pb-1 rounded-t-sm  bg-dark-700 w-full text-brand2-100 font-bold text-center">
                        <p>Highscores</p>
                    </header>
                    <div className="bg-white w-full px-2 py-1 font-bold text-dark-700">



                        <div className="border-b-2 border-gray-200 rounded-sm px-4 pr-6">
                            <div className="flex justify-between">
                                <p>Your Score: </p>
                                <p className="font-semibold"> <IoMdCalendar className="inline mb-1" /> {timestampNow} </p>
                            </div>

                            <div className="font-semibold flex justify-between">
                                <p className="">{score} Points</p>
                                <p className=""> <BiTimer className="inline mb-1" /> {ticksToString(ticks)} </p>
                            </div>
                        </div>

                        <ol className="list-decimal px-6">
                            {scores.map(({ userDisplayName, timestamp, score, ticks }, i) => {
                                return <li key={i} className="border-b-2 rounded-sm">
                                    <div className="flex justify-between">
                                        <p>{userDisplayName}</p>
                                        <p className="font-semibold"> <IoMdCalendar className="inline mb-1" /> {new Date(timestamp).toLocaleDateString()} </p>
                                    </div>

                                    <div className="font-semibold flex justify-between">
                                        <p>{score} Points</p>
                                        <p> <BiTimer className="inline mb-1" /> {ticksToString(ticks)} </p>
                                    </div>
                                </li>
                            })
                            }
                        </ol>

                    </div>
                    <footer className="bg-dark-800 rounded-b-sm w-full flex">
                        <button className=" mx-auto my-1 px-1 text-brand2-100 font-bold rounded-sm  border-b border-brand2-100 hover:bg-brand2-100 hover:text-dark-700 duration-300 focus:outline-none"
                            onClick={onRestart}> Restart</button>
                    </footer>
                </div>
            </div>
        </>
    )
}


export default Highscore;