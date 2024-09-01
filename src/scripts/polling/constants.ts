import { config } from '../../utils/config';

export const POLL_INTERVAL = 10000; // 10 seconds

// Modbus addresses for reading
export const STATE_COIL_ADDRESS = 20;
export const RECIPE_ID_REGISTER = 44;
export const ROPE_LENGTH_REGISTER = 42;
export const FLOAT_LENGTH_REGISTER = 78;
export const FLOAT_GAP_REGISTER = 43;
export const PRODUCED_LENGTH_REGISTER = 22;
export const PRODUCED_LENGTH_FLOATING_POINT_REGISTER = 20;

// Modbus addresses for writing
export const WRITE_RECIPE_ID_REGISTER = 44;
export const WRITE_ROPE_LENGTH_REGISTER = 42;
export const WRITE_FLOAT_GAP_LENGTH_REGISTER = 43;
export const WRITE_FLOAT_LENGTH_REGISTER = 78;

export const RECIPE_CODE_OFFSET = 210000;

export const MODBUS_TIMEOUT = 60000; // 60 seconds

export const WRITE_ENABLED = true;

export const SENTRY_DSN = config.app.sentryDsn;