import React from 'react';
import { Typography, Paper, Box } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

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
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    marginBottom: theme.spacing(1),
  },
  content: {
    maxWidth: '100%',
    textAlign: 'justify',
  },
  paper: {
    padding: theme.spacing(4),
    maxWidth: theme.spacing(100),
    margin: '0 auto',
  },
  image: {
    alignSelf: 'center',
    maxWidth: '240px',
    maxHeight: '120px',
    width: 'auto',
    height: 'auto',
    margin: theme.spacing(2),
  },
  contactInfo: {
    fontWeight: 'bold',
    marginTop: theme.spacing(1),
  },
}));

const SupportPage = () => {
  const classes = useStyles();

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
          Suporte ao Cliente
        </Typography>
        <Typography paragraph className={classes.content}>
          Estamos aqui para ajudar você com qualquer dúvida ou problema relacionado à nossa aplicação de rastreamento de veículos.
        </Typography>

        <div className={classes.section}>
          <Typography variant="h5" className={classes.sectionTitle}>
            Contato
          </Typography>
          <Typography paragraph className={classes.content}>
            Para entrar em contato com nossa equipe de suporte, utilize os seguintes canais:
          </Typography>
          <Typography paragraph className={classes.contactInfo}>
            Telefone: (86) 99454-7968
          </Typography>
          <Typography paragraph className={classes.contactInfo}>
            E-mail: pabllobeg@gmail.com
          </Typography>
        </div>

        <div className={classes.section}>
          <Typography variant="h5" className={classes.sectionTitle}>
            Horário de Atendimento
          </Typography>
          <Typography paragraph className={classes.content}>
            Nossa equipe está disponível para atendimento de segunda a sexta-feira, das 8h às 18h. Para casos urgentes, estamos disponíveis também aos sábados, das 9h às 13h.
          </Typography>
        </div>

        <div className={classes.section}>
          <Typography variant="h5" className={classes.sectionTitle}>
            Relatório de Problemas
          </Typography>
          <Typography paragraph className={classes.content}>
            Para reportar problemas técnicos, tente fornecer o máximo de detalhes possível sobre o problema encontrado, incluindo o dispositivo utilizado, e os passos para reproduzir o problema. Isso nos ajudará a encontrar uma solução mais rapidamente.
          </Typography>
        </div>

        <div className={classes.section}>
          <Typography variant="h5" className={classes.sectionTitle}>
            Feedback
          </Typography>
          <Typography paragraph className={classes.content}>
            Valorizamos muito sua opinião sobre nossos serviços. Se você tiver sugestões ou comentários sobre como podemos melhorar nossa aplicação, sinta-se à vontade para compartilhá-los conosco através dos canais de contato acima.
          </Typography>
        </div>
      </Paper>
    </Box>
  );
};

export default SupportPage;
