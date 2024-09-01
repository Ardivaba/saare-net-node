interface ModbusReadAddresses {
    stateCoilAddress: number;
    recipeIdRegister: number;
    ropeLengthRegister: number;
    floatLengthRegister: number;
    floatGapRegister: number;
    producedLengthRegister: number;
    producedLengthFloatingPointRegister: number;
}

interface ModbusWriteAddresses {
    recipeIdRegister: number;
    ropeLengthRegister: number;
    floatGapLengthRegister: number;
    floatLengthRegister: number;
}

interface ModbusConfig {
    pollInterval: number;
    readAddresses: ModbusReadAddresses;
    writeAddresses: ModbusWriteAddresses;
    recipeCodeOffset: number;
    modbusTimeout: number;
    writeEnabled: boolean;
}

export const modbusConfig: ModbusConfig = {
    pollInterval: 3000,
    readAddresses: {
        stateCoilAddress: 20,
        recipeIdRegister: 44,
        ropeLengthRegister: 42,
        floatLengthRegister: 78,
        floatGapRegister: 43,
        producedLengthRegister: 22,
        producedLengthFloatingPointRegister: 20,
    },
    writeAddresses: {
        recipeIdRegister: 44,
        ropeLengthRegister: 42,
        floatGapLengthRegister: 43,
        floatLengthRegister: 78,
    },
    recipeCodeOffset: 210000,
    modbusTimeout: 60000,
    writeEnabled: true,
};