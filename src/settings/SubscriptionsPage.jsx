import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableRow, TableCell, TableHead, TableBody, TableFooter, FormControlLabel, Switch,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import { useEffectAsync } from '../reactHelper';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import { useManager } from '../common/util/permissions';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';

const SubscriptionsPage = () => {
  const classes = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExpired, setShowExpired] = useState(false);

  const actionDetails = {
    key: 'details',
    title: t('sharedDetails'),
    icon: <LinkIcon fontSize="small" />,
    handler: (subscriptionId) => navigate(`/settings/subscription/${subscriptionId}/details`),
  };

  // Mock data setup for demonstration
  useEffectAsync(async () => {
    setLoading(true);
    try {
      // This would be an actual API call in production
      // const response = await fetch('/api/subscriptions');
      // if (response.ok) {
      //   setItems(await response.json());
      // } else {
      //   throw Error(await response.text());
      // }

      // Mock data for UI development
      setTimeout(() => {
        const mockSubscriptions = [
          {
            id: 1,
            name: 'Basic Plan',
            type: 'Monthly',
            price: 9.99,
            status: 'active',
            features: 'Basic tracking',
            creationTime: '2023-01-15T00:00:00.000Z',
            expirationTime: '2024-01-15T00:00:00.000Z',
          },
          {
            id: 2,
            name: 'Premium Plan',
            type: 'Annual',
            price: 99.99,
            status: 'active',
            features: 'Advanced tracking, reports',
            creationTime: '2023-02-20T00:00:00.000Z',
            expirationTime: '2024-02-20T00:00:00.000Z',
          },
          {
            id: 3,
            name: 'Enterprise Plan',
            type: 'Monthly',
            price: 29.99,
            status: 'expired',
            features: 'Full access',
            creationTime: '2023-03-10T00:00:00.000Z',
            expirationTime: '2023-10-10T00:00:00.000Z',
          },
        ];
        setItems(mockSubscriptions);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [timestamp]);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsSubscriptions']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedName')}</TableCell>
            <TableCell>{t('subscriptionType')}</TableCell>
            <TableCell>{t('subscriptionPrice')}</TableCell>
            <TableCell>{t('subscriptionStatus')}</TableCell>
            <TableCell>{t('subscriptionFeatures')}</TableCell>
            <TableCell>{t('subscriptionExpirationTime')}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? items.filter((s) => showExpired || s.status !== 'expired')
            .filter(filterByKeyword(searchKeyword))
            .map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>
                  $
                  {item.price}
                </TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.features}</TableCell>
                <TableCell>{formatTime(item.expirationTime, 'date')}</TableCell>
                <TableCell className={classes.columnAction} padding="none">
                  <CollectionActions
                    itemId={item.id}
                    editPath="/settings/subscription"
                    endpoint="subscriptions"
                    setTimestamp={setTimestamp}
                    customActions={manager ? [actionDetails] : []}
                  />
                </TableCell>
              </TableRow>
            )) : (<TableShimmer columns={7} endAction />)}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} align="right">
              <FormControlLabel
                control={(
                  <Switch
                    value={showExpired}
                    onChange={(e) => setShowExpired(e.target.checked)}
                    size="small"
                  />
                )}
                label={t('subscriptionShowExpired')}
                labelPlacement="start"
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <CollectionFab editPath="/settings/subscription" />
    </PageLayout>
  );
};

export default SubscriptionsPage;
