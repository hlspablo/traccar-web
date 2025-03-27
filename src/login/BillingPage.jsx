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
import { devicesActions, sessionActions } from '../store';

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
    backgroundColor: '#000',
    color: '#fff',
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
  },
  table: {
    minWidth: 350,
  },
  tableHead: {
    backgroundColor: theme.palette.primary.main,
  },
  tableHeadCell: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  totalCard: {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    marginTop: theme.spacing(3),
    textAlign: 'center',
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
  },
}));

const BillingPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [devicesLoaded, setDevicesLoaded] = useState(false);
  const [positionsLoaded, setPositionsLoaded] = useState(false);

  // Use the AuthContext instead of direct Redux access for authentication
  const { authChecked, isAuthenticated, user } = useAuth();

  const devices = useSelector((state) => state.devices.items);
  const positions = useSelector((state) => state.session.positions);

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

  // Third effect to fetch positions after devices are loaded
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        if (isAuthenticated && devicesLoaded && devices && Object.keys(devices).length > 0) {
          // Check if positions are already loaded
          const deviceIds = Object.keys(devices);
          const allPositionsLoaded = deviceIds.every((id) => positions && positions[id]);

          if (!allPositionsLoaded) {
            // Get all device IDs to fetch positions
            const deviceIdParam = deviceIds.join(',');
            const positionsResponse = await fetch(`/api/positions?deviceId=${deviceIdParam}`);

            if (positionsResponse.ok) {
              const fetchedPositions = await positionsResponse.json();
              const positionsMap = {};

              // Create a positions map by device ID
              fetchedPositions.forEach((position) => {
                positionsMap[position.deviceId] = position;
              });

              dispatch(sessionActions.updatePositions(positionsMap));
            }
          }
        }
        setPositionsLoaded(true);
      } catch (err) {
        console.error('Error fetching positions:', err);
        setError('Erro ao carregar posições. Por favor, tente novamente mais tarde.');
        setPositionsLoaded(true);
      }
    };

    if (isAuthenticated && devicesLoaded && !positionsLoaded) {
      fetchPositions();
    }
  }, [isAuthenticated, devicesLoaded, devices, positions, dispatch, positionsLoaded]);

  // Show loading while authentication is being checked or devices are loading
  if (!authChecked || loading || !devicesLoaded || !positionsLoaded) {
    let loadingMessage = 'Carregando informações de faturamento...';

    if (!authChecked) {
      loadingMessage = 'Verificando autenticação...';
    } else if (!devicesLoaded) {
      loadingMessage = 'Carregando dispositivos...';
    } else if (!positionsLoaded) {
      loadingMessage = 'Carregando dados de posição...';
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
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
        }}
      >
        <Box sx={{ mb: 4 }}>
          <img className={classes.image} src={Logo} alt="Logo" />
        </Box>
        <Paper className={classes.paper} elevation={3} sx={{ bgcolor: '#000' }}>
          <Typography variant="h4" className={classes.header}>
            Resumo de Faturamento
          </Typography>

          <Typography variant="h6" className={classes.header}>
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
      const position = positions[device.id];
      if (position && position.attributes && position.attributes.valor) {
        const valor = parseFloat(position.attributes.valor) || 0;
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
      }}
    >
      <Box sx={{ mb: 4 }}>
        <img className={classes.image} src={Logo} alt="Logo" />
      </Box>
      <Paper className={classes.paper} elevation={3} sx={{ bgcolor: '#000' }}>
        <Typography variant="h4" className={classes.header}>
          Resumo de Faturamento
        </Typography>

        <Typography variant="h6" className={classes.header}>
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
                  const position = positions[device.id];
                  const plano = position?.attributes?.plano || 'Básico';
                  const valor = position?.attributes?.valor || 0;

                  return (
                    <TableRow key={device.id} className={classes.tableRow}>
                      <TableCell component="th" scope="row">
                        {device.name}
                      </TableCell>
                      <TableCell>{plano}</TableCell>
                      <TableCell align="right">
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
                      <TableCell component="th" scope="row">
                        {device.name}
                      </TableCell>
                      <TableCell>Erro</TableCell>
                      <TableCell align="right">-</TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Card className={classes.totalCard}>
          <CardContent>
            <Typography variant="h5">
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
