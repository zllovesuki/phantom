function r(){let i=[],a={addEventListener(e,t,n,s){return e.addEventListener(t,n,s),a.add(()=>e.removeEventListener(t,n,s))},requestAnimationFrame(...e){let t=requestAnimationFrame(...e);a.add(()=>cancelAnimationFrame(t))},nextFrame(...e){a.requestAnimationFrame(()=>{a.requestAnimationFrame(...e)})},setTimeout(...e){let t=setTimeout(...e);a.add(()=>clearTimeout(t))},add(e){i.push(e)},style(e,t,n){let s=e.style.getPropertyValue(t);return Object.assign(e.style,{[t]:n}),this.add(()=>{Object.assign(e.style,{[t]:s})})},dispose(){for(let e of i.splice(0))e()}};return a}export{r as disposables};
