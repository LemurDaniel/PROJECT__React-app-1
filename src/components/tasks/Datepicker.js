import React from 'react'

import { BsArrowLeft, BsArrowRight } from 'react-icons/bs'

const Datepicker = ({ date, setDate }) => {


    const moveDate = direction => {
        const newDate = new Date(date);
        newDate.setDate( newDate.getDate() + direction );
        setDate(newDate.toISOString().split('T')[0])
    }


    return (
        <div className="px-14 pt-5 flex justify-between border-white ">
            <BsArrowLeft key='test' className="rounded-light w-8 h-8 " 
                onClick={ e => moveDate(-1) } />

            <input className="bg-transparent text-right  font-bold    text-black filter invert    focus:outline-none select-none"
                type="date" value={date} onChange={e => setDate(e.target.value)} />

            <BsArrowRight className="rounded-light w-8 h-8 " 
                onClick={ e => moveDate(1) } />
        </div>
    )
}


export default Datepicker
