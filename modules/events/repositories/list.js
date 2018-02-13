'use strict';

module.exports = async (db) => {
    // Fetch all events
    const events = await db.Event.findAll();

    // Add attendants count to every event
    const list = await Promise.all(events.map(async (ev) => {

        const registeredP = ev.getRegistered();
        const newEvent = await ev.toJSON();
        const registered = await registeredP;

        newEvent.registeredCount = registered.length;

        return newEvent;
    }));

    return list;
};
