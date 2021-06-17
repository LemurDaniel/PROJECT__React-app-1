import React from 'react'

import { FaTimes, FaCalendarDay } from 'react-icons/fa'
import { ImCross, ImCheckmark } from 'react-icons/im'



const Task = ({ task, onDelete, toggleDone }) => {

    const style = (task.done ? 'done' : 'notdone');

    return (

        <div className={'task ' + style} key={task.id} >

            <div className='mx-2 sm:mx-5 ' onClick={e => toggleDone(task)}>
                {task.done ? (
                    <i className='iconButton text-brand2-400' > <ImCheckmark /> </i>
                ) : (
                    <i className='iconButton text-brand2-300' > <ImCross /> </i>
                )
                }
            </div>


            <div>
                <h1 className='font-bold underline' >{task.title} </h1>
                <p className='flex justify-start items-center'>  
                    <i className='pr-2'><FaCalendarDay /></i> 
                    {task.date + ' at ' + task.time}
                </p>
            </div>

            <i className='absolute right-2 top-2 rounded-full hover:bg-white hover:text-brand2-300 duration-300' 
                onClick={e => onDelete(task.id)}>
                <FaTimes />
            </i>

        </div>

    )
}


export default Task;