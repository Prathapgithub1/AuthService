import bcrypt from 'bcrypt';

/**
 * Hashes a plain text password.
 * @param password - Plain text password to be hashed
 * @hashPassword - Function to hash the password
 * @returns A promise that resolves to an object containing the success status, HTTP status code, message, and hashed password (if successful)
 */
export const hashPassword = async (password: string): Promise<any> => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    if (!hashedPassword) {
        return { success: false, status: 500, message: 'Error hashing password', data: [] };
    }
    return { success: true, status: 200, message: 'Password hashed successfully', data: [hashedPassword] };
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<any> => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
        return { success: false, status: 401, message: 'Invalid password', data: [] };
    }
    return { success: true, status: 200, message: 'Password matched successfully', data: [] };
}