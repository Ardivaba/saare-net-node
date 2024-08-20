import { Router, Request, Response } from 'express';
import { Production } from '../entities/Production';
import { Between, Like } from 'typeorm';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            per_page = 10,
            sort = 'id',
            direction = 'ASC',
            startDate,
            endDate,
            recipeCode,
            minQuantity,
            maxQuantity,
            machineName
        } = req.query;

        const queryBuilder = Production.createQueryBuilder('production')
            .leftJoinAndSelect('production.machine', 'machine');

        if (startDate) {
            queryBuilder.andWhere('production.startDate >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('production.endDate <= :endDate', { endDate });
        }
        if (recipeCode) {
            queryBuilder.andWhere('production.recipeCode LIKE :recipeCode', { recipeCode: `${recipeCode}%` });
        }
        if (minQuantity) {
            queryBuilder.andWhere('production.producedQuantity >= :minQuantity', { minQuantity });
        }
        if (maxQuantity) {
            queryBuilder.andWhere('production.producedQuantity <= :maxQuantity', { maxQuantity });
        }
        if (machineName) {
            queryBuilder.andWhere('machine.name LIKE :machineName', { machineName: `%${machineName}%` });
        }

        // Apply sorting
        const sortDirection = direction.toString().toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(`production.${sort}`, sortDirection as 'ASC' | 'DESC');

        const total = await queryBuilder.getCount();
        const productions = await queryBuilder
            .skip((+page - 1) * +per_page)
            .take(+per_page)
            .getMany();

        res.json({
            productions,
            totalPages: Math.ceil(total / +per_page),
            currentPage: +page
        });
    } catch (error) {
        console.error('Error in GET /productions:', error);
        res.status(500).json({ error: 'Failed to retrieve productions' });
    }
});

router.get('/export', async (req: Request, res: Response) => {
    try {
        const {
            startDate,
            endDate,
            recipeCode,
            minQuantity,
            maxQuantity,
            machineName
        } = req.query;

        const queryBuilder = Production.createQueryBuilder('production')
            .leftJoinAndSelect('production.machine', 'machine');

        if (startDate) {
            queryBuilder.andWhere('production.startDate >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('production.endDate <= :endDate', { endDate });
        }
        if (recipeCode) {
            queryBuilder.andWhere('production.recipeCode LIKE :recipeCode', { recipeCode: `${recipeCode}%` });
        }
        if (minQuantity) {
            queryBuilder.andWhere('production.producedQuantity >= :minQuantity', { minQuantity });
        }
        if (maxQuantity) {
            queryBuilder.andWhere('production.producedQuantity <= :maxQuantity', { maxQuantity });
        }
        if (machineName) {
            queryBuilder.andWhere('machine.name LIKE :machineName', { machineName: `%${machineName}%` });
        }

        const productions = await queryBuilder.getMany();

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=toodang.csv');

        res.write('ID,Retsepti kood,Alguskuupäev,Lõppkuupäev,Kogus,Tootmisaeg,Masina nimi\n');

        productions.forEach(prod => {
            const productionTime = prod.endDate ? prod.endDate.getTime() - prod.startDate.getTime() : 0;
            const hours = Math.floor(productionTime / 3600000);
            const minutes = Math.floor((productionTime % 3600000) / 60000);

            res.write(`${prod.id},${prod.recipeCode},${formatDate(prod.startDate)},${prod.endDate ? formatDate(prod.endDate) : ''},${prod.producedQuantity.toFixed(2)},${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')},${prod.machine.name}\n`);
        });

        res.end();
    } catch (error) {
        console.error('Error in GET /productions/export:', error);
        res.status(500).json({ error: 'Failed to export productions' });
    }
});

function formatDate(date: Date): string {
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default router;