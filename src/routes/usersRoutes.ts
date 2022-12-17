import { Application } from 'express'
import controller from '../controllers/userController'
import jwt from '../utils/jwt'

const userRoute = (app: Application) => {
  app.post('/users/register', controller.register)
  app.post('/users/login', controller.login)
  app.get('/users/auth', jwt.verfiyToken, controller.auth)
  // app.get('/users', jwt.verfiyToken, controller.index)
  app.get('/users/:id', jwt.verfiyToken, controller.show)
  app.delete('/users/:id', jwt.verfiyToken, controller.remove)
}

export default userRoute
