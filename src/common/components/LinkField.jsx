import { Autocomplete, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useEffectAsync, useCatchCallback } from '../../reactHelper';
import { apiGet, apiPost, apiDelete } from '../util/api';

const LinkField = ({
  label,
  endpointAll,
  endpointLinked,
  baseId,
  keyBase,
  keyLink,
  keyGetter = (item) => item.id,
  titleGetter = (item) => item.name,
}) => {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState();
  const [linked, setLinked] = useState();

  useEffectAsync(async () => {
    if (active) {
      const items = await apiGet(endpointAll);
      setItems(items);
    }
  }, [active]);

  useEffectAsync(async () => {
    if (active) {
      const linked = await apiGet(endpointLinked);
      setLinked(linked);
    }
  }, [active]);

  const createBody = (linkId) => {
    const body = {};
    body[keyBase] = baseId;
    body[keyLink] = linkId;
    return body;
  };

  const onChange = useCatchCallback(async (value) => {
    const oldValue = linked.map((it) => keyGetter(it));
    const newValue = value.map((it) => keyGetter(it));
    if (!newValue.find((it) => it < 0)) {
      const results = [];
      newValue.filter((it) => !oldValue.includes(it)).forEach((added) => {
        results.push(apiPost('/permissions', createBody(added)));
      });
      oldValue.filter((it) => !newValue.includes(it)).forEach((removed) => {
        results.push(apiDelete('/permissions', createBody(removed)));
      });
      await Promise.all(results);
      setLinked(value);
    }
  }, [linked, keyGetter]);

  return (
    <Autocomplete
      loading={active && !items}
      isOptionEqualToValue={(i1, i2) => keyGetter(i1) === keyGetter(i2)}
      options={items || []}
      getOptionLabel={(item) => titleGetter(item)}
      renderInput={(params) => <TextField {...params} label={label} />}
      value={(items && linked) || []}
      onChange={(_, value) => onChange(value)}
      open={open}
      onOpen={() => {
        setOpen(true);
        setActive(true);
      }}
      onClose={() => setOpen(false)}
      multiple
    />
  );
};

export default LinkField;
