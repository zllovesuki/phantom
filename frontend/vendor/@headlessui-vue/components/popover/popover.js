var ce=Object.defineProperty,de=Object.defineProperties;var Pe=Object.getOwnPropertyDescriptors;var N=Object.getOwnPropertySymbols;var ee=Object.prototype.hasOwnProperty,te=Object.prototype.propertyIsEnumerable;var Z=(a,i,u)=>i in a?ce(a,i,{enumerable:!0,configurable:!0,writable:!0,value:u}):a[i]=u,B=(a,i)=>{for(var u in i||(i={}))ee.call(i,u)&&Z(a,u,i[u]);if(N)for(var u of N(i))te.call(i,u)&&Z(a,u,i[u]);return a},oe=(a,i)=>de(a,Pe(i));var _=(a,i)=>{var u={};for(var v in a)ee.call(a,v)&&i.indexOf(v)<0&&(u[v]=a[v]);if(a!=null&&N)for(var v of N(a))i.indexOf(v)<0&&te.call(a,v)&&(u[v]=a[v]);return u};import{Fragment as ne,computed as O,defineComponent as G,h as $,inject as U,provide as q,ref as D,shallowRef as me,watchEffect as z,onMounted as le,onUnmounted as re}from"vue";import{match as L}from'../../utils/match.js';import{render as j,Features as W}from'../../utils/render.js';import{useId as H}from'../../hooks/use-id.js';import{Keys as k}from'../../keyboard.js';import{getFocusableElements as J,Focus as C,focusIn as x,isFocusableElement as be,FocusableMode as Se,FocusResult as Q}from'../../utils/focus-management.js';import{dom as l}from'../../utils/dom.js';import{useOpenClosedProvider as ge,State as K,useOpenClosed as ae}from'../../internal/open-closed.js';import{useResolveButtonType as ye}from'../../hooks/use-resolve-button-type.js';import{useOutsideClick as Ee}from'../../hooks/use-outside-click.js';import{getOwnerDocument as A}from'../../utils/owner.js';import{useEventListener as he}from'../../hooks/use-event-listener.js';import{Hidden as X,Features as Y}from'../../internal/hidden.js';import{useTabDirection as ue,Direction as R}from'../../hooks/use-tab-direction.js';import'../../utils/micro-task.js';var Oe=(u=>(u[u.Open=0]="Open",u[u.Closed=1]="Closed",u))(Oe||{});let ie=Symbol("PopoverContext");function V(a){let i=U(ie,null);if(i===null){let u=new Error(`<${a} /> is missing a parent <${Fe.name} /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(u,V),u}return i}let se=Symbol("PopoverGroupContext");function pe(){return U(se,null)}let fe=Symbol("PopoverPanelContext");function Ie(){return U(fe,null)}let Fe=G({name:"Popover",props:{as:{type:[Object,String],default:"div"}},setup(a,{slots:i,attrs:u,expose:v}){var n;let o=D(null);v({el:o,$el:o});let e=D(1),d=D(null),m=D(null),I=D(null),c=D(null),S=O(()=>A(o)),b=O(()=>{var w,T;if(!l(d)||!l(c))return!1;for(let h of document.querySelectorAll("body > *"))if(Number(h==null?void 0:h.contains(l(d)))^Number(h==null?void 0:h.contains(l(c))))return!0;let t=J(),r=t.indexOf(l(d)),p=(r+t.length-1)%t.length,P=(r+1)%t.length,g=t[p],M=t[P];return!((w=l(c))!=null&&w.contains(g))&&!((T=l(c))!=null&&T.contains(M))}),s={popoverState:e,buttonId:D(null),panelId:D(null),panel:c,button:d,isPortalled:b,beforePanelSentinel:m,afterPanelSentinel:I,togglePopover(){e.value=L(e.value,{[0]:1,[1]:0})},closePopover(){e.value!==1&&(e.value=1)},close(t){s.closePopover();let r=(()=>t?t instanceof HTMLElement?t:t.value instanceof HTMLElement?l(t):l(s.button):l(s.button))();r==null||r.focus()}};q(ie,s),ge(O(()=>L(e.value,{[0]:K.Open,[1]:K.Closed})));let F={buttonId:s.buttonId,panelId:s.panelId,close(){s.closePopover()}},y=pe(),E=y==null?void 0:y.registerPopover;function f(){var t,r,p,P;return(P=y==null?void 0:y.isFocusWithinPopoverGroup())!=null?P:((t=S.value)==null?void 0:t.activeElement)&&(((r=l(d))==null?void 0:r.contains(S.value.activeElement))||((p=l(c))==null?void 0:p.contains(S.value.activeElement)))}return z(()=>E==null?void 0:E(F)),he((n=S.value)==null?void 0:n.defaultView,"focus",t=>{var r,p;e.value===0&&(f()||d&&c&&t.target!==window&&((r=l(s.beforePanelSentinel))!=null&&r.contains(t.target)||(p=l(s.afterPanelSentinel))!=null&&p.contains(t.target)||s.closePopover()))},!0),Ee([d,c],(t,r)=>{var p;s.closePopover(),be(r,Se.Loose)||(t.preventDefault(),(p=l(d))==null||p.focus())},O(()=>e.value===0)),()=>{let t={open:e.value===0,close:s.close};return j({theirProps:a,ourProps:{ref:o},slot:t,slots:i,attrs:u,name:"Popover"})}}}),Ue=G({name:"PopoverButton",props:{as:{type:[Object,String],default:"button"},disabled:{type:[Boolean],default:!1},id:{type:String,default:()=>`headlessui-popover-button-${H()}`}},inheritAttrs:!1,setup(a,{attrs:i,slots:u,expose:v}){let o=V("PopoverButton"),e=O(()=>A(o.button));v({el:o.button,$el:o.button}),le(()=>{o.buttonId.value=a.id}),re(()=>{o.buttonId.value=null});let d=pe(),m=d==null?void 0:d.closeOthers,I=Ie(),c=O(()=>I===null?!1:I.value===o.panelId.value),S=D(null),b=`headlessui-focus-sentinel-${H()}`;c.value||z(()=>{o.button.value=S.value});let s=ye(O(()=>({as:a.as,type:i.type})),S);function F(n){var t,r,p,P,g;if(c.value){if(o.popoverState.value===1)return;switch(n.key){case k.Space:case k.Enter:n.preventDefault(),(r=(t=n.target).click)==null||r.call(t),o.closePopover(),(p=l(o.button))==null||p.focus();break}}else switch(n.key){case k.Space:case k.Enter:n.preventDefault(),n.stopPropagation(),o.popoverState.value===1&&(m==null||m(o.buttonId.value)),o.togglePopover();break;case k.Escape:if(o.popoverState.value!==0)return m==null?void 0:m(o.buttonId.value);if(!l(o.button)||(P=e.value)!=null&&P.activeElement&&!((g=l(o.button))!=null&&g.contains(e.value.activeElement)))return;n.preventDefault(),n.stopPropagation(),o.closePopover();break}}function y(n){c.value||n.key===k.Space&&n.preventDefault()}function E(n){var t,r;a.disabled||(c.value?(o.closePopover(),(t=l(o.button))==null||t.focus()):(n.preventDefault(),n.stopPropagation(),o.popoverState.value===1&&(m==null||m(o.buttonId.value)),o.togglePopover(),(r=l(o.button))==null||r.focus()))}function f(n){n.preventDefault(),n.stopPropagation()}return()=>{let n=o.popoverState.value===0,t={open:n},w=a,{id:r}=w,p=_(w,["id"]),P=c.value?{ref:S,type:s.value,onKeydown:F,onClick:E}:{ref:S,id:r,type:s.value,"aria-expanded":a.disabled?void 0:o.popoverState.value===0,"aria-controls":l(o.panel)?o.panelId.value:void 0,disabled:a.disabled?!0:void 0,onKeydown:F,onKeyup:y,onClick:E,onMousedown:f},g=ue();function M(){let T=l(o.panel);if(!T)return;function h(){L(g.value,{[R.Forwards]:()=>x(T,C.First),[R.Backwards]:()=>x(T,C.Last)})===Q.Error&&x(J().filter(ve=>ve.dataset.headlessuiFocusGuard!=="true"),L(g.value,{[R.Forwards]:C.Next,[R.Backwards]:C.Previous}),{relativeTo:l(o.button)})}h()}return $(ne,[j({ourProps:P,theirProps:B(B({},i),p),slot:t,attrs:i,slots:u,name:"PopoverButton"}),n&&!c.value&&o.isPortalled.value&&$(X,{id:b,features:Y.Focusable,"data-headlessui-focus-guard":!0,as:"button",type:"button",onFocus:M})])}}}),qe=G({name:"PopoverOverlay",props:{as:{type:[Object,String],default:"div"},static:{type:Boolean,default:!1},unmount:{type:Boolean,default:!0}},setup(a,{attrs:i,slots:u}){let v=V("PopoverOverlay"),o=`headlessui-popover-overlay-${H()}`,e=ae(),d=O(()=>e!==null?(e.value&K.Open)===K.Open:v.popoverState.value===0);function m(){v.closePopover()}return()=>{let I={open:v.popoverState.value===0};return j({ourProps:{id:o,"aria-hidden":!0,onClick:m},theirProps:a,slot:I,attrs:i,slots:u,features:W.RenderStrategy|W.Static,visible:d.value,name:"PopoverOverlay"})}}}),ze=G({name:"PopoverPanel",props:{as:{type:[Object,String],default:"div"},static:{type:Boolean,default:!1},unmount:{type:Boolean,default:!0},focus:{type:Boolean,default:!1},id:{type:String,default:()=>`headlessui-popover-panel-${H()}`}},inheritAttrs:!1,setup(a,{attrs:i,slots:u,expose:v}){let{focus:o}=a,e=V("PopoverPanel"),d=O(()=>A(e.panel)),m=`headlessui-focus-sentinel-before-${H()}`,I=`headlessui-focus-sentinel-after-${H()}`;v({el:e.panel,$el:e.panel}),le(()=>{e.panelId.value=a.id}),re(()=>{e.panelId.value=null}),q(fe,e.panelId),z(()=>{var n,t;if(!o||e.popoverState.value!==0||!e.panel)return;let f=(n=d.value)==null?void 0:n.activeElement;(t=l(e.panel))!=null&&t.contains(f)||x(l(e.panel),C.First)});let c=ae(),S=O(()=>c!==null?(c.value&K.Open)===K.Open:e.popoverState.value===0);function b(f){var n,t;switch(f.key){case k.Escape:if(e.popoverState.value!==0||!l(e.panel)||d.value&&!((n=l(e.panel))!=null&&n.contains(d.value.activeElement)))return;f.preventDefault(),f.stopPropagation(),e.closePopover(),(t=l(e.button))==null||t.focus();break}}function s(f){var t,r,p,P,g;let n=f.relatedTarget;n&&l(e.panel)&&((t=l(e.panel))!=null&&t.contains(n)||(e.closePopover(),((p=(r=l(e.beforePanelSentinel))==null?void 0:r.contains)!=null&&p.call(r,n)||(g=(P=l(e.afterPanelSentinel))==null?void 0:P.contains)!=null&&g.call(P,n))&&n.focus({preventScroll:!0})))}let F=ue();function y(){let f=l(e.panel);if(!f)return;function n(){L(F.value,{[R.Forwards]:()=>{var r;x(f,C.First)===Q.Error&&((r=l(e.afterPanelSentinel))==null||r.focus())},[R.Backwards]:()=>{var t;(t=l(e.button))==null||t.focus({preventScroll:!0})}})}n()}function E(){let f=l(e.panel);if(!f)return;function n(){L(F.value,{[R.Forwards]:()=>{let t=l(e.button),r=l(e.panel);if(!t)return;let p=J(),P=p.indexOf(t),g=p.slice(0,P+1),w=[...p.slice(P+1),...g];for(let T of w.slice())if(T.dataset.headlessuiFocusGuard==="true"||r!=null&&r.contains(T)){let h=w.indexOf(T);h!==-1&&w.splice(h,1)}x(w,C.First,{sorted:!1})},[R.Backwards]:()=>{var r;x(f,C.Previous)===Q.Error&&((r=l(e.button))==null||r.focus())}})}n()}return()=>{let f={open:e.popoverState.value===0,close:e.close},P=a,{id:n,focus:t}=P,r=_(P,["id","focus"]),p={ref:e.panel,id:n,onKeydown:b,onFocusout:o&&e.popoverState.value===0?s:void 0,tabIndex:-1};return j({ourProps:p,theirProps:B(B({},i),r),attrs:i,slot:f,slots:oe(B({},u),{default:(...g)=>{var M;return[$(ne,[S.value&&e.isPortalled.value&&$(X,{id:m,ref:e.beforePanelSentinel,features:Y.Focusable,"data-headlessui-focus-guard":!0,as:"button",type:"button",onFocus:y}),(M=u.default)==null?void 0:M.call(u,...g),S.value&&e.isPortalled.value&&$(X,{id:I,ref:e.afterPanelSentinel,features:Y.Focusable,"data-headlessui-focus-guard":!0,as:"button",type:"button",onFocus:E})])]}}),features:W.RenderStrategy|W.Static,visible:S.value,name:"PopoverPanel"})}}}),Je=G({name:"PopoverGroup",props:{as:{type:[Object,String],default:"div"}},setup(a,{attrs:i,slots:u,expose:v}){let o=D(null),e=me([]),d=O(()=>A(o));v({el:o,$el:o});function m(b){let s=e.value.indexOf(b);s!==-1&&e.value.splice(s,1)}function I(b){return e.value.push(b),()=>{m(b)}}function c(){var F;let b=d.value;if(!b)return!1;let s=b.activeElement;return(F=l(o))!=null&&F.contains(s)?!0:e.value.some(y=>{var E,f;return((E=b.getElementById(y.buttonId.value))==null?void 0:E.contains(s))||((f=b.getElementById(y.panelId.value))==null?void 0:f.contains(s))})}function S(b){for(let s of e.value)s.buttonId.value!==b&&s.close()}return q(se,{registerPopover:I,unregisterPopover:m,isFocusWithinPopoverGroup:c,closeOthers:S}),()=>j({ourProps:{ref:o},theirProps:a,slot:{},attrs:i,slots:u,name:"PopoverGroup"})}});export{Fe as Popover,Ue as PopoverButton,Je as PopoverGroup,qe as PopoverOverlay,ze as PopoverPanel};
