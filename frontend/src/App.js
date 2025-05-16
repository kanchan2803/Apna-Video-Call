import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';
import HomeComponent from './pages/home';
import History from './pages/history';

function App() {
  return (

      <Router>
        <AuthProvider>
          <div className="App">
            
            {/* <Navbar />  Add Navbar component here */}
            {/* <HeroSection />  Add Hero Section here */}
            {/* <FeaturesSection />  Add Features Section here */}
            {/* <Footer />   */}

            <Routes>

              <Route path='/' element={<LandingPage />} />

              <Route path='/auth' element={<Authentication />} />

              <Route path='/home's element={<HomeComponent />} />
              <Route path='/history' element={<History />} />
              <Route path='/:url' element={<VideoMeetComponent />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    
  );
}

export default App;

