import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
  Snackbar, Alert, Button,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';
import AsaasAPI from '../common/util/AsaasAPI';

const SubscriptionsPage = () => {
  const classes = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setTimeout(() => {
        setLoading(false);
      }, 500); // Small delay to avoid UI flashing on fast responses
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

  // Navigate to subscription details
  const handleViewDetails = (id) => {
    navigate(`/settings/subscription/${id}/details`);
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
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>{t('subscriptionId')}</TableCell>
            <TableCell>{t('subscriptionCycle')}</TableCell>
            <TableCell>{t('subscriptionPrice')}</TableCell>
            <TableCell>{t('subscriptionStatus')}</TableCell>
            <TableCell>{t('clientId')}</TableCell>
            <TableCell>{t('externalReference')}</TableCell>
            <TableCell>{t('nextDueDate')}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? items
            .filter(filterByKeyword(searchKeyword))
            .map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{t(`subscriptionCycle${item.type.charAt(0).toUpperCase() + item.type.slice(1).toLowerCase()}`)}</TableCell>
                <TableCell>
                  R$
                  {item.price.toFixed(2)}
                </TableCell>
                <TableCell>{t(`subscriptionStatus${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`)}</TableCell>
                <TableCell>{item.customer}</TableCell>
                <TableCell>{item.externalReference || '-'}</TableCell>
                <TableCell>{formatTime(item.expirationTime, 'date')}</TableCell>
                <TableCell className={classes.columnAction} padding="none">
                  <Button
                    onClick={() => handleViewDetails(item.id)}
                    size="small"
                    startIcon={<LinkIcon fontSize="small" />}
                  >
                    {t('sharedDetails')}
                  </Button>
                </TableCell>
              </TableRow>
            )) : (<TableShimmer columns={8} endAction />)}
        </TableBody>
      </Table>

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
