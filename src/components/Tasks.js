import Task from "./Task";

const Tasks = ({ tasks, onDelete }) => {

    
    return (

        <div className="flex flex-col justify-center px-10 ">
            {tasks.map( (task, i) => (
                <Task task={task} onDelete={onDelete} /> )
            )}
        </div>

    );
}

export default Tasks