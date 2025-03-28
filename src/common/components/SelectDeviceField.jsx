import React, { useState, useEffect } from 'react';
import {
  TextField, CircularProgress, Autocomplete,
  Typography, Box, Chip,
} from '@mui/material';
import { useTranslation } from './LocalizationProvider';

const SelectDeviceField = ({ onChange, value, label, required, userId }) => {
  const t = useTranslation();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedDevices, setSelectedDevices] = useState([]);

  // Fetch devices when userId changes
  useEffect(() => {
    const fetchDevices = async () => {
      if (!userId) {
        setDevices([]);
        setSelectedDevices([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/devices?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setDevices(data);

          // Set selected devices if value exists
          if (Array.isArray(value) && value.length > 0) {
            const selected = data.filter((device) => value.includes(device.id));
            setSelectedDevices(selected);
          } else {
            setSelectedDevices([]);
          }
        } else {
          throw Error(await response.text());
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [userId, value]);

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
