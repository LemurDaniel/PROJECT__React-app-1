import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { MdCancel } from 'react-icons/md'

const AddTask = ({ showModal, onAdd }) => {

    const DateNow = new Date();
    const year = DateNow.getFullYear().toString();
    let month = DateNow.getMonth().toString();
    let day = DateNow.getDate().toString();

    if (month.length != 2) month = '0'+month;
    if (day.length != 2) day = '0'+day;

    const [text, setText] = useState('');
    const [desc, setDesc] = useState('');
    const [date, setDate] = useState(year+'-'+month+'-'+day);

    const onSubmit = e => {
        if(!text) {
            alert('Please add a Title for your Task');
            return;
        }

        onAdd({ text, desc, date })
        showModal(false);

        setText('');
        setDesc('');
    }


    return (
        <div className="fixed inset-x-0 w-min mx-auto top-28 z-50  justify-center items-center flex overflow-x-hidden overflow-y-auto shadow-2xl">

            <div className="bg-white rounded-md border-brand2-100 border-2 w-80">

                <header className="p-1 px-2 bg-dark-700  text-white text-xl rounded-t-md">

                    <h1 className="inline">Add a new Task</h1>
                    <i className="absolute right-1 top-1 text-sm hover:bg-brand2-250 rounded-full" onClick={ e => showModal(false) }> <MdCancel /> </i>

                </header>

                <div className="p-1 px-2 text-dark-700 font-bold">
                    <form >
                        <div className="border-b-2 p-2">
                            <label htmlFor="task_text" className="block">Title</label>
                            <input type="text" name="task_text" id="task_text" 
                                className = "focus:outline-none"
                                placeholder='Add a Title' value={text}
                                onChange={ e => setText(e.target.value) }
                            />
                        </div>
                        <div className="border-b-2 p-2">
                            <label htmlFor="task_desc" className="block">Description</label>
                            <input type="text" name="task_desc" id="task_desc" 
                                className = "focus:outline-none"
                                placeholder='Add a description' value={desc}
                                onChange={ e => setDesc(e.target.value) }
                            />
                        </div >
                        <div className="border-b-2 p-2">
                            <label htmlFor="task_date" className="block">Date</label>
                            <input type="date" name="task_date" id="task_date"
                                className="select-none focus:outline-none w-30"
                                value={date}
                                onChange={ e => setDate(e.target.value) }
                            />
                        </div>
                    </form>
                </div>

                <div className="py-2 px-2 rounded-b-md bg-dark-700 flex">
                    <button className="btn-orange px-2 mx-auto" onClick={onSubmit}> Save Task </button>
                </div>
               
            </div>

        </div>
    )

}

AddTask.propTypes = {

}

export default AddTask
