
import { Route, Switch } from 'react-router-dom';
import Home from './views/Home'
import './App.css';
import NotFound from './views/NotFound/NotFound';
import LandingPage from './views/LandingPage/LandingPage';
import LoginPage from './views/LoginPage/LoginPage';
import PostDetail from './views/PostDetail/PostDetail';
import About from './views/About/About';
import TestPosts from './Components/TestPosts/TestPosts';

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path='/home'>
          <Home />
        </Route>
        <Route exact path='/'>
          <LandingPage />
        </Route>
        <Route exact path='/login'>
          <LoginPage />
        </Route>
        <Route exact path='/about'>
          <About />
        </Route>
        <Route exact path='/posts/:id'>
          <PostDetail />
        </Route>
        <Route exact path='/testposts'>
          <TestPosts />
        </Route>
        <Route path='*'>
          <NotFound />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
