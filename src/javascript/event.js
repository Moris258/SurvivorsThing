export default class Event{
    constructor() {
        this.registeredEvents = [];
    }

    addEvent(event){
        this.registeredEvents.push(event);
    }

    removeEvent(event){
        this.registeredEvents.splice(this.registeredEvents.indexOf(event), 1);
    }

    callEvents(args){
        this.registeredEvents.forEach(event => {
            event(args)
        });
    }
}