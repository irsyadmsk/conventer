import test from 'node:test';
import assert from 'node:assert/strict';
import {ProjectStore} from '../src/features/kreasi/store.ts';
import {createProject} from '../src/features/kreasi/core.js';
class MemoryStorage {
  data=new Map(); writes=0;
  getItem(k){return this.data.get(k)??null;}
  setItem(k,v){this.writes++;this.data.set(k,v);}
}
class Locks {
  queue=Promise.resolve(); names=[]; held=false;
  request(name,options,callback){
    this.names.push([name,options.mode]);
    const job=this.queue.then(async()=>{this.held=true;try{return await callback({name,mode:'exclusive'});}finally{this.held=false;}});
    this.queue=job.catch(()=>{});return job;
  }
}
const setup=()=>({storage:new MemoryStorage(),locks:new Locks()});
test('account isolation and empty initial state without eager writes',async()=>{
  const options=setup(),a=new ProjectStore('a',options),b=new ProjectStore('b',options);
  assert.notEqual(a.key,b.key);const state=a.load();assert.equal(state.projects.length,1);assert.equal(state.activeId,state.projects[0].id);assert.equal(options.storage.writes,0);
  state.projects[0].name='A';await a.save(state);assert.equal(new ProjectStore('a',options).load().projects[0].name,'A');assert.notEqual(b.load().projects[0].name,'A');assert.deepEqual(options.locks.names,[[a.key,'exclusive']]);
});
test('exclusive held lock blocks snapshot comparison and write',async()=>{
  const options=setup();let release;options.locks.request('held',{mode:'exclusive'},()=>new Promise(r=>{release=r;}));await Promise.resolve();
  const store=new ProjectStore('a',options),state=store.load();const pending=store.save(state);await Promise.resolve();assert.equal(options.storage.writes,0);
  options.storage.data.set(store.key,'external');release();await assert.rejects(pending,/conflict|berubah/i);assert.equal(options.storage.getItem(store.key),'external');assert.equal(store.conflicted,true);
});
test('two loaded stores cannot silently overwrite each other; conflict is latched',async()=>{
  const options=setup(),a=new ProjectStore('a',options),b=new ProjectStore('a',options);const sa=a.load(),sb=b.load();await a.save(sa);await assert.rejects(b.save(sb));assert.equal(b.conflicted,true);b.load();await assert.rejects(b.save(sb));
  const c=new ProjectStore('c',options);const sc=c.load();c.markConflict();await assert.rejects(c.save(sc));assert.equal(c.conflicted,true);
});
test('unreadable storage preserved; no replacement default',async()=>{
  for(const raw of ['broken','{}',JSON.stringify({version:1,activeId:'missing',projects:[]})]) {
    const options=setup(),s=new ProjectStore('a',options);options.storage.data.set(s.key,raw);assert.throws(()=>s.load());await assert.rejects(s.save({version:1,activeId:'x',projects:[{...createProject(),id:'x'}]}));assert.equal(options.storage.getItem(s.key),raw);assert.equal(options.storage.writes,0);
  }
});
test('dispose cancels queued saves after account switch',async()=>{
  const options=setup();let release;options.locks.request('held',{mode:'exclusive'},()=>new Promise(r=>{release=r;}));await Promise.resolve();const s=new ProjectStore('a',options),state=s.load(),pending=s.save(state);s.dispose();release();await assert.rejects(pending,/disposed|ditutup/i);assert.equal(options.storage.writes,0);await assert.rejects(s.save(state));
});
test('invalid collections and aggregate quota are rejected without writes',async()=>{
  const options=setup(),s=new ProjectStore('a',options),state=s.load(),p=state.projects[0];
  for(const bad of [{...state,projects:Array.from({length:21},()=>createProject())},{...state,projects:[p,p]},{...state,activeId:'missing'}, {...state,version:2}]) await assert.rejects(s.save(bad));
  const projects=Array.from({length:4},()=>{const p=createProject();p.glyphs=[{id:'g',source:'a',strokes:[]}];for(let left=50000;left>0;){const n=Math.min(left,2048);left-=n;p.glyphs[0].strokes.push(Array.from({length:n},()=>[12.3,45.6]));}return p;});
  await assert.rejects(s.save({version:1,activeId:projects[0].id,projects}),/quota|besar|byte/i);assert.equal(options.storage.writes,0);
});
test('unavailable/failed locks and storage failures fail closed',async()=>{
  for(const locks of [undefined,{request:async()=>{throw Error('denied');}},{request:async()=>{}}]) {
    const storage=new MemoryStorage(),s=new ProjectStore('a',{storage,locks}),state=s.load();await assert.rejects(s.save(state));assert.equal(storage.writes,0);
  }
  const options=setup(),s=new ProjectStore('a',options),state=s.load();options.storage.setItem=()=>{throw Error('quota exceeded');};await assert.rejects(s.save(state),/quota/);
});
test('save captures validated state before lock wait, not later mutations',async()=>{
  const options=setup();let release;options.locks.request('held',{mode:'exclusive'},()=>new Promise(r=>{release=r;}));await Promise.resolve();const s=new ProjectStore('a',options),state=s.load();state.projects[0].name='Snapshot';const pending=s.save(state);state.projects[0].name='Changed';release();await pending;assert.equal(JSON.parse(options.storage.getItem(s.key)).projects[0].name,'Snapshot');
});
