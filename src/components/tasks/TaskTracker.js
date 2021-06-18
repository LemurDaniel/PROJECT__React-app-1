import React, { useState, useContext, useEffect } from 'react'

import { BsInfoSquareFill } from 'react-icons/bs'

import Clock from '../Clock';
import Task from './Task';
import AddTask from './AddTask';
import UserContext from '../UserContext';
import Datepicker from './Datepicker';

const sortTypes = {
    'time': {
        title: 'Time',
        func: (a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time),
    },
    'status': {
        title: 'Todo',
        func: (a, b) => a.done - b.done,
    },
    'status_reverse': {
        title: 'Done',
        func: (a, b) => !a.done - !b.done,
    },
    'title': {
        title: 'Title',
        func: (a, b) => a.title.localeCompare(b.title),
    },
}

const TaskTracker = () => {

    const { meta } = useContext(UserContext);

    const [showModal, setShowModal] = useState(false);
    const [sortType, setSortType] = useState(sortTypes['time']);

    const [tasks, setTasks] = useState([]);
    const [hash, setHash] = useState(null);

    // Fetch Tasks from server
    const fetchTasks = async date => {

        const res = await fetch(meta.endpoint+`/tasks?date=${date}&hash=${hash}&token=${meta.token}`)
        const data = await res.json();

        if (data.hash === hash) return;

        data.result.sort(sortType.func);
        setTasks(data.result);
        setHash(data.hash)

    }



    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    useEffect(() => fetchTasks(date), [date]);

    // Delete Task
    const deleteTask = async id => {

        const res = await fetch(meta.endpoint+`/tasks?id=${id}&token=${meta.token}`, {
            method: 'DELETE',
        })

        await res.json();

        const filtered = tasks.filter(task => task.id !== id);
        setTasks(filtered);

    }


    // Add a new Task
    const addTask = async task => {

        const res = await fetch(meta.endpoint+`/tasks?token=${meta.token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        })

        const data = await res.json();
        const newTasks = [...tasks, data];
        newTasks.sort(sortType.func)

        setDate(task.date);
        setTasks(newTasks);

    }

    
    const toggleDone = async task => {

        const res = await fetch(meta.endpoint+`/tasks?token=${meta.token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...task, done: !task.done })
        })

        const data = await res.json();

        const newTasks = tasks.map(task => task.id === data.id ? data : task);
        newTasks.sort(sortType.func);
        setTasks(newTasks);
    }


    const onSortChange = e => {

        const newSortType = sortTypes[e.target.value];
        setSortType(newSortType);

        const copy = tasks.slice(0);
        copy.sort(newSortType.func);
        setTasks(copy);
    }


    return (
        <section className="pt-2 pb-20 px-5 lg:px-40 xl:px-80 select-none">
            <div className="rounded-sm shadow-2xl pb-5">

                {/* Header containing Clock, Dropdown and Button */}
                <header className="header border-b ">

                    <div className="pr-4"> <Clock size={65} digital={false} /> </div>

                    <h1 className='font-bold text-2xl lg:text-4xl text-brand2-300'> Task Tracker </h1>

                    <div className="w-40 mx-auto text-white border-white bg-dark-700 border-2 rounded-md hover:border-brand2-100 focus:border-brand2-100 duration-300">
                        <label htmlFor="sorting" className="px-2">Sort by </label>
                        <select name="sorting" id="sorting" onChange={onSortChange}
                            className="bg-dark-700 focus:outline-none" >
                            {Object.keys(sortTypes).map(v => <option key={v} value={v}>{sortTypes[v].title}</option>)}
                        </select>
                    </div>

                    <button className="btn-custom btn-orange" onClick={e => setShowModal(!showModal)} >
                        {!showModal ? 'Add new Task' : 'Close new Task'}
                    </button>
                </header>

                {/* The Datepicker to switch between dates. */}
                <Datepicker setDate={setDate} date={date} />

                {/* The Modal for adding a new Task. */}
                {showModal ? <AddTask showModal={setShowModal} onAdd={addTask} /> : null}

                {/* The list containing all tasks of the current date. */}
                <div className="flex flex-col justify-center px-10 pt-4 ">
                    {tasks.length > 0 ? (
                        tasks.map(task => ( <Task key={task.id} task={task} onDelete={deleteTask} toggleDone={toggleDone} /> ))
                    ) : (
                        <i className="mx-auto py-10 text-2xl text-brand2-100"> <BsInfoSquareFill className="inline" />  No Tasks remaining </i>
                    )
                    }
                </div>

            </div>
        </section>
    )
}

export default TaskTracker
