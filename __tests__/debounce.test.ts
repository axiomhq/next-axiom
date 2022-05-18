/**
 * @jest-environment jsdom
*/
import {jest} from '@jest/globals';
import { NextWebVitalsMetric } from "next/app";
import { reportWebVitals } from "../index";

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => { Promise.resolve({ test: 100 }); console.log('fetch') },
  }),
) as jest.Mock;

test('debounce sendMetrics', async () => {
    const metrics: NextWebVitalsMetric[] = [
        {id: '1', startTime: 1234, value: 1, name: 'FCP', label: 'web-vital'},
        {id: '2', startTime: 5678, value: 2, name: 'FCP', label: 'web-vital'},
        {id: '3', startTime: 9012, value: 3, name: 'FCP', label: 'web-vital'},
        {id: '4', startTime: 3456, value: 4, name: 'FCP', label: 'web-vital'},
    ]
    
    for(let metric of metrics) {
        reportWebVitals(metric)
    }

    await new Promise(res => 
    setTimeout(() => {
        const spy = jest.spyOn(global, 'fetch')
        expect(spy).toHaveBeenCalledTimes(1)
        res(true)
    }, 4000))
})
