import React, { useState } from 'react';
import { Link } from '@mui/material';
import { useCatch } from '../../reactHelper';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { apiGet } from '../../common/util/api';

const DeviceUsersValue = ({ deviceId }) => {
  const t = useTranslation();

  const [users, setUsers] = useState();

  const loadUsers = useCatch(async () => {
    const query = new URLSearchParams({ deviceId });
    const users = await apiGet(`/users?${query.toString()}`);
    setUsers(users);
  });

  if (users) {
    return users.map((user) => user.name).join(', ');
  }
  return (<Link href="#" onClick={loadUsers}>{t('reportShow')}</Link>);
};

export default DeviceUsersValue;
