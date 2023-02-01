import ConsoleTransport from "../../src/transports/console.transport";

const mockedLog = jest.spyOn(global.console, 'log').mockImplementation();

test('ConsoleTransport should print to console immediately', () => {
    const transport = new ConsoleTransport();
    transport.log({ _time: Date.now().toString(), level: 'info', message: 'hello, world!', fields: {} });
    expect(mockedLog).toHaveBeenCalledTimes(1);
});
