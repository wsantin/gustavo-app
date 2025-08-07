import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  Group as GroupIcon,
  Place as PlaceIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp,
  Schedule,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../store/AuthContext';

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPersonal: 0,
    personalActivo: 0,
    totalZonas: 0,
    nuevosMes: 0
  });
  const [recentPersonal, setRecentPersonal] = useState([]);

  useEffect(() => {
    // fetchDashboardData(); // Temporalmente deshabilitado para evitar errores de Firestore
    setLoading(false);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Obtener total de personal
      const personalSnapshot = await getDocs(collection(db, 'socios'));
      const totalPersonal = personalSnapshot.size;
      
      // Obtener personal activo
      const personalActivoQuery = query(
        collection(db, 'socios'),
        where('estado', '==', 'activo')
      );
      const personalActivoSnapshot = await getDocs(personalActivoQuery);
      const personalActivo = personalActivoSnapshot.size;


      // Obtener total de zonas
      const zonasSnapshot = await getDocs(collection(db, 'zonas'));
      const totalZonas = zonasSnapshot.size;

      // Obtener personal nuevo este mes
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const nuevosMesQuery = query(
        collection(db, 'socios'),
        where('fechaCreacion', '>=', startOfMonth)
      );
      const nuevosMesSnapshot = await getDocs(nuevosMesQuery);
      const nuevosMes = nuevosMesSnapshot.size;

      // Obtener personal reciente
      const recentQuery = query(
        collection(db, 'socios'),
        orderBy('fechaCreacion', 'desc'),
        limit(5)
      );
      const recentSnapshot = await getDocs(recentQuery);
      const recentData = recentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setStats({
        totalPersonal,
        personalActivo,
        totalZonas,
        nuevosMes
      });
      setRecentPersonal(recentData);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Personal',
      value: stats.totalPersonal,
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      trend: '+12%',
      subtitle: `${stats.personalActivo} activos`
    },
    {
      title: 'Zonas',
      value: stats.totalZonas,
      icon: <PlaceIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      subtitle: 'Registradas'
    },
    {
      title: 'Nuevos este mes',
      value: stats.nuevosMes,
      icon: <PersonAddIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      trend: '+8%',
      subtitle: 'Personal nuevo'
    }
  ];

  const getInitials = (nombres, apellidos) => {
    const n = nombres ? nombres.charAt(0) : '';
    const a = apellidos ? apellidos.charAt(0) : '';
    return (n + a).toUpperCase();
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido de vuelta, {currentUser?.displayName || 'Usuario'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="caption">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    {stat.subtitle && (
                      <Typography variant="caption" color="text.secondary">
                        {stat.subtitle}
                      </Typography>
                    )}
                    {stat.trend && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                        <Typography variant="caption" color="success.main">
                          {stat.trend}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                      width: 56,
                      height: 56
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }} elevation={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Personal Reciente
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/personal')}
              >
                Ver todos
              </Button>
            </Box>
            
            {recentPersonal.length > 0 ? (
              <List>
                {recentPersonal.map((socio) => (
                  <ListItem
                    key={socio.id}
                    secondaryAction={
                      <Chip 
                        label={socio.estado || 'activo'} 
                        color={socio.estado === 'activo' ? 'success' : 'default'}
                        size="small"
                      />
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getInitials(socio.nombres, socio.apellidos)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${socio.nombres} ${socio.apellidos}`}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {socio.zona}
                          </Typography>
                          {" — "}{socio.celular}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No hay personal registrado aún
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              Acciones Rápidas
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mb: 2 }}
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/personal/nuevo')}
              >
                Agregar Nuevo Personal
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mb: 2 }}
                startIcon={<GroupIcon />}
                onClick={() => navigate('/personal')}
              >
                Ver Lista de Personal
              </Button>
              <Button 
                variant="outlined" 
                fullWidth
                startIcon={<PlaceIcon />}
                onClick={() => navigate('/zonas')}
              >
                Gestionar Zonas
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              Estado del Sistema
            </Typography>
            <List dense>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.light', width: 32, height: 32 }}>
                    <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Sistema Operativo"
                  secondary="Todos los servicios funcionando"
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'info.light', width: 32, height: 32 }}>
                    <Schedule sx={{ fontSize: 18, color: 'info.main' }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Última sincronización"
                  secondary="Hace 2 minutos"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;