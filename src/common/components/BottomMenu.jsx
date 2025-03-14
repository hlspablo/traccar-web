import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Paper, BottomNavigation, BottomNavigationAction, Badge,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTranslation } from './LocalizationProvider';
import { sessionActions } from '../../store';

const BottomMenu = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const socket = useSelector((state) => state.session.socket);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await fetch('/api/session', { method: 'DELETE' });
    dispatch(sessionActions.updateUser(null));
    navigate('/login');
  };

  return (
    <Paper square elevation={3}>
      <BottomNavigation value="map" onChange={() => navigate('/')} showLabels>
        <BottomNavigationAction
          label={t('mapTitle')}
          icon={(
            <Badge color="error" variant="dot" overlap="circular" invisible={socket !== false}>
              <MapIcon />
            </Badge>
          )}
          value="map"
        />
        <BottomNavigationAction
          onClick={handleLogout}
          label={t('loginLogout')}
          icon={(
            <Badge color="error" variant="dot" overlap="circular" invisible={socket !== false}>
              <LogoutIcon />
            </Badge>
          )}
          value="logout"
        />
      </BottomNavigation>

    </Paper>
  );
};

export default BottomMenu;
