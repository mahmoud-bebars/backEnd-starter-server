import { UserControl } from '../../models/users'

const userStoreTest = new UserControl()

describe('Models Testing', () => {
  describe('User Model', () => {
    it('shoud Register a new user to the appliction', async () => {
      const user = {
        firstName: 'mahmoud',
        lastName: 'bebars',
        username: 'mbebars',
        email: 'm.bebars@icloud.com',
        phone: '01203747990',
        password: '12345',
        confirmPassword: '12345',
      }
      const results = await userStoreTest.register(user)
      expect(results.userId).toBeDefined()
      expect(results.username).toEqual('mbebars')
    })

    it('should fail because email exists', async () => {
      const user = {
        firstName: 'mahmoud',
        lastName: 'bebars',
        username: 'mbebars',
        email: 'm.bebars@icloud.com',
        phone: '01203747990',
        password: '12345',
        confirmPassword: '12345',
      }
      const results = await userStoreTest.register(user)
      expect(results.errMsg).toEqual('email exists, choose another one....')
    })
    it('should fail because username exists', async () => {
      const user = {
        firstName: 'mahmoud',
        lastName: 'bebars',
        username: 'mbebars',
        email: 'm.bebars1998@icloud.com',
        phone: '01203747990',
        password: '12345',
        confirmPassword: '12345',
      }
      const results = await userStoreTest.register(user)
      expect(results.errMsg).toEqual('username exists, choose another one....')
    })
    it('should fail because phone exists', async () => {
      const user = {
        firstName: 'mahmoud',
        lastName: 'bebars',
        username: 'mahmoud.bebars',
        email: 'm.bebars2018@icloud.com',
        phone: '01203747990',
        password: '12345',
        confirmPassword: '12345',
      }
      const results = await userStoreTest.register(user)
      expect(results.errMsg).toEqual('phone exists, choose another one....')
    })
    it('should login the user to his account', async () => {
      const username = 'mbebars'
      const password = '12345'

      const results = await userStoreTest.login(username, password)
      expect(results.userId).toBeDefined()
    })
    it('should return list of users after authorize the request', async () => {
      const result = await userStoreTest.index()
      expect(result[0].id).toEqual(1)
    })
    it('shoud return the user with id: 1 information', async () => {
      const result = await userStoreTest.show(1)
      expect(result.id).toEqual(1)
      expect(result.username).toEqual('mbebars')
    })
    it('should remove user with id:1 ', async () => {
      await userStoreTest.delete(2)
      await userStoreTest.delete(3)
      await userStoreTest.delete(4)
      const results = await userStoreTest.delete(1)
      expect(results.id).toEqual(1)
    })
    it('should update the emailVerfiy property status to true', async () => {
      const user = {
        firstName: 'mahmoud',
        lastName: 'bebars',
        username: 'mbebars',
        email: 'm.bebars@icloud.com',
        phone: '01203747990',
        password: '12345',
        confirmPassword: '12345',
      }
      const sginUp = await userStoreTest.register(user)
      const results = await userStoreTest.verfiy(sginUp.userId)
      expect(results.emailVerfiy).toBeTrue()
    })
  })
})
