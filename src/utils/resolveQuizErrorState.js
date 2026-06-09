const STATUS_PRESETS = {
  401: {
    title: 'Sign In Required',
    message: 'Your quiz session is not available right now. Please sign in again.',
  },
  403: {
    title: 'Concept Access Restricted',
    message: 'Your account does not have permission to open this concept.',
  },
  404: {
    title: 'Concept Not Found',
    message: 'This concept does not exist or may have been removed.',
  },
  408: {
    title: 'Concept Timed Out',
    message: 'SoulSync took too long to load this concept. Please try again.',
  },
  500: {
    title: 'Quiz Error',
    message: 'Something unexpected happened while preparing this concept.',
  },
  502: {
    title: 'Quiz Service Unavailable',
    message: 'The quiz experience could not be loaded because a dependent service failed.',
  },
  503: {
    title: 'Quiz Service Unavailable',
    message: 'The quiz experience is temporarily unavailable. Please try again shortly.',
  },
  default: {
    title: 'Quiz Error',
    message: 'Something went wrong while loading this concept.',
  },
};

function inferStatusCode(error) {
  const explicitStatus = Number(error?.statusCode || error?.status);
  if (Number.isFinite(explicitStatus) && explicitStatus > 0) {
    return explicitStatus;
  }

  const errorCode = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();

  if (errorCode === 'permission-denied') return 403;
  if (errorCode === 'not-found') return 404;
  if (errorCode === 'deadline-exceeded') return 408;
  if (errorCode === 'unavailable') return 503;

  if (message.includes('sign-in session is not available')) return 401;
  if (message.includes('does not exist') || message.includes('removed')) return 404;
  if (message.includes('failed to fetch') || message.includes('networkerror')) return 503;
  if (
    message.includes('failed to fetch dynamically imported module')
    || message.includes('importing a module script failed')
    || message.includes('load failed')
  ) {
    return 502;
  }

  return 500;
}

export function resolveQuizErrorState(error, overrides = {}) {
  const statusCode = overrides.statusCode || inferStatusCode(error);
  const preset = STATUS_PRESETS[statusCode] || STATUS_PRESETS.default;

  return {
    statusCode,
    title: overrides.title || preset.title,
    message: overrides.message || error?.message || preset.message,
  };
}
