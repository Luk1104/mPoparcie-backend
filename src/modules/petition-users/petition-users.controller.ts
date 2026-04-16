import { type Request, type Response } from 'express';
import { registerUser, loginUser } from './petition-users.service.js';
import type { RegisterDTO, LoginDTO } from './petition-users.validation.js';

export const login = async (req: Request<any, any, LoginDTO>, res: Response) => {
    const { username, password } = req.body ?? {};

	// if (!username || !password) {
	// 	return res.status(400).json({ status: 'error', message: 'Wszystkie pola są wymagane' });
	// }
	
    try {
        // Komunikacja z service
        const { token } = await loginUser({ username, password });
        if (token) res.set('Authorization', `Bearer ${token}`);
        return res.status(200).json({ status: 'success', message: 'Login successful' });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: 'Wystąpił błąd podczas logowania' });
    }
};

export const register = async (req: Request<any, any, RegisterDTO>, res: Response) => {

    const { username, password, name, surname } = req.body ?? {};
	// if (!username || !password || !name || !surname) {
	// 	return res.status(400).json({ status: 'error', message: 'Wszystkie pola są wymagane' });
	// }

    try {
        // Komunikacja z service
        const { token } = await registerUser({ username, password, name, surname });
        if (token) res.set('Authorization', `Bearer ${token}`);
        return res.status(201).json({ status: 'success', message: 'Rejestracja udana' });
    }
    catch (error) {
        console.log('Error in register controller:', error);
        return res.status(500).json({ status: 'error', message: 'Wystąpił błąd podczas rejestracji' });
    }
};
