import React from 'react';
import {
  TextField, useTheme, useMediaQuery, Box,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useTranslation } from '../../common/components/LocalizationProvider';

export const filterByKeyword = (keyword) => (item) => !keyword || JSON.stringify(item).toLowerCase().includes(keyword.toLowerCase());

const useStyles = makeStyles((theme) => ({
  header: {
    position: 'sticky',
    left: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing(3, 2, 2),
  },
  searchField: {
    flexGrow: 1,
  },
}));

const SearchHeader = ({ keyword, setKeyword, children }) => {
  const theme = useTheme();
  const classes = useStyles();
  const t = useTranslation();

  const phone = useMediaQuery(theme.breakpoints.down('sm'));

  if (phone) {
    return (
      <div className={classes.header}>
        <TextField
          className={classes.searchField}
          variant="outlined"
          placeholder={t('sharedSearch')}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        {children}
      </div>
    );
  }

  if (children) {
    return (
      <Box className={classes.header}>
        {children}
      </Box>
    );
  }

  return null;
};

export default SearchHeader;
