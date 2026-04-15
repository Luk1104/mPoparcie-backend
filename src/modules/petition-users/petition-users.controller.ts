import { type Request, type Response } from 'express';
import { registerUser, loginUser } from './petition-users.service.js';

export const login = (req: Request, res: Response) => {
	const { username, password } = req.body ?? {};

	if (!username || !password) {
		return res.status(400).json({ status: 'error', message: 'Wszystkie pola są wymagane' });
	}
	
    try {
        // Komunikacja z service
        const LoggedInUser = loginUser({ username, password });
        return res.status(200).json({ status: 'success', message: 'Login successful' });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: 'Wystąpił błąd podczas logowania' });
    }
};

export const register = (req: Request, res: Response) => {

	const { username, password, name, surname } = req.body ?? {};
	if (!username || !password || !name || !surname) {
		return res.status(400).json({ status: 'error', message: 'Wszystkie pola są wymagane' });
	}

    try {
        // Komunikacja z service
        const newUser = registerUser({ username, password, name, surname });
        return res.status(201).json({ status: 'success', message: 'Rejestracja udana', data: newUser });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: 'Wystąpił błąd podczas rejestracji' });
    }
};
