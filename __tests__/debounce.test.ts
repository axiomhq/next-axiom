// import { jest } from '@jest/globals';
import { NextWebVitalsMetric } from "next/app";
import { reportWebVitals } from "../index";
import sendMetrics from '../sendMetrics';

// global.fetch = jest.fn(() =>
//     Promise.resolve({
//         json: () => { Promise.resolve({ test: 100 }); console.log('fetch') },
//     }),
// ) as jest.Mock;
jest.mock('../sendMetrics', () => {
    return {
        __esModule: true,
        default: jest.fn(metrics => metrics)
    }
})

test('debounce sendMetrics', async () => {
    let metrics: NextWebVitalsMetric[] = [
        { id: '1', startTime: 1234, value: 1, name: 'FCP', label: 'web-vital' },
        { id: '2', startTime: 5678, value: 2, name: 'FCP', label: 'web-vital' },
    ]
    // const sendMetrics = jest.mock('../sendMetrics', () => jest.fn().mockImplementation(metrics => {
    //     console.log(metrics)
    // }))

    for (let metric of metrics) {
        reportWebVitals(metric)
    }

    let t;
    await new Promise(res =>
        t = setTimeout(() => {
            expect(sendMetrics).toBeCalledWith(metrics)
            expect(sendMetrics).toHaveBeenCalledTimes(1)
            res(true)
        }, 1200))
    clearTimeout(t)

    // send another webVital and wait for it to be sent
    metrics = [
        { id: '3', startTime: 9012, value: 3, name: 'FCP', label: 'web-vital' },
    ]
    for (let metric of metrics) {
        reportWebVitals(metric)
    }

    await new Promise(res =>
    t = setTimeout(() => {
        expect(sendMetrics).toBeCalledWith(metrics)
        expect(sendMetrics).toHaveBeenCalledTimes(1)
        res(true)
    }, 1200))
    clearTimeout(t)
})
