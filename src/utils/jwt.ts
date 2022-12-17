import { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

const jwtSecret = process.env.ACCESS_TOKEN_SEECRET as string
const jwtExpire = process.env.JWT_EXPIRES as string

const generateToken = (username: string, userId: string): string => {
  const accessToken: string = jwt.sign(
    {
      user: username,
      userId: userId,
    },
    jwtSecret,
    { expiresIn: jwtExpire }
  )
  return accessToken
}

const verfiyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization as string
    const token = authorizationHeader.split(' ')[1]
    jwt.verify(token, jwtSecret as string)
    // console.log('Authorized') /* just for dev testing */
    next()
  } catch (err) {
    return res.status(401).json(`invaild token ${err}`)
  }
}

export default {
  generateToken,
  verfiyToken,
}
