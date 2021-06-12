import React from 'react'

import Button from '../components/Button'
import Task from '../components/Task';


const TaskTracker = () => {

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
    const deleteTask = (id) => {
        setTasks(tasks.filter( task => task.id !== id ));
    }

    return (
        <section className="py-10 px-5 lg:px-40 xl:px-80">
            <div className="border-2 rounded-sm pb-5">

                <header className="header">
                    <h1 className='font-bold text-2xl lg:text-4xl text-brand2-300'> Task Tracker </h1>
                    <button className="btn-custom btn-orange" > Add Task </button>
                </header>

                <div className="flex flex-col justify-center px-10 ">
                    {tasks.map( task => (
                        <Task task={task} onDelete={deleteTask} /> )
                    )}
                </div>

            </div>
        </section>
    )
}

export default TaskTracker
