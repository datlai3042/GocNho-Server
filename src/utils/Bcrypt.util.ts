import bcrypt from 'bcrypt'

const SALT = 8

export const hassPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT)
}

export const compare = (passwordForm: string, userPassword: string): boolean => {
  return bcrypt.compareSync(passwordForm, userPassword)
}
