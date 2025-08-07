import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Alert,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Place as PlaceIcon
} from '@mui/icons-material';

function Zonas() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Zonas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra las zonas geográficas para la organización de socios
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Zonas Registradas
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
              >
                Nueva Zona
              </Button>
            </Box>

            <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
              <PlaceIcon sx={{ mr: 1 }} />
              La gestión de zonas estará disponible en la Fase 5 del desarrollo.
              Podrás crear, editar y eliminar zonas geográficas.
            </Alert>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estadísticas de Zonas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              - Total de zonas: 0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              - Zonas activas: 0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              - Socios por zona: 0
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Zonas;