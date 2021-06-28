import './css/Tailwind.css'
import './css/App.css';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';


import Nav from './components/website/Nav';
import Footer from './components/website/Footer';

import Home from './pages/Home';
import Impressum from './pages/Impressum';

import UserContext from './components/UserContext';
import TaskTracker from './components/tasks/TaskTracker';
import Spacegame from './components/Spacegame';
import Drawing from './components/images/Drawing';
import Gallery from './components/images/Gallery';



function App() {

  // const [meta, setMeta] = useState({ user: 'Testnutzer (Guest adaff)', endpoint: 'http://192.168.178.41', token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImM3OTJjMzkyMWQxNTY0ZDciLCJ1c2VyRGlzcGxheU5hbWUiOiJUZXN0IHVzZXIyIiwiaWF0IjoxNjI0NTMxMTYxLCJleHAiOjE2MjQ1NzQzNjF9.1b8hAe_QHZgb_95YAfbUMoHdiY4oUQHC2ssIUfI9A85vzz8BoRl7YIfIpeXNADMnraAP_DnzyMpu9z5N6shQ5w' });
  const [meta, setMeta] = useState({ endpoint: window.location.origin });
  useEffect(() => {
    const call = async () => {
      const res = await fetch(meta.endpoint + `/user?token=${meta.token}`);
      if (res.status !== 200 && res.status !== 304) return setMeta({ ...meta, user: null, token: null });

      const data = await res.json();
      setMeta({ ...meta, user: data.userDisplayName });

    }
    call();
  }, []);

  return (

    <>
      <UserContext.Provider value={{ meta, setMeta }}>

        <Router>

          <Nav />

          <div className="min-h-screen md:min-h-full">
            <Route path='/' exact component={Home} />
            <Route path='/index' exact component={Home} />
            <Route path='/game' exact component={Spacegame} />
            <Route path='/taskTracker' component={TaskTracker} />
            <Route path='/gallery' component={Gallery} />
            <Route path='/drawing' component={Drawing} />
            <Route path='/impressum' component={Impressum} />
          </div>

        </Router>

        <Footer />

      </UserContext.Provider>

    </>

  );

}

export default App;
