import Task from "./Task";

const Tasks = ({ tasks }) => {

    
    return (

        <div className="flex flex-col justify-center px-10 ">
            {tasks.map( (task, i) => (
                <Task task={task} even={i%2}/> )
            )}
        </div>

    );
}

export default Tasks