!function(e){function t(t){for(var o,i,d=t[0],a=t[1],s=t[2],u=0,g=[];u<d.length;u++)i=d[u],r[i]&&g.push(r[i][0]),r[i]=0;for(o in a)Object.prototype.hasOwnProperty.call(a,o)&&(e[o]=a[o]);for(l&&l(t);g.length;)g.shift()();return c.push.apply(c,s||[]),n()}function n(){for(var e,t=0;t<c.length;t++){for(var n=c[t],o=!0,d=1;d<n.length;d++){var a=n[d];0!==r[a]&&(o=!1)}o&&(c.splice(t--,1),e=i(i.s=n[0]))}return e}var o={},r={0:0},c=[];function i(t){if(o[t])return o[t].exports;var n=o[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=e,i.c=o,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)i.d(n,o,function(t){return e[t]}.bind(null,o));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="";var d=window.webpackJsonp=window.webpackJsonp||[],a=d.push.bind(d);d.push=t,d=d.slice();for(var s=0;s<d.length;s++)t(d[s]);var l=a;c.push([10,1]),n()}({10:function(e,t,n){"use strict";n.r(t);var o=n(1),r=n.n(o),c=n(2),i=n.n(c);function d(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}r.a.use(i.a);var a=class{constructor(e,t){d(this,"contextmenu",{}),d(this,"event",{clickOnNode:e=>{},clickOnEdge:e=>{},clickOnBackground:()=>{},dbclickOnNode:e=>{},dbclickOnEdge:e=>{},dbclickOnBackground:()=>{}}),console.log("Bind cytoscape to DOM ",e),this.cy=window.cy=r()({container:e,style:t}),console.log("Init cyez",this.cy),this.init()}init(){this.RegisterDoubleClickEvent(),this.RegisterGestures()}RegisterDoubleClickEvent(e=350){let t;this.cy.on("tap",n=>{let o=n.timeStamp;o-t<e&&n.target.trigger("doubleTap",n),t=o})}RegisterGestures(){cy.on("doubleTap",e=>{let t=e.target;return e.target===cy?this.event.dbclickOnBackground():t.isNode()?this.event.dbclickOnNode(t.data()):t.isEdge()?this.event.dbclickOnEdge(t.data()):void 0}),cy.on("tap",e=>{let t=e.target;return e.target===cy?this.event.clickOnBackground():t.isNode()?this.event.clickOnNode(t.data()):t.isEdge()?this.event.clickOnEdge(t.data()):void 0})}addNode(e,t,n,o){this.cy.add({group:"nodes",data:{id:e,name:t,type:n,attr:o},position:{x:200,y:200}})}addEdge(e,t,n){this.cy.add({group:"edges",data:{source:e,target:t,name:n}})}getSelectedElements(){}getSelectedNodes(){}getSelectedEdges(){}get nodes(){return this.cy.nodes().map(e=>e.data())}get edges(){return this.cy.edges().map(e=>e.data())}addContextMenu(e,t,n,o){return e in this.contextmenu?(console.error(`id 为${e}的右键菜单已经存在`),!1):n instanceof Array&&o instanceof Array?n.length!==o.length?(console.error("content 与 func 数组长度必须一致"),!1):void(this.contextmenu[e]=cy.cxtmenu({selector:"node",commands:n.map((e,t)=>({content:n[t],select:o[t]}))})):(console.error("content 与 func 必须为数组形式"),!1)}removeContextMenu(e){if(!e in this.contextmenu)return console.error(`id 为${e}的右键菜单不存在`),!1;this.contextmenu[e].destroy(),delete this.contextmenu[e]}};n(9);let s=new a(document.getElementById("cy"),{});window.cyez=s,s.addNode(1,"测试1","test",{}),s.addNode(2,"测试2","test",{}),s.addEdge(1,2,"测试集"),s.addContextMenu(1,"node",["<span>测试</span>",'<span class="fa fa-star fa-2x"></span><div>删除此菜单</div>'],[e=>console.log("正在查看",e),()=>s.removeContextMenu(1)]),s.event.clickOnNode=function(e){console.log(e.name)}},9:function(e,t,n){}});
//# sourceMappingURL=app.6d8e3979.js.map