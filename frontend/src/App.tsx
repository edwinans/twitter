import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Feed } from './pages/Feed';
import { Users } from './pages/Users';
import { Profile } from './pages/Profile';
import { ProfileRelationships } from './pages/ProfileRelationships';
import { TweetDetail } from './pages/TweetDetail';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:username"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:username/followers"
            element={
              <ProtectedRoute>
                <ProfileRelationships kind="followers" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:username/following"
            element={
              <ProtectedRoute>
                <ProfileRelationships kind="following" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tweet/:id"
            element={
              <ProtectedRoute>
                <TweetDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/feed" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
