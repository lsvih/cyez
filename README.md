# cytoscape is too easy

## Startup

- Create folder `node_modules/cyez`
- Copy `dist/index.js` into `node_modules/cyez`
- Import cyez in App.vue

```js
import Cyez from 'cyez'

export default {
    name:'App',
    mounted(){
        this.cyez = new Cyez(document.getElementById('graph'), {})
    }
}
```

### Install Dependency

```bash
npm install
```


### Build

```bash
npm run build
```


### Preview and test

```bash
npm start
```

### Generate documents

```bash
jsdoc -R README.md -d docs src/cyez/cyez.js
```