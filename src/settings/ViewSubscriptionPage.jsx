import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Button,
  CircularProgress,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { formatTime } from '../common/util/formatter';
import { buildApiUrl } from '../config/apiConfig';

const ViewSubscriptionPage = () => {
  const t = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);

  // Helper function similar to the AsaasAPI utility
  const fetchWithProxy = async (endpoint, options = {}) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`/asaas-proxy${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          access_token: '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmFjZTU1MTFjLWU1OTItNGZiYy05MGYwLTlhNGM2ZGU2ZDNhMDo6JGFhY2hfZTQyODE5MjEtNjljZi00YTAwLWIxNjgtZGQxNzk1ZTU1Nzky',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - API call took too long to respond');
      }
      throw error;
    }
  };

  const handleResponse = async (response) => {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Unknown error' };
      }
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    try {
      return await response.json();
    } catch (e) {
      throw new Error('Failed to parse API response');
    }
  };

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch subscription details from Asaas API
        const response = await fetchWithProxy(`/v3/subscriptions/${id}`);
        const data = await handleResponse(response);
        setSubscription(data);

        // If there's an externalReference, use it to fetch user and devices
        if (data.externalReference) {
          try {
            // Fetch user
            const userId = data.externalReference.split('-')[0];
            const userResponse = await fetch(`/api/users/${userId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUser(userData);
            } else {
              console.warn('Failed to fetch user data');
            }

            // Fetch user devices
            const devicesResponse = await fetch(buildApiUrl('/devices'));
            if (devicesResponse.ok) {
              setDevices(await devicesResponse.json());
            } else {
              console.error('Failed to fetch devices');
            }
          } catch (err) {
            console.error('Error fetching related data:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching subscription details:', err);
        setError(err.message || 'Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSubscriptionDetails();
    } else {
      setError('Subscription ID is required');
      setLoading(false);
    }
  }, [id]);

  const handleBack = () => {
    navigate('/settings/subscriptions');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsSubscriptions', 'subscriptionDetails']}>
      <Box mb={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          {t('sharedBack')}
        </Button>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : subscription && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('subscriptionDetails')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2">{t('subscriptionId')}</Typography>
                    <Typography variant="body1">{subscription.id}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2">{t('subscriptionCycle')}</Typography>
                    <Typography variant="body1">
                      {t(`subscriptionCycle${subscription.cycle.charAt(0).toUpperCase() + subscription.cycle.slice(1).toLowerCase()}`)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2">{t('subscriptionStatus')}</Typography>
                    <Typography variant="body1">
                      {t(`subscriptionStatus${subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).toLowerCase()}`)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2">{t('subscriptionPrice')}</Typography>
                    <Typography variant="body1">
                      R$
                      {' '}
                      {subscription.value.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2">{t('externalReference')}</Typography>
                    <Typography variant="body1">
                      {subscription.externalReference || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2">{t('nextDueDate')}</Typography>
                    <Typography variant="body1">
                      {formatTime(subscription.nextDueDate, 'date')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2">{t('planDescription')}</Typography>
                    <Typography variant="body1">
                      {subscription.description || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2">{t('planValue')}</Typography>
                    <Typography variant="body1">
                      R$
                      {' '}
                      {subscription.value.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {user && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('sharedUser')}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2">{t('sharedName')}</Typography>
                      <Typography variant="body1">{user.name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2">{t('userEmail')}</Typography>
                      <Typography variant="body1">{user.email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2">{t('userPhone')}</Typography>
                      <Typography variant="body1">{user.phone || '-'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('deviceTitle')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {devices.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('sharedName')}</TableCell>
                          <TableCell>{t('deviceIdentifier')}</TableCell>
                          <TableCell>{t('planName')}</TableCell>
                          <TableCell>{t('planValue')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {devices.map((device) => (
                          <TableRow key={device.id}>
                            <TableCell>{device.name}</TableCell>
                            <TableCell>{device.uniqueId}</TableCell>
                            <TableCell>{device.attributes?.planName || '-'}</TableCell>
                            <TableCell>
                              {device.attributes?.planValue
                                ? `R$ ${parseFloat(device.attributes.planValue).toFixed(2)}`
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1">
                    {t('sharedNoData')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </PageLayout>
  );
};

export default ViewSubscriptionPage;
