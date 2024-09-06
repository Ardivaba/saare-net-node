import { defineStore } from 'pinia';
import axios from 'axios';
import * as Sentry from "@sentry/vue";

export const useReportsStore = defineStore('reports', {
    state: () => ({
        totalProduction: [],
        productionByCode: [],
        workerProduction: [],
        workers: [],
        loading: false,
        error: null,
    }),
    actions: {
        async fetchTotalProduction(startDate, endDate) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get(`${window.baseURL}/api/reports/total-production`, {
                    params: { startDate, endDate }
                });
                this.totalProduction = response.data;
            } catch (error) {
                this.error = 'Error fetching total production data';
                Sentry.captureException({msg: this.error, error});
            } finally {
                this.loading = false;
            }
        },
        async fetchProductionByCode(startDate, endDate) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get(`${window.baseURL}/api/reports/production-by-code`, {
                    params: { startDate, endDate }
                });
                this.productionByCode = response.data;
            } catch (error) {
                this.error = 'Error fetching production by code data';
                Sentry.captureException({msg: this.error, error});
            } finally {
                this.loading = false;
            }
        },
        async fetchWorkerProduction(startDate, endDate, workerIds) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get(`${window.baseURL}/api/reports/worker-production`, {
                    params: { startDate, endDate, workerIds: workerIds.join(',') }
                });
                this.workerProduction = response.data;
            } catch (error) {
                this.error = 'Error fetching worker production data';
                Sentry.captureException({msg: this.error, error});
            } finally {
                this.loading = false;
            }
        },
        async fetchWorkers() {
            try {
                const response = await axios.get(`${window.baseURL}/api/workers`);
                this.workers = response.data.workers;
            } catch (error) {
                this.error = 'Error fetching workers';
                Sentry.captureException({msg: this.error, error});
            }
        },
    },
});