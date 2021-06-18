import React, { useEffect, useState } from 'react'

const Searchbar = ({ onSearch, timeout }) => {

    const [timestamp, setTimestamp] = useState(0)
    const [name, setName] = useState('')
    const [user, setUser] = useState('')
    const [label, setLabel] = useState('')
    const [conf, setConf] = useState('')

    // Reset timestamp when a value has changed.
    useEffect(() => setTimestamp(0), [name, user, label])

    const buttonPress = e => {

        // Only allow for a repeated call of the search function after a timeout.
        const now = new Date().getTime();

        console.log(now - timestamp)
        if( now - timestamp <= timeout ) return;

        console.log('Search')
        setTimestamp(new Date().getTime());
        if(onSearch) onSearch(name, user, label);

    }

    // TODO put in CSS 
    const input = "px-2 mt-2 text-white bg-dark-800 font-bold focus:outline-none border-b border-brand2-100 text-center md:text-left";

    return (
        <div className=" py-5 flex flex-col select-none">
            <form className="p-1 text-center md:text-left md:flex flex-wrap justify-evenly font-bold text-brand2-100">

                <div className="w-min mx-auto pb-2 md:pb-0 md:mx-0">
                    <label htmlFor="name">Name of the Drawing:</label>
                    <input name="name" id="name" className={input}
                       type='text' placeholder="Enter a Name" value={name} onChange={ e => setName(e.target.value) }
                       />
                </div>

                <div className="w-min mx-auto pb-2 md:pb-0 md:mx-0">
                    <label htmlFor="user">Drawn by user:</label>
                    <input name="user" id="user" className={input}
                        type='text' placeholder="Enter a Username" value={user} onChange={ e => setUser(e.target.value) }
                        />
                </div>

                <div className="w-min mx-auto pb-2 md:pb-0 md:mx-0">
                    <label htmlFor="class">AI Label:</label>
                    <input name="class" id="class" className={input}
                        type='text' placeholder="Enter an AI label" value={label} onChange={ e => setLabel(e.target.value) }
                        />
                </div>

                { true ? null :
                <div className="w-min mx-auto md:mx-0">
                    <label htmlFor="conf">AI Confidence:</label>
                    <input name="conf" id="conf" className={input}
                        type='text' placeholder="Enter an AI label" value={conf} onChange={ e => setConf(e) }
                        />
                </div>   
                }

            </form>

            <button className="mt-5 btn-custom btn-orange mx-auto focus:outline-none"
                onClick={ buttonPress } > 
                Search for Images 
            </button>  

        </div>
    )
}


Searchbar.defaultProps = {
    timeout: 2000
}

export default Searchbar


