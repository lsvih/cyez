import Cyez from '../cyez/cyez'
import '../styles/index.scss'

const pre_defined_style = {
    'core': {
        'active-bg-color': '#fff',
        'active-bg-opacity': '0.333'
    },
    'edge': {
        'curve-style': 'haystack',
        'haystack-radius': 0,
        'opacity': 0.333,
        'width': 2,
        'z-index': 0,
        'overlay-opacity': 0,
        'events': 'no'
    },
    'node': {
        'width': 40,
        'height': 40,
        'font-size': 10,
        'font-weight': 'bold',
        'min-zoomed-font-size': 4,
        'content': 'data(name)',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#ff2130',
        'text-outline-width': 2,
        'text-outline-color': '#fff',
        'text-outline-opacity': 1,
        'overlay-color': '#fff'
    }
}

let cyez = new Cyez(document.getElementById('cy'),{})
window.cyez = cyez
// 增加节点与连边示例
cyez.addNode(1, '测试1', 'test', {})
cyez.addNode(2, '测试2', 'test', {})
cyez.addEdge(1, 2, '测试集')


// 为节点设置右键菜单及删除右键菜单示例
cyez.addContextMenu(1, 'node',
    ['<span>测试</span>', '<span class="fa fa-star fa-2x"></span><div>删除此菜单</div>'],
    [node => console.log('正在查看', node), () => cyez.removeContextMenu(1)])

// 点击节点功能示例
cyez.event.clickOnNode = function(node){
    console.log(node.name)
} // 在节点上单击，显示点击节点的名称
