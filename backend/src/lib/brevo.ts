



if (!env.BREVO_API_KEY) {
    return {
      loggableResponse: {
        status: 200,
        statusText: 'OK',
        data: { message: 'BREVO_API_KEY is not set' },
      },
    }
  }