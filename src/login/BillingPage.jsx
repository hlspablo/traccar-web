import React, { useEffect, useState } from 'react';
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
  Collapse,
  IconButton,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useAuth } from '../common/util/AuthContext';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsLoaded, setSubscriptionsLoaded] = useState(false);
  const [devices, setDevices] = useState([]);
  const [devicesLoaded, setDevicesLoaded] = useState(false);
  const [openRows, setOpenRows] = useState({});

  // Use the AuthContext for authentication
  const { authChecked, isAuthenticated, user } = useAuth();

  // Toggle row expansion
  const handleToggleRow = (subscriptionId) => {
    setOpenRows((prev) => ({
      ...prev,
      [subscriptionId]: !prev[subscriptionId],
    }));
  };

  // Helper function for making API calls to Asaas via proxy
  const fetchWithProxy = async (endpoint, options = {}) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`/asaas-proxy${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          access_token: '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmFjZTU1MTFjLWU1OTItNGZiYy05MGYwLTlhNGM2ZGU2ZDNhMDo6JGFhY2hfZTQyODE5MjEtNjljZi00YTAwLWIxNjgtZGQxNzk1ZTU1Nzky',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout da requisição - A API demorou muito para responder');
      }
      throw error;
    }
  };

  const handleResponse = async (response) => {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Erro desconhecido' };
      }
      throw new Error(errorData.message || `Falha na requisição com status ${response.status}`);
    }

    try {
      return await response.json();
    } catch (e) {
      throw new Error('Falha ao processar resposta da API');
    }
  };

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

  // Second effect to fetch user's subscriptions
  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      try {
        if (!isAuthenticated || !user) {
          setSubscriptionsLoaded(true);
          return;
        }

        // Get subscription IDs from user attributes
        const subscriptionIds = [];
        if (user.attributes) {
          Object.keys(user.attributes).forEach((key) => {
            if (key.startsWith('subscription_')) {
              const subscriptionId = key.substring('subscription_'.length);
              subscriptionIds.push(subscriptionId);
            }
          });
        }

        if (subscriptionIds.length === 0) {
          setSubscriptions([]);
          setSubscriptionsLoaded(true);
          return;
        }

        // Fetch all subscriptions in parallel
        const subscriptionPromises = subscriptionIds.map((subId) => fetchWithProxy(`/v3/subscriptions/${subId}`)
          .then(handleResponse)
          .catch((error) => {
            console.error(`Erro ao buscar assinatura ${subId}:`, error);
            return null; // Return null for failed fetches
          }));

        const results = await Promise.all(subscriptionPromises);
        const validSubscriptions = results.filter((sub) => sub !== null);
        setSubscriptions(validSubscriptions);
        setSubscriptionsLoaded(true);
      } catch (err) {
        console.error('Erro ao buscar assinaturas do usuário:', err);
        setError(err.message || 'Falha ao carregar assinaturas do usuário');
        setSubscriptionsLoaded(true);
      }
    };

    if (isAuthenticated && !subscriptionsLoaded) {
      fetchUserSubscriptions();
    }
  }, [isAuthenticated, user, subscriptionsLoaded]);

  // Third effect to fetch devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        if (!isAuthenticated) {
          setDevicesLoaded(true);
          return;
        }

        const response = await fetch('/api/devices');
        if (response.ok) {
          const allDevices = await response.json();
          setDevices(allDevices);
        } else {
          console.error('Erro ao buscar dispositivos:', response.status);
        }
        setDevicesLoaded(true);
      } catch (err) {
        console.error('Erro ao buscar dispositivos:', err);
        setDevicesLoaded(true);
      }
    };

    if (isAuthenticated && !devicesLoaded) {
      fetchDevices();
    }
  }, [isAuthenticated, devicesLoaded]);

  // Show loading while authentication is being checked or data is loading
  if (!authChecked || loading || !subscriptionsLoaded || !devicesLoaded) {
    let loadingMessage = 'Carregando informações de faturamento...';

    if (!authChecked) {
      loadingMessage = 'Verificando autenticação...';
    } else if (!subscriptionsLoaded) {
      loadingMessage = 'Carregando assinaturas...';
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

  if (!subscriptions || subscriptions.length === 0) {
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
            Não há assinaturas registradas para este usuário.
          </Alert>
        </Paper>
      </Box>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    try {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (err) {
      return '-';
    }
  };

  // Translate cycle values
  const translateCycle = (cycleValue) => {
    if (!cycleValue) return '-';

    const translations = {
      WEEKLY: 'Semanal',
      BIWEEKLY: 'Quinzenal',
      MONTHLY: 'Mensal',
      BIMONTHLY: 'Bimestral',
      QUARTERLY: 'Trimestral',
      SEMIANNUALLY: 'Semestral',
      YEARLY: 'Anual',
    };

    return translations[cycleValue.toUpperCase()] || cycleValue;
  };

  // Translate status values
  const translateStatus = (statusValue) => {
    if (!statusValue) return '-';

    const translations = {
      ACTIVE: 'Ativo',
      EXPIRED: 'Expirado',
      INACTIVE: 'Inativo',
    };

    return translations[statusValue.toUpperCase()] || statusValue;
  };

  // Format currency for display
  const formatCurrency = (value) => {
    try {
      return parseFloat(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    } catch (err) {
      return '-';
    }
  };

  // Calculate total with error handling
  let total = 0;
  try {
    subscriptions.forEach((subscription) => {
      if (subscription.value) {
        const valor = parseFloat(subscription.value) || 0;
        if (!Number.isNaN(valor)) {
          total += valor;
        }
      }
    });
  } catch (err) {
    setError('Erro ao calcular o total. Por favor, tente novamente mais tarde.');
  }

  // Get devices for a subscription
  const getDevicesForSubscription = (subscriptionId) => {
    try {
      return devices.filter((device) => device.attributes && device.attributes.subscriptionId === subscriptionId);
    } catch (err) {
      console.error('Erro ao filtrar dispositivos para assinatura:', err);
      return [];
    }
  };

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
                <TableCell className={classes.tableHeadCell} style={{ width: '60px' }} />
                <TableCell className={classes.tableHeadCell}>ID da Assinatura</TableCell>
                <TableCell className={classes.tableHeadCell}>Ciclo</TableCell>
                <TableCell className={classes.tableHeadCell}>Próximo Vencimento</TableCell>
                <TableCell className={classes.tableHeadCell}>Status</TableCell>
                <TableCell className={classes.tableHeadCell} align="right">Valor (R$)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.map((subscription) => {
                try {
                  const value = subscription.value || 0;
                  const cycle = translateCycle(subscription.cycle);
                  const nextDueDate = formatDate(subscription.nextDueDate);
                  const status = translateStatus(subscription.status);
                  const subscriptionDevices = getDevicesForSubscription(subscription.id);
                  const hasDevices = subscriptionDevices.length > 0;

                  return (
                    <React.Fragment key={subscription.id}>
                      <TableRow
                        className={classes.tableRow}
                        onClick={() => hasDevices && handleToggleRow(subscription.id)}
                        sx={{ cursor: hasDevices ? 'pointer' : 'default' }}
                      >
                        <TableCell className={classes.tableCell}>
                          <IconButton
                            size="small"
                            disabled={!hasDevices}
                          >
                            {hasDevices && (
                              openRows[subscription.id] ? (
                                <KeyboardArrowUpIcon />
                              ) : (
                                <KeyboardArrowDownIcon />
                              )
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell className={classes.tableCell}>{subscription.id || '-'}</TableCell>
                        <TableCell className={classes.tableCell}>{cycle}</TableCell>
                        <TableCell className={classes.tableCell}>{nextDueDate}</TableCell>
                        <TableCell className={classes.tableCell}>{status}</TableCell>
                        <TableCell align="right" className={classes.tableCellAmount}>
                          {formatCurrency(value)}
                        </TableCell>
                      </TableRow>

                      {hasDevices && (
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                            <Collapse in={openRows[subscription.id]} timeout="auto" unmountOnExit>
                              <Box sx={{ margin: 2 }}>
                                <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontSize: '1rem' }}>
                                  Dispositivos desta assinatura
                                </Typography>
                                <Table size="small" aria-label="devices">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell className={classes.tableCell} sx={{ fontWeight: 'bold' }}>Dispositivo</TableCell>
                                      <TableCell className={classes.tableCell} sx={{ fontWeight: 'bold' }}>Plano</TableCell>
                                      <TableCell className={classes.tableCell} sx={{ fontWeight: 'bold' }} align="right">Valor</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {subscriptionDevices.map((device) => (
                                      <TableRow key={device.id}>
                                        <TableCell className={classes.tableCell}>{device.name}</TableCell>
                                        <TableCell className={classes.tableCell}>{device.attributes?.planName || '-'}</TableCell>
                                        <TableCell className={classes.tableCell} align="right">
                                          {device.attributes?.planValue
                                            ? formatCurrency(device.attributes.planValue)
                                            : '-'}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                } catch (err) {
                  return (
                    <TableRow key={subscription.id || 'error'} className={classes.tableRow}>
                      <TableCell className={classes.tableCell} />
                      <TableCell className={classes.tableCell}>-</TableCell>
                      <TableCell className={classes.tableCell}>-</TableCell>
                      <TableCell className={classes.tableCell}>-</TableCell>
                      <TableCell className={classes.tableCell}>-</TableCell>
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
              {formatCurrency(total)}
            </Typography>
          </CardContent>
        </Card>
      </Paper>
    </Box>
  );
};

export default BillingPage;
