import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  CircularProgress,
  Box,
  Grid,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { formatTime } from '../common/util/formatter';

const SubscriptionsByUser = () => {
  const t = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [expanded, setExpanded] = useState(false);

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

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user data
        const userResponse = await fetch(`/api/users/${id}`);
        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        setUser(userData);

        // Get subscription IDs from user attributes
        const subscriptionIds = [];
        if (userData.attributes) {
          Object.keys(userData.attributes).forEach((key) => {
            if (key.startsWith('subscription_')) {
              const subscriptionId = key.substring('subscription_'.length);
              subscriptionIds.push(subscriptionId);
            }
          });
        }

        if (subscriptionIds.length === 0) {
          setSubscriptions([]);
          setLoading(false);
          return;
        }

        // Fetch all subscriptions in parallel
        const subscriptionPromises = subscriptionIds.map((subId) => fetchWithProxy(`/v3/subscriptions/${subId}`)
          .then(handleResponse)
          .catch((error) => {
            console.error(`Error fetching subscription ${subId}:`, error);
            return null; // Return null for failed fetches
          }));

        const results = await Promise.all(subscriptionPromises);
        const validSubscriptions = results.filter((sub) => sub !== null);
        setSubscriptions(validSubscriptions);
      } catch (err) {
        console.error('Error fetching user subscriptions:', err);
        setError(err.message || 'Failed to load user subscriptions');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserSubscriptions();
    } else {
      setError('User ID is required');
      setLoading(false);
    }
  }, [id]);

  const handleBack = () => {
    navigate('/settings/users');
  };

  const handleViewSubscription = (subscriptionId) => {
    navigate(`/settings/subscription/${subscriptionId}/view`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsUsers', 'userSubscriptions']}>
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
      ) : (
        <>
          {user && (
            <Card sx={{ mb: 3 }}>
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
          )}

          <Typography variant="h6" gutterBottom sx={{ ml: 2 }}>
            {t('settingsSubscriptions')}
          </Typography>

          {subscriptions.length > 0 ? (
            subscriptions.map((subscription) => (
              <Accordion
                key={subscription.id}
                expanded={expanded === subscription.id}
                onChange={handleChange(subscription.id)}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{subscription.id}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
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
                      <Typography variant="subtitle2">{t('externalReference')}</Typography>
                      <Typography variant="body1">
                        {subscription.externalReference || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleViewSubscription(subscription.id)}
                        >
                          {t('viewSubscription')}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography variant="body1">
              {t('sharedNoData')}
            </Typography>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default SubscriptionsByUser;
