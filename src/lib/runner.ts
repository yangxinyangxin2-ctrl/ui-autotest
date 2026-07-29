import { useTestStore } from '../store/useTestStore';
import { TestCase, TestCaseStep, TestResult, SessionReport } from '../types';
import html2canvas from 'html2canvas';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

export const STEP_TEMPLATES: Record<string, { icon: string, label: string, fields: string[], placeholders: Record<string, string> }> = {
    'goto': { icon: '🌐', label: '页面跳转', fields: ['value'], placeholders: { value: '完整 URL (如 https://...)' } },
    'click': { icon: '🖱️', label: '元素点击', fields: ['selector'], placeholders: { selector: 'CSS 选择器或 XPath' } },
    'input': { icon: '⌨️', label: '输入文本', fields: ['selector', 'value'], placeholders: { selector: '输入框选择器', value: '要输入的文本内容' } },
    'select': { icon: '🔽', label: '下拉选择', fields: ['selector', 'value'], placeholders: { selector: 'Select元素选择器', value: 'Option的Value值' } },
    'wait_element': { icon: '⏳', label: '等待元素', fields: ['selector', 'timeout'], placeholders: { selector: '目标元素选择器' } },
    'assert_text': { icon: '✅', label: '断言文本', fields: ['selector', 'value'], placeholders: { selector: '目标元素选择器', value: '期望包含的文本' } },
    'assert_exist': { icon: '✅', label: '断言存在', fields: ['selector'], placeholders: { selector: '期望存在的元素' } },
    'assert_not_exist': { icon: '❌', label: '断言消失', fields: ['selector'], placeholders: { selector: '期望不存在的元素' } },
    'delay': { icon: '⏱️', label: '延迟等待', fields: ['value'], placeholders: { value: '毫秒数 (如 1000)' } },
    'scroll': { icon: '↕️', label: '滚动页面', fields: ['value'], placeholders: { value: '滚动高度 (如 500 或 bottom)' } },
    'clear_input': { icon: '🧹', label: '清空输入框', fields: ['selector'], placeholders: { selector: '输入框选择器' } },
};

export const runTestSequence = async (casesToRun: TestCase[], iframe: HTMLIFrameElement) => {
    const store = useTestStore.getState();
    if (store.isRunning) return;
    
    store.setIsRunning(true);
    store.setShouldStop(false);
    store.clearLogs();
    store.addLog(`开始执行 ${casesToRun.length} 个用例...`);

    const sessionReport: SessionReport = {
        id: generateId(),
        startTime: Date.now(),
        total: casesToRun.length,
        success: 0,
        fail: 0,
        results: []
    };

    for (let i = 0; i < casesToRun.length; i++) {
        if (useTestStore.getState().shouldStop) break;

        const tc = casesToRun[i];
        store.addLog(`\n--- 运行用例 [${i + 1}/${casesToRun.length}]: ${tc.name} ---`);

        const result: TestResult = {
            caseId: tc.id,
            caseName: tc.name,
            success: true,
            logs: [],
            duration: 0,
            errorMsg: null,
            screenshot: null
        };
        const caseStart = Date.now();

        // Reset iframe
        iframe.src = 'about:blank';
        await sleep(500);

        for (let j = 0; j < tc.steps.length; j++) {
            if (useTestStore.getState().shouldStop) {
                result.success = false;
                result.errorMsg = '手动停止';
                break;
            }

            const step = tc.steps[j];
            const tpl = STEP_TEMPLATES[step.type];
            store.addLog(`执行步骤 ${j + 1}: ${tpl.label} - ${step.selector || ''} ${step.value || ''}`);

            try {
                await executeStep(step, iframe);
                await sleep(useTestStore.getState().speed);
            } catch (err: any) {
                store.addLog(`步骤 ${j + 1} 失败: ${err.message}`, 'error');
                result.success = false;
                result.errorMsg = `步骤 ${j + 1} 失败: ${err.message}`;

                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc && iframeDoc.body) {
                        const canvas = await html2canvas(iframeDoc.body);
                        result.screenshot = canvas.toDataURL('image/jpeg', 0.5);
                        store.addLog('已捕获错误截图', 'info');
                    }
                } catch (e) {
                    store.addLog('截图失败: 可能是跨域限制', 'error');
                }
                break;
            }
        }

        result.duration = Date.now() - caseStart;
        if (result.success) {
            sessionReport.success++;
            store.addLog(`用例通过 (${result.duration}ms)`, 'success');
        } else {
            sessionReport.fail++;
            store.addLog(`用例失败 (${result.duration}ms)`, 'error');
        }
        sessionReport.results.push(result);
    }

    sessionReport.duration = Date.now() - sessionReport.startTime;
    store.addReport(sessionReport);

    store.addLog(`\n执行结束！总计: ${sessionReport.total}, 成功: ${sessionReport.success}, 失败: ${sessionReport.fail}`);
    store.setIsRunning(false);
};

const executeStep = async (step: TestCaseStep, iframe: HTMLIFrameElement) => {
    const win = iframe.contentWindow;
    if (!win) throw new Error('Iframe window is null');

    if (step.type === 'goto') {
        iframe.src = step.value || '';
        useTestStore.getState().addLog(`正在加载: ${step.value}`, 'wait');
        return new Promise<void>((resolve, reject) => {
            const timeoutId = setTimeout(() => reject(new Error('页面加载超时')), step.timeout || 10000);
            iframe.onload = () => {
                clearTimeout(timeoutId);
                resolve();
            };
        });
    }

    const doc = win.document;
    if (!doc) throw new Error('无法访问 iframe DOM (可能跨域)');

    const getElement = (selector: string) => {
        if (!selector) return null;
        if (selector.startsWith('/')) {
            const result = doc.evaluate(selector, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue as HTMLElement;
        }
        return doc.querySelector(selector) as HTMLElement;
    };

    const waitForElement = async (selector: string, timeout = 5000, expectExist = true) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const el = getElement(selector);
            if (expectExist && el) return el;
            if (!expectExist && !el) return null;
            await sleep(200);
        }
        throw new Error(expectExist ? `超时未找到元素: ${selector}` : `元素依然存在: ${selector}`);
    };

    switch (step.type) {
        case 'click': {
            const el = await waitForElement(step.selector || '');
            if(el) el.click();
            break;
        }
        case 'input': {
            const el = await waitForElement(step.selector || '') as HTMLInputElement;
            if(el) {
                el.value = step.value || '';
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
            break;
        }
        case 'clear_input': {
            const el = await waitForElement(step.selector || '') as HTMLInputElement;
            if(el) {
                el.value = '';
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
            break;
        }
        case 'select': {
            const el = await waitForElement(step.selector || '') as HTMLSelectElement;
            if(el) {
                el.value = step.value || '';
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
            break;
        }
        case 'wait_element': {
            useTestStore.getState().addLog(`等待元素: ${step.selector}`, 'wait');
            await waitForElement(step.selector || '', step.timeout || 10000);
            break;
        }
        case 'assert_text': {
            const el = await waitForElement(step.selector || '');
            if(el) {
                const text = el.innerText || (el as HTMLInputElement).value || '';
                if (!text.includes(step.value || '')) {
                    throw new Error(`文本断言失败. 期望包含: "${step.value}", 实际为: "${text}"`);
                }
                useTestStore.getState().addLog('断言成功', 'success');
            }
            break;
        }
        case 'assert_exist': {
            await waitForElement(step.selector || '');
            useTestStore.getState().addLog('断言成功', 'success');
            break;
        }
        case 'assert_not_exist': {
            await waitForElement(step.selector || '', step.timeout || 5000, false);
            useTestStore.getState().addLog('断言成功', 'success');
            break;
        }
        case 'delay': {
            const ms = parseInt(step.value || '1000');
            useTestStore.getState().addLog(`硬等待 ${ms}ms...`, 'wait');
            await sleep(ms);
            break;
        }
        case 'scroll': {
            const val = step.value || '';
            if (val === 'bottom') {
                win.scrollTo(0, doc.body.scrollHeight);
            } else {
                win.scrollTo(0, parseInt(val) || 0);
            }
            break;
        }
        default:
            throw new Error(`未知的步骤类型: ${step.type}`);
    }
};
