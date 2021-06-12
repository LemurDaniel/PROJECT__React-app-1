import React from 'react'

import { FaTimes, FaCalendarDay, FaCheckCircle, FaCircle } from 'react-icons/fa'
import { MdCancel, MdCheckCircle } from 'react-icons/md'

const Task = ({task, even, onClick}) => {

    const task_id = 'task-id-'+task.id;
    const style = (task.done ? 'done' : 'notdone');
    
    return (
    
        <div className={"task " + style} >
            
            <div className="mx-2 sm:mx-5">
                <i className="iconButton" onClick={onClick} >
                    { task.done ? <MdCheckCircle /> : <MdCancel /> }  
                </i>    
            </div>
            
            <div>
                <label className="font-bold underline" for={task_id}>{ task.text } </label>
                <p className="flex justify-start items-center">  <i className="pr-2"><FaCalendarDay /></i> {task.day}</p>
            </div>
            
            <i className="absolute right-2 top-2 "> 
                <FaTimes />      
            </i>
              
        </div>
 
    )
}


export default Task
