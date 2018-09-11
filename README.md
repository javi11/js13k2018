# js13k2018

Help Richy turn on his router again before the Fornite match ends. Help him go online again.

### How to run

Just run
```
npm run start
```
And go to you browser to `http://localhost:8080`

### How to build
Just run
```
npm run build
```

### How to add game mechanics

Go to the `./app/level.js` foolder and for example add new objects with new behaviours on the `getLevelObjects` method.
Ex:

```js
return [
  {
        symbol: 'D',
        available: 40,
        sprite: {
          img,
          animation: [13]
        },
        rate: 0.3,
        action(hero) {
          hero.speed = Math.abs(hero.speed - 2);
        }
      }
]
```

This will generate as many objects as you set availible depending on the rate (from 0 to 1). This particular object will decrease the hero speed.
Set also the object spriteSheet in the img, and the position or animations, in this example will get the object sprite from position 13*object.size.
