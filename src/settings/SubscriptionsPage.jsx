import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableRow, TableCell, TableHead, TableBody, TableFooter, FormControlLabel, Switch,
  Snackbar, Alert, Button,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import RefreshIcon from '@mui/icons-material/Refresh';
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
import AsaasAPI from '../common/util/AsaasAPI';

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
  const [error, setError] = useState(null);

  const actionDetails = {
    key: 'details',
    title: t('sharedDetails'),
    icon: <LinkIcon fontSize="small" />,
    handler: (subscriptionId) => navigate(`/settings/subscription/${subscriptionId}/details`),
  };

  // Convert Asaas API subscription data to our app's format
  const mapSubscriptionData = (apiData) => apiData.map((subscription) => ({
    id: subscription.id,
    name: subscription.description || `Subscription #${subscription.id}`,
    type: subscription.cycle,
    price: subscription.value,
    status: subscription.status.toLowerCase(),
    features: subscription.description,
    customer: subscription.customer,
    externalReference: subscription.externalReference,
    creationTime: subscription.dateCreated,
    expirationTime: subscription.nextDueDate,
  }));

  // Fetch subscriptions from Asaas API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching subscriptions...');
      const response = await AsaasAPI.getSubscriptions();
      console.log('API response:', response);

      if (response && response.data) {
        const mappedData = mapSubscriptionData(response.data);
        setItems(mappedData);
        console.log('Subscriptions loaded:', mappedData.length);
      } else {
        console.error('Invalid API response:', response);
        setError('Invalid response format from API');
      }
    } catch (err) {
      console.error('Subscription fetch error:', err);
      setError(err.message || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or when timestamp changes
  useEffect(() => {
    fetchData();
  }, [timestamp]);

  // Handle refresh button click
  const handleRefresh = () => {
    setTimestamp(Date.now());
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsSubscriptions']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
          sx={{ ml: 2 }}
          disabled={loading}
        >
          {t('sharedRefresh')}
        </Button>
      </SearchHeader>
      {error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Using proxy endpoint for API calls.
          {' '}
          {error}
        </Alert>
      )}
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedName')}</TableCell>
            <TableCell>{t('subscriptionType')}</TableCell>
            <TableCell>{t('subscriptionPrice')}</TableCell>
            <TableCell>{t('subscriptionStatus')}</TableCell>
            <TableCell>{t('userEmail')}</TableCell>
            <TableCell>{t('sharedReference')}</TableCell>
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
                  R$
                  {item.price.toFixed(2)}
                </TableCell>
                <TableCell>{t(`subscriptionStatus${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`)}</TableCell>
                <TableCell>{item.customer}</TableCell>
                <TableCell>{item.externalReference || '-'}</TableCell>
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
            )) : (<TableShimmer columns={8} endAction />)}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={8} align="right">
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

      {/* Error notification */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default SubscriptionsPage;
