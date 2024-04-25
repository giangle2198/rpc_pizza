class Progress {
    constructor() {
        this.mapId = "DemoRoom";
        this.stateHeroPositionX = 0;
        this.stateHeroPositionY = 0;
        this.stateHeroDirection = "down";
        this.saveFileID = "RPC_PIZZA_SAVING";
    }

    save() {
        localStorage.setItem(this.saveFileID, JSON.stringify({
            mapId: this.mapId,
            stateHeroPositionX: this.stateHeroPositionX,
            stateHeroPositionY: this.stateHeroPositionY,
            stateHeroDirection: this.stateHeroDirection,
            playerState: {
                lineups: playerState.lineup,
                items: playerState.items,
                pizzas: playerState.pizzas,
                storyFlags: playerState.storyFlags,
            }
        }));
    }

    getSaveFile() {
        const file = localStorage.getItem(this.saveFileID);
        return file ? JSON.parse(file) : null;
    }

    load() {
        const file = this.getSaveFile();
        if (file) {
            console.log(file.stateHeroPositionX)
            this.mapId = file.mapId;
            this.stateHeroPositionX = file.stateHeroPositionX;
            this.stateHeroPositionY = file.stateHeroPositionY;
            this.stateHeroDirection = file.stateHeroDirection;
            Object.keys(file.playerState).forEach((key) => {
                playerState[key] = file.playerState[key];
            })
        } 
    }
}