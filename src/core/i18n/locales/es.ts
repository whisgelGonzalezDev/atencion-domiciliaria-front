const es = {
  nav: {
    home: 'Inicio',
    settings: 'Configuración',
    logout: 'Cerrar sesión',
  },
  auth: {
    title: 'Bienvenido de nuevo',
    subtitle: 'Inicia sesión para continuar',
    email: 'Correo electrónico',
    password: 'Contraseña',
    signIn: 'Iniciar sesión',
    emailPlaceholder: 'tu@empresa.com',
    passwordPlaceholder: '••••••••',
    invalidCredentials: 'Correo o contraseña incorrectos',
  },
  errors: {
    notFound: 'Página no encontrada',
    notFoundSubtitle: 'La página que buscas no existe o ha sido movida.',
    goBack: '← Volver atrás',
    somethingWentWrong: 'Algo salió mal',
    tryAgain: 'Intentar de nuevo',
  },
  common: {
    loading: 'Cargando…',
    error: 'Algo salió mal',
    noData: 'Sin datos disponibles',
    save: 'Guardar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    loginSuccess: '¡Bienvenido de nuevo!',
    logoutSuccess: 'Sesión cerrada correctamente',
  },
} as const

export default es
