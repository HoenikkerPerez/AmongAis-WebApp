class Channel {
    constructor(audio_uri) {
        this.audio_uri = audio_uri;
        this.resource = new Audio(audio_uri);
    }
    play(volume=1, repeat=false) {
        if(repeat)
            this.resource.loop = true;
        this.resource.volume = volume;
        this.resource.play();
    }

    stop() {
        this.resource.pause();
    }

    changeVolume(volume) {
        this.resource.volume = volume;
    }

}


class Switcher {
    constructor(audio_uri, num) {
        this.channels = [];
        this.num = num;
        this.index = 0;
            
        for (var i = 0; i < num; i++) {
            this.channels.push(new Channel(audio_uri));
        }
    }
    play(volume, repeat=false) {
        this.channels[this.index++].play(volume, repeat);
        this.index = this.index < this.num ? this.index : 0;
    }
    stop() {
        this.channels[this.index].stop();
    }
    changeVolume(volume) {
        this.channels[this.index].changeVolume(volume)
    }
}




class SfxAudio {    
        playGameSound = function(volume) {
            this.sfx_switcher_gameSound.play(volume, true);
        }

        changeGameVolume = function(volume) {
            this.sfx_switcher_gameSound.changeVolume(volume);
        }

        stopGameSound = function() {
            this.sfx_switcher_gameSound.stop();
        }

        playMenuSound = function(volume) {
            this.sfx_switcher_menuSound.play(volume, true);
        }

        changeMenuVolume = function(volume) {
            this.sfx_switcher_menuSound.changeVolume(volume);
        }

        stopMenuSound = function() {
            this.sfx_switcher_menuSound.stop();
        }

        playShoot = function() {
           this.sfx_switcher_front.play();
        }
    
        playBack = function() {
            this.sfx_switcher_back.play(); 
        }
    
        playSuccess = function() {
            this.sfx_switcher_success.play(); 
        }
    
        playStart = function() {
            this.sfx_switcher_start.play();
        }

    constructor(ctx) {
        this.sfx_switcher_front   = new Switcher('sfx/flip-front.mp3', 10);
        this.sfx_switcher_back    = new Switcher('sfx/flip-back.mp3', 10);
        this.sfx_switcher_success = new Switcher('sfx/success.mp3', 2);
        this.sfx_switcher_start   = new Switcher('sfx/start.mp3', 1);
        this.sfx_switcher_gameSound   = new Switcher('sfx/Total_Reboot.mp3', 1);
        // this.sfx_switcher_menuSound   = new Switcher('sfx/LocalForecast.mp3', 1);
        this.sfx_switcher_menuSound   = new Switcher('sfx/success.mp3', 1);
    };

    _load() {
        // Listeners for UI
        this._loadWsMessages();
    };


};

