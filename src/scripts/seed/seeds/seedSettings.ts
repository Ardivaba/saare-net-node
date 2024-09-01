import { Settings } from "../../../entities/Settings";

export async function seedSettings() {
    const settings = new Settings();
    settings.max_parking_time = 120;
    settings.parking_lot_active = true;
    settings.total_spaces = 16;
    settings.taken_spaces = Math.floor(Math.random() * 16);
    settings.signal_delay_time = 5;

    await settings.save();
    console.log('Settings seeded');
}
