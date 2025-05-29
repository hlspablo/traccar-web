import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
  Snackbar, Alert, Button, Box, Typography, IconButton,
  Tooltip, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import PersonIcon from '@mui/icons-material/Person';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';
import AsaasAPI from '../common/util/AsaasAPI';
import useCustomerCache from '../common/util/useCustomerCache';
import { apiGet, apiPut } from '../common/util/api';

const SubscriptionsPage = () => {
  const classes = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination state
  const [offset, setOffset] = useState(0);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Use customer cache hook
  const {
    fetchCustomerName,
    isCustomerCached,
    isCustomerLoading,
    getCustomerName,
  } = useCustomerCache();

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
      const response = await AsaasAPI.getSubscriptions(offset, limit);

      if (response && response.data) {
        const mappedData = mapSubscriptionData(response.data);
        setItems(mappedData);

        // Update pagination info
        setHasMore(response.hasMore || false);
        setTotalCount(response.totalCount || 0);
      } else {
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

  // Handle delete subscription
  const handleDeleteClick = (subscription) => {
    setSubscriptionToDelete(subscription);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSubscriptionToDelete(null);
  };

  // Update user attributes to remove subscription
  const updateUserSubscriptionAttributes = async (subscriptionId) => {
    try {
      // Find the subscription to get the customer information
      const subscription = items.find((item) => item.id === subscriptionId);
      if (!subscription || !subscription.externalReference) {
        console.warn('Subscription not found or no external reference');
        return;
      }

      // Extract user ID from external reference (format: "userId-deviceId")
      const userId = subscription.externalReference.split('-')[0];
      if (!userId) {
        console.warn('Could not extract user ID from external reference');
        return;
      }

      // Get the specific user data who owns the subscription
      const userData = await apiGet(`/users/${userId}`);

      // Find and remove the subscription attribute
      const updatedAttributes = { ...userData.attributes };

      // Look for the subscription attribute key that matches the subscription ID
      Object.keys(updatedAttributes).forEach((key) => {
        if (key.startsWith('subscription_') && updatedAttributes[key] === subscriptionId) {
          delete updatedAttributes[key];
        }
      });

      // Update the user with modified attributes
      const updatedUser = {
        ...userData,
        attributes: updatedAttributes,
      };

      await apiPut(`/users/${userId}`, updatedUser);
    } catch (err) {
      console.error('Error updating user attributes:', err);
      throw new Error('Failed to update user subscription attributes');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!subscriptionToDelete) return;

    setDeleting(true);
    try {
      // Delete subscription from Asaas API
      await AsaasAPI.deleteSubscription(subscriptionToDelete.id);

      // Update user attributes to remove the subscription
      await updateUserSubscriptionAttributes(subscriptionToDelete.id);

      // Refresh the subscription list
      setTimestamp(Date.now());

      // Close dialog
      setDeleteDialogOpen(false);
      setSubscriptionToDelete(null);

      // Show success message (optional - you can add a success state if needed)
    } catch (err) {
      console.error('Delete subscription error:', err);
      setError(err.message || 'Failed to delete subscription');
    } finally {
      setDeleting(false);
    }
  };

  // Navigate to subscription details
  const handleViewDetails = (id) => {
    navigate(`/settings/subscription/${id}/view`);
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
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{item.customer}</Typography>
                    <Tooltip title={isCustomerCached(item.customer) ? 'Nome carregado' : 'Carregar nome do cliente'}>
                      <IconButton
                        size="small"
                        onClick={() => fetchCustomerName(item.customer)}
                        disabled={isCustomerLoading(item.customer)}
                        color={isCustomerCached(item.customer) ? 'success' : 'default'}
                      >
                        {isCustomerLoading(item.customer) ? (
                          <CircularProgress size={16} />
                        ) : (
                          <PersonIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    {getCustomerName(item.customer) && (
                      <Typography variant="body2" color="textSecondary">
                        (
                        {getCustomerName(item.customer)}
                        )
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{item.externalReference || '-'}</TableCell>
                <TableCell>{formatTime(item.expirationTime, 'date')}</TableCell>
                <TableCell className={classes.columnAction} padding="none">
                  <Button
                    onClick={() => handleViewDetails(item.id)}
                    size="small"
                    startIcon={<LinkIcon fontSize="small" />}
                    sx={{ mr: 1 }}
                  >
                    {t('sharedDetails')}
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(item)}
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon fontSize="small" />}
                    disabled={loading || deleting}
                  >
                    {t('sharedRemove')}
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
          px: 3,
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

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {t('sharedRemove')}
          {' '}
          {t('settingsSubscription')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {t('sharedRemoveConfirm')}
            {' '}
            {subscriptionToDelete?.id}
            ?
            <br />
            <strong>{t('deviceDeleteWarning')}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            {t('sharedCancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? t('sharedLoading') : t('sharedRemove')}
          </Button>
        </DialogActions>
      </Dialog>

      <CollectionFab editPath="/settings/subscription" />
    </PageLayout>
  );
};

export default SubscriptionsPage;
