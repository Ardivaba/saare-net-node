import { defineStore } from 'pinia'
import axios from "axios";
import * as Sentry from "@sentry/vue";

export const useRecipesStore = defineStore('recipes', {
    state: () => ({
        recipes: [],
        filteredRecipes: [],
        recipe: {},
        currentPage: 1,
        totalPages: 1,
        sortColumn: 'id',
        sortDirection: 'asc',
    }),
    actions: {
        async getRecipes() {
            try {
                const response = await axios.get(`${window.baseURL}/api/recipes`, {
                    params: {
                        page: this.currentPage,
                        sort: this.sortColumn,
                        direction: this.sortDirection,
                    }
                });
                this.recipes = response.data.recipes;
                this.totalPages = response.data.totalPages;
            } catch (error) {
                Sentry.captureException({msg: 'Viga retseptide laadimisel', error});
            }
        },
        async getAllRecipes() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await axios.get(`${window.baseURL}/api/recipes`, {
                    params: {
                        all: true,
                        sort: this.sortColumn,
                        direction: this.sortDirection,
                    }
                });
                this.recipes = response.data.recipes;
                this.filteredRecipes = this.recipes;
            } catch (error) {
                this.error = 'Viga kõigi retseptide laadimisel';
                Sentry.captureException({msg: this.error, error});
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async getRecipe(id) {
            try {
                const response = await axios.get(`${window.baseURL}/api/recipes/${id}`);
                this.recipe = response.data;
            } catch (error) {
                Sentry.captureException({msg: 'Viga retsepti laadimisel', error});
            }
        },
        async createRecipe(recipeData) {
            try {
                const response = await axios.post(`${window.baseURL}/api/recipes`, recipeData);
                this.recipes.push(response.data);
                return response.data;
            } catch (error) {
                Sentry.captureException({msg: 'Viga retsepti loomisel', error});
                throw error;
            }
        },
        async updateRecipe(id, recipeData) {
            try {
                const response = await axios.put(`${window.baseURL}/api/recipes/${id}`, recipeData);
                const index = this.recipes.findIndex(r => r.id === id);
                if (index !== -1) {
                    this.recipes[index] = response.data;
                }
                return response.data;
            } catch (error) {
                Sentry.captureException({msg: 'Viga retsepti uuendamisel', error});
                throw error;
            }
        },
        async deleteRecipe(id) {
            try {
                await axios.delete(`${window.baseURL}/api/recipes/${id}`);
                this.recipes = this.recipes.filter(r => r.id !== id);
            } catch (error) {
                Sentry.captureException({msg: 'Viga retsepti kustutamisel', error});
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
        filterRecipes(query) {
            if (!query) {
                this.filteredRecipes = this.recipes;
            } else {
                const lowerQuery = query.toLowerCase();
                this.filteredRecipes = this.recipes.filter(recipe => 
                    recipe.code.toString().toLowerCase().includes(lowerQuery) ||
                    recipe.description.toLowerCase().includes(lowerQuery)
                );
            }
        },
    },
});