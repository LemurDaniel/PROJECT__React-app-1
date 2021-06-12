import './css/Tailwind.css'
import './css/App.css';


import Nav from './pages/fragments/Nav';
import Footer from './pages/fragments/Footer';
import TaskTracker from './pages/TaskTracker';


import { BrowserRouter as Router, Route } from 'react-router-dom';


function App() {


  const navigations = [
    {
      title: 'Task Tracker',
      url: '/taskTracker'
    },
    {
      title: 'Task Tracker',
      url: '/taskTracker'
    },
    {
      title: 'Task Tracker',
      url: '/taskTracker1'
    },
  ]

  return (

    <>

      <Nav navigations={navigations}/>

      <Router>
        <Route path='/taskTracker' exact component={TaskTracker} />
      </Router>

      <Footer />
      
    </>

  );

}

export default App;
