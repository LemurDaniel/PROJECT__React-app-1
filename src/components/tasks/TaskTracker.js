import React from 'react'

import { BsInfoSquareFill } from 'react-icons/bs'

import Task from './Task';
import AddTask from './AddTask';


const TaskTracker = () => {

    const [showModal, setShowModal] = React.useState(false);
    const [tasks, setTasks] = React.useState([
        {
            id: 1,
            done: false,
            text: 'Doctors Appointment',
            day: 'Feb 5th at 2.30pm',
            reminder: true
        },
        {
            id: 2,
            done: false,
            text: 'Meeting at School',
            day: 'Feb 6h at 1.30pm',
            reminder: true
        },
        {
            id: 3,
            done: true,
            text: 'Food Shopping',
            day: 'Feb 5th at 2.30pm',
            reminder: false
        }
    ]);

    // Delete Task
    const deleteTask = id => {
        setTasks(tasks.filter(task => task.id !== id));
    }

    const toggleDone = id => {
        setTasks(
            tasks.map(task => task.id !== id ? task : { ...task, done: !task.done })
        )
    }

    return (
        <section className="py-10 px-5 lg:px-40 xl:px-80 select-none">
            <div className="border-2 rounded-sm pb-5">

                <header className="header border-b ">
                    <h1 className='font-bold text-2xl lg:text-4xl text-brand2-300'> Task Tracker </h1>
                    <button className="btn-custom btn-orange" onClick={ e => setShowModal(!showModal) } > Add Task </button>
                </header>

                { showModal ? <AddTask modalClose={e => setShowModal(false)}/>  : null }

                <div className="flex flex-col justify-center px-10 pt-4 ">
                    {tasks.length > 0 ? (
                        tasks.map(task => (
                            <Task task={task} onDelete={deleteTask} toggleDone={toggleDone} />
                        ))
                    ) : (
                        <i className="mx-auto py-10 text-2xl text-brand2-100">
                            <BsInfoSquareFill className="inline" />  No Tasks remaining
                        </i>
                    )

                    }
                </div>

            </div>
        </section>
    )
}

export default TaskTracker
