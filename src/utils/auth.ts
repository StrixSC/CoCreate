export const validateEmail = (email: String): boolean => {
    if(typeof email !== 'string') {
        return false;
    }
    
    return email ? true : false;
}

export const validatePassword = (password: String): boolean => {
    if(typeof password !== 'string') {
        return false;
    }

    return password ? true : false;
}