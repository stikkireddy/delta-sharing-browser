var d=Object.defineProperty;var u=(s,n,e)=>n in s?d(s,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[n]=e;var y=(s,n,e)=>(u(s,typeof n!="symbol"?n+"":n,e),e);import{_ as c}from"./preload-helper.628312a4.js";import{F as w}from"./FileSystemHandle.a36c07be.js";const a=Symbol("adapter");var h;class i extends w{constructor(e){super(e);y(this,h);this[a]=e}async getDirectoryHandle(e,t={}){if(e==="")throw new TypeError("Name can't be an empty string.");if(e==="."||e===".."||e.includes("/"))throw new TypeError("Name contains invalid characters.");t.create=!!t.create;const r=await this[a].getDirectoryHandle(e,t);return new i(r)}async*entries(){const{FileSystemFileHandle:e}=await c(()=>import("./FileSystemFileHandle.5caf4f79.js"),["FileSystemFileHandle.5caf4f79.js","FileSystemHandle.a36c07be.js","config.80337a15.js"]);for await(const[t,r]of this[a].entries())yield[r.name,r.kind==="file"?new e(r):new i(r)]}async*getEntries(){const{FileSystemFileHandle:e}=await c(()=>import("./FileSystemFileHandle.5caf4f79.js"),["FileSystemFileHandle.5caf4f79.js","FileSystemHandle.a36c07be.js","config.80337a15.js"]);console.warn("deprecated, use .entries() instead");for await(let t of this[a].entries())yield t.kind==="file"?new e(t):new i(t)}async getFileHandle(e,t={}){const{FileSystemFileHandle:r}=await c(()=>import("./FileSystemFileHandle.5caf4f79.js"),["FileSystemFileHandle.5caf4f79.js","FileSystemHandle.a36c07be.js","config.80337a15.js"]);if(e==="")throw new TypeError("Name can't be an empty string.");if(e==="."||e===".."||e.includes("/"))throw new TypeError("Name contains invalid characters.");t.create=!!t.create;const o=await this[a].getFileHandle(e,t);return new r(o)}async removeEntry(e,t={}){if(e==="")throw new TypeError("Name can't be an empty string.");if(e==="."||e===".."||e.includes("/"))throw new TypeError("Name contains invalid characters.");return t.recursive=!!t.recursive,this[a].removeEntry(e,t)}async resolve(e){if(await e.isSameEntry(this))return[];const t=[{handle:this,path:[]}];for(;t.length;){let{handle:r,path:o}=t.pop();for await(const l of r.values()){if(await l.isSameEntry(e))return[...o,l.name];l.kind==="directory"&&t.push({handle:l,path:[...o,l.name]})}}return null}async*keys(){for await(const[e]of this[a].entries())yield e}async*values(){for await(const[e,t]of this)yield t}[(h=a,Symbol.asyncIterator)](){return this.entries()}}Object.defineProperty(i.prototype,Symbol.toStringTag,{value:"FileSystemDirectoryHandle",writable:!1,enumerable:!1,configurable:!0});Object.defineProperties(i.prototype,{getDirectoryHandle:{enumerable:!0},entries:{enumerable:!0},getFileHandle:{enumerable:!0},removeEntry:{enumerable:!0}});export{i as FileSystemDirectoryHandle,i as default};
