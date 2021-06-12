import React from 'react'

import { FaTimes, FaCalendarDay, FaCheckCircle, FaCircle } from 'react-icons/fa'
import { MdCancel, MdCheckCircle } from 'react-icons/md'

const Task = ({task, onDelete}) => {

    const task_id = 'task-id-'+task.id;
    const style = (task.done ? 'done' : 'notdone');
    
    return (
    
        <div className={"task " + style} key={task_id} >
            
            <div className="mx-2 sm:mx-5">
                <i className="iconButton" onClick={ e => console.log(e)} >
                    { task.done ? <MdCheckCircle /> : <MdCancel /> }  
                </i>    
            </div>
            
            <div>
                <h1 className="font-bold underline" >{ task.text } </h1>
                <p className="flex justify-start items-center">  <i className="pr-2"><FaCalendarDay /></i> {task.day}</p>
            </div>
            
            <i className="absolute right-2 top-2 rounded-full hover:bg-white hover:text-brand2-300 duration-300" onClick={ e => onDelete(task.id) }> 
                <FaTimes />      
            </i>
              
        </div>
 
    )
}


export default Task
