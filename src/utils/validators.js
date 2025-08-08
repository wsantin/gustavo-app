import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Correo electrónico inválido')
    .required('El correo electrónico es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida')
});

export const registerSchema = yup.object({
  displayName: yup
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .required('El nombre es requerido'),
  email: yup
    .string()
    .email('Correo electrónico inválido')
    .required('El correo electrónico es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
    .required('La contraseña es requerida'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden')
    .required('Confirme su contraseña')
});

export const resetPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Correo electrónico inválido')
    .required('El correo electrónico es requerido')
});

export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('La contraseña actual es requerida'),
  newPassword: yup
    .string()
    .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
    .required('La nueva contraseña es requerida'),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Las contraseñas no coinciden')
    .required('Confirme su nueva contraseña')
});

// Validaciones para personal (anteriormente socios)
export const socioSchema = yup.object({
  dni: yup
    .string()
    .matches(/^\d{8}$/, 'El DNI debe tener exactamente 8 dígitos')
    .required('El DNI es requerido'),
  nombres: yup
    .string()
    .min(2, 'Los nombres deben tener al menos 2 caracteres')
    .max(50, 'Los nombres no pueden tener más de 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Los nombres solo pueden contener letras')
    .required('Los nombres son requeridos'),
  apellidos: yup
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(50, 'Los apellidos no pueden tener más de 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Los apellidos solo pueden contener letras')
    .required('Los apellidos son requeridos'),
  celular: yup
    .string()
    .matches(/^9\d{8}$/, 'El celular debe empezar con 9 y tener 9 dígitos')
    .required('El celular es requerido'),
  zona: yup
    .string()
    .required('La zona es requerida'),
  direccion: yup
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(100, 'La dirección no puede tener más de 100 caracteres')
    .required('La dirección es requerida'),
  fechaJuramentacion: yup
    .date()
    .max(new Date(), 'La fecha de juramentación no puede ser futura')
    .required('La fecha de juramentación es requerida')
});

// Validaciones para zonas
export const zonaSchema = yup.object({
  nombre: yup
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .required('El nombre es requerido'),
  descripcion: yup
    .string()
    .max(200, 'La descripción no puede tener más de 200 caracteres')
    .optional()
});

// Validaciones para campañas
export const campanaSchema = yup.object({
  nombre: yup
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .required('El nombre es requerido'),
  descripcion: yup
    .string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional(),
  fechaInicio: yup
    .date()
    .required('La fecha de inicio es requerida'),
  fechaFin: yup
    .date()
    .min(yup.ref('fechaInicio'), 'La fecha de fin debe ser posterior a la de inicio')
    .required('La fecha de fin es requerida'),
  activa: yup
    .boolean()
    .required('El estado es requerido')
});