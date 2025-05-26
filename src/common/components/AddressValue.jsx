import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from '@mui/material';
import { useTranslation } from './LocalizationProvider';
import { useCatch, useEffectAsync } from '../../reactHelper';
import { apiGet } from '../util/api';

const AddressValue = ({ latitude, longitude, originalAddress }) => {
  const t = useTranslation();

  const addressEnabled = useSelector((state) => state.session.server.geocoderEnabled);

  const [address, setAddress] = useState();

  useEffect(() => {
    setAddress(originalAddress);
  }, [latitude, longitude, originalAddress]);

  useEffectAsync(async () => {
    if (!address && latitude && longitude) {
      const query = new URLSearchParams({ lat: latitude, lon: longitude });
      const response = await apiGet(`/server/geocode?${query.toString()}`);
      setAddress(response || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    }
  }, [address, latitude, longitude]);

  const showAddress = useCatch(async () => {
    const query = new URLSearchParams({ latitude, longitude });
    const response = await apiGet(`/server/geocode?${query.toString()}`);
    setAddress(response);
  });

  if (address) {
    return address;
  }
  if (addressEnabled) {
    return (<Link href="#" onClick={showAddress}>{t('sharedShowAddress')}</Link>);
  }
  return '';
};

export default AddressValue;
