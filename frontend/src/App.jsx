import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/" element={<div>User Dashboard (To be built)</div>} />
        <Route path="*" element={<div>User Dashboard (To be built)</div>} />
      </Routes>
    </Router>
  );
}

export default App;

