import supertest from 'supertest'
import app from '../../server'
import jwt from '../../utils/jwt'

const testUser = {
  username: 'm.bebars',
  userId: '1234567890',
}
// this testToken only used for generation so tests can pass any time without failing because of token expiration
const token = jwt.generateToken(testUser.username, testUser.userId)

const testToken = `barer ${token}`

describe('Controllers Testing', () => {
  describe('Users Controller', () => {
    it('Should Create a user with Route /users/register', async () => {
      const response = await supertest(app).post('/users/register').send({
        firstName: 'mahmoud',
        lastName: 'bebars',
        username: 'm.bebars',
        email: 'm.bebars@gmail.com',
        password: '12345',
        confirmPassword: '12345',
      })

      expect(response.status).toBe(200)
      expect(response.body.accessToken.token).toBeDefined()
    })
    it('Should login the user to the accout', async () => {
      const response = await supertest(app).post('/users/login').send({
        username: 'm.bebars',
        password: '12345',
      })
      expect(response.status).toBe(200)
      expect(response.body.accessToken.token).toBeDefined()
    })
    it('Should authorize the user', async () => {
      const response = await supertest(app)
        .get('/users/auth')
        .set('Authorization', testToken)
        .expect(200)
      expect(response.status).toBe(200)
    })
    it('should get a list of users after athorizing the request', async () => {
      const response = await supertest(app)
        .get('/users')
        .set('Authorization', testToken)
        .expect(200)
      expect(response.status).toBe(200)
    })
    it('should get user with id:1 info', async () => {
      const id = '2'
      const response = await supertest(app)
        .get('/users/' + id)
        .query(id)
        .set('Authorization', testToken)
        .expect(200)
      expect(response.status).toBe(200)
    })

    it('should delete user with id: 1 after authorization', async () => {
      const response = await supertest(app)
        .delete('/users/' + 2)
        .set('Authorization', testToken)
        .expect(200)
      expect(response.status).toBe(200)
    })
  })
})
