import React, { useEffect, useState } from 'react'

const Searchbar = ({ onSearch, timeout }) => {

    const [timestamp, setTimestamp] = useState(0)
    const [name, setName] = useState('')
    const [user, setUser] = useState('')
    const [label, setLabel] = useState('')

    // Reset timestamp when a value has changed.
    useEffect(() => setTimestamp(0), [name, user, label])

    const buttonPress = e => {

        // Only allow for a repeated call of the search function after a timeout.
        const now = new Date().getTime();
        if (now - timestamp <= timeout) return;

        setTimestamp(new Date().getTime());
        if (onSearch) onSearch(name, user, label);

    }


    return (
        <div className=" py-5 flex flex-col select-none">
            <form className="text-center md:text-left md:flex flex-wrap justify-evenly  ">


                <input name="name" id="name" className="input-responsive"
                    type='text' placeholder="Enter a Name" value={name} onChange={e => setName(e.target.value)}
                />

                <input name="user" id="user" className="input-responsive"
                    type='text' placeholder="Enter a Username" value={user} onChange={e => setUser(e.target.value)} />


                <input name="class" id="class" className="input-responsive"
                    type='text' placeholder="Enter an AI label" value={label} onChange={e => setLabel(e.target.value)}
                />


            </form>

            <button className="btn-prominent btn-light mt-8 font-bold"
                onClick={buttonPress} >
                Search for Images
            </button>

        </div>
    )
}


Searchbar.defaultProps = {
    timeout: 2000
}

export default Searchbar


