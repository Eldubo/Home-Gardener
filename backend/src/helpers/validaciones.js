
export class validaciones {

 validateEmail = async(email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 validatePassword = async(password) => password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);

}