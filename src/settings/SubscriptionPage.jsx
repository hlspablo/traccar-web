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
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import SelectUserField from '../common/components/SelectUserField';
import SelectDeviceField from '../common/components/SelectDeviceField';
import useSettingsStyles from './common/useSettingsStyles';

const SubscriptionPage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();
  const navigate = useNavigate();

  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const validate = () => item && item.type && item.userId && item.deviceIds && item.deviceIds.length > 0;

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

      // Send the POST request to enable billing using the standard API pattern
      const response = await fetch(`/api/users/${item.userId}/enableBilling`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        setSuccess('Subscription created successfully');

        // Navigate to the subscriptions page after a delay
        setTimeout(() => {
          navigate('/settings/subscriptions');
        }, 1500);
      } else {
        // Handle error responses
        let errorMessage = `Error: ${response.status} ${response.statusText}`;

        try {
          // Try to get the response text
          const responseText = await response.text();

          if (responseText) {
            try {
              const errorData = JSON.parse(responseText);
              if (errorData && errorData.message) {
                errorMessage = errorData.message;
              }
            } catch (parseError) {
              // If not valid JSON, use the text as is
              errorMessage = responseText;
            }
          }
        } catch (error) {
          console.error('Error reading response:', error);
        }

        throw new Error(errorMessage);
      }
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
