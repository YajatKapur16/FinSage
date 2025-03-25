import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #121212 0%, #1E1E1E 100%)'
        }}
      >
        <CircularProgress sx={{ color: '#FF6B00' }} />
      </Box>
    );
  }

  if (!currentUser && !loading) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;