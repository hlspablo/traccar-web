import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Paper,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from '../../common/components/LocalizationProvider';

const plans = [
  { id: 'coragem1', name: 'Coragem Moto Essencial', value: 34.90 },
  { id: 'coragem2', name: 'Coragem Moto Premium', value: 44.90 },
  { id: 'coragem3', name: 'Coragem Carro Essencial', value: 49.90 },
  { id: 'coragem4', name: 'Coragem Carro Premium', value: 59.90 },
  { id: 'custom', name: 'Personalizado', value: null },
];

const PlanSelector = ({ attributes, setAttributes }) => {
  const t = useTranslation();
  const theme = useTheme();

  // Determine initially selected plan based on existing attributes
  const getInitialPlan = () => {
    if (!attributes.planName || !attributes.planValue) {
      return null;
    }

    const existingPlan = plans.find(
      (plan) => plan.id !== 'custom'
                && plan.name === attributes.planName
                && plan.value === Number(attributes.planValue),
    );

    return existingPlan ? existingPlan.id : 'custom';
  };

  const [selectedPlan, setSelectedPlan] = useState(getInitialPlan());

  // Set plan values to attributes when selected
  useEffect(() => {
    if (selectedPlan && selectedPlan !== 'custom') {
      const plan = plans.find((p) => p.id === selectedPlan);
      if (plan) {
        const updatedAttributes = { ...attributes };
        updatedAttributes.planName = plan.name;
        updatedAttributes.planValue = plan.value;
        setAttributes(updatedAttributes);
      }
    }
  }, [selectedPlan]);

  const handlePlanChange = (event) => {
    setSelectedPlan(event.target.value);
  };

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">
          {t('devicePlan')}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pb: 3 }}>
        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            aria-label="plans"
            name="plans"
            value={selectedPlan || ''}
            onChange={handlePlanChange}
          >
            <Grid container spacing={2}>
              {plans.map((plan) => (
                <Grid item xs={12} sm={6} key={plan.id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderColor: selectedPlan === plan.id ? theme.palette.primary.main : 'inherit',
                      borderWidth: 1,
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <FormControlLabel
                      value={plan.id}
                      control={<Radio color="primary" />}
                      label={(
                        <>
                          <Typography variant="subtitle1" component="div">
                            {plan.id === 'custom' ? t('devicePlanCustom') : plan.name}
                          </Typography>
                          {plan.id !== 'custom' ? (
                            <Typography
                              variant="body2"
                              color="primary"
                              sx={{ fontWeight: 'medium' }}
                            >
                              R$
                              {' '}
                              {plan.value.toFixed(2)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              {t('devicePlanCustomDescription')}
                            </Typography>
                          )}
                        </>
                      )}
                      sx={{
                        m: 0,
                        width: '100%',
                        '& .MuiFormControlLabel-label': {
                          width: '100%',
                        },
                      }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        </FormControl>
      </AccordionDetails>
    </Accordion>
  );
};

export default PlanSelector;
