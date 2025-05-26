import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import BottomMenu from './common/components/BottomMenu';
import SocketController from './SocketController';
import CachingController from './CachingController';
import { useCatch, useEffectAsync } from './reactHelper';
import { sessionActions } from './store';
import UpdateController from './UpdateController';
import TermsDialog from './common/components/TermsDialog';
import Loader from './common/components/Loader';
import { apiGet, apiPut } from './common/util/api';

const useStyles = makeStyles(() => ({
  page: {
    flexGrow: 1,
    overflow: 'auto',
  },
  menu: {
    zIndex: 4,
  },
}));

const App = () => {
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const newServer = useSelector((state) => state.session.server.newServer);
  const termsUrl = useSelector((state) => state.session.server.attributes.termsUrl);
  const user = useSelector((state) => state.session.user);

  const acceptTerms = useCatch(async () => {
    try {
      const updatedUser = await apiPut(`/users/${user.id}`, {
        ...user,
        attributes: { ...user.attributes, termsAccepted: true },
      });
      dispatch(sessionActions.updateUser(updatedUser));
    } catch (error) {
      console.error('Error accepting terms:', error);
      throw error;
    }
  });

  useEffectAsync(async () => {
    if (!user) {
      try {
        console.log('🔍 Checking for existing session...');
        const sessionData = await apiGet('/session');
        console.log('✅ Session found, user logged in:', sessionData.email || sessionData.name);
        dispatch(sessionActions.updateUser(sessionData));
      } catch (error) {
        console.log('❌ No valid session found:', error.message);
        if (newServer) {
          navigate('/register');
        } else {
          navigate('/login');
        }
      }
    }
    return null;
  }, [user]);

  if (user == null) {
    return (<Loader />);
  }
  if (termsUrl && !user.attributes.termsAccepted) {
    return (<TermsDialog open onCancel={() => navigate('/login')} onAccept={() => acceptTerms()} />);
  }
  return (
    <>
      <SocketController />
      <CachingController />
      <UpdateController />
      <div className={classes.page}>
        <Outlet />
      </div>
      {!desktop && (
        <div className={classes.menu}>
          <BottomMenu />
        </div>
      )}
    </>
  );
};

export default App;
