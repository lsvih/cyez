import edgehandles from "cytoscape-edgehandles"
import {concat} from 'lodash'

const edge_handle_style = [{
    selector: '.eh-handle',
    style: {
        'background-color': 'red',
        'width': 12,
        'height': 12,
        'shape': 'ellipse',
        'overlay-opacity': 0,
        'border-width': 12, // makes the handle easier to hit
        'border-opacity': 0
    }
}, {
    selector: '.eh-hover',
    style: {
        'background-color': 'red'
    }
}, {
    selector: '.eh-source',
    style: {
        'border-width': 2,
        'border-color': 'red'
    }
}, {
    selector: '.eh-target',
    style: {
        'border-width': 2,
        'border-color': 'red'
    }
}, {
    selector: '.eh-preview, .eh-ghost-edge',
    style: {
        'background-color': 'red',
        'line-color': 'red',
        'target-arrow-color': 'red',
        'source-arrow-color': 'red'
    }
}, {
    selector: '.eh-ghost-edge.eh-preview-active',
    style: {
        'opacity': 0
    }
}]

/**
 * 注册连线编辑器
 * @private
 */
export default function RegisterEdgeHandle(cytoscape, cyez) {
    if (typeof cytoscape('core', 'edgehandles') !== 'function')
        cytoscape.use(edgehandles)
    cyez.edge_handle = cyez.cy.edgehandles()
    let old_style = cyez.cy.style().json()
    let new_style = concat(old_style, edge_handle_style)
    cyez.cy.style().fromJson(new_style).update()
    cyez.edge_handle.disable()
}
