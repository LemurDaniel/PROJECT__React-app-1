import React, { useState, useContext } from 'react'

import UserContext from './UserContext'


const types = {
    guest: {
        title: 'Login as a Guest',
        btn: 'Guestlogin',
        fields: [1, 0, 0, 0],
        api: '/user/guest'
    },
    login: {
        title: 'Login as a User',
        btn: 'Login',
        fields: [0, 1, 1, 0],
        api: '/user/login'
    },
    register: {
        title: 'Register a new Account',
        btn: 'Register',
        fields: [1, 1, 1, 1],
        api: '/user/register'
    },
}

const Authorization = ({ showModal }) => {

    const { setUser, setToken } = useContext(UserContext);


    const [activeType, setActiveType] = useState(Object.keys(types)[0])
    const [userName, setUserName] = useState('')
    const [userDisplayName, setUserDisplayName] = useState('')
    const [password, setPassword] = useState('')
    const [passwordRepeat, setPasswordRepeat] = useState('')

    const sendRequest = async e => {

        const type = types[activeType];
        if (type.fields[0] && !userDisplayName) return alert('Please specify a Displayname');
        if (type.fields[1] && !userName) return alert('Please specify a Username');
        if (type.fields[2] && !password) return alert('Please enter a Password');
        if (type.fields[3] && !passwordRepeat) return alert('Please repeat your Password');

        if (type.fields[2] && type.fields[3]
            && password !== passwordRepeat) return alert('Your Passwords do not match');

        const res = await fetch('http://localhost' + type.api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: userName, password: password, userDisplayName: userDisplayName })
        })

        console.log(res)

        const data = await res.json();
        console.log(data);
        setUser(data.userDisplayName);
        setToken(data.token);

        // temporary
        document.cookie = "user=" + data.userDisplayName;
        document.cookie = "doodle_token=" + data.token;
    
    }



    return (
        <div className="fixed inset-x-0 w-min mx-auto top-28 z-50  justify-center items-center flex overflow-x-hidden overflow-y-auto shadow-2xl">

            <div className="bg-white rounded-md border-brand2-100 border-2 w-80">

                <header className="p-2 px-2 bg-dark-700  text-white text-xl rounded-t-md">

                    <select className="bg-dark-700 focus:outline-none" onChange={e => setActiveType(e.target.value)} >
                        {Object.keys(types).map(v => v === activeType ? (
                            <option key={v} value={v} defaultValue >{types[v].title} </option>
                        ) : <option key={v} value={v} >{types[v].title} </option>)}
                    </select>

                </header>


                <div className="p-1 px-2 text-dark-700 font-bold">
                    <form >

                        {types[activeType].fields[0] ?
                            <div className="border-b-2 p-2">
                                <label htmlFor="task_text" className="block">Display Username</label>
                                <input type="text" name="task_text" id="task_text"
                                    className="focus:outline-none w-full px-1 rounded-sm"
                                    placeholder='Enter a name for Display' value={userDisplayName}
                                    onChange={e => setUserDisplayName(e.target.value)}
                                />
                            </div>
                            : null
                        }

                        {types[activeType].fields[1] ?
                            <div className="border-b-2 p-2">
                                <label htmlFor="task_text" className="block">Username</label>
                                <input type="text" name="task_text" id="task_text"
                                    className="focus:outline-none w-full px-1 rounded-sm"
                                    placeholder='Enter your username' value={userName}
                                    onChange={e => setUserName(e.target.value)}
                                />
                            </div>
                            : null
                        }


                        {types[activeType].fields[2] ?
                            <div className="border-b-2 p-2">
                                <label htmlFor="task_pass" className="block">Password</label>
                                <input type="password" name="task_pass" id="task_pass"
                                    className="focus:outline-none w-full px-1 rounded-sm"
                                    placeholder='Enter your password' value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div >
                            : null
                        }

                        {types[activeType].fields[3] ?
                            <div className="border-b-2 p-2">
                                <input type="password" name="task_pass" id="task_pass2"
                                    className="focus:outline-none w-full px-1 rounded-sm"
                                    placeholder='Repeat the password' value={passwordRepeat}
                                    onChange={e => setPasswordRepeat(e.target.value)}
                                />
                            </div>
                            : null
                        }

                    </form>
                </div>

                <div className="py-2 px-2 rounded-b-md bg-dark-700 flex">
                    <button className="btn-orange px-2 mx-auto" onClick={sendRequest}> {types[activeType].btn} </button>
                </div>

            </div>

        </div>
    )
}

export default Authorization
