const enum Direction {UP, DOWN};

//color
const color = {
    white: '#FFFFFF',
    black: '#000000',
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
    yellow: '#FFFF00',
    orange: '#FFA500',
    purple: '#800080',
    pink: '#FFC0CB',
    brown: '#A52A2A',
    grey: '#808080',
    cyan: '#00FFFF',
    lime: '#00FF00',
    magenta: '#FF00FF',
    silver: '#C0C0C0',
    gold: '#FFD700',
    maroon: '#800000',
    olive: '#808000',
    navy: '#000080',
    teal: '#008080',
    aqua: '#00FFFF',
    indigo: '#4B0082',

    random: function() {
        const keys = Object.keys(this);
        return this[keys[Math.floor(keys.length * Math.random())]];
    }
};