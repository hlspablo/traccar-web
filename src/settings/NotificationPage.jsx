import React, { useState } from 'react';

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation, useTranslationKeys } from '../common/components/LocalizationProvider';
import EditItemView from './components/EditItemView';
import { prefixString, unprefixString } from '../common/util/stringUtils';
import SelectField from '../common/components/SelectField';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';
import useSettingsStyles from './common/useSettingsStyles';
import { apiPost } from '../common/util/api';

const NotificationPage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();

  const [item, setItem] = useState();

  const alarms = useTranslationKeys((it) => it.startsWith('alarm')).map((it) => ({
    key: unprefixString('alarm', it),
    name: t(it),
  }));

  const testNotificators = useCatch(async () => {
    await Promise.all(item.notificators.split(/[, ]+/).map(async (notificator) => {
      await apiPost(`/notifications/test/${notificator}`, item);
    }));
  });

  const validate = () => item && item.type && item.notificators && (!item.notificators?.includes('command') || item.commandId);

  return (
    <EditItemView
      endpoint="notifications"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedNotification']}
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
              <SelectField
                value={item.type}
                onChange={(e) => setItem({ ...item, type: e.target.value })}
                endpoint="/notifications/types"
                keyGetter={(it) => it.type}
                titleGetter={(it) => t(prefixString('event', it.type))}
                label={t('sharedType')}
              />
              {item.type === 'alarm' && (
                <SelectField
                  multiple
                  value={item.attributes && item.attributes.alarms ? item.attributes.alarms.split(/[, ]+/) : []}
                  onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, alarms: e.target.value.join() } })}
                  data={alarms}
                  keyGetter={(it) => it.key}
                  label={t('sharedAlarms')}
                />
              )}
              <SelectField
                multiple
                value={item.notificators ? item.notificators.split(/[, ]+/) : []}
                onChange={(e) => setItem({ ...item, notificators: e.target.value.join() })}
                endpoint="/notifications/notificators"
                keyGetter={(it) => it.type}
                titleGetter={(it) => t(prefixString('notificator', it.type))}
                label={t('notificationNotificators')}
              />
              {item.notificators?.includes('command') && (
                <SelectField
                  value={item.commandId}
                  onChange={(event) => setItem({ ...item, commandId: Number(event.target.value) })}
                  endpoint="/commands"
                  titleGetter={(it) => it.description}
                  label={t('sharedSavedCommand')}
                />
              )}
              <Button
                variant="outlined"
                color="primary"
                onClick={testNotificators}
                disabled={!item.notificators}
              >
                {t('sharedTestNotificators')}
              </Button>
              <FormGroup>
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={item.always}
                      onChange={(event) => setItem({ ...item, always: event.target.checked })}
                    />
                    )}
                  label={t('notificationAlways')}
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedExtra')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <SelectField
                value={item.calendarId}
                onChange={(event) => setItem({ ...item, calendarId: Number(event.target.value) })}
                endpoint="/calendars"
                label={t('sharedCalendar')}
              />
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </EditItemView>
  );
};

export default NotificationPage;
