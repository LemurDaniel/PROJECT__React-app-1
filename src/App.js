import './css/Tailwind.css'
import './css/App.css';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';


import Nav from './components/website/Nav';
import Footer from './components/website/Footer';

import Home from './pages/Home';

import UserContext from './components/UserContext';
import TaskTracker from './components/tasks/TaskTracker';
import Spacegame from './components/Spacegame';
import Drawing from './components/images/Drawing';
import Gallery from './components/images/Gallery';


const navigations = [
  {
    title: 'Task Tracker',
    url: '/taskTracker'
  },
  {
    title: 'Gallery',
    url: '/gallery'
  },
  {
    title: 'Doodle',
    url: '/drawing'
  },
  {
    title: 'Asteroids',
    url: '/game'
  },
]


function App() {

  // const [meta, setMeta] = useState({ user: 'testing', endpoint: 'http://localhost', token: '' });
  const [meta, setMeta] = useState({ endpoint: window.location.origin });
  useEffect(() => {
    const call = async () => {
      const res = await fetch(meta.endpoint + `/user?token=${meta.token}`);
      if (res.status !== 200) setMeta({ ...meta, user: null, token: null });

      const data = await res.json();
      setMeta( { ...meta, user: data.userDisplayName } );
      
    }
    call();
  }, []);

  return (

    <>
      <UserContext.Provider value={{ meta, setMeta }}>

        <Nav navigations={navigations} />

        <div className="min-h-screen md:min-h-full">
          <Router>

            <Route path='/' exact component={Home} />
            <Route path='/game' exact component={Spacegame} />
            <Route path='/taskTracker' component={TaskTracker} />
            <Route path='/gallery' component={Gallery} />
            <Route path='/drawing' component={Drawing} />

          </Router>
        </div>

        <Footer />

      </UserContext.Provider>

    </>

  );

}

export default App;
