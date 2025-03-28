import React, { useState, useEffect } from 'react';
import {
  TextField, CircularProgress, Autocomplete,
  Typography, Box,
} from '@mui/material';
import { useTranslation } from './LocalizationProvider';

const SelectUserField = ({ onChange, value, label, required }) => {
  const t = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/users?all=true');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);

          // Set selected user if value exists
          if (value) {
            const found = data.find((user) => user.id === value);
            setSelectedUser(found || null);
          }
        } else {
          throw Error(await response.text());
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [value]);

  const handleChange = (event, newValue) => {
    setSelectedUser(newValue);
    onChange(newValue ? newValue.id : '');
  };

  return (
    <Autocomplete
      value={selectedUser}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={users}
      getOptionLabel={(option) => (option.name ? `${option.name} (${option.email})` : '')}
      loading={loading}
      fullWidth
      filterOptions={(options, { inputValue }) => {
        const filtered = options.filter(
          (user) => user.name?.toLowerCase().includes(inputValue.toLowerCase())
            || user.email?.toLowerCase().includes(inputValue.toLowerCase()),
        );
        return filtered;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || t('sharedUser')}
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
        />
      )}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <li key={key} {...otherProps}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body1">{option.name}</Typography>
              <Typography variant="caption" color="text.secondary">{option.email}</Typography>
            </Box>
          </li>
        );
      }}
      noOptionsText={t('sharedNoData')}
    />
  );
};

export default SelectUserField;
