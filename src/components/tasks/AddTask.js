import React, { useState } from 'react'

import { MdCancel } from 'react-icons/md'
import { ImCross, ImCheckmark } from 'react-icons/im'

const AddTask = ({ showModal, onAdd }) => {

    const dateObject_toString = date => {
        const year = date.getFullYear().toString();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hours = date.getHours();

        if (month < 10) month = '0'+month;
        if (day < 10) day = '0'+day;
        if (hours < 10) hours = '0'+hours;

        return year+'-'+month+'-'+day + 'T' + hours + ':00';
    }

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [done, setDone] = useState(false);
    const [date, setDate] = useState( dateObject_toString(new Date()) );

    const onSubmit = e => {
        if(!title) {
            alert('Please add a Title for your Task');
            return;
        }

        onAdd({ title, description, date, done }, dateObject_toString(new Date(date)))
        showModal(false);

        setTitle('');
        setDone(false);
        setDescription('');
    }


    return (
        <div className="fixed inset-x-0 w-min mx-auto top-28 z-50  justify-center items-center flex overflow-x-hidden overflow-y-auto shadow-2xl">

            <div className="bg-white rounded-md border-brand2-100 border-2 w-80">

                <header className="p-1 px-2 bg-dark-700  text-white text-xl rounded-t-md flex justify-start">

                    <div className="p-1 mr-3 w-min hover:bg-white hover:text-dark-700 rounded-full duration-300" onClick={ e => setDone(!done) } > 
                        { !done ? 
                            <ImCross className="text-brand2-300" /> :
                            <ImCheckmark className="text-brand2-400" />
                        }
                    </div>

                    <h1 >Add a new Task</h1>
                    <i className="absolute right-1 top-1 text-sm hover:bg-brand2-250 rounded-full" onClick={ e => showModal(false) }> <MdCancel /> </i>

                </header>

                <div className="p-1 px-2 text-dark-700 font-bold">
                    <form >
                        <div className="border-b-2 p-2">
                            <label htmlFor="task_text" className="block">Title</label>
                            <input type="text" name="task_text" id="task_text" 
                                className = "focus:outline-none w-full"
                                placeholder='Add a Title' value={title}
                                onChange={ e => setTitle(e.target.value) }
                            />
                        </div>
                        <div className="border-b-2 p-2">
                            <label htmlFor="task_date" className="block">Date and Time</label>
                            <input type="datetime-local" name="task_date" id="task_date"
                                className="select-none focus:outline-none w-full"
                                value={date}
                                onChange={ e => setDate(e.target.value) }
                            />
                        </div>
                        <div className="border-b-2 p-2">
                            <label htmlFor="task_desc" className="block">Description</label>
                            <textarea name="task_desc" rows="4" 
                                className = "focus:outline-none w-full"
                                placeholder='Add a description' value={description}
                                onChange={ e => setDescription(e.target.value) }
                            />
                        </div >
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
