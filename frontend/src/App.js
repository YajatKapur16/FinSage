import { ForumProvider } from './contexts/ForumContext';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { ExpenseProvider } from './contexts/ExpenseContext';

// Components
import Layout from './components/Layout';
import Landing from './components/LandingPage';
import LoginSignup from './components/LoginSignup';
import Dashboard from './components/Dashboard';
import Expenses from './components/ExpenseManager';
import Forum from './components/Forum/Forum';
import ThreadDetail from './components/Forum/ThreadDetail';
import Profile from './components/Profile';
import PrivateRoute from './components/PrivateRoute';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <ForumProvider>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <AuthProvider>
            <ExpenseProvider>
              <Router>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<LoginSignup />} />
                  <Route path="/auth" element={<LoginSignup />} />
                  
                  {/* Protected Routes */}
                  <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/forum" element={<Forum />} />
                    <Route path="/forum/threads/:threadId" element={<ThreadDetail />} />
                    <Route path="/profile" element={<Profile />} />
                  </Route>
                  
                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
            </ExpenseProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ForumProvider>
  );
}

export default App;