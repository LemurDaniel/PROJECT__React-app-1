import React from 'react'

const Highscore = ({scores, onRestart}) => {
    return (
        <>
            {/* Modal on gameover */}
            < div className="absolute bg-white opacity-10 inset-0 " ></div >

            <div className="absolute inset-x-0 top-40 ">
                <div className="w-60 mx-auto flex flex-col justify-center items-center   border border-brand2-100 rounded-sm shadow-2xl">
                    <header className="px-2 pb-1 rounded-t-sm  bg-dark-700 w-full text-brand2-100 font-bold text-center">
                        <p>Game Over</p>
                    </header>
                    <div className="bg-white w-full px-2 py-1 font-bold text-dark-700">
                        
                        <h1 className="border-b-2 border-gray-200 rounded-sm">Highscores:</h1>
                        <ol className="list-decimal px-6">
                            {scores.map( (v, i) => <li key={i}>Score: {v} Points</li>) }
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