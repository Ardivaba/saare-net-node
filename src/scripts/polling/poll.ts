import { modbusConfig } from './modbusConfig';
import { createConnection } from '../../utils/createConnection';
import { Machine, MachineState } from '../../entities/Machine';
import ModbusRTU from 'modbus-serial';
import { Production } from '../../entities/Production';

async function init(): Promise<Machine[]> {
    await createConnection();
    return await Machine.find();
}

async function createModbusConnection(): Promise<ModbusRTU> {
    const client = new ModbusRTU();
    await client.connectTCP('192.168.1.147', { port: 502 });
    if (client.isOpen) {
        console.log('Connection opened');
    } else {
        console.log('Failed to connect');
        throw new Error('Failed to connect to Modbus');
    }
    return client;
}

async function saveMachineState(machine: Machine, client: ModbusRTU) {
    try {
        const previousState = Object.assign({}, machine);
        const stateCoil = await client.readCoils(modbusConfig.readAddresses.stateCoilAddress, 1);
        const recipeId = await client.readHoldingRegisters(modbusConfig.readAddresses.recipeIdRegister, 1);
        const ropeLength = await client.readHoldingRegisters(modbusConfig.readAddresses.ropeLengthRegister, 1);
        const floatLength = await client.readHoldingRegisters(modbusConfig.readAddresses.floatLengthRegister, 1);
        const floatGap = await client.readHoldingRegisters(modbusConfig.readAddresses.floatGapRegister, 1);
        const producedLength = await client.readHoldingRegisters(modbusConfig.readAddresses.producedLengthRegister, 1);
        const producedLengthFP = await client.readHoldingRegisters(modbusConfig.readAddresses.producedLengthFloatingPointRegister, 1);

        machine.state = stateCoil.data[0] ? MachineState.Producing : MachineState.Waiting;
        machine.recipe_code = recipeId.data[0] + modbusConfig.recipeCodeOffset;
        machine.rope_length = ropeLength.data[0];
        machine.float_length = floatLength.data[0];
        machine.float_gap = floatGap.data[0];
        machine.produced_rope_length = producedLength.data[0] + producedLengthFP.data[0] / 1000;

        if (machine.produced_rope_length > 0) {
            let currentProduction: Production = null;
            if (machine.current_production_id !== null) {
                currentProduction = await Production.findOneBy({ id: machine.current_production_id });
            }

            const shouldCreateNewProduction =
                machine.current_production_id == null ||
                (currentProduction !== null &&
                    (currentProduction.recipe_code != machine.recipe_code ||
                        machine.produced_rope_length < currentProduction.produced_quantity));

            if (shouldCreateNewProduction) {
                const newProduction = await Production.create({
                    machine_id: machine.id,
                    produced_quantity: machine.produced_rope_length,
                    recipe_code: machine.recipe_code
                }).save();
                console.log(`Creating new production with quantity: ${machine.produced_rope_length}`);
                machine.current_production_id = newProduction.id;
            } else if (currentProduction && machine.produced_rope_length > currentProduction.produced_quantity) {
                currentProduction.produced_quantity = machine.produced_rope_length;
                await currentProduction.save();
                console.log(`Updated production ${currentProduction.id} with quantity: ${machine.produced_rope_length}`);
            } else {
                console.log(`No update needed for production ${currentProduction?.id}. Current: ${currentProduction?.produced_quantity}, New: ${machine.produced_rope_length}`);
            }
        } else {
            console.log(`Skipping production update for machine ${machine.id} due to zero production`);
        }

        await machine.save();
        console.log(`Machine state updated for machine ${machine.id}: ${JSON.stringify(machine)}`);
    } catch (error) {
        console.error(`Error saving machine state for machine ${machine.id}:`, error);
    }
}

async function pollMachines(machines: Machine[], client: ModbusRTU): Promise<void> {
    for (const machine of machines) {
        await saveMachineState(machine, client);
    }
}

async function main(): Promise<void> {
    try {
        const machines = await init();
        const client = await createModbusConnection();

        while (true) {
            await pollMachines(machines, client);
            await new Promise(resolve => setTimeout(resolve, modbusConfig.pollInterval));
            console.log('Polling');
        }
    } catch (error) {
        console.error(error);
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});