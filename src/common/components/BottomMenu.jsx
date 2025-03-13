import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper, BottomNavigation, BottomNavigationAction, Badge,
} from '@mui/material';

import DescriptionIcon from '@mui/icons-material/Description';
import MapIcon from '@mui/icons-material/Map';

import { useTranslation } from './LocalizationProvider';
import { useRestriction } from '../util/permissions';

const BottomMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslation();

  const disableReports = useRestriction('disableReports');
  const socket = useSelector((state) => state.session.socket);

  const currentSelection = () => {
    if (location.pathname.startsWith('/reports')) {
      return 'reports';
    } if (location.pathname === '/') {
      return 'map';
    }
    return null;
  };

  const handleSelection = (event, value) => {
    switch (value) {
      case 'map':
        navigate('/');
        break;
      case 'reports':
        navigate('/reports/combined');
        break;
      default:
        break;
    }
  };

  return (
    <Paper square elevation={3}>
      <BottomNavigation value={currentSelection()} onChange={handleSelection} showLabels>
        <BottomNavigationAction
          label={t('mapTitle')}
          icon={(
            <Badge color="error" variant="dot" overlap="circular" invisible={socket !== false}>
              <MapIcon />
            </Badge>
          )}
          value="map"
        />
        {!disableReports && (
          <BottomNavigationAction label={t('reportTitle')} icon={<DescriptionIcon />} value="reports" />
        )}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomMenu;
