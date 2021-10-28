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
npm install -f
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
npm run doc
```
