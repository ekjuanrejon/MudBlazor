﻿//Functions related to MudThrottledEventManager
class MudThrottledEventManager {

    constructor() {
        this.mapper = {};
    }

    subscribe(eventName, elementId, throotleInterval, key, properties, dotnetReference) {
        const handlerRef = this.throttleEventHandler.bind(this, key);

        var elem = document.getElementById(elementId);
        if (elem) {
            elem.addEventListener(eventName, handlerRef, false);

            this.mapper[key] = {
                eventName: eventName,
                handler: handlerRef,
                delay: throotleInterval,
                timerId: -1,
                reference: dotnetReference,
                elementId: elementId,
                properties: properties,
            };
        }
    }

    throttleEventHandler(key, event) {
        const entry = this.mapper[key];
        if (!entry) {
            return;
        }

        clearTimeout(entry.timerId);
        entry.timerId = window.setTimeout(
            this.eventHandler.bind(this, key, event),
            entry.delay
        );
    }

    eventHandler(key, event) {
        const entry = this.mapper[key];
        if (!entry) {
            return;
        }

        var elem = document.getElementById(entry.elementId);
        if (elem != event.srcElement) {
            return;
        }

        const eventEntry = {};
        for (var i = 0; i < entry.properties.length; i++) {
            eventEntry[entry.properties[i]] = event[entry.properties[i]];
        }

        entry.reference.invokeMethodAsync('OnEventOccur', key, JSON.stringify(eventEntry));
    }

    unsubscribe(key) {
        const entry = this.mapper[key];
        if (!entry) {
            return;
        }

        entry.reference = null;

        const elem = document.getElementById(entry.elementId);
        if (elem) {
            elem.removeEventListener(entry.eventName, entry.handler, false);
        }

        delete this.mapper[key];
    }
};

window.mudThrottledEventManager = new MudThrottledEventManager();
