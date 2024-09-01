import { modbusConfig } from './modbusConfig';
import { pollMachines } from './actions/pollMachines';
import { createConnection } from '../../utils/createConnection';
import { Machine, MachineState } from '../../entities/Machine';
import ModbusRTU, { } from 'modbus-serial';

async function init(): Promise<void> {
    await createConnection();
    const machines = await Machine.find();
    await createModbusConnection(machines[0]);
}

async function createModbusConnection(machine: Machine) {
    const client = new ModbusRTU();
    await client.connectTCP('192.168.1.147', { port: 502 });
    if (client.isOpen) {
        console.log('Connection opened');
        await saveMachineState(machine, client);
    } else {
        console.log('Failed to connect');
    }
}

async function saveMachineState(machine: Machine, client: ModbusRTU) {
    try {
        const stateCoil = await client.readCoils(modbusConfig.readAddresses.stateCoilAddress, 1);
        const recipeId = await client.readHoldingRegisters(modbusConfig.readAddresses.recipeIdRegister, 1);
        const ropeLength = await client.readHoldingRegisters(modbusConfig.readAddresses.ropeLengthRegister, 1);
        const floatLength = await client.readHoldingRegisters(modbusConfig.readAddresses.floatLengthRegister, 1);
        const floatGap = await client.readHoldingRegisters(modbusConfig.readAddresses.floatGapRegister, 1);
        const producedLength = await client.readHoldingRegisters(modbusConfig.readAddresses.producedLengthRegister, 1);
        const producedLengthFP = await client.readHoldingRegisters(modbusConfig.readAddresses.producedLengthFloatingPointRegister, 1);

        console.log(producedLength.data[0] + ' ' + producedLengthFP.data[0]);

        machine.state = stateCoil.data[0] ? MachineState.Producing : MachineState.Waiting;
        machine.recipe_code = recipeId.data[0] + modbusConfig.recipeCodeOffset;
        machine.rope_length = ropeLength.data[0];
        machine.float_length = floatLength.data[0];
        machine.float_gap = floatGap.data[0];
        machine.produced_rope_length = producedLength.data[0] * producedLengthFP.data[0] / 1000;

        await machine.save();

        console.log(machine);

        console.log(`Machine state updated for machine ${machine.id}`);
    } catch (error) {
        console.error(`Error saving machine state for machine ${machine.id}:`, error);
    }
}

async function main(): Promise<void> {
    await init();

    try {
        await createConnection();
        while (true) {
            await pollMachines();
            await new Promise(resolve => setTimeout(resolve, modbusConfig.pollInterval));
        }
    } catch (error) {
        console.error(error);
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});