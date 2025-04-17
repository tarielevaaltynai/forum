import { logger, winstonLogger } from './logger';
import debug from 'debug';
//  НЕ РАБОТАЕТ
// Исправленный мок для debug
jest.mock('debug', () => {
  const original = jest.requireActual('debug');
  return jest.fn().mockImplementation(() => {
    return Object.assign(() => {}, {
      enabled: true, // или jest.fn().mockReturnValue(true)
      extend: original.extend,
    });
  });
});

jest.mock('./sentry', () => ({
  sentryCaptureException: jest.fn(),
}));

jest.mock('winston', () => {
  const original = jest.requireActual('winston');
  return {
    ...original,
    createLogger: () => ({
      info: jest.fn(),
      error: jest.fn(),
    }),
  };
});

describe('logger', () => {
  it('should call winston.info when debug is enabled', () => {
    logger.info('test', 'Test message', { some: 'meta' });
    expect(winstonLogger.info).toBeCalled();
  });

  it('should call winston.error and capture to sentry', () => {
    const error = new Error('Oops');
    logger.error('test', error, { action: 'doSomething' });
    expect(winstonLogger.error).toBeCalled();
  });
});