import { useMemo } from 'react';

export default (t) => useMemo(() => ({
  'web.reportColor': {
    name: t('attributeWebReportColor'),
    type: 'string',
    subtype: 'color',
  },
  devicePassword: {
    name: t('attributeDevicePassword'),
    type: 'string',
  },
  deviceImage: {
    name: t('attributeDeviceImage'),
    type: 'string',
  },
  'processing.copyAttributes': {
    name: t('attributeProcessingCopyAttributes'),
    type: 'string',
  },
  'decoder.timezone': {
    name: t('sharedTimezone'),
    type: 'string',
  },
  deviceInactivityStart: {
    name: t('attributeDeviceInactivityStart'),
    type: 'number',
  },
  deviceInactivityPeriod: {
    name: t('attributeDeviceInactivityPeriod'),
    type: 'number',
  },
  plate: {
    name: t('attributePlate'),
    type: 'string',
  },
  color: {
    name: t('attributeColor'),
    type: 'string',
  },
  planName: {
    name: t('attributePlanName'),
    type: 'string',
  },
  planValue: {
    name: t('attributePlanValue'),
    type: 'number',
  },
  subscriptionId: {
    name: t('attributeSubscriptionId'),
    type: 'string',
  },
}), [t]);
