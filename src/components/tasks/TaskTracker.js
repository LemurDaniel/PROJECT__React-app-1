import React, { useState, useEffect } from 'react'

import { BsInfoSquareFill } from 'react-icons/bs'

import Task from './Task';
import AddTask from './AddTask';

    const sortTypes = {
        'date': {
            title: 'Date',
            func: (a, b) => a.date - b.date,
        },
        'status': {
            title: 'Todo',
            func: (a, b) =>  a.done - b.done ,
        },
        'status_reverse': {
            title: 'Done',
            func: (a, b) =>  !a.done - !b.done ,
        },
        'title': {
            title: 'Title',
            func: (a, b) => a.text.localeCompare(b.text),
        },
    }

const TaskTracker = () => {

    const [showModal, setShowModal] = useState(false);
    const [sortType, setSortType] = useState(sortTypes['date']);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const getTasks = async () => {
            const tasksFromServer = await fetchTasks();
            setTasks(tasksFromServer);
        }
        getTasks();
    }, []);

    // Fetch Tasks from server
    const fetchTasks = async () => {
        const res  = await fetch('https://b1a1ccd6-5f98-4563-bb39-bfb3e6dbf241.mock.pstmn.io/tasks?all')
        const data = await res.json();

        // Convert timestamp to Date object.
        data.forEach( task => task.date = new Date(task.date) );

        return data;
    }

    // Fetch Single Tasks from server
    const fetchTask = async id => {
        const res  = await fetch(`https://b1a1ccd6-5f98-4563-bb39-bfb3e6dbf241.mock.pstmn.io/tasks?id=${id}`)
        const data = await res.json();

        // Convert timestamp to Date object.
        data.date = new Date(data.date);

        return data;
    }

    // Delete Task
    const deleteTask = async id => {
        //const res = await fetch(`https://b1a1ccd6-5f98-4563-bb39-bfb3e6dbf241.mock.pstmn.io/tasks?id=${id}`, {
        //    method: 'DELETE',
        //})

        //if(res.status !== 200) throw 'Something went wrong!';

        //const data = await res.json();
        setTasks(tasks.filter(task => task.id !== id));
    }

    // Add a new Task
    const addTask = async task => {

        const id = tasks.length+1;
        const newTask = { ...task, done: false, date: new Date(task.date).getTime() };

        console.log(newTask)
        const res = await fetch(`https://b1a1ccd6-5f98-4563-bb39-bfb3e6dbf241.mock.pstmn.io/tasks`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask),
        })


        if(res.status !== 200) throw 'Something went wrong';

        const data = await res.json();
        data.date = new Date(data.date);

        const newTasks = [...tasks, data];
        newTasks.sort( sortType.func );
        setTasks(newTasks);
    }

    const toggleDone = async id => {
        
        /*
        const taskToToggle = await fetchTask(id);
        const updatedTask = {...taskToToggle, done: !taskToToggle.done };

        console.log(updatedTask)
        const res = await fetch(`https://b1a1ccd6-5f98-4563-bb39-bfb3e6dbf241.mock.pstmn.io/tasks?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask),
        });

        const data = await res.json();
        data.date = new Date(data.date);
        */

        const data = tasks.filter( v => v.id == id )[0];
        data.done = !data.done;

        // Insert the new Task and replace an eventually existing task.
        const allTasks = tasks.map( v => v.id !== data.id ? v : data );
        allTasks.sort( sortType.func );
        setTasks( allTasks );
    }

    const onSortChange = e => {

        const newSortType = sortTypes[e.target.value];
        setSortType( newSortType );

        const copy = tasks.slice(0);
        copy.sort( newSortType.func ); 
        setTasks( copy );
    }


    return (
        <section className="pt-2 pb-20 px-5 lg:px-40 xl:px-80 select-none">
            <div className="rounded-sm shadow-2xl pb-5">

                <header className="header border-b ">
                    <h1 className='font-bold text-2xl lg:text-4xl text-brand2-300'> Task Tracker </h1>

                    <div className="w-40 mx-auto text-white border-white bg-dark-700 border-2 rounded-md hover:border-brand2-100 focus:border-brand2-100 duration-300">
                        <label htmlFor="sorting" className="px-2">Sort by </label>
                        <select name="sorting" id="sorting" onChange={onSortChange} 
                            className="bg-dark-700 focus:outline-none" >
                            { Object.keys(sortTypes).map( v => <option value={v}>{sortTypes[v].title}</option> )}
                        </select>
                    </div>
                    
                    <button className="btn-custom btn-orange" onClick={ e => setShowModal(!showModal) } > 
                    { !showModal ? 'Add new Task' : 'Close new Task'  }
                    </button>
                </header>

                { showModal ? <AddTask showModal={setShowModal} onAdd={addTask}/>  : null }

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
