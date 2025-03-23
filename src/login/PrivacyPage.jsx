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
}));

const PrivacyPage = () => {
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
          Política de Privacidade
        </Typography>
        <Typography paragraph className={classes.content}>
          Esta política de privacidade descreve como suas informações pessoais são tratadas em nossa aplicação de rastreamento de veículos.
        </Typography>

        <div className={classes.section}>
          <Typography variant="h5" className={classes.sectionTitle}>
            Coleta de Dados
          </Typography>
          <Typography paragraph className={classes.content}>
            Nossa aplicação não realiza qualquer coleta de dados diretamente dos usuários. Todas as informações pessoais, como e-mail e senha, são previamente fornecidas pelo usuário durante o cadastro realizado fora desta aplicação. Não solicitamos, armazenamos ou compartilhamos informações adicionais a partir do uso da aplicação.
          </Typography>
        </div>

        <div className={classes.section}>
          <Typography variant="h5" className={classes.sectionTitle}>
            Uso dos Dados
          </Typography>
          <Typography paragraph className={classes.content}>
            As informações recebidas (e-mail e senha) têm a finalidade exclusiva de autenticar o usuário e permitir acesso aos serviços de rastreamento de veículos fornecidos pela aplicação.
          </Typography>
        </div>

        <div className={classes.section}>
          <Typography variant="h5" className={classes.sectionTitle}>
            Compartilhamento de Dados
          </Typography>
          <Typography paragraph className={classes.content}>
            Não compartilhamos qualquer dado pessoal obtido por meio da aplicação com terceiros. Os dados de autenticação são utilizados apenas internamente para verificação e controle de acesso.
          </Typography>
        </div>

        <div className={classes.section}>
          <Typography variant="h5" className={classes.sectionTitle}>
            Segurança
          </Typography>
          <Typography paragraph className={classes.content}>
            Comprometemo-nos com a segurança dos dados pessoais fornecidos previamente pelos usuários. Utilizamos medidas técnicas adequadas para proteger contra acessos não autorizados e manter a integridade dos dados.
          </Typography>
        </div>

        <div className={classes.section}>
          <Typography variant="h5" className={classes.sectionTitle}>
            Encerramento de Conta
          </Typography>
          <Typography paragraph className={classes.content}>
            Para encerrar sua conta e interromper o acesso aos serviços, é necessário encerrar o contrato do serviço externamente. O encerramento da conta não é realizado diretamente pela aplicação.
          </Typography>
        </div>

        <div className={classes.section}>
          <Typography variant="h5" className={classes.sectionTitle}>
            Alterações nesta Política
          </Typography>
          <Typography paragraph className={classes.content}>
            Esta política de privacidade poderá ser atualizada ocasionalmente para refletir melhorias ou mudanças na aplicação. As alterações serão disponibilizadas nesta página, e recomendamos consultá-la periodicamente.
          </Typography>
        </div>
      </Paper>
    </Box>
  );
};

export default PrivacyPage;
