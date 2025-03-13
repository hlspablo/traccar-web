import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Paper, BottomNavigation, BottomNavigationAction, Badge,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import { useTranslation } from './LocalizationProvider';

const BottomMenu = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const socket = useSelector((state) => state.session.socket);

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
      </BottomNavigation>
    </Paper>
  );
};

export default BottomMenu;
