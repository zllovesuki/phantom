import{watchEffect as r}from"vue";import{env as m}from'../utils/env.js';function u(e,t,n){m.isServer||r(o=>{document.addEventListener(e,t,n),o(()=>document.removeEventListener(e,t,n))})}export{u as useDocumentEvent};
