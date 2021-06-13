import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { MdCancel } from 'react-icons/md'

const AddTask = ({ modalClose }) => {

    const [text, SetText] = useState('');
    const [text2, SetText2] = useState('');
    const [text3, SetText3] = useState('');

    return (
        <div className="fixed inset-x-0 w-min mx-auto  z-50  justify-center items-center flex overflow-x-hidden overflow-y-auto shadow-2xl">

            <div className="bg-white rounded-md border-brand2-100 border-2 ">

                <header className="p-1 px-2 bg-dark-700  text-white text-xl rounded-t-md">

                    <h1 className="inline">Add a new Task</h1>
                    <i className="absolute right-1 top-1 text-sm hover:bg-brand2-250 rounded-full" onClick={modalClose}> <MdCancel /> </i>

                </header>

                <div className="p-1 px-2">
                    <form>
                        <div>
                            <label htmlFor="task_input">Task</label>
                            <input type="text" placeholder='Add a Title' />
                        </div>
                        <div>
                            <label htmlFor="task_input">Task</label>
                            <input type="text" placeholder='Add a Title' />
                        </div>
                        <div>
                            <label htmlFor="task_input">Task</label>
                            <input type="text" placeholder='Add a Title' />
                        </div>
                    </form>
                </div>

                <div className="p-1 px-2 border-t-2 border-brand2-100 rounded-b-md">
                    bottom
                </div>
               
            </div>

        </div>
    )

}

AddTask.propTypes = {

}

export default AddTask
