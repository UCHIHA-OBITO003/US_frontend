import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import FriendRequests from './pages/FriendRequests';
import Stories from './pages/Stories';
import NightMode from './pages/NightMode';
import LoadingScreen from './components/LoadingScreen';
import PrivateRoute from './components/PrivateRoute';
import PasscodeLock from './components/PasscodeLock';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#374151',
            borderRadius: '1rem',
            padding: '1rem',
            boxShadow: '0 4px 20px rgba(255, 107, 179, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#FF6BB3',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/home" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/home" /> : <Register />}
        />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/:partnerId"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/friend-requests"
          element={
            <PrivateRoute>
              <FriendRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/stories"
          element={
            <PrivateRoute>
              <Stories />
            </PrivateRoute>
          }
        />
        <Route
          path="/night-mode"
          element={
            <PrivateRoute>
              <NightMode />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;

