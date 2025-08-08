import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Autocomplete,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { socioSchema } from '../../utils/validators';
import sociosService from '../../services/personal.service';
import zonasService from '../../services/zonas.service';

function SocioForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [zonas, setZonas] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal para agregar nueva zona
  const [showAddZonaModal, setShowAddZonaModal] = useState(false);
  const [newZonaName, setNewZonaName] = useState('');
  const [newZonaDescription, setNewZonaDescription] = useState('');
  const [savingZona, setSavingZona] = useState(false);
  
  // Estado para el Autocomplete de zona
  const [selectedZona, setSelectedZona] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(socioSchema),
    defaultValues: {
      dni: '',
      nombres: '',
      apellidos: '',
      celular: '',
      zona: ''
    }
  });

  useEffect(() => {
    const initializeForm = async () => {
      // Limpiar zona seleccionada
      setSelectedZona(null);
      
      // Primero cargar las zonas y esperar a que termine
      console.log('🔄 Inicializando formulario...');
      await loadInitialData();
      
      // Si es edición, cargar los datos después de que se hayan cargado las zonas
      if (isEdit) {
        // Obtener las zonas actualizadas del estado
        const zonasResult = await zonasService.getZonas();
        if (zonasResult.success) {
          const zonasArray = Array.isArray(zonasResult.data) ? zonasResult.data : [];
          console.log('🏢 Pasando zonas a loadSocio:', zonasArray.map(z => z.nombre));
          await loadSocio(zonasArray);
        } else {
          await loadSocio([]);
        }
      }
    };
    
    initializeForm();
  }, [isEdit, id]);

  const loadInitialData = async () => {
    try {
      const zonasResult = await zonasService.getZonas();
      
      if (zonasResult.success) {
        setZonas(Array.isArray(zonasResult.data) ? zonasResult.data : []);
      } else {
        setZonas([]);
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setError('Error al cargar las zonas');
      setZonas([]);
    }
  };

  const loadSocio = async (zonasArray = zonas) => {
    setInitialLoading(true);
    try {
      console.log('🔍 Cargando datos del personal con ID:', id);
      console.log('🏢 Zonas disponibles al momento de cargar:', zonasArray.map(z => z.nombre));
      
      const result = await sociosService.getSocioById(id);
      
      if (result.success) {
        const socio = result.data;
        console.log('📋 Datos del personal cargados:', socio);
        
        // Cargar campos del formulario con logs para debug
        setValue('dni', socio.dni || '');
        setValue('nombres', socio.nombres || '');
        setValue('apellidos', socio.apellidos || '');
        setValue('celular', socio.celular || '');
        
        // Verificar y cargar zona con debug
        const zonaValue = socio.zona || '';
        console.log('🏢 Zona a cargar:', zonaValue);
        setValue('zona', zonaValue);
        
        // Encontrar la zona correspondiente en la lista y seleccionarla
        if (zonaValue && zonasArray.length > 0) {
          const zonaObj = zonasArray.find(z => z.nombre === zonaValue);
          console.log('🏢 Zona encontrada para seleccionar:', zonaObj);
          setSelectedZona(zonaObj || null);
          
          if (!zonaObj) {
            console.warn('⚠️ No se encontró la zona en la lista disponible');
          }
        } else {
          setSelectedZona(null);
          if (zonaValue) {
            console.warn('⚠️ Zona requerida pero lista de zonas vacía');
          }
        }
        
        setSuccess('Datos del personal cargados correctamente');
      } else {
        console.error('❌ Error al cargar personal:', result.error);
        setError('No se pudo cargar los datos del personal: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error al cargar personal:', error);
      setError('Error al cargar los datos del personal');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAddZona = async () => {
    if (!newZonaName.trim()) return;
    
    setSavingZona(true);
    try {
      const zonaData = {
        nombre: newZonaName.trim(),
        descripcion: newZonaDescription.trim(),
        activa: true
      };
      
      const result = await zonasService.createZona(zonaData);
      
      if (result.success) {
        // Recargar lista de zonas
        await loadInitialData();
        
        // Crear objeto de zona para seleccionar
        const nuevaZona = {
          id: 'temp-' + Date.now(), // ID temporal
          nombre: newZonaName.trim(),
          descripcion: newZonaDescription.trim(),
          activa: true
        };
        
        // Seleccionar la nueva zona en el autocomplete
        setSelectedZona(nuevaZona);
        setValue('zona', newZonaName.trim());
        
        // Cerrar modal y limpiar
        setShowAddZonaModal(false);
        setNewZonaName('');
        setNewZonaDescription('');
        setSuccess('Nueva zona agregada exitosamente');
      } else {
        setError(result.error || 'Error al crear la zona');
      }
    } catch (error) {
      console.error('Error al crear zona:', error);
      setError('Error inesperado al crear la zona');
    } finally {
      setSavingZona(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;
      
      // Preparar datos para envío
      const personalData = {
        dni: data.dni.trim(),
        nombres: data.nombres.trim(),
        apellidos: data.apellidos.trim(),
        celular: data.celular.trim(),
        zona: data.zona,
        // Campos adicionales para mantener compatibilidad
        estado: 'activo',
        fechaRegistro: new Date()
      };

      if (isEdit) {
        result = await sociosService.updateSocio(id, personalData);
      } else {
        result = await sociosService.createSocio(personalData);
      }

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/personal');
        }, 1500);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error al guardar personal:', error);
      setError('Error inesperado al guardar los datos del personal');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/personal')}
          sx={{ mb: 2 }}
        >
          Volver a la lista
        </Button>
        
        <Typography variant="h4" gutterBottom>
          {isEdit ? 'Editar Personal' : 'Nuevo Personal'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isEdit ? 'Modifica los datos del personal' : 'Registra nuevo personal en el sistema'}
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

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* DNI */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="DNI *"
                  placeholder="Ej: 12345678"
                  {...register('dni')}
                  error={!!errors.dni}
                  helperText={errors.dni?.message}
                  inputProps={{ maxLength: 8 }}
                />
              </Grid>

              {/* Celular */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Celular *"
                  placeholder="Ej: 987654321"
                  {...register('celular')}
                  error={!!errors.celular}
                  helperText={errors.celular?.message}
                  inputProps={{ maxLength: 9 }}
                />
              </Grid>

              {/* Nombres */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombres *"
                  placeholder="Ej: Juan Carlos"
                  {...register('nombres')}
                  error={!!errors.nombres}
                  helperText={errors.nombres?.message}
                />
              </Grid>

              {/* Apellidos */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Apellidos *"
                  placeholder="Ej: García López"
                  {...register('apellidos')}
                  error={!!errors.apellidos}
                  helperText={errors.apellidos?.message}
                />
              </Grid>

              {/* Zona */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', width: '100%' }}>
                  <Autocomplete
                    sx={{ flex: 1, minWidth: 200, maxWidth: 250 }}
                    fullWidth
                    options={zonas}
                    value={selectedZona}
                    getOptionLabel={(option) => option?.nombre || ''}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body1">{option.nombre}</Typography>
                          {option.descripcion && (
                            <Typography variant="caption" color="text.secondary">
                              {option.descripcion}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Zona *"
                        error={!!errors.zona}
                        helperText={errors.zona?.message}
                        placeholder="Buscar zona..."
                      />
                    )}
                    onChange={(event, value) => {
                      console.log('🏢 Zona seleccionada:', value);
                      setSelectedZona(value);
                      setValue('zona', value ? value.nombre : '');
                    }}
                    noOptionsText="No se encontraron zonas"
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return option === value;
                      return option.nombre === value.nombre;
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={() => setShowAddZonaModal(true)}
                    sx={{ 
                      mt: 1,
                      bgcolor: 'primary.light', 
                      '&:hover': { bgcolor: 'primary.main' },
                      color: 'white'
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Grid>

              {/* Botones */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/personal')}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} />
                      ) : isEdit ? (
                        <EditIcon />
                      ) : (
                        <PersonAddIcon />
                      )
                    }
                  >
                    {loading
                      ? 'Guardando...'
                      : isEdit
                      ? 'Actualizar Personal'
                      : 'Registrar Personal'
                    }
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          ℹ️ Información Importante
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • El DNI debe tener exactamente 8 dígitos<br/>
          • El celular debe empezar con 9 y tener 9 dígitos en total<br/>
          • Los nombres y apellidos solo pueden contener letras y espacios<br/>
          • Todos los campos marcados con (*) son obligatorios
        </Typography>
      </Paper>

      {/* Modal para agregar nueva zona */}
      <Dialog 
        open={showAddZonaModal} 
        onClose={() => {
          setShowAddZonaModal(false);
          setNewZonaName('');
          setNewZonaDescription('');
        }}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Agregar Nueva Zona</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre de la Zona *"
            value={newZonaName}
            onChange={(e) => setNewZonaName(e.target.value)}
            margin="normal"
            placeholder="Ej: Zona Norte"
          />
          <TextField
            fullWidth
            label="Descripción (opcional)"
            value={newZonaDescription}
            onChange={(e) => setNewZonaDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
            placeholder="Ej: Comprende los distritos del norte de la ciudad"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowAddZonaModal(false);
              setNewZonaName('');
              setNewZonaDescription('');
            }}
            disabled={savingZona}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddZona}
            variant="contained"
            disabled={!newZonaName.trim() || savingZona}
            startIcon={savingZona ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {savingZona ? 'Guardando...' : 'Agregar Zona'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default SocioForm;