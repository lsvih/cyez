import cytoscape from 'cytoscape'
import cxtmenu from 'cytoscape-cxtmenu'
import navigator from 'cytoscape-navigator'
import Layout from './cyez-layout'
import {saveAs} from 'file-saver'
import fileDialog from 'file-dialog'
import panzoom from 'cytoscape-panzoom'
import b64toBlob from 'b64-to-blob'
import {isEmpty} from 'lodash'

import 'cytoscape-panzoom/cytoscape.js-panzoom.css';

class Cyez {
    /**
     * 传入交互组件的容器，以及样式，构建 cyez 实例
     * @param container {Node} 交互组件所在的容器，用 document.getElementById 等选择器得到
     * @param style {Object} 交互组件的样式模板
     */
    constructor(container, style) {
        console.log('Bind cytoscape to DOM ', container)
        this.cy = cytoscape({container, style})
        console.log('Init cyez', this.cy)
        this.layout = new Layout()
        this.init()
    }

    /**
     * 初始化各组件与事件
     * @private
     */
    init() {
        this.RegisterContextMenu()
        this.RegisterNavigator()
        this.RegisterPanzoom()
        this.RegisterDoubleClickEvent()
        this.RegisterGestures()
        this.RegisterLayout()
    }


    /**
     * 判断当前画布是否应该冻结
     * @var
     * @type {boolean}
     */
    freeze = false

    /**
     * 用于存储右键菜单
     * @private
     * @member Cyez
     * @type {{}}
     */
    contextmenu = {}


    /**
     * Initial layout algorithms
     * @private
     */
    RegisterLayout() {
        this.layout.RegisterLayout(cytoscape)
    }

    /**
     * 注册鹰眼导航
     * @private
     */
    RegisterNavigator() {
        if (typeof cytoscape('core', 'navigator') !== 'function')
            navigator(cytoscape)
    }

    /**
     * 注册放大缩小 UI 组件
     * @private
     */
    RegisterPanzoom() {
        if (typeof cytoscape('core', 'panzoom') !== 'function')
            panzoom(cytoscape)
        this.cy.panzoom({
            zoomFactor: 0.1,
            zoomDelay: 45,
            minZoom: 0.1,
            maxZoom: 10,
            fitPadding: 50,
            panSpeed: 10,
            panDistance: 100,
            panDragAreaSize: 75,
            panMinPercentSpeed: 0.25,
            panInactiveArea: 8,
            panIndicatorMinOpacity: 0.5,
            zoomOnly: false,
            fitSelector: undefined,
            animateOnFit: function () {
                return false
            },
            fitAnimationDuration: 1000
        })
    }


    /**
     * 初始化导航组件
     * @param {String} 传入指定的 container selector，如'.cytoscape-navigator'
     * @public
     */
    InitNavigator(container) {
        this.cy.navigator({
            container: container,
            viewLiveFramerate: 0,
            thumbnailEventFramerate: 30,
            thumbnailLiveFramerate: false,
            dblClickDelay: 200,
            removeCustomContainer: true,
            rerenderDelay: 100
        })
    }

    /**
     * 在画布上注册双击时间 doubleTap
     * @param doubleClickDelayMs {Number} 定义双击时长
     * @private
     */
    RegisterDoubleClickEvent(doubleClickDelayMs = 350) {
        let previousTapStamp
        this.cy.on('tap', e => {
            let currentTapStamp = e.timeStamp
            let msFromLastTap = currentTapStamp - previousTapStamp
            if (msFromLastTap < doubleClickDelayMs) {
                e.target.trigger('doubleTap', e)
            }
            previousTapStamp = currentTapStamp
        })
    }

    /**
     * 注册右键菜单组件
     * @private
     */
    RegisterContextMenu() {
        if (typeof cytoscape('core', 'cxtmenu') !== 'function')
            cytoscape.use(cxtmenu)
    }

    /**
     * 注册各种点击事件
     * @private
     */
    RegisterGestures() {
        this.cy.on('doubleTap', e => {
            let target = e.target
            if (e.target === this.cy)// double click on background
                return this.event.dbclickOnBackground()
            if (target.isNode())
                return this.event.dbclickOnNode(target.data())
            if (target.isEdge())
                return this.event.dbclickOnEdge(target.data())
        })

        this.cy.on('tap', e => {
            let target = e.target
            if (e.target === this.cy)// click on background
                return this.event.clickOnBackground()
            if (target.isNode())
                return this.event.clickOnNode(target.data())
            if (target.isEdge())
                return this.event.clickOnEdge(target.data())
        })
    }


    /**
     * 增加一个新的节点
     * @param id {(Number | String)} 节点的 id
     * @param name {String} 节点的名称
     * @param type {String} 节点的类型
     * @param attr {Object} 节点的属性
     * @return {cy.node} 得到的节点实例
     * @public
     */
    addNode(id, name, type, attr) {
        return this.cy.add({
            group: 'nodes',
            data: {id, name, type, attr},
            position: {x: 200, y: 200}
        })
    }

    /**
     * 在 id 为 source_id 和 id 为 target_id 的两个节点间增加关系为 name 的边
     * @param source_id {(Number | String)} 源节点的 id
     * @param target_id {(Number | String)} 目标节点的 id
     * @param name {?String} 连边的名字
     * @public
     */
    addEdge(source_id, target_id, name) {
        this.cy.add({
            group: 'edges',
            data: {source: source_id, target: target_id, name}
        })
    }

    /**
     * 删除指定的连边
     * @param edge {cytoscape.edge} 待删除的连边
     * @public
     */
    DeleteEdge(edge) {
        edge.remove()
    }

    /**
     * 根据 id 删除指定的连边
     * @param id {!(String | Number)} 需要删除的边的 id
     * @public
     */
    DeleteEdgeById(id) {
        let edge = this.getEdgeById(id)
        if (edge !== null) {
            this.DeleteEdge(edge)
        }
    }

    /**
     * 根据 id 获取边的实例
     * @param id {!(String | Number)} 需要查询的边的 id
     * @return {?cytoscape.edge} 查询得到的边，如果没有找到对应 id 的边则返回 null
     * @public
     */
    getEdgeById(id) {
        let edge = this.cy.edges(`#${id}`)
        if (edge.length === 0) {
            console.warn(`没有找到 id 为 ${id} 的连边`)
            return null
        } else {
            return edge
        }
    }

    /**
     * 获取当前被选中的元素（包括节点和连边）
     * @return {?cytoscape.element} 被选中的元素的实例
     */
    getSelectedElements() {
        return this.cy.$(':selected')
    }

    /**
     * 获取当前被选中的节点
     * @return {?cytoscape.node} 被选中的节点的实例
     */
    getSelectedNodes() {
        return this.cy.$('node:selected')
    }

    /**
     * 获取当前被选中的连边
     * @return {?cytoscape.edge} 被选中的连边的实例
     */
    getSelectedEdges() {
        return this.cy.$('edge:selected')
    }

    /**
     * 根据节点 id 获取其邻居节点
     * @param id {!(String | Number)} 需要查找邻居的节点 id
     * @return {?cy.node[]} 邻居节点集合，如果没有找到则返回空数组
     * @public
     */
    getNeighborById(id) {
        let node = this.getNodeById(id)
        if (!node) {
            console.warn(`没有找到id为${id}的节点`)
            return null
        } else {
            return node.neighborhood()
        }
    }


    /**
     * 根据节点 id 获取节点实体
     * @param id
     * @return {?cy.node}
     * @public
     */
    getNodeById(id) {
        let selector = this.cy.$(`#${id}`)
        if (selector.length === 1)
            return selector[0]
        else if (selector.length > 1) {
            console.warn(`存在多个id为${id}的节点`)
            return selector[0]
        } else
            return null
    }


    /**
     * 判断 id 是否已经存在
     * @param id {!(String | Number)} 需要判断的 id
     * @returns {boolean}
     * @public
     */
    isIdExist(id){
        return !isEmpty(this.getNodeById(id)) || !isEmpty(this.getEdgeById(id))
    }


    /**
     * 根据节点 id 获取节点坐标
     * @param id
     * @returns {Object}
     */
    getPositionById(id) {
        let node = this.getNodeById(id)
        if (!node) {
            console.warn(`没有找到id为${id}的节点`)
            return null
        } else {
            return node.position()
        }
    }


    /**
     * 将布局算法应用与全部节点。不能在一次布局完成前进行第二次布局。
     * @param layout {String} 指定一种布局方式，可选值有：['grid', 'circle', 'concentric', 'breadthfirst', 'cose', 'cola', 'dagre', 'elk', 'klay', 'spread']
     * @param callback {?Function} 可选，布局完成之后将调用此函数
     * @public
     */
    Layout(layout, callback) {
        if (this.freeze) {
            console.info('当前画布处于冻结状态')
        } else {
            this.freeze = true // 防止重复布局，冻结画布
            this.cy.layout({
                name: layout,
                animate: true,
                maxSimulationTime: 4000,
                animationDuration: 1000,
                animationEasing: 'ease-in-out',
                stop: () => {
                    this.freeze = false // 布局完成后解冻画布
                    if (callback != null) {
                        callback()
                    }
                }
            }).run()
        }
    }


    /**
     * 对部分节点应用布局算法
     * @param nodes {!cytoscape.node} 传入需要进行布局的节点
     * @param layout {!String} 制定一种布局方式，可选值参见 {@link Layout}
     * @param callback {?Function} 可选，布局完成后将调用此函数
     * @public
     */
    LayoutNodes(nodes, layout, callback) {
        if (this.freeze) {
            console.info('当前画布处于冻结状态')
        } else {
            nodes.makeLayout({
                name: layout,
                fit: false,
                animate: true,
                maxSimulationTime: 4000,
                animationDuration: 1000,
                animationEasing: 'ease-in-out',
                avoidOverlap: true,
                stop: () => {
                    this.freeze = false // 布局完成后解冻画布
                    if (callback != null) {
                        callback()
                    }
                }
            }).run()
        }
    }


    /**
     * 高亮设定的节点。相当于将除了传入节点之外的其它节点和连线加上 faded class，因此需要在样式中加上 .faded{opacity:0.1} 的设定
     * @param nodes {!cytoscape.node} 需要高亮的节点
     * @public
     * TODO
     */
    HighlightNodes(nodes) {
        let all_elements = this.cy.elements()
        let n_nodes = nodes.closedNeighborhood()
        let others = all_elements.not(nodes).not(n_nodes)
        this.cy.batch(() => others.addClass('faded'))
    }


    /**
     * 取消高亮节点，即将全部的节点的 faded class 都去掉
     * @public
     */
    CancelHighlight() {
        let all_elements = this.cy.elements()
        this.cy.batch(() => all_elements.removeClass('faded'))
    }


    /**
     * 获取所有节点的信息
     * @returns {nodes}
     */
    get nodes() {
        return this.cy.nodes().map(e => e.data())
    }

    /**
     * 获取所有连边的信息
     * @returns {edges}
     */
    get edges() {
        return this.cy.edges().map(e => e.data())
    }


    /**
     * 新增一个右键菜单
     * @param id {int} 右键菜单的标识，可以用此标识销毁对应菜单
     * @param selector {String} 右击的对象，使用 cy selector 进行选择。比如 node 是在节点上右击，node:selected 是在
     * 选中的节点上右击。更多 selector 请参考 {@link https://js.cytoscape.org/#selectors}
     * @param content {String[]} 右键菜单的内容，用数组 Html 代码传递
     * @param func {Function[]} 右键菜单的功能，用数组 Function 传递
     * @example
     *  addContextMenu(1, 'node',
     *  content = ['<span>提示1</span>','<span>提示2</span>']
     *  func = [alert(1), alert(2)])
     */
    addContextMenu(id, selector, content, func) {
        if (id in this.contextmenu) {
            console.error(`id 为${id}的右键菜单已经存在`)
            return false
        }
        if (!(content instanceof Array && func instanceof Array)) {
            console.error('content 与 func 必须为数组形式')
            return false
        }
        if (content.length !== func.length) {
            console.error('content 与 func 数组长度必须一致')
            return false
        }
        this.contextmenu[id] = this.cy.cxtmenu({
            selector: 'node',
            commands: content.map((_, i) => {
                return {
                    content: content[i],
                    select: func[i]
                }
            })
        })
    }

    /**
     * 将当前图谱导出为 json 文件，并下载。
     * @public
     */
    save() {
        let blob = new Blob([JSON.stringify(this.cy.json())], {type: "text/plain;charset=utf-8"})
        saveAs(blob, 'graph.json')
    }

    /**
     * 从文件读取 json 文件，并加载到视图中
     * @public
     */
    load() {
        fileDialog({accept: 'application/json'})
            .then(files => {
                let reader = new FileReader()
                reader.onload = file => {
                    this.cy.json(JSON.parse(file.target.result))
                }
                reader.readAsText(files[0])
            })
    }

    /**
     * 将当前图谱导出为 jpg 图片，并下载
     * @public
     * @see https://github.com/iVis-at-Bilkent/pathway-mapper/blob/master/public/src/js/FileOperationsManager.js#L33
     */
    saveAsJPEG() {
        let graphData = this.cy.jpeg();
        let b64data = graphData.substr(graphData.indexOf(",") + 1);
        let imageData = b64toBlob(b64data, "image/jpeg");
        let blob = new Blob([imageData]);
        saveAs(blob, "graph.jpg");
    }

    /**
     * 将当前图谱导出为 png 图片，并下载
     * @public
     * @see https://github.com/iVis-at-Bilkent/pathway-mapper/blob/master/public/src/js/FileOperationsManager.js#L44
     */
    saveAsPNG() {
        let graphData = this.cy.png();
        let b64data = graphData.substr(graphData.indexOf(",") + 1);
        let imageData = b64toBlob(b64data, "image/png");
        let blob = new Blob([imageData]);
        saveAs(blob, "graph.png");
    }

    /**
     * 销毁指定 id 的右键菜单
     * @param id {!(String | Number)} 待删除的右键菜单的 id
     *
     */
    removeContextMenu(id) {
        if (!id in this.contextmenu) {
            console.error(`id 为${id}的右键菜单不存在`)
            return false
        }
        this.contextmenu[id].destroy()
        delete this.contextmenu[id]
    }

    /**
     * 将画布完全重置
     */
    reset() {
        this.cy.elements().remove()
        this.cy.reset()
    }

    /**
     * 缩放视图至指定的元素
     * @param eles {cy.nodes} 需要查看的元素
     * @see {https://github.com/iVis-at-Bilkent/cytoscape.js-view-utilities/blob/master/src/view-utilities.js#L190}
     * @returns {cy.nodes}
     * @public
     */
    zoomToSelected(eles) {
        let boundingBox = eles.boundingBox();
        let diff_x = Math.abs(boundingBox.x1 - boundingBox.x2);
        let diff_y = Math.abs(boundingBox.y1 - boundingBox.y2);
        let padding;
        if (diff_x >= 200 || diff_y >= 200) {
            padding = 50;
        } else {
            padding = (this.cy.width() < this.cy.height()) ?
                ((200 - diff_x) / 2 * this.cy.width() / 200) : ((200 - diff_y) / 2 * this.cy.height() / 200);
        }

        this.cy.animate({
            fit: {
                eles: eles,
                padding: padding
            }
        }, {
            duration: 1200
        });
        return eles;
    }

    /**
     * 定义了多种点击事件
     * @interface
     */
    event = {
        /**
         * 在节点上单击
         * @method
         * @param {string} node - 传出点击的节点
         */
        clickOnNode: node => {
        },
        /**
         * 在连线上单击
         * @method
         * @param {string} edge - 传出点击的连线
         */
        clickOnEdge: edge => {
        },
        /**
         * 在背景上单击
         * @method
         */
        clickOnBackground: () => {
        },
        /**
         * 在节点上双击
         * @method
         * @param {string} node - 传出点击的节点
         */
        dbclickOnNode: node => {
        },
        /**
         * 在连线上双击
         * @method
         * @param {string} edge - 传出点击的连线
         */
        dbclickOnEdge: edge => {
        },
        /**
         * 在北京上双击
         * @method
         */
        dbclickOnBackground: () => {
        },
    }


}

export default Cyez