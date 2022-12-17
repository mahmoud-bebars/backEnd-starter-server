const generate = (): string => {
  const otpLength: number = 7
  let otp: string = ''

  for (let i = 0; i < otpLength; i++) {
    otp += Math.floor(Math.random() * 9)
  }

  return otp
}

export default { generate }
