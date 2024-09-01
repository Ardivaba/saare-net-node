import { defineStore } from 'pinia'
import axios from "axios";
import * as Sentry from "@sentry/vue";

export const useWorkersStore = defineStore('workers', {
    state: () => ({
        workers: [],
        worker: {},
        currentPage: 1,
        totalPages: 1,
        sortColumn: 'id',
        sortDirection: 'asc',
    }),
    actions: {
        async getWorkers() {
            try {
                const response = await axios.get(`${window.baseURL}/api/workers`, {
                    params: {
                        page: this.currentPage,
                        sort: this.sortColumn,
                        direction: this.sortDirection,
                    }
                });
                this.workers = response.data.workers;
                this.totalPages = response.data.totalPages;
            } catch (error) {
                Sentry.captureException({msg: 'Error fetching workers', error});
            }
        },
        async getWorker(id) {
            try {
                const response = await axios.get(`${window.baseURL}/api/workers/${id}`);
                this.worker = response.data;
            } catch (error) {
                Sentry.captureException({msg: 'Error fetching worker', error});
            }
        },
        async createWorker(workerData) {
            try {
                const response = await axios.post(`${window.baseURL}/api/workers`, workerData);
                this.workers.push(response.data);
                return response.data;
            } catch (error) {
                Sentry.captureException({msg: 'Error creating worker', error});
                throw error;
            }
        },
        async updateWorker(id, workerData) {
            try {
                const response = await axios.put(`${window.baseURL}/api/workers/${id}`, workerData);
                const index = this.workers.findIndex(w => w.id === id);
                if (index !== -1) {
                    this.workers[index] = response.data;
                }
                return response.data;
            } catch (error) {
                Sentry.captureException({msg: 'Error updating worker', error});
                throw error;
            }
        },
        async deleteWorker(id) {
            try {
                await axios.delete(`${window.baseURL}/api/workers/${id}`);
                this.workers = this.workers.filter(w => w.id !== id);
            } catch (error) {
                Sentry.captureException({msg: 'Error deleting worker', error});
                throw error;
            }
        },
        async getCurrentWorker() {
            try {
                const response = await axios.get(`${window.baseURL}/api/workers/current`);
                this.currentWorker = response.data;
            } catch (error) {
                Sentry.captureException({msg: 'Error fetching current worker', error});
                this.currentWorker = null;
            }
        },
        setCurrentWorker(worker) {
            this.currentWorker = worker;
            if (worker) {
                localStorage.setItem('currentWorker', JSON.stringify(worker));
            } else {
                localStorage.removeItem('currentWorker');
            }
        },
        async loginWorker(rfCode) {
            try {
                const response = await axios.post(`${window.baseURL}/api/auth/workers/login`, { code: rfCode });
                this.setCurrentWorker(response.data);
                return this.currentWorker;
            } catch (error) {
                Sentry.captureException({msg: 'Error logging in worker', error});
                throw error;
            }
        },
        async logoutWorker() {
            try {
                await axios.post(`${window.baseURL}/api/workers/logout`);
                this.setCurrentWorker(null);
            } catch (error) {
                Sentry.captureException({msg: 'Error logging out worker', error});
                throw error;
            }
        },
        initializeCurrentWorker() {
            const storedWorker = localStorage.getItem('currentWorker');
            if (storedWorker) {
                this.currentWorker = JSON.parse(storedWorker);
            }
        },
        setPage(page) {
            this.currentPage = page;
        },
        setSorting(column, direction) {
            this.sortColumn = column;
            this.sortDirection = direction;
        },
    },
});