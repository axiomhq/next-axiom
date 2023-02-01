import LogDrainTransport from "../../src/transports/log-drain.transport";

const mockedLog = jest.spyOn(global.console, 'log').mockImplementation();

test('LogDrainTransport should print JSON log to console immediately', () => {
    const transport = new LogDrainTransport();
    const event = { _time: Date.now().toString(), level: 'info', message: 'hello, world!', fields: {} }
    transport.log(event);
    expect(mockedLog).toHaveBeenCalledTimes(1);
    expect(mockedLog).toHaveBeenCalledWith(JSON.stringify(event));
});
