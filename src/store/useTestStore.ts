import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TestCase, TestCaseStep, SessionReport, StepLog } from '../types';

interface TestState {
    // Config
    guideShown: boolean;
    setGuideShown: (val: boolean) => void;

    // Test Cases
    cases: TestCase[];
    currentCaseId: string | null;
    addCase: () => void;
    deleteCase: (id: string) => void;
    copyCase: (id: string) => void;
    updateCaseName: (id: string, name: string) => void;
    setCurrentCase: (id: string | null) => void;
    importCases: (cases: TestCase[]) => void;
    clearAll: () => void;

    // Steps
    addStep: (type: TestCaseStep['type']) => void;
    updateStep: (stepId: string, field: keyof TestCaseStep, value: any) => void;
    deleteStep: (stepId: string) => void;
    reorderSteps: (oldIndex: number, newIndex: number) => void;

    // Reports
    reports: SessionReport[];
    addReport: (report: SessionReport) => void;

    // Runtime State (Not persisted)
    isRunning: boolean;
    shouldStop: boolean;
    speed: number;
    setSpeed: (speed: number) => void;
    setIsRunning: (val: boolean) => void;
    setShouldStop: (val: boolean) => void;
    
    // Logs (Not persisted)
    logs: StepLog[];
    addLog: (msg: string, type?: StepLog['type']) => void;
    clearLogs: () => void;

    // Sandbox
    sandboxSize: string;
    setSandboxSize: (size: string) => void;
    pickingMode: boolean;
    setPickingMode: (val: boolean) => void;
}

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

export const useTestStore = create<TestState>()(
    persist(
        (set, get) => ({
            // Config
            guideShown: false,
            setGuideShown: (val) => set({ guideShown: val }),

            // Test Cases
            cases: [],
            currentCaseId: null,
            setCurrentCase: (id) => set({ currentCaseId: id }),
            addCase: () => {
                const newCase: TestCase = {
                    id: generateId(),
                    name: `新建测试用例 ${get().cases.length + 1}`,
                    category: 'default',
                    steps: []
                };
                set({ cases: [...get().cases, newCase], currentCaseId: newCase.id });
            },
            deleteCase: (id) => {
                set({
                    cases: get().cases.filter(c => c.id !== id),
                    currentCaseId: get().currentCaseId === id ? null : get().currentCaseId
                });
            },
            copyCase: (id) => {
                const tc = get().cases.find(c => c.id === id);
                if (!tc) return;
                const newCase: TestCase = {
                    ...tc,
                    id: generateId(),
                    name: tc.name + ' (副本)',
                    steps: tc.steps.map(s => ({ ...s, id: generateId() }))
                };
                set({ cases: [...get().cases, newCase] });
            },
            updateCaseName: (id, name) => {
                set({
                    cases: get().cases.map(c => c.id === id ? { ...c, name } : c)
                });
            },
            importCases: (cases) => {
                set({ cases, currentCaseId: null });
            },
            clearAll: () => {
                set({ cases: [], currentCaseId: null, reports: [] });
            },

            // Steps
            addStep: (type) => {
                const currentId = get().currentCaseId;
                if (!currentId) return;
                set({
                    cases: get().cases.map(c => {
                        if (c.id !== currentId) return c;
                        return {
                            ...c,
                            steps: [...c.steps, {
                                id: generateId(),
                                type,
                                selector: '',
                                value: '',
                                timeout: 5000
                            }]
                        };
                    })
                });
            },
            updateStep: (stepId, field, value) => {
                const currentId = get().currentCaseId;
                if (!currentId) return;
                set({
                    cases: get().cases.map(c => {
                        if (c.id !== currentId) return c;
                        return {
                            ...c,
                            steps: c.steps.map(s => s.id === stepId ? { ...s, [field]: value } : s)
                        };
                    })
                });
            },
            deleteStep: (stepId) => {
                const currentId = get().currentCaseId;
                if (!currentId) return;
                set({
                    cases: get().cases.map(c => {
                        if (c.id !== currentId) return c;
                        return { ...c, steps: c.steps.filter(s => s.id !== stepId) };
                    })
                });
            },
            reorderSteps: (oldIndex, newIndex) => {
                const currentId = get().currentCaseId;
                if (!currentId) return;
                set({
                    cases: get().cases.map(c => {
                        if (c.id !== currentId) return c;
                        const newSteps = [...c.steps];
                        const [moved] = newSteps.splice(oldIndex, 1);
                        newSteps.splice(newIndex, 0, moved);
                        return { ...c, steps: newSteps };
                    })
                });
            },

            // Reports
            reports: [],
            addReport: (report) => {
                set({ reports: [report, ...get().reports].slice(0, 50) }); // keep latest 50
            },

            // Runtime (These should technically be excluded from persist, but keeping it simple for now by persisting or just resetting on load)
            isRunning: false,
            shouldStop: false,
            speed: 500,
            setSpeed: (speed) => set({ speed }),
            setIsRunning: (val) => set({ isRunning: val }),
            setShouldStop: (val) => set({ shouldStop: val }),

            // Logs
            logs: [],
            addLog: (msg, type = 'info') => {
                const time = new Date().toLocaleTimeString();
                set({ logs: [...get().logs, { time, msg, type }] });
            },
            clearLogs: () => set({ logs: [] }),

            // Sandbox
            sandboxSize: '100%',
            setSandboxSize: (size) => set({ sandboxSize: size }),
            pickingMode: false,
            setPickingMode: (val) => set({ pickingMode: val }),

        }),
        {
            name: 'ui_autotest_storage',
            partialize: (state) => ({
                cases: state.cases,
                reports: state.reports,
                guideShown: state.guideShown,
                speed: state.speed,
                sandboxSize: state.sandboxSize
            })
        }
    )
);
