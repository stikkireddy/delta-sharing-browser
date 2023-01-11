import{_ as t}from"./preload-helper.628312a4.js";const p={INVALID:["seeking position failed.","InvalidStateError"],GONE:["A requested file or directory could not be found at the time an operation was processed.","NotFoundError"],MISMATCH:["The path supplied exists, but was not an entry of requested type.","TypeMismatchError"],MOD_ERR:["The object can not be modified in this way.","InvalidModificationError"],SYNTAX:e=>[`Failed to execute 'write' on 'UnderlyingSinkBase': Invalid params passed. ${e}`,"SyntaxError"],SECURITY:["It was determined that certain files are unsafe for access within a Web application, or that too many calls are being made on file resources.","SecurityError"],DISALLOWED:["The request is not allowed by the user agent or the platform in the current context.","NotAllowedError"]},w={writable:globalThis.WritableStream};async function E(e){console.warn("deprecated fromDataTransfer - use `dt.items[0].getAsFileSystemHandle()` instead");const[r,o,a]=await Promise.all([t(()=>import("./memory.f1ac3965.js"),["memory.f1ac3965.js","config.80337a15.js","preload-helper.628312a4.js"]),t(()=>import("./sandbox.7d3a607e.js"),["sandbox.7d3a607e.js","preload-helper.628312a4.js"]),t(()=>import("./FileSystemDirectoryHandle.fd63fe26.js"),["FileSystemDirectoryHandle.fd63fe26.js","preload-helper.628312a4.js","FileSystemHandle.a36c07be.js"])]),n=new r.FolderHandle("",!1);return n._entries=e.map(i=>i.isFile?new o.FileHandle(i,!1):new o.FolderHandle(i,!1)),new a.FileSystemDirectoryHandle(n)}async function y(e){const{FolderHandle:r,FileHandle:o}=await t(()=>import("./memory.f1ac3965.js"),["memory.f1ac3965.js","config.80337a15.js","preload-helper.628312a4.js"]),{FileSystemDirectoryHandle:a}=await t(()=>import("./FileSystemDirectoryHandle.fd63fe26.js"),["FileSystemDirectoryHandle.fd63fe26.js","preload-helper.628312a4.js","FileSystemHandle.a36c07be.js"]),n=Array.from(e.files),i=n[0].webkitRelativePath.split("/",1)[0],_=new r(i,!1);return n.forEach(l=>{const d=l.webkitRelativePath.split("/");d.shift();const m=d.pop(),f=d.reduce((c,s)=>(c._entries[s]||(c._entries[s]=new r(s,!1)),c._entries[s]),_);f._entries[m]=new o(l.name,l,!1)}),new a(_)}async function I(e){const{FileHandle:r}=await t(()=>import("./memory.f1ac3965.js"),["memory.f1ac3965.js","config.80337a15.js","preload-helper.628312a4.js"]),{FileSystemFileHandle:o}=await t(()=>import("./FileSystemFileHandle.5caf4f79.js"),["FileSystemFileHandle.5caf4f79.js","FileSystemHandle.a36c07be.js","config.80337a15.js"]);return Array.from(e.files).map(a=>new o(new r(a.name,a,!1)))}export{w as config,p as errors,E as fromDataTransfer,y as getDirHandlesFromInput,I as getFileHandlesFromInput};