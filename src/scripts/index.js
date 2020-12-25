import Cyez from '../cyez/cyez'
import '../styles/index.scss'


let cyez = new Cyez(document.getElementById('cy'),{}, {})
cyez.InitNavigator('.cytoscape-navigator-overlay')
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
