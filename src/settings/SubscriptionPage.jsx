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
  FormControlLabel,
  Checkbox,
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
import { useAdministrator, useManager } from '../common/util/permissions';
import useSettingsStyles from './common/useSettingsStyles';
import AsaasAPI from '../common/util/AsaasAPI';

const SubscriptionPage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();
  const navigate = useNavigate();

  const admin = useAdministrator();
  const manager = useManager();

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
    features: subscription.description,
    customer: subscription.customer,
    externalReference: subscription.externalReference,
    billingType: subscription.billingType,
    creationTime: subscription.dateCreated,
    expirationTime: subscription.nextDueDate,
    // Add any other fields needed by your form
  });

  // For mapping back to Asaas format when saving
  const mapToAsaasFormat = (formData) => ({
    customer: formData.customer,
    value: formData.price,
    cycle: formData.type,
    description: formData.features,
    externalReference: formData.externalReference,
    // Add other fields needed by Asaas API
  });

  const validate = () => item && item.type && item.price;

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
              <TextField
                value={item?.name || ''}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                label={t('sharedName')}
              />
              <TextField
                value={item?.customer || ''}
                onChange={(e) => setItem({ ...item, customer: e.target.value })}
                label={t('userEmail')}
                required
              />
              <FormControl required>
                <InputLabel>{t('subscriptionType')}</InputLabel>
                <Select
                  label={t('subscriptionType')}
                  value={item?.type || ''}
                  onChange={(e) => setItem({ ...item, type: e.target.value })}
                >
                  <MenuItem value="MONTHLY">{t('subscriptionMonthly')}</MenuItem>
                  <MenuItem value="BIMONTHLY">Bimonthly</MenuItem>
                  <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                  <MenuItem value="SEMIANNUALLY">Semiannually</MenuItem>
                  <MenuItem value="YEARLY">{t('subscriptionAnnual')}</MenuItem>
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
                label={t('sharedReference')}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('subscriptionDetails')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                label={t('subscriptionFeatures')}
                multiline
                rows={4}
                value={item?.features || ''}
                onChange={(e) => setItem({ ...item, features: e.target.value })}
              />
              <TextField
                label={t('subscriptionExpirationTime')}
                type="date"
                value={item?.expirationTime ? item.expirationTime.split('T')[0] : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setItem({ ...item, expirationTime: new Date(e.target.value).toISOString() });
                  }
                }}
                disabled={!manager}
              />
              <TextField
                label={t('subscriptionCreationTime')}
                type="date"
                value={item?.creationTime ? item.creationTime.split('T')[0] : new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  if (e.target.value) {
                    setItem({ ...item, creationTime: new Date(e.target.value).toISOString() });
                  }
                }}
                disabled={!admin}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedPermissions')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <FormControl>
                <InputLabel>{t('subscriptionStatus')}</InputLabel>
                <Select
                  label={t('subscriptionStatus')}
                  value={item?.status || 'active'}
                  onChange={(e) => setItem({ ...item, status: e.target.value })}
                  disabled={!manager}
                >
                  <MenuItem value="active">{t('subscriptionStatusActive')}</MenuItem>
                  <MenuItem value="pending">{t('subscriptionStatusPending')}</MenuItem>
                  <MenuItem value="suspended">{t('subscriptionStatusSuspended')}</MenuItem>
                  <MenuItem value="expired">{t('subscriptionStatusExpired')}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                value={item?.deviceLimit || -1}
                onChange={(e) => setItem({ ...item, deviceLimit: Number(e.target.value) })}
                label={t('userDeviceLimit')}
                type="number"
                disabled={!admin}
              />
              <TextField
                value={item?.userLimit || -1}
                onChange={(e) => setItem({ ...item, userLimit: Number(e.target.value) })}
                label={t('userUserLimit')}
                type="number"
                disabled={!admin}
              />
              <FormControlLabel
                control={<Checkbox checked={item?.allowReports || false} onChange={(e) => setItem({ ...item, allowReports: e.target.checked })} />}
                label={t('subscriptionAllowReports')}
                disabled={!manager}
              />
              <FormControlLabel
                control={<Checkbox checked={item?.allowCommands || false} onChange={(e) => setItem({ ...item, allowCommands: e.target.checked })} />}
                label={t('subscriptionAllowCommands')}
                disabled={!manager}
              />
              <FormControlLabel
                control={<Checkbox checked={item?.allowNotifications || false} onChange={(e) => setItem({ ...item, allowNotifications: e.target.checked })} />}
                label={t('subscriptionAllowNotifications')}
                disabled={!manager}
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
