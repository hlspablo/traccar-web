import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import { useAdministrator, useManager } from '../common/util/permissions';
import useSettingsStyles from './common/useSettingsStyles';

const SubscriptionPage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();

  const admin = useAdministrator();
  const manager = useManager();

  const { id } = useParams();
  const [item, setItem] = useState(null);

  const validate = () => item && item.name && item.type && item.price;

  return (
    <EditItemView
      endpoint="subscriptions"
      item={item}
      setItem={setItem}
      defaultItem={{ price: 0, active: true }}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'settingsSubscription']}
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.name || ''}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                label={t('sharedName')}
              />
              <FormControl>
                <InputLabel>{t('subscriptionType')}</InputLabel>
                <Select
                  label={t('subscriptionType')}
                  value={item.type || ''}
                  onChange={(e) => setItem({ ...item, type: e.target.value })}
                >
                  <MenuItem value="Monthly">{t('subscriptionMonthly')}</MenuItem>
                  <MenuItem value="Annual">{t('subscriptionAnnual')}</MenuItem>
                  <MenuItem value="Lifetime">{t('subscriptionLifetime')}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                type="number"
                value={item.price || 0}
                onChange={(e) => setItem({ ...item, price: Number(e.target.value) })}
                label={t('subscriptionPrice')}
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
                value={item.features || ''}
                onChange={(e) => setItem({ ...item, features: e.target.value })}
              />
              <TextField
                label={t('subscriptionExpirationTime')}
                type="date"
                value={item.expirationTime ? item.expirationTime.split('T')[0] : ''}
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
                value={item.creationTime ? item.creationTime.split('T')[0] : new Date().toISOString().split('T')[0]}
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
                  value={item.status || 'active'}
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
                type="number"
                value={item.deviceLimit || -1}
                onChange={(e) => setItem({ ...item, deviceLimit: Number(e.target.value) })}
                label={t('userDeviceLimit')}
                disabled={!admin}
              />
              <TextField
                type="number"
                value={item.userLimit || -1}
                onChange={(e) => setItem({ ...item, userLimit: Number(e.target.value) })}
                label={t('userUserLimit')}
                disabled={!admin}
              />
              <FormControlLabel
                control={<Checkbox checked={item.allowReports || false} onChange={(e) => setItem({ ...item, allowReports: e.target.checked })} />}
                label={t('subscriptionAllowReports')}
                disabled={!manager}
              />
              <FormControlLabel
                control={<Checkbox checked={item.allowCommands || false} onChange={(e) => setItem({ ...item, allowCommands: e.target.checked })} />}
                label={t('subscriptionAllowCommands')}
                disabled={!manager}
              />
              <FormControlLabel
                control={<Checkbox checked={item.allowNotifications || false} onChange={(e) => setItem({ ...item, allowNotifications: e.target.checked })} />}
                label={t('subscriptionAllowNotifications')}
                disabled={!manager}
              />
            </AccordionDetails>
          </Accordion>
          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{}}
          />
        </>
      )}
    </EditItemView>
  );
};

export default SubscriptionPage;
