import { logger } from './logger'
import { winstonLogger } from './logger'
import * as debug from 'debug'
import { ExpectedError } from './error'
import { TRPCError } from '@trpc/server'

jest.mock('debug', () => {
  return () => jest.fn().mockReturnValue(true)
})

jest.mock('./sentry', () => ({
  sentryCaptureException: jest.fn(),
}))

describe('logger', () => {
  const infoSpy = jest.spyOn(winstonLogger, 'info').mockImplementation(() => {})
  const errorSpy = jest.spyOn(winstonLogger, 'error').mockImplementation(() => {})
  const { sentryCaptureException } = require('./sentry')

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('logs info with metadata', () => {
    logger.info('testType', 'This is a test', { email: 'secret@example.com' })
    expect(infoSpy).toHaveBeenCalled()
    const callArgs = infoSpy.mock.calls[0]
    expect(callArgs[0]).toBe('This is a test')
    expect(callArgs[1].logType).toBe('testType')
    expect(callArgs[1].email).toBe('🙈')
  })

  it('logs error and captures it in sentry if not ExpectedError', () => {
    const err = new Error('Unexpected')
    logger.error('testType', err, { token: '12345' })
    expect(sentryCaptureException).toHaveBeenCalledWith(err, { token: '🙈' })
    expect(errorSpy).toHaveBeenCalled()
  })

  it('does not send to sentry if ExpectedError', () => {
    const err = new ExpectedError('Known issue')
    logger.error('testType', err)
    expect(sentryCaptureException).not.toHaveBeenCalled()
  })

  it('does not send to sentry if TRPCError wrapping ExpectedError', () => {
    const err = new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: new ExpectedError('Wrapped') })
    logger.error('testType', err)
    expect(sentryCaptureException).not.toHaveBeenCalled()
  })
})