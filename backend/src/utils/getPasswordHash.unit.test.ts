// __s__/getPasswordHash.test.ts

import { getPasswordHash } from '../utils/getPasswordHash'
import crypto from 'crypto'

// мокаем переменные окружения
jest.mock('../lib/env', () => ({
  env: {
    PASSWORD_SALT: 'test_salt'
  }
}))

describe('getPasswordHash', () => {
  it('возвращает одинаковый хеш для одинакового пароля', () => {
    const hash1 = getPasswordHash('my_password')
    const hash2 = getPasswordHash('my_password')
    expect(hash1).toBe(hash2)
  })

  it('возвращает разные хеши для разных паролей', () => {
    const hash1 = getPasswordHash('password1')
    const hash2 = getPasswordHash('password2')
    expect(hash1).not.toBe(hash2)
  })

  it('включает соль в хеш', () => {
    // проверим, что если мы вручную посчитаем, то результат совпадет
    const expected = crypto
      .createHash('sha256')
      .update('test_saltmy_password')
      .digest('hex')

    const actual = getPasswordHash('my_password')
    expect(actual).toBe(expected)
  })
})
