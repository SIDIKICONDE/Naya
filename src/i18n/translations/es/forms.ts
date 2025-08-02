export default {
  labels: {
    name: 'Nombre',
    email: 'Correo',
    password: 'Contraseña',
  },
  placeholders: {
    enterName: 'Ingrese su nombre',
    enterEmail: 'Ingrese su correo',
    enterPassword: 'Ingrese su contraseña',
  },
  validation: {
    required: 'Este campo es requerido',
    email: 'Correo inválido',
    password: 'Contraseña inválida',
  },
  buttons: {
    submit: 'Enviar',
    save: 'Guardar',
    cancel: 'Cancelar',
  },
} as const;
