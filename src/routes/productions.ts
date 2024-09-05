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
            queryBuilder.andWhere('production.start_date >= :startDate', { startDate: new Date(startDate as string) });
        }
        if (endDate) {
            queryBuilder.andWhere('production.end_date <= :endDate', { endDate: new Date(endDate as string) });
        }
        if (recipeCode) {
            queryBuilder.andWhere('CAST(production.recipe_code AS CHAR) LIKE :recipeCode', { recipeCode: `%${recipeCode}%` });
        }
        if (minQuantity) {
            queryBuilder.andWhere('production.produced_quantity >= :minQuantity', { minQuantity: parseFloat(minQuantity as string) });
        }
        if (maxQuantity) {
            queryBuilder.andWhere('production.produced_quantity <= :maxQuantity', { maxQuantity: parseFloat(maxQuantity as string) });
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
            machineName,
            export: exportType
        } = req.query;

        const queryBuilder = Production.createQueryBuilder('production')
            .leftJoinAndSelect('production.machine', 'machine')
            .leftJoinAndSelect('production.order', 'order');

        if (exportType !== 'all') {
            if (startDate) {
                queryBuilder.andWhere('production.start_date >= :startDate', { startDate: new Date(startDate as string) });
            }
            if (endDate) {
                queryBuilder.andWhere('production.end_date <= :endDate', { endDate: new Date(endDate as string) });
            }
            if (recipeCode) {
                queryBuilder.andWhere('CAST(production.recipe_code AS CHAR) LIKE :recipeCode', { recipeCode: `%${recipeCode}%` });
            }
            if (minQuantity) {
                queryBuilder.andWhere('production.produced_quantity >= :minQuantity', { minQuantity: parseFloat(minQuantity as string) });
            }
            if (maxQuantity) {
                queryBuilder.andWhere('production.produced_quantity <= :maxQuantity', { maxQuantity: parseFloat(maxQuantity as string) });
            }
            if (machineName) {
                queryBuilder.andWhere('machine.name LIKE :machineName', { machineName: `%${machineName}%` });
            }
        }

        const productions = await queryBuilder.getMany();

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=productions.csv');

        res.write('ID,Tellimuse ID,Retsepti kood,Alguskuupäev,Lõppkuupäev,Kogus,Tootmisaeg,Masina nimi\n');

        productions.forEach(prod => {
            const productionTime = prod.end_date && prod.start_date
                ? (prod.end_date.getTime() - prod.start_date.getTime()) / 60000 // Convert to minutes
                : 0;
            const hours = Math.floor(productionTime / 60);
            const minutes = Math.floor(productionTime % 60);

            res.write(`${prod.id},${prod.order_id || ''},${prod.recipe_code},${formatDate(prod.start_date)},${formatDate(prod.end_date)},${prod.produced_quantity.toFixed(2)},${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')},${prod.machine ? prod.machine.name : ''}\n`);
        });

        res.end();
    } catch (error) {
        console.error('Error in GET /productions/export:', error);
        res.status(500).json({ error: 'Failed to export productions' });
    }
});

function formatDate(date: Date | null): string {
    if (!date) return '';
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default router;