export type StepType = 'goto' | 'click' | 'input' | 'select' | 'wait_element' | 'assert_text' | 'assert_exist' | 'assert_not_exist' | 'delay' | 'scroll' | 'clear_input';

export interface TestCaseStep {
    id: string;
    type: StepType;
    selector?: string;
    value?: string;
    timeout?: number;
}

export interface TestCase {
    id: string;
    name: string;
    category: string;
    steps: TestCaseStep[];
}

export interface StepLog {
    time: string;
    msg: string;
    type: 'info' | 'success' | 'error' | 'wait';
}

export interface TestResult {
    caseId: string;
    caseName: string;
    success: boolean;
    logs: StepLog[];
    duration: number;
    errorMsg: string | null;
    screenshot: string | null;
}

export interface SessionReport {
    id: string;
    startTime: number;
    duration?: number;
    total: number;
    success: number;
    fail: number;
    results: TestResult[];
}
