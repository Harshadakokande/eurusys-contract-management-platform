/**
 * Contract Store
 * Manages contract state with lifecycle controls and localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    Contract,
    ContractCreateInput,
    ContractField,
    ContractStatus,
    DashboardFilter,
} from '../types';
import {
    generateId,
    getCurrentTimestamp,
    canTransition,
    getStatusesForFilter,
    getValidTransitions,
} from '../utils';
import { useBlueprintStore } from './blueprintStore';

interface ContractState {
    contracts: Contract[];
    isLoading: boolean;

    getContract: (id: string) => Contract | undefined;
    getContractsByFilter: (filter: DashboardFilter) => Contract[];
    createContract: (input: ContractCreateInput) => Contract | undefined;
    updateContractFields: (id: string, fields: ContractField[]) => boolean;
    transitionStatus: (id: string, newStatus: ContractStatus) => boolean;
    deleteContract: (id: string) => boolean;
    searchContracts: (query: string) => Contract[];
}

export const useContractStore = create<ContractState>()(
    persist(
        (set, get) => ({
            contracts: [],
            isLoading: false,

            getContract: (id) => get().contracts.find((c) => c.id === id),

            getContractsByFilter: (filter) => {
                const statuses = getStatusesForFilter(filter);
                return get().contracts.filter((c) => statuses.includes(c.status));
            },

            createContract: (input) => {
                if (!input.name.trim()) {
                    console.error('Contract name cannot be empty');
                    return undefined;
                }

                const blueprint =
                    useBlueprintStore.getState().getBlueprint(input.blueprintId);

                if (!blueprint) {
                    console.error(`Blueprint ${input.blueprintId} not found`);
                    return undefined;
                }

                const now = getCurrentTimestamp();

                const fields: ContractField[] = blueprint.fields
                    .sort((a, b) => a.position - b.position)
                    .map((bf) => ({
                        id: bf.id,
                        type: bf.type,
                        label: bf.label,
                        position: bf.position,
                        required: bf.required,
                        editableBy: bf.editableBy,
                        placeholder: bf.placeholder,
                        value:
                            bf.type === 'CHECKBOX'
                                ? bf.defaultChecked ?? false
                                : null,
                    }));

                const contract: Contract = {
                    id: generateId(),
                    name: input.name.trim(),
                    blueprintId: blueprint.id,
                    blueprintName: blueprint.name,
                    status: 'CREATED',
                    fields,
                    createdAt: now,
                    updatedAt: now,
                };

                set((state) => ({
                    contracts: [...state.contracts, contract],
                }));

                return contract;
            },

            updateContractFields: (id, updatedFields) => {
                const contract = get().getContract(id);
                if (!contract) return false;

                const isManagerEditable = contract.status === 'CREATED';
                const isClientEditable = contract.status === 'SENT';

                if (!isManagerEditable && !isClientEditable) {
                    console.warn(
                        `Cannot edit fields in status: ${contract.status}`
                    );
                    return false;
                }

                set((state) => ({
                    contracts: state.contracts.map((c) =>
                        c.id === id
                            ? {
                                  ...c,
                                  fields: updatedFields,
                                  updatedAt: getCurrentTimestamp(),
                              }
                            : c
                    ),
                }));

                return true;
            },

            transitionStatus: (id, newStatus) => {
                const contract = get().getContract(id);
                if (!contract) return false;

                if (!canTransition(contract.status, newStatus)) {
                    console.error(
                        `Invalid transition ${contract.status} → ${newStatus}. ` +
                            `Allowed: ${getValidTransitions(contract.status).join(
                                ', '
                            )}`
                    );
                    return false;
                }

                set((state) => ({
                    contracts: state.contracts.map((c) =>
                        c.id === id
                            ? {
                                  ...c,
                                  status: newStatus,
                                  updatedAt: getCurrentTimestamp(),
                              }
                            : c
                    ),
                }));

                return true;
            },

            deleteContract: (id) => {
                const exists = get().contracts.some((c) => c.id === id);
                if (exists) {
                    set((state) => ({
                        contracts: state.contracts.filter((c) => c.id !== id),
                    }));
                }
                return exists;
            },

            searchContracts: (query) => {
                const q = query.toLowerCase();
                return get().contracts.filter(
                    (c) =>
                        c.name.toLowerCase().includes(q) ||
                        c.blueprintName.toLowerCase().includes(q)
                );
            },
        }),
        {
            name: 'EURUSYS_Contracts',
        }
    )
);
