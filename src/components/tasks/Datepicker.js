import React, { useEffect } from 'react'

import { BsArrowLeft, BsArrowRight } from 'react-icons/bs'

const Datepicker = ({ date, onChangeDate }) => {



    const dateObject_toString = date => {

        const year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
    
        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;

        return year + '-' + month + '-' + day;
    }

    const moveDate = direction => {

        const newDate = new Date(date);
        newDate.setDate( newDate.getDate() + direction );
  
        console.log(dateObject_toString(newDate))
        onChangeDate(dateObject_toString(newDate))
    }

    useEffect( () => {
        console.log(dateObject_toString(new Date()))
        onChangeDate(dateObject_toString(new Date()))
        console.log('tetstst')
    }, [])


    return (
        <div className="px-14 pt-5 flex justify-between border-white ">
            <BsArrowLeft key='test' className="text-white border-2 rounded-full w-8 h-8  hover:bg-white hover:text-dark-700 duration-300" 
                onClick={ e => moveDate(-1) } />
            <input className="bg-transparent rounded-sm text-right font-bold text-black filter invert focus:outline-none select-none"
                type="date" value={date} onChange={e => onChangeDate(e.target.value)} />
            <BsArrowRight className="text-white border-2 rounded-full w-8 h-8  hover:bg-white hover:text-dark-700 duration-300" 
                onClick={ e => moveDate(1) } />
        </div>
    )
}


export default Datepicker
