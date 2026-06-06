import{c as o}from"./index-BVLk3A68.js";/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],h=o("calendar",u);/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]],y=o("pencil",i),d=n=>{const a=Number(n);return Number.isFinite(a)?a:null},l=n=>{const a=d(n);return a===null?null:Math.max(0,Math.min(100,a<=1?a*100:a))},b=(n,a=null)=>{if(typeof n=="string"){const r=n.trim();return r?{label:r,nombre:r,score:a}:null}if(!n||typeof n!="object")return null;const e=String(n.label??n.etiqueta??n.categoria??n.nombre??"").trim();return e?{label:e,nombre:String(n.nombre??n.label??n.etiqueta??n.categoria??e).trim(),score:l(n.score??n.confianza??n.probabilidad??a)}:null},m=n=>{if(!(n!=null&&n.ia_procesado))return null;const a=l(n.ia_confianza);if(!a||a<=0)return null;const e=Array.isArray(n.ia_etiquetas)?n.ia_etiquetas.map((t,c)=>b(t,c===0?a:null)).filter(Boolean):[];if(e.length===0)return null;const r=e[0],s=e.some(t=>Number(t.score)>0);return!(r!=null&&r.label)||!s?null:{principal:r,etiquetas:e,confianza:a}};export{h as C,y as P,m as g};
