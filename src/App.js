import './css/Tailwind.css'
import './css/App.css';

import { useState } from 'react'

import Nav from './pages/Nav';
import Footer from './pages/Footer';
import Header from './components/Header';
import Tasks from './components/Tasks';


function App() {

  const [tasks, setTasks] = useState([
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

  return (

    <>

      <Nav />

      <section className="bg-dark-800 py-10 px-5 lg:px-96">
        <div className="border-2 rounded-sm pb-5">

          <Header />
          <Tasks tasks={tasks} />

        </div>
      </section>

      <Footer />
      
    </>

  );
}

export default App;
