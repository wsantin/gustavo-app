import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Assessment as StatsIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { zonaSchema } from '../../utils/validators';
import zonasService from '../../services/zonas.service';

function ZonasManager() {
  const [zonas, setZonas] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedZona, setSelectedZona] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(zonaSchema)
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [zonasResult, statsResult] = await Promise.all([
        zonasService.getZonas(),
        zonasService.getStats()
      ]);

      if (zonasResult.success) {
        setZonas(zonasResult.data);
      } else {
        setError(zonasResult.error);
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    reset({ nombre: '', descripcion: '', activa: true });
    setSelectedZona(null);
    setShowAddModal(true);
  };

  const handleEdit = (zona) => {
    setSelectedZona(zona);
    setValue('nombre', zona.nombre);
    setValue('descripcion', zona.descripcion || '');
    setValue('activa', zona.activa);
    setShowEditModal(true);
  };

  const handleDelete = (zona) => {
    setSelectedZona(zona);
    setShowDeleteDialog(true);
  };

  const onSubmit = async (data) => {
    try {
      let result;
      
      if (selectedZona) {
        result = await zonasService.updateZona(selectedZona.id, data);
      } else {
        result = await zonasService.createZona(data);
      }

      if (result.success) {
        setSuccess(result.message);
        reset();
        setShowAddModal(false);
        setShowEditModal(false);
        loadData();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error inesperado');
    }
  };

  const confirmDelete = async () => {
    try {
      const result = await zonasService.deleteZona(selectedZona.id);
      
      if (result.success) {
        setSuccess(result.message);
        setShowDeleteDialog(false);
        loadData();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error al eliminar zona');
    }
  };

  const filteredZonas = zonas.filter(zona => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      zona.nombre.toLowerCase().includes(term) ||
      (zona.descripcion || '').toLowerCase().includes(term)
    );
  });

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('es-ES');
    } catch {
      return '-';
    }
  };

  const ZonaFormModal = ({ open, onClose, title, isEdit = false }) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationIcon color="primary" />
        {title}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                fullWidth
                label="Nombre de la zona"
                {...register('nombre')}
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
                placeholder="Ej: Zona Norte, Centro, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción (opcional)"
                multiline
                rows={3}
                {...register('descripcion')}
                error={!!errors.descripcion}
                helperText={errors.descripcion?.message}
                placeholder="Descripción detallada de la zona..."
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1">Estado:</Typography>
                <Button
                  variant={selectedZona?.activa !== false ? 'contained' : 'outlined'}
                  color="success"
                  onClick={() => setValue('activa', true)}
                  size="small"
                >
                  Activa
                </Button>
                <Button
                  variant={selectedZona?.activa === false ? 'contained' : 'outlined'}
                  color="error"
                  onClick={() => setValue('activa', false)}
                  size="small"
                >
                  Inactiva
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Actualizar' : 'Crear'} Zona
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon />
          Gestión de Zonas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra las zonas geográficas del sistema
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Estadísticas */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StatsIcon color="primary" />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Zonas
                    </Typography>
                    <Typography variant="h4">{stats.total}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon color="success" />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Activas
                    </Typography>
                    <Typography variant="h4" color="success.main">{stats.activas}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon color="error" />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Inactivas
                    </Typography>
                    <Typography variant="h4" color="error.main">{stats.inactivas}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon color="info" />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Con Personal
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      {Object.keys(stats.sociosPorZona).length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Controles */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar zonas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAdd}
              >
                Nueva Zona
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Personal</TableCell>
                <TableCell>Fecha Creación</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredZonas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {searchTerm ? 'No se encontraron zonas' : 'No hay zonas registradas'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredZonas.map((zona) => (
                  <TableRow key={zona.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon color="primary" />
                        <Typography variant="subtitle2">{zona.nombre}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {zona.descripcion || 'Sin descripción'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={zona.activa ? 'Activa' : 'Inactiva'}
                        color={zona.activa ? 'success' : 'error'}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={stats?.sociosPorZona?.[zona.nombre] || 0}
                        color="info"
                        size="small"
                        variant="outlined"
                        icon={<PeopleIcon />}
                      />
                    </TableCell>
                    <TableCell>{formatDate(zona.fechaCreacion)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Editar zona">
                          <IconButton size="small" onClick={() => handleEdit(zona)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar zona">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(zona)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modales */}
      <ZonaFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nueva Zona"
      />

      <ZonaFormModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Zona"
        isEdit
      />

      {/* Dialog de eliminación */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la zona{' '}
            <strong>"{selectedZona?.nombre}"</strong>?
          </Typography>
          {stats?.sociosPorZona?.[selectedZona?.nombre] && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Esta zona tiene {stats.sociosPorZona[selectedZona.nombre]} persona(s) asociada(s).
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ZonasManager;