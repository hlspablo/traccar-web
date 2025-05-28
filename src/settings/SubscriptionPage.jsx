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
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider as MuiLocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import SelectUserField from '../common/components/SelectUserField';
import SelectDeviceField from '../common/components/SelectDeviceField';
import useSettingsStyles from './common/useSettingsStyles';
import { apiPost } from '../common/util/api';

const SubscriptionPage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [nextDueDate, setNextDueDate] = useState(dayjs().add(1, 'day'));

  const validate = () => item && item.type && item.userId && item.deviceIds && item.deviceIds.length > 0 && nextDueDate && nextDueDate.isValid();

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

  // Load existing subscription data if editing
  useEffect(() => {
    if (!id) return; // Skip for new subscription

    setLoading(true);
    setError(null);

    // For now, we're not implementing edit functionality
    // Just go back to the subscriptions page
    navigate('/settings/subscriptions');
  }, [id, navigate]);

  // Initialize empty subscription for new entries
  useEffect(() => {
    if (!id && !item) {
      setItem({
        type: '',
        deviceIds: [],
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
      // Create the request body
      const requestBody = {
        cycle: item.type,
        deviceIds: item.deviceIds,
      };

      // Only add nextDueDate if it's valid
      if (nextDueDate && nextDueDate.isValid()) {
        requestBody.nextDueDate = nextDueDate.format('YYYY-MM-DD');
      }

      // Send the POST request to enable billing using the standard API pattern
      await apiPost(`/users/${item.userId}/enableBilling`, requestBody);
      setSuccess('Subscription created successfully');

      // Navigate to the subscriptions page after a delay
      setTimeout(() => {
        navigate('/settings/subscriptions');
      }, 1500);
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError(err.message || 'Failed to create subscription');
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
              <MuiLocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                <DatePicker
                  label={t('nextDueDate')}
                  value={nextDueDate}
                  onChange={(newValue) => setNextDueDate(newValue)}
                  minDate={dayjs()}
                  format="DD/MM/YYYY"
                />
              </MuiLocalizationProvider>
            </AccordionDetails>
          </Accordion>

          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '16px 0', padding: '0 30px' }}>
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
