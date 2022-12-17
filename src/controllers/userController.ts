import { Request, Response, NextFunction } from 'express'
import { User, UserControl } from '../models/users'
import jwt from '../utils/jwt'
import OTP from '../utils/otp'
import localStorage from '../utils/localStorage'
import generatePassword from 'password-generator'

const control = new UserControl()

/* const index = async (req: Request, res: Response) => {
  try {
    const users = await control.index()
    res.status(200).json({
      results: users,
      message: `${users.length} user inforamtion has been retrived succesfully`,
    })
  } catch (error) {
    res.status(200).json({ error: error })
  }
} */

const show = async (req: Request, res: Response) => {
  const userId: string = req.params.userId

  try {
    const user = await control.showByUserId(userId)
    res.status(200).json({
      results: user,
      message: `user information with userId:${userId} has been retrived succesfully`,
    })
  } catch (error) {
    res.status(400).json({ error: error })
  }
}

const register = async (req: Request, res: Response) => {
  const user: User = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  }
  try {
    const createdUser = await control.register(user)

    if (!createdUser.errMsg) {
      // generate access token for the user Authorization
      const accessToken = jwt.generateToken(
        createdUser.username,
        createdUser.userId
      )
      const otp = OTP.generate() as string
      localStorage.OTPs.push(otp)
      console.log(otp, localStorage.OTPs)
      // sending the response to the client side with the authorization token & needed info to continue...
      res.status(200).json({
        user: { username: createdUser.username, userId: createdUser.userId },
        accessToken: { token: accessToken, issuedAt: Date() },
        message: `New user with username:${createdUser.username} has been registered succesfully`,
      })
    } else if (createdUser.errMsg) {
      res.status(400).json({
        message: createdUser.errMsg,
      })
    }
  } catch (error) {
    res.status(400).send({ message: `error here: ${error}` })
  }
}

const verfiy = async (req: Request, res: Response) => {
  const otp: string = req.body.otp
  const userId: string = req.body.userId

  try {
    if (!otp || otp === '') {
      res.status(400).json({
        message: 'otp not found please enter the otp',
      })
    }
    if (localStorage.OTPs.includes(otp)) {
      const verfied = await control.verfiy(userId as string)
      if (verfied.emailVerfiy === 'true') {
        res.status(200).json({
          emailverfiy: true,
          message: 'your email has been verfied enjoy our service',
        })
      }
    } else {
      res.status(400).json({
        message: 'The sended otp is invailed... please try again',
      })
    }
  } catch (err) {
    res.status(400).send({ message: `error here: ${err}` })
  }
}

const login = async (req: Request, res: Response) => {
  const user: User = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    username: req.body.username,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  }

  try {
    const loggedUser = await control.login(
      user.username as string,
      user.password as string
    )
    if (!loggedUser.errMsg) {
      // generate access token for the user Authorization
      const accessToken = jwt.generateToken(
        loggedUser.username,
        loggedUser.userId
      )
      // sending the response to the client side with the authorization token & needed info to continue...
      res.status(200).json({
        user: { username: loggedUser.username, userId: loggedUser.userId },
        accessToken: { token: accessToken, issuedAt: Date() },
        message: `user with name:${user.username} has been logged succesfully`,
      })
    } else if (loggedUser.errMsg) {
      res.status(400).json({
        message: loggedUser.errMsg,
      })
    }
  } catch (error) {
    res.status(400).send({ message: `error here: ${error}` })
  }
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send({
    message: 'Authorized You are good to go',
  })
}

const changePass = async (req: Request, res: Response, next: NextFunction) => {
  const oldPass: string = req.body.oldpass
  const newPass: string = req.body.newPass
  const confirmNewPass: string = req.body.confirmNewPass
  const userId: string = req.body.userId

  try {
    if (newPass !== confirmNewPass)
      res.status(400).json({
        message: 'password does not match',
      })
    const showUserPass = await control.showByUserId(userId)

    if (showUserPass.password !== oldPass)
      res.status(400).json({
        message:
          'Old password does not match the reegisterd password in our system try Again...',
      })

    const changePassword = await control.changePass(userId, newPass)

    if (!changePassword.errMsg) {
      res.status(200).send({
        message: 'User Password has been changed successfully',
      })
    } else if (changePassword.errMsg) {
      res.status(400).send({
        message: `Faild to change the user Password due to error :${changePassword.errMsg}`,
      })
    }
  } catch (err) {
    res.status(400).send({ message: `error here: ${err}` })
  }
}

const resetPass = async (req: Request, res: Response, next: NextFunction) => {
  const email: string = req.body.email
  const newPass = generatePassword(15, true)
  try {
    const getUser = await control.showByEmail(email)

    if (getUser.errMsg)
      res.status(400).send({
        message: getUser.errMsg,
      })
    if (getUser.userId) {
      const resetPass = await control.changePass(getUser.userId, newPass)

      // send password to the email with the user name
      // if success
      if (resetPass.errMsg)
        res.status(400).send({
          message: resetPass.errMsg,
        })
      res.status(200).send({
        message: `User with id: ${resetPass.userId} Password has been changed successfully`,
      })
      console.log(resetPass.newPass)
    }
  } catch (err) {
    res.status(400).send({ message: `error here: ${err}` })
  }
}

const remove = async (req: Request, res: Response) => {
  const userId: string = req.body.id
  try {
    const removedProduct = await control.remove(userId)
    res.status(200).json({
      results: removedProduct,
      message: `Product with id:${userId} has been removed succesfully`,
    })
  } catch (error) {
    res.status(400).json({ error: error })
  }
}

export default {
  show,
  remove,
  register,
  verfiy,
  login,
  auth,
  changePass,
  resetPass,
}
