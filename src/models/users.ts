import Database from '../database'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()

const saltRounds = process.env.SALT_ROUNDS as string
const pepper = process.env.BCRYPT_PASSWORD as string

export type User = {
  id?: number
  userId?: string
  firstName: string
  lastName: string
  username: string
  phone: string
  email: string
  password: string
  confirmPassword: string
  newPass?: string
}

type Response = {
  username: string
  userId: string
  newPass?: string
  emailVerfiy?: string
  errMsg?: string
}

export class UserControl {
  // GET All users in a list
  /*   async index(): Promise<User[]> {
    try {
      const conn = await Database.connect()
      const sql = 'SELECT * FROM users'
      const results = await conn.query(sql)
      const users = results.rows
      conn.release()
      return users
    } catch (err) {
      throw new Error(`Cannot get users ${err}`)
    }
  } */

  async showByUserId(userId: string): Promise<User> {
    try {
      const conn = await Database.connect()
      const sql = 'SELECT * FROM users WHERE userId=($1)'
      const result = await conn.query(sql, [userId])
      const user = result.rows[0]
      conn.release()
      return user
    } catch (err) {
      throw new Error(`Could not find user with id: ${userId}. Error: ${err}`)
    }
  }

  async showByEmail(email: string): Promise<Response> {
    try {
      const conn = await Database.connect()
      const sql = 'SELECT * FROM users WHERE email=($1) RETURNING *'
      const result = await conn.query(sql, [email])
      const user = result.rows[0]
      conn.release()
      return {
        username: user.username,
        userId: user.userid,
      }
    } catch (err) {
      return {
        username: '',
        userId: '',
        errMsg: `user With email: ${email} does not exists`,
      }
    }
  }

  // user Register function
  async register(u: User): Promise<Response> {
    try {
      const conn = await Database.connect()

      /* we will first before start register process have some checks on
        - Email
        - phone
        - username
        & we will also compare between passwords enterd 
      */

      // check if email exist in the database or no to prevent duplication
      const checkEmailSql = 'SELECT * FROM users WHERE email =($1)'
      const emailCheck = await conn.query(checkEmailSql, [u.email])
      if (emailCheck.rows.length >= 1)
        return {
          username: '',
          userId: '',
          errMsg: 'email exists, choose another one....',
        }

      // Since login contain username so it Can not be also duplicated in db
      // we will check if osername exist in the database or no
      const checkUsernameSql = 'SELECT * FROM users WHERE username =($1)'
      const usernameCheck = await conn.query(checkUsernameSql, [u.username])
      if (usernameCheck.rows.length >= 1)
        return {
          username: '',
          userId: '',
          errMsg: 'username exists, choose another one....',
        }

      // check if Phone exist in the database or no to prevent duplication
      const checkPhoneSql = 'SELECT * FROM users WHERE phone =($1)'
      const phoneCheck = await conn.query(checkPhoneSql, [u.phone])
      if (phoneCheck.rows.length >= 1)
        return {
          username: '',
          userId: '',
          errMsg: 'phone exists, choose another one....',
        }

      // compare passwords & create hashed password
      if (u.password !== u.confirmPassword)
        return {
          username: '',
          userId: '',
          errMsg: 'Passwords Doesn not Match, try Again...',
        }
      const hash = bcrypt.hashSync(
        u.password + (pepper as string),
        parseInt(saltRounds as string)
      )
      // create uniqe id for the user
      const userId = uuidv4()

      // record user info in the database
      const insertSql =
        'INSERT INTO users (userid,firstName,lastName,username,email,phone,emailVerfiy,password) VALUES ($1, $2, $3, $4, $5, $6,$7,$8) RETURNING *'
      const result = await conn.query(insertSql, [
        userId,
        u.firstName,
        u.lastName,
        u.username,
        u.email,
        u.phone,
        0,
        hash,
      ])
      const user = result.rows[0]
      conn.release()

      // create the function success response
      const response = {
        userId: user.userid as string,
        username: user.username as string,
      }

      return response
    } catch (err) {
      // catch any Errors
      throw new Error(
        `Could not Register the user with name ${u.username}. Error: ${err}`
      )
    }
  }

  // user Login function
  async login(username: string, password: string): Promise<Response> {
    try {
      const conn = await Database.connect()
      // check username exists or no
      const sql = 'SELECT * FROM users WHERE username=($1)'
      const result = await conn.query(sql, [username])
      conn.release()

      // check of username existance
      if (result.rows.length) {
        const user = result.rows[0]
        // compare password with hashed one in the db
        if (bcrypt.compareSync(password + pepper, user.password)) {
          // create the success response
          const response = {
            username: username,
            userId: user.userid,
          }
          return response
        }
      }
      // return errors when username/password is not correct
      return {
        username: '',
        userId: '',
        errMsg: 'username/password is not correct... try again',
      }
    } catch (err) {
      // catch any Errors
      return {
        username: '',
        userId: '',
        errMsg: `Could not Login user to the account due to Error: ${err}`,
      }
    }
  }

  async verfiy(userId: string): Promise<Response> {
    try {
      const conn = await Database.connect()
      const sql =
        'UPDATE users SET emailVerfiy=($2) WHERE userid=($1) RETURNING username,userid,emailVerfiy'
      const result = await conn.query(sql, [userId, 1])
      const user = result.rows[0]
      conn.release()
      return {
        username: user.username,
        userId: user.userid,
        emailVerfiy: user.emailverfiy,
      }
    } catch (err) {
      // catch any Errors
      return {
        username: '',
        userId: '',
        errMsg: `Could not Verfiy the account due to Error: ${err}`,
      }
    }
  }

  async changePass(userId: string, newPass: string): Promise<Response> {
    try {
      const sql =
        'UPDATE users SET emailVerfiy=($2) WHERE userid=($1) RETURNING username,userid,password'

      const conn = await Database.connect()

      const result = await conn.query(sql, [userId, newPass])

      const user = result.rows[0]

      conn.release()

      return {
        username: user.username,
        userId: user.userid,
        newPass: user.password,
      }
    } catch (err) {
      return {
        username: '',
        userId: '',
        errMsg: `Could not change the account password due to Error: ${err}`,
      }
    }
  }

  async remove(userId: string): Promise<User> {
    try {
      const sql = 'DELETE FROM users WHERE userid=($1) RETURNING *'

      const conn = await Database.connect()

      const result = await conn.query(sql, [userId])

      const userRemoved = result.rows[0]

      conn.release()

      return userRemoved
    } catch (err) {
      throw new Error(`Could not delete user with id: ${userId}. Error: ${err}`)
    }
  }
}
