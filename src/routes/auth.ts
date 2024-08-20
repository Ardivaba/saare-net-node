import { Router, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import jwt from 'jsonwebtoken';
import { Worker } from '../entities/Worker';
import { config } from '../utils/config';

interface Auth {
    username: string;
    password: string;
}

let dataSource: DataSource;

export const initAuth = (ds: DataSource) => {
    dataSource = ds;
};

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
    const payload = req.body as Auth;
    if (payload.username !== config.app.jwtUsername || payload.password !== config.app.jwtPassword) {
        return res.status(401).json({ status: "fail", message: "invalid username or password" });
    }

    const now = new Date();
    const token = jwt.sign({
        sub: 'auth_token',
        exp: Math.floor(now.getTime() / 1000) + (72 * 60 * 60), // 72 hours
        iat: Math.floor(now.getTime() / 1000),
        nbf: Math.floor(now.getTime() / 1000)
    }, config.app.jwtSecret);

    res.cookie('auth_token', token, {
        path: '/',
        maxAge: 3600 * 60 * 1000, // 60 hours in milliseconds
        httpOnly: true,
        secure: config.app.isProduction
    });

    return res.status(200).json({ status: "success" });
});

router.post('/logout', (req: Request, res: Response) => {
    res.cookie('auth_token', '', {
        path: '/',
        expires: new Date(0),
        httpOnly: true,
        secure: config.app.isProduction
    });

    return res.status(200).json({ status: "success" });
});

router.post('/workers/login', async (req: Request, res: Response) => {
    const { code } = req.body;
    const workerRepository = dataSource.getRepository(Worker);

    const worker = await workerRepository.findOne({ where: { code } });
    if (!worker) {
        return res.status(401).json({ status: "fail", message: "invalid worker code" });
    }

    worker.isLoggedIn = true;
    worker.lastLoginAt = new Date();
    await workerRepository.save(worker);

    return res.status(200).json(worker);
});

router.post('/workers/logout', async (req: Request, res: Response) => {
    const workerRepository = dataSource.getRepository(Worker);

    const worker = await workerRepository.findOne({ where: { isLoggedIn: true } });
    if (!worker) {
        return res.status(404).json({ status: "fail", message: "No worker currently logged in" });
    }

    worker.isLoggedIn = false;
    await workerRepository.save(worker);

    return res.status(200).json({ status: "success" });
});

router.get('/workers/current', async (req: Request, res: Response) => {
    const workerRepository = dataSource.getRepository(Worker);

    const worker = await workerRepository.findOne({ where: { isLoggedIn: true } });
    if (!worker) {
        return res.status(401).json({ status: "fail", message: "No worker currently logged in" });
    }

    return res.status(200).json(worker);
});

export default router;
