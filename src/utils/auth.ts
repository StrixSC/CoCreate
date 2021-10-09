export const validateEmail = (email: string): boolean => {
  if(typeof email !== 'string') {
    return false;
  }
    
  return email ? true : false;
};

export const validatePassword = (password: string): boolean => {
  if(typeof password !== 'string') {
    return false;
  }

  return password ? true : false;
};