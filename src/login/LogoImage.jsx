import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { makeStyles } from '@mui/styles';

import Logo from '../resources/images/coragem-logo.png';
import LogoInverted from '../resources/images/logo-coragem-white.png';

const useStyles = makeStyles((theme) => ({
  image: {
    alignSelf: 'center',
    maxWidth: '240px',
    maxHeight: '120px',
    width: 'auto',
    height: 'auto',
    margin: theme.spacing(2),
  },
}));

const LogoImage = () => {
  const theme = useTheme();
  const classes = useStyles();

  const expanded = !useMediaQuery(theme.breakpoints.down('lg'));

  if (expanded) {
    return <img className={classes.image} src={Logo} alt="Logo" />;
  }
  return <img className={classes.image} src={LogoInverted} alt="Logo" />;
};

export default LogoImage;
