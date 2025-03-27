import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useAuth } from '../common/util/AuthContext';
import { devicesActions } from '../store';

import Logo from '../resources/images/coragem-logo.png';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(4),
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px !important',
    color: '#fff',
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  userHeader: {
    textAlign: 'center',
    marginBottom: '30px !important',
    color: '#fff',
    fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '1.2rem',
    fontWeight: 400,
    opacity: 0.9,
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  content: {
    maxWidth: '100%',
    textAlign: 'justify',
  },
  paper: {
    padding: theme.spacing(4),
    maxWidth: theme.spacing(100),
    margin: '0 auto',
    backgroundColor: '#1E1E2F',
    color: '#fff',
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
  },
  image: {
    alignSelf: 'center',
    maxWidth: '240px',
    maxHeight: '120px',
    width: 'auto',
    height: 'auto',
    margin: theme.spacing(2),
  },
  tableContainer: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  table: {
    minWidth: 350,
  },
  tableHead: {
    backgroundColor: '#000',
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
  },
  tableHeadCell: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    letterSpacing: '0.5px',
    padding: theme.spacing(1.5, 2),
    textTransform: 'uppercase',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  tableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: 'rgba(77, 122, 247, 0.05)',
    },
    '&:hover': {
      backgroundColor: 'rgba(77, 122, 247, 0.1)',
    },
  },
  tableCell: {
    color: '#f0f0f0',
    borderColor: 'rgba(77, 122, 247, 0.2)',
    fontSize: '1rem',
    fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  tableCellAmount: {
    fontWeight: 'bold',
    color: '#f0f0f0',
    borderColor: 'rgba(77, 122, 247, 0.2)',
    fontSize: '1rem',
    fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  totalCard: {
    backgroundColor: '#4D7AF7',
    color: '#fff',
    marginTop: theme.spacing(3),
    textAlign: 'center',
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  totalTitle: {
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '1.3rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: '1.8rem',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    padding: theme.spacing(1),
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
  },
}));

const BillingPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [devicesLoaded, setDevicesLoaded] = useState(false);

  // Use the AuthContext instead of direct Redux access for authentication
  const { authChecked, isAuthenticated, user } = useAuth();

  const devices = useSelector((state) => state.devices.items);

  // First effect for authentication check
  useEffect(() => {
    let timer;

    // Wait for authentication to be checked and redirect if not authenticated
    if (authChecked && !isAuthenticated) {
      navigate('/login');
    } else if (isAuthenticated) {
      // Only load data when authenticated
      timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [authChecked, isAuthenticated, navigate]);

  // Second effect to fetch devices if not already loaded
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        if (isAuthenticated && (!devices || Object.keys(devices).length === 0)) {
          const response = await fetch('/api/devices');
          if (response.ok) {
            const fetchedDevices = await response.json();
            dispatch(devicesActions.refresh(fetchedDevices));
          }
        }
        setDevicesLoaded(true);
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('Erro ao carregar dispositivos. Por favor, tente novamente mais tarde.');
        setDevicesLoaded(true);
      }
    };

    if (isAuthenticated && !devicesLoaded) {
      fetchDevices();
    }
  }, [isAuthenticated, devices, dispatch, devicesLoaded]);

  // Show loading while authentication is being checked or devices are loading
  if (!authChecked || loading || !devicesLoaded) {
    let loadingMessage = 'Carregando informações de faturamento...';

    if (!authChecked) {
      loadingMessage = 'Verificando autenticação...';
    } else if (!devicesLoaded) {
      loadingMessage = 'Carregando dispositivos...';
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          width: '100%',
          p: 4,
          bgcolor: '#ffffff',
        }}
      >
        <img className={classes.image} src={Logo} alt="Logo" />
        <CircularProgress sx={{ mt: 4 }} />
        <Typography sx={{ mt: 2 }}>
          {loadingMessage}
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!devices || Object.keys(devices).length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          bgcolor: '#ffffff',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <img className={classes.image} src={Logo} alt="Logo" />
        </Box>
        <Paper className={classes.paper} elevation={3}>
          <Typography variant="h4" className={classes.header}>
            Resumo de Faturamento
          </Typography>

          <Typography variant="h6" className={classes.userHeader}>
            {user.name || user.email}
          </Typography>

          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            Não há dispositivos registrados para este usuário.
          </Alert>
        </Paper>
      </Box>
    );
  }

  const devicesArray = Object.values(devices);

  // Calculate total with error handling
  let total = 0;
  try {
    devicesArray.forEach((device) => {
      if (device.attributes && device.attributes.valor) {
        const valor = parseFloat(device.attributes.valor) || 0;
        if (!Number.isNaN(valor)) {
          total += valor;
        }
      }
    });
  } catch (err) {
    setError('Erro ao calcular o total. Por favor, tente novamente mais tarde.');
    console.error('Error calculating total:', err);
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 4,
        bgcolor: '#ffffff',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Box sx={{ mb: 4 }}>
        <img className={classes.image} src={Logo} alt="Logo" />
      </Box>
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h4" className={classes.header}>
          Resumo de Faturamento
        </Typography>

        <Typography variant="h6" className={classes.userHeader}>
          {user.name || user.email}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table className={classes.table} aria-label="tabela de faturamento">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell className={classes.tableHeadCell}>Dispositivo</TableCell>
                <TableCell className={classes.tableHeadCell}>Plano</TableCell>
                <TableCell className={classes.tableHeadCell} align="right">Valor (R$)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devicesArray.map((device) => {
                try {
                  const plano = device.attributes?.plano || 'Falha ao carregar plano';
                  const valor = device.attributes?.valor || 0;

                  return (
                    <TableRow key={device.id} className={classes.tableRow}>
                      <TableCell component="th" scope="row" className={classes.tableCell}>
                        {device.name}
                      </TableCell>
                      <TableCell className={classes.tableCell}>{plano}</TableCell>
                      <TableCell align="right" className={classes.tableCellAmount}>
                        {parseFloat(valor).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </TableCell>
                    </TableRow>
                  );
                } catch (err) {
                  console.error(`Error rendering device ${device.id}:`, err);
                  return (
                    <TableRow key={device.id} className={classes.tableRow}>
                      <TableCell component="th" scope="row" className={classes.tableCell}>
                        {device.name}
                      </TableCell>
                      <TableCell className={classes.tableCell}>Erro</TableCell>
                      <TableCell align="right" className={classes.tableCellAmount}>-</TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Card className={classes.totalCard}>
          <CardContent>
            <Typography variant="h5" className={classes.totalTitle}>
              Total
            </Typography>
            <Typography className={classes.totalValue}>
              {total.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Typography>
          </CardContent>
        </Card>
      </Paper>
    </Box>
  );
};

export default BillingPage;
