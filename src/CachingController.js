import { useDispatch, useSelector, connect } from 'react-redux';

import {
  geofencesActions, groupsActions, driversActions, maintenancesActions, calendarsActions,
} from './store';
import { useEffectAsync } from './reactHelper';
import { apiGet } from './common/util/api';

const CachingController = () => {
  const authenticated = useSelector((state) => !!state.session.user);
  const dispatch = useDispatch();

  useEffectAsync(async () => {
    if (authenticated) {
      try {
        const data = await apiGet('/geofences');
        dispatch(geofencesActions.refresh(data));
      } catch (error) {
        console.error('Error fetching geofences:', error);
      }
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      try {
        const data = await apiGet('/groups');
        dispatch(groupsActions.refresh(data));
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      try {
        const data = await apiGet('/drivers');
        dispatch(driversActions.refresh(data));
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      try {
        const data = await apiGet('/maintenance');
        dispatch(maintenancesActions.refresh(data));
      } catch (error) {
        console.error('Error fetching maintenance:', error);
      }
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      try {
        const data = await apiGet('/calendars');
        dispatch(calendarsActions.refresh(data));
      } catch (error) {
        console.error('Error fetching calendars:', error);
      }
    }
  }, [authenticated]);

  return null;
};

export default connect()(CachingController);
