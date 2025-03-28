import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import SelectUserField from '../common/components/SelectUserField';
import SelectDeviceField from '../common/components/SelectDeviceField';
import useSettingsStyles from './common/useSettingsStyles';
import AsaasAPI from '../common/util/AsaasAPI';

const SubscriptionPage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Map Asaas subscription to our format
  const mapSubscription = (subscription) => ({
    id: subscription.id,
    name: subscription.description || `Subscription #${subscription.id}`,
    type: subscription.cycle,
    price: subscription.value,
    status: subscription.status.toLowerCase(),
    deviceIds: subscription.deviceIds || [],
    externalReference: subscription.externalReference,
    userId: subscription.userId,
  });

  // For mapping back to Asaas format when saving
  const mapToAsaasFormat = (formData) => ({
    value: formData.price,
    cycle: formData.type,
    description: formData.name,
    externalReference: formData.externalReference,
    userId: formData.userId,
    deviceIds: formData.deviceIds,
  });

  const validate = () => item && item.type && item.price && item.userId && item.deviceIds && item.deviceIds.length > 0;

  // Handle user selection change
  const handleUserChange = (userId) => {
    setItem({
      ...item,
      userId,
      deviceIds: [], // Reset deviceIds when user changes
    });
  };

  // Handle device selection change
  const handleDeviceChange = (deviceIds) => {
    setItem({
      ...item,
      deviceIds,
    });
  };

  // Load subscription data when id changes
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!id) return; // Skip for new subscription

      setLoading(true);
      setError(null);
      try {
        const subscription = await AsaasAPI.getSubscription(id);
        setItem(mapSubscription(subscription));
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError(AsaasAPI.handleError(err) || 'Failed to load subscription');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [id]);

  // Initialize empty subscription for new entries
  useEffect(() => {
    if (!id && !item) {
      setItem({
        name: '',
        type: '',
        price: 0,
        deviceIds: [],
        externalReference: '',
        userId: '',
      });
    }
  }, [id, item]);

  const handleSave = async () => {
    if (!validate()) {
      setError(t('errorGeneral'));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const asaasData = mapToAsaasFormat(item);

      if (id) {
        // Update existing subscription
        await AsaasAPI.updateSubscription(id, asaasData);
        setSuccess('Subscription updated successfully');
      } else {
        // Create new subscription
        const response = await AsaasAPI.createSubscription(asaasData);
        setSuccess('Subscription created successfully');

        // Navigate to the new subscription's page
        setTimeout(() => {
          navigate(`/settings/subscription/${response.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving subscription:', err);
      setError(AsaasAPI.handleError(err) || 'Failed to save subscription');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !item) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'settingsSubscriptions', id ? 'sharedEdit' : 'sharedAdd']}
    >
      {(item || !id) && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <SelectUserField
                value={item?.userId || ''}
                onChange={handleUserChange}
                label={t('sharedUser')}
                required
              />
              <SelectDeviceField
                value={item?.deviceIds || []}
                onChange={handleDeviceChange}
                label={t('deviceTitle')}
                userId={item?.userId}
                required
              />
              <FormControl required>
                <InputLabel>{t('subscriptionCycle')}</InputLabel>
                <Select
                  label={t('subscriptionCycle')}
                  value={item?.type || ''}
                  onChange={(e) => setItem({ ...item, type: e.target.value })}
                >
                  <MenuItem value="WEEKLY">{t('subscriptionCycleWeekly')}</MenuItem>
                  <MenuItem value="BIWEEKLY">{t('subscriptionCycleBiweekly')}</MenuItem>
                  <MenuItem value="MONTHLY">{t('subscriptionCycleMonthly')}</MenuItem>
                  <MenuItem value="BIMONTHLY">{t('subscriptionCycleBimonthly')}</MenuItem>
                  <MenuItem value="QUARTERLY">{t('subscriptionCycleQuarterly')}</MenuItem>
                  <MenuItem value="SEMIANNUALLY">{t('subscriptionCycleSemiannually')}</MenuItem>
                  <MenuItem value="YEARLY">{t('subscriptionCycleYearly')}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                type="number"
                value={item?.price || 0}
                onChange={(e) => setItem({ ...item, price: Number(e.target.value) })}
                label={t('subscriptionPrice')}
                required
              />
              <TextField
                value={item?.externalReference || ''}
                onChange={(e) => setItem({ ...item, externalReference: e.target.value })}
                label={t('externalReference')}
              />
            </AccordionDetails>
          </Accordion>

          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '16px 0' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading || !validate()}
            >
              {loading ? <CircularProgress size={24} /> : t('sharedSave')}
            </Button>
          </div>

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

          {/* Success notification */}
          <Snackbar
            open={!!success}
            autoHideDuration={3000}
            onClose={() => setSuccess(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
              {success}
            </Alert>
          </Snackbar>
        </>
      )}
    </PageLayout>
  );
};

export default SubscriptionPage;
