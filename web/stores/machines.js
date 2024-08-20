import { defineStore } from 'pinia'
import axios from "axios";
import * as Sentry from "@sentry/vue";

export const useMachinesStore = defineStore('machines', {
    state: () => ({
        machines: [],
        machine: {},
        currentPage: 1,
        totalPages: 1,
        sortColumn: 'id',
        sortDirection: 'asc',
    }),
    actions: {
        async getMachines() {
            try {
                const response = await axios.get(`${window.baseURL}/api/machines`, {
                    params: {
                        page: this.currentPage,
                        sort: this.sortColumn,
                        direction: this.sortDirection,
                    }
                });
                // Assuming the response is directly an array of machines
                this.machines = response.data;
                // Calculate total pages based on the number of machines (assuming 10 per page)
                this.totalPages = Math.ceil(this.machines.length / 10);
                console.log('Fetched machines:', this.machines); // Debug log
            } catch (error) {
                console.error('Error fetching machines:', error);
                Sentry.captureException({msg: 'Error fetching machines', error});
                this.machines = []; // Ensure machines is an empty array on error
            }
        },
        async getMachine(id) {
            try {
                const response = await axios.get(`${window.baseURL}/api/machines/${id}`);
                this.machine = response.data;
            } catch (error) {
                console.error('Error fetching machine:', error);
                Sentry.captureException({msg: 'Error fetching machine', error});
                this.machine = {}; // Reset machine data in case of error
            }
        },
        async createMachine(machineData) {
            try {
                const response = await axios.post(`${window.baseURL}/api/machines`, machineData);
                this.machines.push(response.data);
                return response.data;
            } catch (error) {
                console.error('Error creating machine:', error);
                Sentry.captureException({msg: 'Error creating machine', error});
                throw error;
            }
        },
        async updateMachine(id, machineData) {
            try {
                const response = await axios.put(`${window.baseURL}/api/machines/${id}`, machineData);
                const index = this.machines.findIndex(m => m.id === id);
                if (index !== -1) {
                    this.machines[index] = response.data;
                }
                return response.data;
            } catch (error) {
                console.error('Error updating machine:', error);
                Sentry.captureException({msg: 'Error updating machine', error});
                throw error;
            }
        },
        async deleteMachine(id) {
            try {
                await axios.delete(`${window.baseURL}/api/machines/${id}`);
                this.machines = this.machines.filter(m => m.id !== id);
            } catch (error) {
                console.error('Error deleting machine:', error);
                Sentry.captureException({msg: 'Error deleting machine', error});
                throw error;
            }
        },
        async loadRecipe(machineId, recipeId) {
            try {
                const response = await axios.post(`${window.baseURL}/api/machines/${machineId}/load-recipe`, { recipe_id: recipeId });
                const updatedMachine = response.data;
                const index = this.machines.findIndex(m => m.id === machineId);
                if (index !== -1) {
                    this.machines[index] = updatedMachine;
                }
                return updatedMachine;
            } catch (error) {
                console.error('Error loading recipe:', error);
                Sentry.captureException({msg: 'Error loading recipe', error});
                throw error;
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