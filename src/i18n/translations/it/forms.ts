export default {
  labels: {
    name: 'Nome',
    email: 'Email',
    password: 'Password',
  },
  placeholders: {
    enterName: 'Inserisci il tuo nome',
    enterEmail: 'Inserisci la tua email',
    enterPassword: 'Inserisci la tua password',
  },
  validation: {
    required: 'Questo campo è obbligatorio',
    email: 'Email non valida',
    password: 'Password non valida',
  },
  buttons: {
    submit: 'Invia',
    save: 'Salva',
    cancel: 'Annulla',
  },
} as const;
