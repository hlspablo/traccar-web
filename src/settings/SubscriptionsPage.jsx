import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
  Snackbar, Alert, Button, Box, Typography,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
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

  // Pagination state
  const [offset, setOffset] = useState(0);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

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

  // Fetch subscriptions from Asaas API with pagination
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching subscriptions with offset=${offset}, limit=${limit}...`);
      const response = await AsaasAPI.getSubscriptions(offset, limit);
      console.log('API response:', response);

      if (response && response.data) {
        const mappedData = mapSubscriptionData(response.data);
        setItems(mappedData);

        // Update pagination info
        setHasMore(response.hasMore || false);
        setTotalCount(response.totalCount || 0);

        console.log('Subscriptions loaded:', mappedData.length);
        console.log('Pagination:', {
          hasMore: response.hasMore,
          totalCount: response.totalCount,
          offset,
          limit,
        });
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

  // Load data when component mounts or when timestamp or pagination changes
  useEffect(() => {
    fetchData();
  }, [timestamp, offset, limit]);

  // Handle refresh button click
  const handleRefresh = () => {
    setTimestamp(Date.now());
  };

  // Navigate to subscription details
  const handleViewDetails = (id) => {
    navigate(`/settings/subscription/${id}/details`);
  };

  // Handle pagination
  const handleNextPage = () => {
    setOffset((prevOffset) => prevOffset + limit);
  };

  const handlePrevPage = () => {
    setOffset((prevOffset) => Math.max(0, prevOffset - limit));
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

      {/* Pagination controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          mb: 2,
        }}
      >
        <Typography variant="body2">
          {totalCount > 0
            ? `${Math.min(offset + 1, totalCount)}-${Math.min(offset + limit, totalCount)} ${t('paginationOf')} ${totalCount}`
            : `0 ${t('paginationOf')} 0`}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<NavigateBeforeIcon />}
            disabled={offset === 0 || loading}
            onClick={handlePrevPage}
            sx={{ mr: 1 }}
          >
            {t('sharedPrevious')}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            endIcon={<NavigateNextIcon />}
            disabled={!hasMore || loading}
            onClick={handleNextPage}
          >
            {t('sharedNext')}
          </Button>
        </Box>
      </Box>

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
