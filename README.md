# cytoscape is too easy

## Startup

- Create folder `node_modules/cyez`
- Copy `dist/index.js` into `node_modules/cyez`
- Import cyez in your App.vue

```js
import Cyez from 'cyez'

export default {
    name:'App',
    mounted(){
        this.cyez = new Cyez(document.getElementById('graph'), {})
    }
}
```

