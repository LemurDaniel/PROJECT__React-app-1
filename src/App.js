import './css/Tailwind.css'
import './css/App.css';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import { useState } from 'react';


import Nav from './components/website/Nav';
import Footer from './components/website/Footer';

import Tasktracking from './pages/Tasktracking';
import Home from './pages/Home';

import UserContext from './components/UserContext';
import Imagegallery from './pages/Imagegallery';


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
  const [user, setUser] = useState(currUser);

  const cookie2 = document.cookie.split(';').filter(v => v.includes('doodle_token='))[0];
  const currToken = !cookie2 ? null : cookie2.split('=')[1];
  const [token, setToken] = useState(currToken);

  console.log(currUser)
  console.log(cookie)

  return (

    <>
      <UserContext.Provider value={{ user, setUser, token, setToken }}>

        <Nav navigations={navigations} />

        <Router>

          <Route path='/' exact component={Home} />
          <Route path='/taskTracker' component={Tasktracking} />
          <Route path='/gallery' component={Imagegallery} />
          <Route path='/drawing' component={Tasktracking} />

        </Router>

        <Footer />

      </UserContext.Provider>
    </>

  );

}

export default App;
