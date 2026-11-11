import express from 'express';
import request from 'supertest';
import authRoutes from './auth.routes';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('demo registration', () => {
    const originalEnvironment = process.env.NODE_ENV;
    afterEach(() => { process.env.NODE_ENV = originalEnvironment; });
    it('rejects provisioning in production before database access', async () => {
        process.env.NODE_ENV = 'production';
        const response = await request(app).post('/auth/register').send({badge:'test',name:'Demo',role:'MANAGER'});
        expect(response.status).toBe(403);
    });
    it('retains development input validation', async () => {
        process.env.NODE_ENV = 'development';
        const response = await request(app).post('/auth/register').send({});
        expect(response.status).toBe(400);
    });
});
