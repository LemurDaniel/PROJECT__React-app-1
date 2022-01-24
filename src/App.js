import './css/Tailwind.css'
import './css/App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';


import Nav from './components/website/Nav';
import Footer from './components/website/Footer';

import Home from './pages/Home';
import Impressum from './pages/Impressum';

import UserContext from './components/UserContext';
import TaskTracker from './components/tasks/TaskTracker';
import Spacegame from './components/game/Spacegame';
import Drawing from './components/images/Drawing';
import Gallery from './components/images/Gallery';



function App() {

  const [meta, setMeta] = useState({ endpoint: window.location.origin });
  useEffect(() => {
    const call = async () => {
      try {
        const res = await fetch(meta.endpoint + `/user?token=${meta.token}`);
        if (res.status !== 200 && res.status !== 304) 
          return setMeta({ ...meta, user: null, token: null });
          
        const data = await res.json();
        setMeta({ ...meta, user: data.userDisplayName });
      } catch (err) {
        return setMeta({ ...meta, user: null, token: null });
      }
    }
    call();
  }, []);

  return (

    <>
      <UserContext.Provider value={{ meta, setMeta }}>

        <Router>

          <Nav />

          <div className="min-h-screen md:min-h-full">
            <Routes>
              <Route path='/' exact element={<Home />} />
              <Route path='/index' exact element={<Home />} />
              <Route path='/game' element={<Spacegame />} />
              <Route path='/taskTracker' element={<TaskTracker />} />
              <Route path='/gallery' element={<Gallery />} />
              <Route path='/drawing' element={<Drawing />} />
              <Route path='/impressum' element={<Impressum />} />
            </Routes>
          </div>

        </Router>

        <Footer />

      </UserContext.Provider>

    </>

  );

}

export default App;
