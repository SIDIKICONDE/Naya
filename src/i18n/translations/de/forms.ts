export default {
  labels: {
    name: 'Name',
    email: 'E-Mail',
    password: 'Passwort',
  },
  placeholders: {
    enterName: 'Namen eingeben',
    enterEmail: 'E-Mail eingeben',
    enterPassword: 'Passwort eingeben',
  },
  validation: {
    required: 'Dieses Feld ist erforderlich',
    email: 'Ungültige E-Mail',
    password: 'Ungültiges Passwort',
  },
  buttons: {
    submit: 'Senden',
    save: 'Speichern',
    cancel: 'Abbrechen',
  },
} as const;
