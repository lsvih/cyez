import cytoscape from 'cytoscape'
import cxtmenu from '@lsvih/cytoscape-cxtmenu'
import navigator from 'cytoscape-navigator'
import RegisterEdgeHandle from './cyez-edgehandle'
import Layout from './cyez-layout'
import {saveAs} from 'file-saver'
import fileDialog from 'file-dialog'
import panzoom from 'cytoscape-panzoom'
import b64toBlob from 'b64-to-blob'
import {isEmpty, assign, merge, concat, pull} from 'lodash'

import 'cytoscape-panzoom/cytoscape.js-panzoom.css';

class Cyez {
    /**
     * 传入交互组件的容器，以及样式，构建 cyez 实例
     * @param container {Node} 交互组件所在的容器，用 document.getElementById 等选择器得到
     * @param style {Object} 交互组件的样式模板
     */
    constructor(container, style) {
        console.log('Bind cytoscape to DOM ', container)
        this.cy = cytoscape({
            container,
            style,
            motionBlur: true,
            hideEdgesOnViewport: true,
            hideLabelsOnViewport: true,
            wheelSensitivity: .6,
            pixelRatio: 1
        })
        console.log('Init cyez', this.cy)
        this.layout = new Layout()
        /**
         * 判断当前画布是否应该冻结
         * @var
         * @type {boolean}
         */
        this.freeze = false
        this.current_layout = null
        this.edge_handle = null
        /**
         * 用于存储右键菜单
         * @private
         * @member Cyez
         * @type {{}}
         */
        this.contextmenu = {}
        /**
         * 定义了多种点击事件
         * @interface
         */;
        this.event = {}
        this.init()
        this.initEvent()
    }

    /**
     * 初始化各组件与事件
     * @private
     */
    init() {
        this.RegisterContextMenu()
        this.RegisterNavigator()
        this.RegisterPanzoom()
        RegisterEdgeHandle(cytoscape, this)
        this.RegisterDoubleClickEvent()
        this.RegisterGestures()
        this.RegisterLayout()
    }


    /**
     * 返回画布的中心点
     * @returns {{x: number, y: number}}
     * @public
     */
    getCenter() {
        return {x: this.cy.width() / 2, y: this.cy.height() / 2}
    }


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

        this.cy.on('cxttap', e => {
            let target = e.target
            if (e.target === this.cy)// click on background
                return this.event.rightclickOnBackground()
            if (target.isNode())
                return this.event.rightclickOnNode(target.data())
            if (target.isEdge())
                return this.event.rightclickOnEdge(target.data())
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
            position: this.getCenter()
        })
    }

    /**
     * 增加一系列节点
     * @param node_list {cy.node[]} 传入形式为：[{name, id, type, attr}]
     * @returns {cy.node}
     */
    addNodes(node_list, options) {
        let default_options = {
            position: this.getCenter()
        }
        options = assign(default_options, options)
        return this.cy.add(node_list.map(node => {
            return {
                group: 'nodes',
                data: node,
                position: {x: options.position.x + Math.random() * 10, y: options.position.y + Math.random() * 10,}
            }
        }))
    }


    /**
     * 增加一系列节点
     * @param edge_list {cy.edge[]} 传入形式为：[{id, name, source, target}]
     * @returns {cy.edge}
     */
    addEdges(edge_list) {
        return this.cy.add(edge_list.map(edge => {
            return {
                group: 'edges',
                data: edge
            }
        }))
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
            data: {id: `${source_id}->${target_id}`, source: source_id, target: target_id, name}
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
     * @param silence {boolean} 是否在控制栏显示错误
     * @return {?cytoscape.edge} 查询得到的边，如果没有找到对应 id 的边则返回 null
     * @public
     */
    getEdgeById(id, silence = false) {
        let edge = this.cy.edges(`#${id}`)
        if (edge.length === 0) {
            if (!silence)
                console.warn(`没有找到 id 为 ${id} 的连边`)
            return null
        } else {
            return edge
        }
    }

    /**
     * 获取当前被选中的元素（包括节点和连边）
     * @return {?cytoscape.element} 被选中的元素的实例
     * @public
     */
    getSelectedElements() {
        return this.cy.$(':selected')
    }

    /**
     * 获取当前被选中的节点
     * @return {?cytoscape.node} 被选中的节点的实例
     * @public
     */
    getSelectedNodes() {
        return this.cy.$('node:selected')
    }

    /**
     * 获取当前被选中的连边
     * @return {?cytoscape.edge} 被选中的连边的实例
     * @public
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
     * 反选，即取消当前选中的元素，选中当前未选中的元素
     * @public
     */
    inverseSelection() {
        let un_selected_elems = this.getUnselectedElements()
        this.getSelectedElements().unselect()
        un_selected_elems.select()
    }

    /**
     * 获取当前未被选中的元素（包括节点和连边）
     * @return {?cytoscape.element} 被选中的元素的实例
     * @public
     */
    getUnselectedElements() {
        return this.cy.$(':unselected')
    }


    /**
     * 判断 id 是否已经存在
     * @param id {!(String | Number)} 需要判断的 id
     * @returns {boolean}
     * @public
     */
    isIdExist(id) {
        return !isEmpty(this.getNodeById(id)) && !isEmpty(this.getEdgeById(id, true))
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
            this.current_layout = this.cy.layout({
                name: layout,
                animate: true,
                maxSimulationTime: 4000,
                animationDuration: 1000,
                animationEasing: 'ease-in-out',
                stop: () => {
                    this.freeze = false // 布局完成后解冻画布
                    this.current_layout = null
                    if (callback != null) {
                        callback()
                    }
                }
            })
            this.current_layout.run()
        }
    }


    /**
     * 对部分节点应用布局算法
     * @param nodes {!cytoscape.node} 传入需要进行布局的节点
     * @param options {!object} 选项，{layout:'grid', position:{x:0,y:0}}。layout指定一种布局方式，可选值参见 {@link Layout}，position指定布局中心
     * @param callback {?Function} 可选，布局完成后将调用此函数
     * @public
     */
    LayoutNodes(nodes, options, callback) {
        let default_options = {
            layout: 'grid',
            position: this.getCenter(),
            radius: 1
        }
        let new_options = merge({}, default_options, options)
        new_options.position = {
            x1: new_options.position.x - new_options.radius,
            x2: new_options.position.x + new_options.radius,
            y1: new_options.position.y - new_options.radius,
            y2: new_options.position.y + new_options.radius
        }
        new_options = merge({}, new_options, options)
        if (this.freeze) {
            console.info('当前画布处于冻结状态')
        } else {
            this.freeze = true
            this.current_layout = nodes.makeLayout({
                name: new_options.layout,
                fit: false,
                boundingBox: new_options.position,
                animate: true,
                maxSimulationTime: 4000,
                animationDuration: 1000,
                animationEasing: 'ease-in-out',
                avoidOverlap: true,
                stop: () => {
                    this.freeze = false // 布局完成后解冻画布
                    this.current_layout = null
                    if (callback != null) {
                        callback()
                    }
                }
            })
            this.current_layout.run()
        }
    }

    /**
     * 停止正在进行的布局
     * @public
     * @return Boolean
     */
    stopLayout() {
        if (isEmpty(this.current_layout)) {
            return false
        } else {
            this.current_layout.stop()
            this.current_layout = null
            return true
        }
    }

    /**
     * 将布局锁定
     * @public
     */
    lock() {
        this.cy.elements().lock()
    }

    /**
     * 解锁布局
     * @public
     */
    unlock() {
        this.cy.elements().unlock()
    }

    /**
     * 将数组数据聚合为集合
     * @param elements {(cytoscape.node[] | cytoscape.edge[] | cytoscape.ele[])} 以数组形式传入的实例
     * @returns {cytoscape.eles} 以集合传出的实例
     * @public
     */
    Collection(elements) {
        return this.cy.collection().add(elements)
    }


    /**
     * 高亮设定的节点。相当于将除了传入节点之外的其它节点和连线加上 faded class，因此需要在样式中加上 .faded{opacity:0.1} 的设定
     * @param nodes {!cytoscape.node} 需要高亮的节点
     * @public
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
     * @param id {int|string} 右键菜单的标识，可以用此标识销毁对应菜单
     * @param option 参考 cytoscape contextmenu 文档
     */
    addContextMenu(id, option) {
        if (id in this.contextmenu) {
            console.error(`id 为${id}的右键菜单已经存在`)
            return false
        }
        this.contextmenu[id] = this.cy.cxtmenu(option)
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
     * @see https://github.com/iVis-at-Bilkent/cytoscape.js-view-utilities/blob/master/src/view-utilities.js#L190
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
     * 更新新的样式
     * @param new_style {JSON} 以JSON形式传入的新的样式
     */
    updateStyleFromJSON(new_style) {
        let old_style = this.cy.style().json()
        let style = concat(old_style, new_style)
        this.cy.style().fromJson(style).update()
    }


    /**
     * 隐藏指定的元素，即为selector的元素添加 display: 'none' 的样式属性
     * @param selector
     * @public
     */
    hideNodes(selector) {
        let hidden_style = [{
            selector,
            style: {
                display: 'none'
            }
        }]
        this.updateStyleFromJSON(hidden_style)
    }

    /**
     * 显示指定的元素，即为selector的元素删除 visibility: hide 的样式属性
     * @param selector
     * @public
     */
    showNodes(selector) {
        let old_style = this.cy.style().json()
        let style = old_style.filter(e => !(e.selector === selector && e.style.display === 'none'))
        this.cy.style().fromJson(style).update()
    }

    /**
     * 选择器
     * @param selector {String} cytoscape选择器
     * @returns {*|E.fn.init}
     */
    $(selector) {
        return this.cy.$(selector)
    }


    /**
     * 初始化事件
     * @private
     */
    initEvent() {
        this.event = {
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
             * 在背景上双击
             * @method
             */
            dbclickOnBackground: () => {
            },
            /**
             * 在节点上右击
             * @method
             * @param {string} node - 传出点击的节点
             */
            rightclickOnNode: node => {
            },
            /**
             * 在连线上右击
             * @method
             * @param {string} edge - 传出点击的连线
             */
            rightclickOnEdge: edge => {
            },
            /**
             * 在背景上右击
             * @method
             */
            rightclickOnBackground: () => {
            },
        }
    }

    /**
     * 判断指定 elements 中是否包含环
     * @param elements
     * @return {Boolean}
     */
    hasLoop(elements) {
        let clearClass = () =>
            this.cy.batch(() => {
                elements.removeClass('visited')
            })
        let nodes = elements.nodes()
        let flag = false
        for (let start_node of nodes.toArray()) {
            if (flag)
                break
            elements.dfs({
                root: `#${start_node.id()}`,
                directed: true,
                visit: (v, e, u, i, depth) => {
                    v.addClass('visited')
                    for (let child of v.outgoers().toArray())
                        if (child.hasClass('visited')) {
                            flag = true
                            return false
                        }
                }
            })
            clearClass()
        }
        clearClass()
        return flag
    }


}

export default Cyez
