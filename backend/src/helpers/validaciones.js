
export class validaciones {
    isValidEmail = async(email) => {
        // Expresión regular simple para validar emails
        const re = /^[^@]+@[^@]+\.[^@]+$/;
        if (!email || typeof email !== 'string' || !re.test(email)) {
           return false;
        }
        return true;
    }

    isValidString = async(string, nombreCampo) => {
       if (!string || typeof string !== 'string' || string.trim() === '' || string.length < 3) {
            return false;
        }
        return true;
    }

    isPositivo = async(value, nombreCampo) => {
        if (value === undefined || value <= 0 || isNaN(value)) {
           return false;
        }
        return true;
    }

    isValidDate = async(dateString, nombreCampo) => { 
        const date = new Date(dateString);
        let ret = true;
        if (isNaN(date.getTime())) {
            ret =  false; 
        }
        return ret;
    }
    isValidPassword = async(password) => password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);

}