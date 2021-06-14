import './css/Tailwind.css'
import './css/App.css';


import Nav from './components/website/Nav';
import Footer from './components/website/Footer';
import TaskTracker from './components/tasks/TaskTracker';


import { BrowserRouter as Router, Route } from 'react-router-dom';
import Authorization from './components/Authorization';


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
      <Route path='/' exact component={Authorization} />
        <Route path='/taskTracker'  component={TaskTracker} />
      </Router>

      <Footer />
      
    </>

  );

}

export default App;
