var n=Object.defineProperty;var c=(r,e,t)=>e in r?n(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var i=(r,e,t)=>(c(r,typeof e!="symbol"?e+"":e,t),t);import{F as u}from"./FileSystemHandle.a36c07be.js";import{c as b}from"./config.80337a15.js";const{WritableStream:p}=b;class s extends p{constructor(...e){super(...e),Object.setPrototypeOf(this,s.prototype),this._closed=!1}close(){this._closed=!0;const e=this.getWriter(),t=e.close();return e.releaseLock(),t}seek(e){return this.write({type:"seek",position:e})}truncate(e){return this.write({type:"truncate",size:e})}write(e){if(this._closed)return Promise.reject(new TypeError("Cannot write to a CLOSED writable stream"));const t=this.getWriter(),o=t.write(e);return t.releaseLock(),o}}Object.defineProperty(s.prototype,Symbol.toStringTag,{value:"FileSystemWritableFileStream",writable:!1,enumerable:!1,configurable:!0});Object.defineProperties(s.prototype,{close:{enumerable:!0},seek:{enumerable:!0},truncate:{enumerable:!0},write:{enumerable:!0}});const a=Symbol("adapter");var m;class l extends u{constructor(t){super(t);i(this,m);this[a]=t}async createWritable(t={}){return new s(await this[a].createWritable(t))}async getFile(){return this[a].getFile()}}m=a;Object.defineProperty(l.prototype,Symbol.toStringTag,{value:"FileSystemFileHandle",writable:!1,enumerable:!1,configurable:!0});Object.defineProperties(l.prototype,{createWritable:{enumerable:!0},getFile:{enumerable:!0}});export{l as FileSystemFileHandle,l as default};
