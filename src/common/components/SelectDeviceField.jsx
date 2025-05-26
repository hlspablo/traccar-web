import React, { useState, useEffect } from 'react';
import {
  TextField, CircularProgress, Autocomplete,
  Typography, Box, Chip,
} from '@mui/material';
import { useTranslation } from './LocalizationProvider';
import { useEffectAsync } from '../../reactHelper';
import { apiGet } from '../util/api';

const SelectDeviceField = ({ onChange, value, label, required, userId }) => {
  const t = useTranslation();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedDevices, setSelectedDevices] = useState([]);

  useEffectAsync(async () => {
    if (userId) {
      setLoading(true);
      try {
        const devices = await apiGet(`/devices?userId=${userId}`);
        setDevices(devices);
      } finally {
        setLoading(false);
      }
    } else {
      setDevices([]);
      setSelectedDevices([]);
    }
  }, [userId]);

  useEffect(() => {
    if (Array.isArray(value) && value.length > 0 && devices.length > 0) {
      const selected = devices.filter((device) => value.includes(device.id));
      setSelectedDevices(selected);
    } else {
      setSelectedDevices([]);
    }
  }, [value, devices]);

  const handleChange = (event, newValue) => {
    setSelectedDevices(newValue);
    onChange(newValue.map((device) => device.id));
  };

  return (
    <Autocomplete
      multiple
      value={selectedDevices}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={devices}
      getOptionLabel={(option) => (option.name ? `${option.name} (${option.uniqueId})` : '')}
      loading={loading}
      fullWidth
      disabled={!userId}
      filterOptions={(options, { inputValue }) => {
        const filtered = options.filter(
          (device) => device.name?.toLowerCase().includes(inputValue.toLowerCase())
            || device.uniqueId?.toLowerCase().includes(inputValue.toLowerCase()),
        );
        return filtered;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || t('deviceTitle')}
          required={required}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          helperText={!userId ? t('selectUserFirst') : ''}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <li key={key} {...otherProps}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body1">{option.name}</Typography>
              <Typography variant="caption" color="text.secondary">{option.uniqueId}</Typography>
            </Box>
          </li>
        );
      }}
      renderTags={(tagValue, getTagProps) => tagValue.map((option, index) => {
        const tagProps = getTagProps({ index });
        const { key, ...otherTagProps } = tagProps;
        return (
          <Chip
            key={key}
            label={`${option.name} (${option.uniqueId})`}
            {...otherTagProps}
            size="small"
          />
        );
      })}
      noOptionsText={userId ? t('sharedNoData') : t('selectUserFirst')}
    />
  );
};

export default SelectDeviceField;
