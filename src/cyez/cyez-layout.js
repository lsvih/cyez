import cola from 'cytoscape-cola'
import dagre from 'cytoscape-dagre'
import elk from 'cytoscape-elk'
import klay from 'cytoscape-klay'
import spread from 'cytoscape-spread'


class Layout {
    constructor() {
        this.builtin_layouts = ['grid', 'circle', 'concentric', 'breadthfirst', 'cose']
        this.plugin_layouts = ['cola', 'dagre', 'elk', 'klay', 'spread']
        /**
         * 定义布局列表
         * @type {String[]}
         * @property
         * @public
         */
        this.layouts = [...this.builtin_layouts, ...this.plugin_layouts]
    }

    /**
     * Register layout plugins
     * @param cy {Object} incoming cytoscape instance
     * @public
     */
    RegisterLayout(cy) {
        cy.use(cola)
        cy.use(dagre)
        cy.use(elk)
        cy.use(klay)
        cy.use(spread)
    }
}

export default Layout
