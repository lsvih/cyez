import cytoscape from 'cytoscape'
import cxtmenu from 'cytoscape-cxtmenu'
import Layout from './cyez-layout'

class Cyez {
    /**
     * 传入交互组件的容器，以及样式，构建 cyez 实例
     * @param container {Node}
     * @param style {object}
     * @return cy
     */
    constructor(container, style) {
        console.log('Bind cytoscape to DOM ', container)
        this.cy = window.cy = cytoscape({container, style})
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
        this.RegisterDoubleClickEvent()
        this.RegisterGestures()
        this.RegisterLayout()
    }


    /**
     * 判断当前画布是否应该冻结
     * @property
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
    RegisterLayout(){
        this.layout.RegisterLayout(cytoscape)
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
        cytoscape.use(cxtmenu)
    }

    /**
     * 注册各种点击事件
     * @private
     */
    RegisterGestures() {
        cy.on('doubleTap', e => {
            let target = e.target
            if (e.target === cy)// double click on background
                return this.event.dbclickOnBackground()
            if (target.isNode())
                return this.event.dbclickOnNode(target.data())
            if (target.isEdge())
                return this.event.dbclickOnEdge(target.data())
        })

        cy.on('tap', e => {
            let target = e.target
            if (e.target === cy)// click on background
                return this.event.clickOnBackground()
            if (target.isNode())
                return this.event.clickOnNode(target.data())
            if (target.isEdge())
                return this.event.clickOnEdge(target.data())
        })
    }


    /**
     * 增加一个新的节点
     * @param id {Number || String}
     * @param name {String}
     * @param type {String}
     * @param attr {Object}
     */
    addNode(id, name, type, attr) {
        this.cy.add({
            group: 'nodes',
            data: {id, name, type, attr},
            position: {x: 200, y: 200}
        })
    }

    /**
     * 在 id 为 source_id 和 id 为 target_id 的两个节点间增加关系为 name 的边
     * @param source_id {Number || String}
     * @param target_id {Number || String}
     * @param name
     */
    addEdge(source_id, target_id, name) {
        this.cy.add({
            group: 'edges',
            data: {source: source_id, target: target_id, name}
        })
    }

    /**
     * 获取当前被选中的元素（包括节点和连边）
     */
    getSelectedElements() {
        //TODO
    }

    /**
     * 获取当前被选中的节点
     */
    getSelectedNodes() {
        //TODO
    }

    /**
     * 获取当前被选中的连边
     */
    getSelectedEdges() {
        //TODO
    }

    /**
     * 根据节点 id 获取其
     * @param id
     * @return {null | cy.node[]}
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
     * @return {null | cy.node}
     */
    getNodeById(id) {
        let selector = this.$('#' + String(id))
        if (selector.length === 0)
            return selector[0]
        else if (selector.length > 1) {
            console.warn(`存在多个id为${id}的节点`)
            return selector[0]
        } else
            return null
    }


    /**
     * 根据节点 id 获取节点坐标
     * @param id
     * @returns {null|*}
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
     * 获取所有节点
     * @returns {nodes}
     */
    get nodes() {
        return this.cy.nodes().map(e => e.data())
    }

    /**
     * 获取所有连边
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
        this.contextmenu[id] = cy.cxtmenu({
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
     * 销毁指定 id 的右键菜单
     * @param id
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