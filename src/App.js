import './css/Tailwind.css'
import './css/App.css';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';


import Nav from './components/website/Nav';
import Footer from './components/website/Footer';

import Tasktracking from './pages/Tasktracking';
import Home from './pages/Home';

import UserContext from './components/UserContext';
import Imagegallery from './pages/Imagegallery';
import Drawing from './components/images/Drawing';
import Spacegame from './components/game/Spacegame';


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
]


function App() {

  const cookie = document.cookie.split(';').filter(v => v.includes('user='))[0];
  const currUser = !cookie ? null : cookie.split('=')[1];

  const cookie2 = document.cookie.split(';').filter(v => v.includes('doodle_token='))[0];
  const currToken = !cookie2 ? null : cookie2.split('=')[1];

  const [meta, setMeta] = useState({ user: currUser, token: currToken, endpoint: 'http://localhost' });
  useEffect(() => {
    const call = async () => {
      if(!currToken) return;
      const res = await fetch(meta.endpoint+`/user?token=${currToken}`);
      if(res.status === 200) return;
      setMeta({ user: null, token: null });
      document.cookie = "user=null; max-age=0";
      document.cookie = "doodle_token=null; max-age=0";
    }
    call();
  }, []);

  console.log(currUser)
  console.log(cookie)

  return (

    <>
      <UserContext.Provider value={{ meta, setMeta }}>

        <Nav navigations={navigations} />

        <Router>

          <Route path='/' exact component={Home} />
          <Route path='/game' exact component={Spacegame} />
          <Route path='/taskTracker' component={Tasktracking} />
          <Route path='/gallery' component={Imagegallery} />
          <Route path='/drawing' component={Drawing} />

        </Router>

        <Footer />

      </UserContext.Provider>

    </>

  );

}

export default App;
