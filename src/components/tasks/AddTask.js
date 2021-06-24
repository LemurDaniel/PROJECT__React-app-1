import React, { useState } from 'react'

import { MdCancel } from 'react-icons/md'
import { ImCross, ImCheckmark } from 'react-icons/im'

const MAX_LEN_DESCRIPTION = 200;

const AddTask = ({ showModal, onAdd }) => {


    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [done, setDone] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('.')[0].substr(0, 17) + '00');


    const onSubmit = e => {
        if (!title) {
            alert('Please add a Title for your Task');
            return;
        }

        const task = {
            title: title,
            description: description,
            date: date.split('T')[0],
            time: date.split('T')[1],
            done: done
        }
        console.log(task)
        onAdd(task)
        showModal(false);

        setTitle('');
        setDone(false);
        setDescription('');
    }


    return (
        <div className="modal">

            <div>

                <header className="p-1 px-2 bg-dark-700  text-xl rounded-t-md   flex justify-start">

                    <div className="p-1 mr-3 w-min   hover:bg-white hover:text-dark-700 rounded-full  duration-300" onClick={e => setDone(!done)} >
                        {!done ?
                            <ImCross className="text-brand2-300" /> :
                            <ImCheckmark className="text-brand2-400" />
                        }
                    </div>

                    <h1 >Add a new Task</h1>
                    <i className="absolute right-1 top-1 text-sm hover:bg-brand2-250 rounded-full" onClick={e => showModal(false)}> <MdCancel /> </i>

                </header>

                <div className="p-1 px-2 text-dark-700 font-bold">
                    <form >
                        <div className="border-b-2 p-2">
                            <label htmlFor="task_text" className="block">Title</label>
                            <input type="text" name="task_text" id="task_text"
                                className="focus:outline-none w-full"
                                placeholder='Add a Title' value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="border-b-2 p-2">
                            <label htmlFor="task_date" className="block">Date and Time</label>
                            <input type="datetime-local" name="task_date" id="task_date"
                                className="select-none focus:outline-none w-full"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                        <div className="border-b-2 p-2">
                            <label htmlFor="task_desc" className="block">Description <span className="font-normal float-right">{description.length}/{MAX_LEN_DESCRIPTION}</span></label>
                            <textarea name="task_desc" rows="4"
                                className="focus:outline-none w-full"
                                placeholder='Add a description' value={description}
                                onChange={e => setDescription(e.target.value.substr(0, MAX_LEN_DESCRIPTION)) }
                            />
                        </div >
                    </form>
                </div>

                <div className="py-2 rounded-b-md bg-dark-700 flex">
                    <button className="btn-decent btn-light" onClick={onSubmit}> Save Task </button>
                </div>

            </div>

        </div>
    )

}

AddTask.propTypes = {

}

export default AddTask
