import React, { useState, useEffect, useContext } from 'react'

import { BsInfoSquareFill  } from 'react-icons/bs'

import Clock from '../Clock';
import Task from './Task';
import AddTask from './AddTask';
import UserContext from '../UserContext';
import Datepicker from './Datepicker';

const sortTypes = {
    'date': {
        title: 'Date',
        func: (a, b) => a.date - b.date,
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
        func: (a, b) => a.text.localeCompare(b.text),
    },
}

const TaskTracker = () => {

    const { token } = useContext(UserContext);


    const [showModal, setShowModal] = useState(false);
    const [sortType, setSortType] = useState(sortTypes['date']);

    const [tasks, setTasks] = useState([]);
    const [hash, setHash] = useState(null);

    // Fetch Tasks from server
    const fetchTasks = async date => {

        try {
            const res = await fetch(`http://localhost/tasks?date=${date}&hash=${hash}&token=${token}`)
            const data = await res.json();

            if(data.hash === hash) return;

            // Convert timestamp to Date object.
            data.result.forEach(task => task.date = new Date(task.date));
            data.result.sort(sortType.func);
            setTasks(data.result);
            setHash(data.hash)

        } catch (err) {
            console.log(err);
            return [];
        }
    }

    const [date, setDate] = useState('');
    const onChangeDate = date => {
        setDate(date);
        fetchTasks(date);
    }


    // Fetch Single Tasks from server
    const fetchTask = async id => {
        const res = await fetch(`https://b1a1ccd6-5f98-4563-bb39-bfb3e6dbf241.mock.pstmn.io/tasks?id=${id}`)
        const data = await res.json();

        // Convert timestamp to Date object.
        data.date = new Date(data.date);

        return data;
    }

    // Delete Task
    const deleteTask = async id => {

        try {
            const res = await fetch(`http://localhost/tasks?id=${id}&token=${token}`, {
                method: 'DELETE',
            })

            if (res.status !== 200) throw new Error('Something went wrong!');
            const data = await res.json();
            setTasks(tasks.filter(task => task.id !== id));
            console.log(data)

        } catch (err) {
            console.log(err)
        }
    }


    // Add a new Task
    const addTask = async task => {

        const newTask = { ...task, date: new Date(task.date).getTime(), token: token };

        try {
            const res = await fetch('http://localhost/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            })

            if (res.status !== 200) throw new Error('Something went wrong!');
            /*
            const data = await res.json();
            data.date = new Date(data.date);

            const newTasks = [...tasks, data];
            newTasks.sort(sortType.func);
            setTasks(newTasks);
            */
            onChangeDate(task.date.split('T')[0]);
    
        } catch (err) {
            console.log(err);
            return [];
        }

    }

    const toggleDone = async task => {

        const updatedTask = { ...task, done: !task.done, date: task.date.getTime() };
        updatedTask.token = token;

        try {
            const res = await fetch('http://localhost/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedTask)
            })

            const data = await res.json();
            data.date = new Date(data.date);

            const newTasks = tasks.map(task => task.id === data.id ? data : task);
            newTasks.sort(sortType.func);
            setTasks(newTasks);

        } catch (err) {
            console.log(err)
        }
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

                <Datepicker onChangeDate={onChangeDate} date={date} />

                {showModal ? <AddTask showModal={setShowModal} onAdd={addTask} /> : null}

                <div className="flex flex-col justify-center px-10 pt-4 ">
                    {tasks.length > 0 ? (
                        tasks.map(task => (
                            <Task key={task.id} task={task} onDelete={deleteTask} toggleDone={toggleDone} />
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
